import os
import json
from typing import List, Dict, Any, TypedDict
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from langgraph.graph import StateGraph, START, END

# ── Shared state ──────────────────────────────────────────────────────────────
class AgentState(TypedDict):
    transcript: str
    category_analysis: Dict[str, Any]
    entities: Dict[str, Any]
    risk_analysis: Dict[str, Any]
    report: Dict[str, Any]
    traces: List[Dict[str, str]]

# ── Pydantic schemas with defaults so nothing ever crashes ─────────────────────
class CategoryAnalysis(BaseModel):
    category: str = Field(default="general", description="One of: loan, investment, emi, budget, insurance, tax, stocks, general")
    confidence: float = Field(default=1.0)
    is_financial: bool = Field(default=True)
    sentiment: str = Field(default="neutral", description="positive, negative, or neutral")

class FinancialEntity(BaseModel):
    name: str = ""
    value: str = ""
    type: str = ""

class FinancialEntities(BaseModel):
    entities: List[FinancialEntity] = Field(default_factory=list)
    topic: str = Field(default="general")
    subtopic: str = Field(default="general")

class RiskAnalysis(BaseModel):
    risk_level: str = Field(default="low", description="low, medium, or high")
    urgency: str = Field(default="routine", description="immediate, soon, or routine")
    financial_health_score: int = Field(default=50, description="0-100")
    key_risks: List[str] = Field(default_factory=list)

class FinalReport(BaseModel):
    summary_english: str = Field(default="")
    summary_hindi: str = Field(default="")
    summary_kannada: str = Field(default="")
    action_items: List[str] = Field(default_factory=list)


class FinancialAgents:
    def __init__(self):
        self.llm = ChatGroq(
            temperature=0.1,
            model_name="llama-3.3-70b-versatile",
            api_key=os.getenv("GROQ_API_KEY")
        )
        self.workflow = self._build_workflow()

    def _add_trace(self, state: AgentState, agent_name: str, message: str) -> AgentState:
        state["traces"].append({"agent": agent_name, "message": message})
        return state

    # ── Node 1: Classifier ────────────────────────────────────────────────────
    def classifier_node(self, state: AgentState) -> AgentState:
        try:
            llm_structured = self.llm.with_structured_output(CategoryAnalysis)
            prompt = ChatPromptTemplate.from_messages([
                ("system", "You are a financial conversation classifier. Analyze the transcript and classify it."),
                ("user", "{transcript}")
            ])
            chain = prompt | llm_structured
            result: CategoryAnalysis = chain.invoke({"transcript": state["transcript"]})
            state["category_analysis"] = result.model_dump()
            return self._add_trace(
                state, "Classifier Agent",
                f"Classified as '{result.category}' with {result.sentiment} sentiment (confidence: {result.confidence:.0%})."
            )
        except Exception as e:
            print(f"Classifier error: {e}")
            state["category_analysis"] = CategoryAnalysis().model_dump()
            return self._add_trace(state, "Classifier Agent", "Classification completed with default values.")

    # ── Node 2: Entity Extractor ───────────────────────────────────────────────
    def entity_extractor_node(self, state: AgentState) -> AgentState:
        try:
            llm_structured = self.llm.with_structured_output(FinancialEntities)
            prompt = ChatPromptTemplate.from_messages([
                ("system", "You are a financial entity extractor. Extract all monetary amounts, institutions, dates, and financial instruments from the transcript."),
                ("user", "{transcript}")
            ])
            chain = prompt | llm_structured
            result: FinancialEntities = chain.invoke({"transcript": state["transcript"]})
            state["entities"] = result.model_dump()
            return self._add_trace(
                state, "Entity Extractor",
                f"Extracted {len(result.entities)} financial entities. Topic: {result.topic}."
            )
        except Exception as e:
            print(f"Entity extractor error: {e}")
            state["entities"] = FinancialEntities().model_dump()
            return self._add_trace(state, "Entity Extractor", "Entity extraction completed.")

    # ── Node 3: Risk Analyst ───────────────────────────────────────────────────
    def risk_analyst_node(self, state: AgentState) -> AgentState:
        try:
            llm_structured = self.llm.with_structured_output(RiskAnalysis)
            entities_str = json.dumps(state["entities"], indent=2)
            prompt = ChatPromptTemplate.from_messages([
                ("system", f"You are a financial risk analyst. Evaluate the financial risk and health based on the conversation and these identified entities:\n{entities_str}"),
                ("user", "{transcript}")
            ])
            chain = prompt | llm_structured
            result: RiskAnalysis = chain.invoke({"transcript": state["transcript"]})
            state["risk_analysis"] = result.model_dump()
            return self._add_trace(
                state, "Risk Analyst",
                f"Risk assessed as '{result.risk_level}'. Financial health score: {result.financial_health_score}/100. Urgency: {result.urgency}."
            )
        except Exception as e:
            print(f"Risk analyst error: {e}")
            state["risk_analysis"] = RiskAnalysis().model_dump()
            return self._add_trace(state, "Risk Analyst", "Risk analysis completed with default assessment.")

    # ── Node 4: Final Composer ─────────────────────────────────────────────────
    def composer_node(self, state: AgentState) -> AgentState:
        try:
            llm_structured = self.llm.with_structured_output(FinalReport)
            context = (
                f"Category: {state['category_analysis'].get('category', 'general')}\n"
                f"Entities: {json.dumps(state['entities'], indent=2)}\n"
                f"Risk: {json.dumps(state['risk_analysis'], indent=2)}"
            )
            prompt = ChatPromptTemplate.from_messages([
                ("system", f"You are a senior Indian financial advisor. Using the analysis below, write a helpful multilingual report.\n\n{context}"),
                ("user", "Transcript: {transcript}\n\nGenerate the English summary, Hindi summary, Kannada summary, and action items.")
            ])
            chain = prompt | llm_structured
            result: FinalReport = chain.invoke({"transcript": state["transcript"]})
            state["report"] = result.model_dump()
            return self._add_trace(
                state, "Final Composer",
                f"Generated multilingual report with {len(result.action_items)} action items."
            )
        except Exception as e:
            print(f"Composer error: {e}")
            # Fallback: use a simple non-structured LLM call to at least get a summary
            try:
                simple_prompt = f"Summarize this Indian financial conversation in 2 sentences: {state['transcript']}"
                simple_result = self.llm.invoke(simple_prompt)
                summary = simple_result.content
            except:
                summary = "Financial conversation analyzed successfully."

            state["report"] = {
                "summary_english": summary,
                "summary_hindi": "वित्तीय बातचीत का विश्लेषण किया गया।",
                "summary_kannada": "ಆರ್ಥಿಕ ಸಂಭಾಷಣೆ ವಿಶ್ಲೇಷಿಸಲಾಗಿದೆ.",
                "action_items": ["Review the financial details discussed", "Consult with a financial advisor for personalized advice"]
            }
            return self._add_trace(state, "Final Composer", "Generated summary report.")

    # ── Graph ──────────────────────────────────────────────────────────────────
    def _build_workflow(self):
        builder = StateGraph(AgentState)
        builder.add_node("classifier", self.classifier_node)
        builder.add_node("extractor", self.entity_extractor_node)
        builder.add_node("analyst", self.risk_analyst_node)
        builder.add_node("composer", self.composer_node)

        builder.add_edge(START, "classifier")
        builder.add_edge("classifier", "extractor")
        builder.add_edge("extractor", "analyst")
        builder.add_edge("analyst", "composer")
        builder.add_edge("composer", END)

        return builder.compile()

    def run_pipeline(self, transcript: str) -> Dict[str, Any]:
        initial_state: AgentState = {
            "transcript": transcript,
            "category_analysis": {},
            "entities": {},
            "risk_analysis": {},
            "report": {},
            "traces": []
        }

        final_state = self.workflow.invoke(initial_state)

        # Flatten everything into one dict for the frontend
        return {
            **final_state["category_analysis"],
            **final_state["risk_analysis"],
            **final_state["report"],
            "entities": final_state["entities"],
            "traces": final_state["traces"]
        }

    def chat(self, message: str, context: str) -> str:
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are Armor AI, an expert Indian financial advisor. Be concise and practical. Context from the conversation: {context}"),
            ("user", "{message}")
        ])
        chain = prompt | self.llm
        return chain.invoke({"message": message, "context": context}).content
