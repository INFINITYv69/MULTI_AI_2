from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from groq import Groq
from transformers import pipeline
from pydantic import BaseModel
import os, json, sqlite3, tempfile, shutil
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv
from agents import FinancialAgents

load_dotenv()
agents = FinancialAgents()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads directory exists
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Mount uploads directory to serve audio files
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# print("Loading Whisper medium on GPU...")
# whisper = WhisperModel("medium", device="cuda", compute_type="int8")
# print("Whisper ready on GPU!")

print("Loading financial classifier on CPU...")
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli", device=-1)
print("Classifier ready!")

print("Loading sentiment model on CPU...")
sentiment_model = pipeline("sentiment-analysis", model="cardiffnlp/twitter-xlm-roberta-base-sentiment", device=-1)
print("Sentiment ready!")

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

FINANCIAL_LABELS = [
    "loan discussion", "SIP or mutual fund investment",
    "EMI planning", "savings and budget",
    "insurance discussion", "tax planning",
    "stock market investment", "general conversation"
]

FINANCIAL_KEYWORDS = [ 
    "loan", "emi", "sip", "mutual fund", "fd", "insurance",
    "salary", "rent", "budget", "savings", "interest", "tax",
    "credit", "debt", "stock", "share", "portfolio", "retire",
    "karz", "udhar", "bachat", "nivesh", "byaj", "paisa",
    "lakh", "crore", "rupee", "home loan", "personal loan"
]

def init_db():
    conn = sqlite3.connect("armor.db")
    # Base table creation
    conn.execute("""
        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            transcript TEXT,
            language TEXT,
            sentiment TEXT,
            financial_category TEXT,
            confidence REAL,
            insights TEXT
        )
    """)
    # Safely add audio_url column if not exists
    cursor = conn.execute("PRAGMA table_info(conversations)")
    columns = [row[1] for row in cursor.fetchall()]
    if "audio_url" not in columns:
        conn.execute("ALTER TABLE conversations ADD COLUMN audio_url TEXT")
        print("Added audio_url column to database.")
    
    conn.commit()
    conn.close()

init_db()

def detect_category(text):
    result = classifier(text, FINANCIAL_LABELS, multi_label=False)
    return result["labels"][0], round(result["scores"][0] * 100, 1)

def detect_sentiment(text):
    try:
        result = sentiment_model(text[:512])[0]
        return result["label"].lower(), round(result["score"] * 100, 1)
    except:
        return "neutral", 0.0

def is_financial(text):
    return any(kw in text.lower() for kw in FINANCIAL_KEYWORDS)

def extract_insights(transcript, category, sentiment_label):
    try:
        # Use the multi-agent pipeline
        insights = agents.run_pipeline(transcript)
        
        # Ensure compatibility with existing frontend expectations
        if "is_financial" not in insights:
            insights["is_financial"] = True
            
        return insights
    except Exception as e:
        print(f"Insight extraction error: {e}")
        return {
            "risk_level": "low",
            "urgency": "Low",
            "financial_health_score": 0,
            "summary_english": f"Error during agent analysis: {str(e)}",
            "summary_hindi": "त्रुटि।",
            "summary_kannada": "ದೋಷ.",
            "action_items": [],
            "error": str(e)
        }

@app.post("/transcribe")
async def transcribe(language: str = "auto", file: UploadFile = File(...)):
    # Determine file extension from Content-Type or filename
    fname = file.filename or "recording.webm"
    ext = os.path.splitext(fname)[-1] or ".webm"
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name
    try:
        with open(tmp_path, "rb") as file_obj:
            transcription = groq_client.audio.transcriptions.create(
                file=(fname, file_obj.read()),
                model="whisper-large-v3",
                prompt="ಕನ್ನಡ, ಸಾಲ, ಹೂಡಿಕೆ, ಉಳಿತಾಯ, ಬಡ್ಡಿ, EMI, SIP, loan, mutual fund, bachat, nivesh, paise, rupees", # Added Kannada script terms
                response_format="json",
                language=None # Auto-detect
            )
        
        transcript = transcription.text
        language = getattr(transcription, 'language', 'unknown')
        
        # Save audio permanently
        audio_filename = f"audio_{int(datetime.now().timestamp())}{ext}"
        audio_path = UPLOAD_DIR / audio_filename
        shutil.copy2(tmp_path, audio_path)
        audio_url = f"http://localhost:8000/uploads/{audio_filename}"

        category, confidence = detect_category(transcript)
        sentiment_label, sentiment_score = detect_sentiment(transcript)
        financial = is_financial(transcript)
        insights = extract_insights(transcript, category, sentiment_label)

        conn = sqlite3.connect("armor.db")
        conn.execute(
            "INSERT INTO conversations (timestamp,transcript,language,sentiment,financial_category,confidence,insights,audio_url) VALUES (?,?,?,?,?,?,?,?)",
            (datetime.now().isoformat(), transcript, language, sentiment_label, category, confidence, json.dumps(insights), audio_url)
        )
        conn.commit()
        conn.close()

        return {
            "transcript": transcript,
            "language": language,
            "is_financial": financial,
            "category": category,
            "confidence": confidence,
            "sentiment": sentiment_label,
            "sentiment_score": sentiment_score,
            "insights": insights,
            "audio_url": audio_url
        }
    finally:
        os.unlink(tmp_path)

@app.get("/history")
def get_history():
    conn = sqlite3.connect("armor.db")
    rows = conn.execute(
        "SELECT id,timestamp,transcript,language,sentiment,financial_category,confidence,insights,audio_url FROM conversations ORDER BY timestamp DESC"
    ).fetchall()
    conn.close()
    return [{"id":r[0],"timestamp":r[1],"transcript":r[2],"language":r[3],"sentiment":r[4],"category":r[5],"confidence":r[6],"insights":json.loads(r[7]),"audio_url":r[8]} for r in rows]

@app.get("/stats")
def get_stats():
    conn = sqlite3.connect("armor.db")
    rows = conn.execute("SELECT insights,sentiment FROM conversations").fetchall()
    conn.close()
    if not rows:
        return {"total":0}
    risk = {"low":0,"medium":0,"high":0}
    intents = {}
    scores = []
    sentiments = {"positive":0,"negative":0,"neutral":0}
    for row in rows:
        ins = json.loads(row[0])
        r = ins.get("risk_level","low")
        risk[r] = risk.get(r,0)+1
        i = ins.get("intent","general")
        intents[i] = intents.get(i,0)+1
        s = ins.get("financial_health_score",50)
        if isinstance(s,(int,float)):
            scores.append(s)
        sent = row[1] or "neutral"
        sentiments[sent] = sentiments.get(sent,0)+1
    return {
        "total": len(rows),
        "financial_count": sum(1 for r in rows if json.loads(r[0]).get("is_financial")),
        "risk_counts": risk,
        "intent_counts": intents,
        "avg_health_score": round(sum(scores)/len(scores)) if scores else 0,
        "sentiments": sentiments
    }

class ReanalyzeRequest(BaseModel):
    transcript: str

@app.post("/reanalyze")
def reanalyze(req: ReanalyzeRequest):
    category, confidence = detect_category(req.transcript)
    sentiment_label, _ = detect_sentiment(req.transcript)
    insights = extract_insights(req.transcript, category, sentiment_label)
    conn = sqlite3.connect("armor.db")
    conn.execute(
        "INSERT INTO conversations (timestamp,transcript,language,sentiment,financial_category,confidence,insights,audio_url) VALUES (?,?,?,?,?,?,?,?)",
        (datetime.now().isoformat(), req.transcript, "edited", sentiment_label, category, confidence, json.dumps(insights), None)
    )
    conn.commit()
    conn.close()
    return {"insights":insights,"category":category,"sentiment":sentiment_label}

class UpdateTranscriptRequest(BaseModel):
    transcript: str

@app.put("/conversations/{id}")
def update_conversation(id: int, req: UpdateTranscriptRequest):
    category, confidence = detect_category(req.transcript)
    sentiment_label, _ = detect_sentiment(req.transcript)
    insights = extract_insights(req.transcript, category, sentiment_label)
    
    conn = sqlite3.connect("armor.db")
    conn.execute(
        "UPDATE conversations SET transcript = ?, language = ?, sentiment = ?, financial_category = ?, confidence = ?, insights = ? WHERE id = ?",
        (req.transcript, "edited", sentiment_label, category, confidence, json.dumps(insights), id)
    )
    conn.commit()
    conn.close()
    return {"id": id, "insights": insights, "category": category, "sentiment": sentiment_label}

class ChatRequest(BaseModel):
    message: str
    context: str  # the transcript/insights as context

@app.post("/chat")
def chat(req: ChatRequest):
    reply = agents.chat(req.message, req.context)
    return {"reply": reply}

@app.get("/")
def root():
    return {"status":"Armor AI running","gpu":True,"models":["whisper-medium-cuda","bart-large-mnli","xlm-roberta-sentiment","llama-3.3-70b"]}