import { useState, useRef } from "react";
import axios from "axios";

const FINANCIAL_KEYWORDS = [
  "emi", "sip", "loan", "investment", "mutual fund", "fd", "insurance",
  "salary", "budget", "savings", "interest", "tax", "credit", "stock",
  "karz", "udhar", "bachat", "nivesh", "byaj", "paisa", "lakhs", "crores"
];

export default function Recorder({ onResult, setLoading }) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [detectedKeywords, setDetectedKeywords] = useState([]);
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];
    setDetectedKeywords([]);

    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "audio/wav" });
      await sendAudio(blob);
      stream.getTracks().forEach((t) => t.stop());
    };

    recorder.start();
    mediaRef.current = recorder;
    setRecording(true);
    setSeconds(0);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);

    // Live keyword detection via Web Speech API
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "hi-IN";

      recognition.onresult = (event) => {
        const text = Array.from(event.results)
          .map(r => r[0].transcript)
          .join(" ")
          .toLowerCase();

        const found = FINANCIAL_KEYWORDS.filter(kw => text.includes(kw));
        if (found.length) setDetectedKeywords([...new Set(found)]);
      };

      recognition.start();
      recognitionRef.current = recognition;
    }
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    recognitionRef.current?.stop();
    clearInterval(timerRef.current);
    setRecording(false);
  };

  const sendAudio = async (blob) => {
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", blob, "recording.wav");
      const res = await axios.post("http://127.0.0.1:8000/transcribe", form);
      onResult(res.data);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (s) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="recorder">
      <div
        className={`mic-btn ${recording ? "recording" : ""}`}
        onClick={recording ? stopRecording : startRecording}
      >
        <span>{recording ? "⏹" : "🎙"}</span>
      </div>

      {recording && <div className="pulse-ring" />}

      <p className="rec-label">
        {recording ? "Recording... tap to stop" : "Tap to record conversation"}
      </p>

      {recording && <p className="rec-timer">{fmt(seconds)}</p>}

      {detectedKeywords.length > 0 && (
        <div className="live-keywords">
          {detectedKeywords.map((kw) => (
            <span key={kw} className="kw-tag">⚡ {kw}</span>
          ))}
        </div>
      )}
    </div>
  );
}