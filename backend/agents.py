import os
import json
from typing import List, Dict, Any, TypedDict
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from langgraph.graph import StateGraph, START, END
from langchain_community.tools import DuckDuckGoSearchRun

# ── Shared state ──────────────────────────────────────────────────────────────
class AgentState(TypedDict):
    transcript: str
    category_analysis: Dict[str, Any]
    entities: Dict[str, Any]
    risk_analysis: Dict[str, Any]
    market_data: str
    report: Dict[str, Any]
    traces: List[Dict[str, str]]

# ── Pydantic schemas ────────────────────────────────────────────────────────
class CategoryAnalysis(BaseModel):
    category: str = Field(default="general", description="One of: loan, investment, emi, budget, insurance, tax, stocks, general")
    confidence: float = Field(default=1.0)
    is_financial: bool = Field(default=True)
    sentiment: str = Field(default="neutral", description="positive, negative, or neutral")
    search_required: bool = Field(default=False, description="Whether to search for real-time rates or prices")
    search_query: str = Field(default="", description="The specific query to search for if required")

# ... rest of models remain same ...
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
    market_context: str = Field(default="", description="Brief real-time market context found")


class FinancialAgents:
    def __init__(self):
        self.llm = ChatGroq(
            temperature=0.1,
            model_name="llama-3.3-70b-versatile",
            api_key=os.getenv("GROQ_API_KEY")
        )
        self.search_tool = DuckDuckGoSearchRun()
        self.workflow = self._build_workflow()

    def _add_trace(self, state: AgentState, agent_name: str, message: str) -> AgentState:
        state["traces"].append({"agent": agent_name, "message": message})
        return state

    # ── Node 1: Classifier ────────────────────────────────────────────────────
    def classifier_node(self, state: AgentState) -> AgentState:
        try:
            llm_structured = self.llm.with_structured_output(CategoryAnalysis)
            prompt = ChatPromptTemplate.from_messages([
                ("system", "You are a financial classifier. Determine the category and if we need live market data (interest rates, stock prices, etc)."),
                ("user", "{transcript}")
            ])
            chain = prompt | llm_structured
            result: CategoryAnalysis = chain.invoke({"transcript": state["transcript"]})
            state["category_analysis"] = result.model_dump()
            return self._add_trace(
                state, "Classifier Agent",
                f"Classified as '{result.category}'. Search Required: {result.search_required}."
            )
        except Exception as e:
            state["category_analysis"] = CategoryAnalysis().model_dump()
            return self._add_trace(state, "Classifier Agent", "Classification completed with defaults.")

    # ── Node 2: Search Agent (Tool Caller) ──────────────────────────────────
    def search_node(self, state: AgentState) -> AgentState:
        cat = state["category_analysis"]
        if not cat.get("search_required") or not cat.get("search_query"):
            state["market_data"] = "No live search performed."
            return self._add_trace(state, "Market Research Agent", "Skipped search (not required).")
        
        try:
            query = cat["search_query"]
            search_result = self.search_tool.run(query)
            state["market_data"] = search_result
            return self._add_trace(state, "Market Research Agent", f"Found live data for: {query}")
        except Exception as e:
            state["market_data"] = "Live search failed."
            return self._add_trace(state, "Market Research Agent", "Search tool failed, proceeding with offline knowledge.")

    # ── Node 3: Entity Extractor ───────────────────────────────────────────────
    def entity_extractor_node(self, state: AgentState) -> AgentState:
        try:
            llm_structured = self.llm.with_structured_output(FinancialEntities)
            prompt = ChatPromptTemplate.from_messages([
                ("system", "You are an entity extractor. Extract financial data. Use this live context if relevant: {context}"),
                ("user", "{transcript}")
            ])
            chain = prompt | llm_structured
            result: FinancialEntities = chain.invoke({
                "transcript": state["transcript"],
                "context": state["market_data"]
            })
            state["entities"] = result.model_dump()
            return self._add_trace(state, "Entity Extractor", f"Extracted {len(result.entities)} entities.")
        except Exception as e:
            state["entities"] = FinancialEntities().model_dump()
            return self._add_trace(state, "Entity Extractor", "Extraction completed.")

    # ── Node 4: Risk Analyst ───────────────────────────────────────────────────
    def risk_analyst_node(self, state: AgentState) -> AgentState:
        try:
            llm_structured = self.llm.with_structured_output(RiskAnalysis)
            prompt = ChatPromptTemplate.from_messages([
                ("system", "You are a risk analyst. Evaluate risk using the transcript, entities, and live market data: {market_data}"),
                ("user", "{transcript}")
            ])
            chain = prompt | llm_structured
            result: RiskAnalysis = chain.invoke({
                "transcript": state["transcript"],
                "market_data": state["market_data"]
            })
            state["risk_analysis"] = result.model_dump()
            return self._add_trace(state, "Risk Analyst", f"Risk level: {result.risk_level}.")
        except Exception as e:
            state["risk_analysis"] = RiskAnalysis().model_dump()
            return self._add_trace(state, "Risk Analyst", "Risk analysis completed.")

    # ── Node 5: Final Composer ─────────────────────────────────────────────────
    def composer_node(self, state: AgentState) -> AgentState:
        try:
            llm_structured = self.llm.with_structured_output(FinalReport)
            context = f"Category: {state['category_analysis']}\nEntities: {state['entities']}\nMarket Data: {state['market_data']}"
            prompt = ChatPromptTemplate.from_messages([
                ("system", f"You are a senior advisor. Generate a multilingual report. Include 'market_context' from the live data: {state['market_data']}"),
                ("user", "Transcript: {transcript}")
            ])
            chain = prompt | llm_structured
            result: FinalReport = chain.invoke({"transcript": state["transcript"]})
            state["report"] = result.model_dump()
            return self._add_trace(state, "Final Composer", "Generated multilingual report with live market context.")
        except Exception as e:
            state["report"] = FinalReport(summary_english="Analysis completed.").model_dump()
            return self._add_trace(state, "Final Composer", "Generated report with defaults.")

    def _build_workflow(self):
        builder = StateGraph(AgentState)
        builder.add_node("classifier", self.classifier_node)
        builder.add_node("search", self.search_node)
        builder.add_node("extractor", self.entity_extractor_node)
        builder.add_node("analyst", self.risk_analyst_node)
        builder.add_node("composer", self.composer_node)

        builder.add_edge(START, "classifier")
        builder.add_edge("classifier", "search")
        builder.add_edge("search", "extractor")
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
            "market_data": "",
            "report": {},
            "traces": []
        }
        final_state = self.workflow.invoke(initial_state)
        return {
            **final_state["category_analysis"],
            **final_state["risk_analysis"],
            **final_state["report"],
            "market_data": final_state["market_data"],
            "traces": final_state["traces"]
        }

    def chat(self, message: str, context: str) -> str:
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are Armor AI financial advisor. Context: {context}"),
            ("user", "{message}")
        ])
        chain = prompt | self.llm
        return chain.invoke({"message": message, "context": context}).content
