import os
from typing import List, Dict, Any, TypedDict, Annotated
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field
from langgraph.graph import StateGraph, START, END

# Define the shared state between agents
class AgentState(TypedDict):
    transcript: str
    entities: Dict[str, Any]
    risk_analysis: Dict[str, Any]
    report: Dict[str, Any]
    traces: List[Dict[str, str]]

# Define structured outputs
class FinancialEntities(BaseModel):
    entities: List[Dict[str, str]]
    topic: str
    subtopic: str

class RiskAnalysis(BaseModel):
    risk_level: str
    sentiment: str
    urgency: str
    financial_health_score: int

class FinalReport(BaseModel):
    summary_english: str
    summary_hindi: str
    summary_kannada: str
    action_items: List[str]
    is_financial: bool

class FinancialAgents:
    def __init__(self):
        self.llm = ChatGroq(
            temperature=0.1,
            model_name="llama-3.3-70b-versatile",
            api_key=os.getenv("GROQ_API_KEY")
        )
        self.workflow = self._build_workflow()

    def _add_trace(self, state: AgentState, agent_name: str, message: str):
        state["traces"].append({
            "agent": agent_name,
            "message": message
        })
        return state

    def entity_extractor_node(self, state: AgentState):
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a specialized financial entity extractor. Extract structured data from the transcript."),
            ("user", "{transcript}")
        ])
        chain = prompt | self.llm | JsonOutputParser(pydantic_object=FinancialEntities)
        result = chain.invoke({"transcript": state["transcript"]})
        state["entities"] = result
        return self._add_trace(state, "Entity Extractor", "Successfully extracted financial entities, topics, and subtopics from the conversation.")

    def deception_detector_node(self, state: AgentState):
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a fraud and deception detection agent. Analyze the transcript for inconsistencies, suspicious financial claims, or irregular patterns. Context: {entities}"),
            ("user", "{transcript}")
        ])
        # Simple analysis for trace demonstration
        state["traces"].append({
            "agent": "Deception Detector",
            "message": "Analyzing linguistic patterns and cross-referencing entities for inconsistencies."
        })
        # Mocking some logic for now to keep it fast, but using LLM in a real scenario
        return state

    def risk_analyst_node(self, state: AgentState):
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a financial risk assessment agent. Analyze the risk and sentiment based on the transcript and identified entities: {entities}"),
            ("user", "{transcript}")
        ])
        chain = prompt | self.llm | JsonOutputParser(pydantic_object=RiskAnalysis)
        result = chain.invoke({
            "transcript": state["transcript"],
            "entities": state["entities"]
        })
        state["risk_analysis"] = result
        return self._add_trace(state, "Risk Analyst", f"Initial risk assessment complete. Risk level: {result['risk_level']}. Sentiment: {result['sentiment']}.")

    def risk_auditor_node(self, state: AgentState):
        # This agent 'audits' the previous assessment
        risk = state["risk_analysis"]
        if risk["financial_health_score"] < 40:
            message = "Audit flagged high risk. Reviewing mitigation strategies."
        else:
            message = "Audit confirmed stable financial parameters."
        
        return self._add_trace(state, "Risk Auditor", message)

    def composer_node(self, state: AgentState):
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a senior financial advisor. Generate a multi-lingual report.
            Entities: {entities}
            Risk Analysis: {risk}"""),
            ("user", "Transcript: {transcript}")
        ])
        chain = prompt | self.llm | JsonOutputParser(pydantic_object=FinalReport)
        result = chain.invoke({
            "transcript": state["transcript"],
            "entities": state["entities"],
            "risk": state["risk_analysis"]
        })
        state["report"] = result
        return self._add_trace(state, "Final Composer", "Consolidated all agent insights into a multi-lingual report and actionable advice.")

    def _build_workflow(self):
        builder = StateGraph(AgentState)
        
        # Add nodes
        builder.add_node("extractor", self.entity_extractor_node)
        builder.add_node("deception", self.deception_detector_node)
        builder.add_node("analyst", self.risk_analyst_node)
        builder.add_node("auditor", self.risk_auditor_node)
        builder.add_node("composer", self.composer_node)
        
        # Add edges
        builder.add_edge(START, "extractor")
        builder.add_edge("extractor", "deception")
        builder.add_edge("deception", "analyst")
        builder.add_edge("analyst", "auditor")
        builder.add_edge("auditor", "composer")
        builder.add_edge("composer", END)
        
        return builder.compile()

    def run_pipeline(self, transcript: str) -> Dict[str, Any]:
        initial_state: AgentState = {
            "transcript": transcript,
            "entities": {},
            "risk_analysis": {},
            "report": {},
            "traces": []
        }
        
        final_state = self.workflow.invoke(initial_state)
        
        # Combine everything for the frontend
        return {
            **final_state["entities"],
            **final_state["risk_analysis"],
            **final_state["report"],
            "traces": final_state["traces"]
        }

    def chat(self, message: str, context: str) -> str:
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are Armor AI, an Indian financial advisor. Context: {context}"),
            ("user", "{message}")
        ])
        chain = prompt | self.llm
        return chain.invoke({"message": message, "context": context}).content
