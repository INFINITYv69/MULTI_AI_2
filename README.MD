# 🛡️ Armor AI — Multi-Agent Financial Autonomy

**Armor AI** is a state-of-the-art, multi-agent financial intelligence system designed to analyze Indian financial conversations in real-time. Built with **LangChain** and **LangGraph**, it utilizes a swarm of specialized LLM agents to transcribe, audit, and analyze unstructured audio data into structured financial insights.

---

## 🚀 Key Features

- 🎙️ **Real-time Voice Analysis**: Multilingual Speech-to-Text (STT) supporting Hindi, English, Kannada, and Hinglish via Groq Whisper Large V3.
- 🤖 **Agentic Workflow**: 5 specialized agents (Extractor, Deception Detector, Risk Analyst, Risk Auditor, Composer) collaborating on a shared LangGraph state.
- 📊 **Live Trace Observability**: Full visibility into the thought process, reasoning, and collaboration of each AI agent.
- 🛡️ **Risk Intelligence**: Real-time risk scoring, fraud detection, and actionable financial advice tailored to the Indian context.
- 📈 **Multilingual Summarization**: Generates summaries and action items in English, Hindi, and Kannada.
- 📱 **Modern UI**: A sleek, responsive dashboard built with React, Tailwind CSS, and Framer Motion.

---

## 🏗️ Architecture

- **Frontend**: React (Vite) + Tailwind CSS + Framer Motion + Lucide Icons.
- **Backend**: FastAPI (Python) + SQLite for persistence.
- **Orchestration**: LangGraph (Stateful Multi-Agent Workflow).
- **LLM**: Llama 3.3 70B via Groq Cloud (Ultra-low latency inference).
- **Models**: Whisper-Large-V3 (STT), BART-Large (Classification), XLM-RoBERTa (Sentiment).

---

## 🛠️ Installation & Setup

### 1. Prerequisites
- **Python**: 3.10 or higher
- **Node.js**: 18.x or higher (npm or yarn)
- **Groq API Key**: Obtain from [console.groq.com](https://console.groq.com)

### 2. Backend Setup
1.  **Navigate to the backend directory**:
    ```bash
    cd backend
    ```
2.  **Install Python dependencies**:
    ```bash
    pip install -r REQUIREMENTS.TXT
    ```
3.  **Configure Environment Variables**:
    Create a `.env` file in the `backend` folder:
    ```env
    GROQ_API_KEY=your_groq_api_key_here
    ```
4.  **Start the FastAPI server**:
    ```bash
    python main.py
    # OR
    uvicorn main:app --reload --port 8000
    ```

### 3. Frontend Setup
1.  **Navigate to the frontend directory**:
    ```bash
    cd frontend
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Start the development server**:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

---

## 🔍 Using the System

1.  **Launch Dashboard**: Open `http://localhost:5173` in your browser.
2.  **Analyze Audio**: Go to the **Analyze** page. You can record live audio or paste a transcript of a financial conversation.
3.  **Run AI Analysis**: Click the **Run AI Analysis** button to trigger the multi-agent workflow.
4.  **Agent Trace**: Visit the **Agents** section to see the live trace of how Extractor, Risk Analyst, and Auditor collaborated on your data.
5.  **History & Stats**: View previous analyses and aggregate financial health metrics in the **History** and **Dashboard** tabs.

---

## 📄 License
This project is licensed under the MIT License. Created for the Fintech Agentic AI Hackathon.
