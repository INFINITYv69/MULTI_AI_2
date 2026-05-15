import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Mic, MicOff, Trash2, Send, Globe, Brain, Target, AlertTriangle, FileText, BarChart3, Lightbulb, TrendingUp, Search, MessageSquare, Edit3, CheckCircle, Activity, Sparkles } from "lucide-react";
import OutputCard from "../components/OutputCard";
import RiskGauge from "../components/RiskGauge";
import AIInsightsBadge from "../components/AIInsightsBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { generateMockAnalysis, type AIAnalysis, sampleConversations } from "../lib/mockAI";
import { useStore } from "../lib/store";

export default function ProductPage() {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AIAnalysis | null>(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [editingTranscript, setEditingTranscript] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState("");
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [transcriptionLabel, setTranscriptionLabel] = useState("Hindi / Hinglish / English");
  const [downloadLanguage, setDownloadLanguage] = useState<"en" | "hi" | "es" | "fr">("en");
  const { addConversation } = useStore();

  const detectTopicFromText = useCallback((text: string) => {
    const normalized = text.toLowerCase();
    if (normalized.includes("sip")) return "SIP";
    if (normalized.includes("insurance")) return "Insurance";
    if (normalized.includes("emi")) return "EMI";
    if (normalized.includes("loan")) return "Loan";
    return "Loan";
  }, []);

  const handleRecordToggle = useCallback(() => {
    if (recording) {
      setRecording(false);
      setTranscribing(true);
      setTranscriptionLabel("Hindi / Hinglish / English");

      setTimeout(() => {
        setTranscribing(false);
        const randomSample = sampleConversations[Math.floor(Math.random() * sampleConversations.length)];
        setInput(randomSample.input);
        setEditedTranscript(randomSample.input);
        setReviewMode(true);
      }, 1500);
    } else {
      setRecording(true);
      setInput("");
      setEditedTranscript("");
      setResult(null);
      setReviewMode(false);
      setEditingTranscript(false);
      setRecordSeconds(0);
    }
  }, [recording]);

  const handleAnalyze = useCallback(() => {
    const analysisInput = editingTranscript ? editedTranscript : input;
    if (!analysisInput.trim()) {
      setError("Please enter a financial conversation");
      return;
    }
    setError("");
    setReviewMode(false);
    setAnalyzing(true);
    setResult(null);

    // Simulate API latency and always produce a mock result when backend may be unavailable.
    setTimeout(() => {
      const analysis = generateMockAnalysis(analysisInput);
      setResult(analysis);
      addConversation(analysisInput, analysis);
      setAnalyzing(false);
    }, 750);
  }, [input, editedTranscript, editingTranscript, addConversation]);

  const clearAll = useCallback(() => {
    setInput("");
    setEditedTranscript("");
    setError("");
    setResult(null);
    setRecording(false);
    setTranscribing(false);
    setReviewMode(false);
    setEditingTranscript(false);
    setRecordSeconds(0);
  }, []);

  useEffect(() => {
    if (!recording) return;
    const interval = window.setInterval(() => setRecordSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(interval);
  }, [recording]);

  const formattedTimer = new Date(recordSeconds * 1000).toISOString().substring(14, 19);
  const transcriptTopic = detectTopicFromText(editingTranscript ? editedTranscript : input);

  const getRiskLevel = (score: number) =>
    score > 70 ? "High" : score > 40 ? "Medium" : "Low";

  const getRiskColor = (score: number) =>
    score > 70 ? "bg-destructive" : score > 40 ? "bg-warning" : "bg-success";

  const getRiskLabel = (score: number) =>
    score > 70 ? "High" : score > 40 ? "Medium" : "Low";

  const languageOptions = [
    { code: "en", label: "English" },
    { code: "hi", label: "Hindi" },
    { code: "es", label: "Spanish" },
    { code: "fr", label: "French" },
  ] as const;

  const translations = {
    en: {
      reportTitle: "ARMOR AI Conversation Report",
      generated: "Generated",
      conversationInput: "Conversation Input",
      noTranscript: "No transcript provided.",
      summary: "Summary",
      analysisOverview: "Analysis Overview",
      languageDetected: "Language detected",
      topic: "Topic",
      subTopic: "Sub-topic",
      intent: "Intent",
      sentiment: "Sentiment",
      riskScore: "Risk score",
      confidence: "Confidence",
      extractedEntities: "Extracted Entities",
      keyInsights: "Key Financial Insights",
      predictiveAnalysis: "Predictive Analysis",
      expectedRiskShift: "Expected risk shift",
      trend: "Trend",
      smartSuggestions: "Smart Suggestions",
    },
    hi: {
      reportTitle: "आर्मर एआई संवाद रिपोर्ट",
      generated: "निर्मित:",
      conversationInput: "संवाद इनपुट",
      noTranscript: "कोई ट्रांसक्रिप्ट उपलब्ध नहीं है।",
      summary: "सारांश",
      analysisOverview: "विश्लेषण अवलोकन",
      languageDetected: "भाषा का पता चला",
      topic: "विषय",
      subTopic: "उप-विषय",
      intent: "इरादा",
      sentiment: "भाव",
      riskScore: "जोखिम स्कोर",
      confidence: "विश्वास",
      extractedEntities: "निकाली गई संस्थाएँ",
      keyInsights: "मुख्य वित्तीय अंतर्दृष्टि",
      predictiveAnalysis: "पूर्वानुमानित विश्लेषण",
      expectedRiskShift: "अपेक्षित जोखिम परिवर्तन",
      trend: "प्रवृत्ति",
      smartSuggestions: "स्मार्ट सुझाव",
    },
    es: {
      reportTitle: "Informe de conversación ARMOR AI",
      generated: "Generado",
      conversationInput: "Entrada de conversación",
      noTranscript: "No se proporcionó transcripción.",
      summary: "Resumen",
      analysisOverview: "Resumen del análisis",
      languageDetected: "Idioma detectado",
      topic: "Tema",
      subTopic: "Subtema",
      intent: "Intención",
      sentiment: "Sentimiento",
      riskScore: "Puntuación de riesgo",
      confidence: "Confianza",
      extractedEntities: "Entidades extraídas",
      keyInsights: "Perspectivas financieras clave",
      predictiveAnalysis: "Análisis predictivo",
      expectedRiskShift: "Cambio de riesgo esperado",
      trend: "Tendencia",
      smartSuggestions: "Sugerencias inteligentes",
    },
    fr: {
      reportTitle: "Rapport de conversation ARMOR AI",
      generated: "Généré",
      conversationInput: "Entrée de la conversation",
      noTranscript: "Aucune transcription fournie.",
      summary: "Résumé",
      analysisOverview: "Aperçu de l'analyse",
      languageDetected: "Langue détectée",
      topic: "Sujet",
      subTopic: "Sous-sujet",
      intent: "Intention",
      sentiment: "Sentiment",
      riskScore: "Score de risque",
      confidence: "Confiance",
      extractedEntities: "Entités extraites",
      keyInsights: "Perspectives financières clés",
      predictiveAnalysis: "Analyse prédictive",
      expectedRiskShift: "Variation de risque attendue",
      trend: "Tendance",
      smartSuggestions: "Suggestions intelligentes",
    },
  } as const;

  const translate = (key: keyof typeof translations.en) => translations[downloadLanguage][key];

  const uiTranslations = {
    en: {
      languageDetection: "LANGUAGE DETECTION",
      financialTopicDetection: "FINANCIAL TOPIC DETECTION",
      entityExtraction: "ENTITY EXTRACTION",
      sentimentAnalysis: "SENTIMENT ANALYSIS",
      intentDetection: "INTENT DETECTION",
      riskScoreVisual: "RISK SCORE (VISUAL)",
      structuredSummary: "STRUCTURED SUMMARY",
      keyFinancialInsights: "KEY FINANCIAL INSIGHTS",
      predictiveAnalysis: "PREDICTIVE ANALYSIS",
      smartSuggestions: "SMART SUGGESTIONS",
      fieldLanguage: "Language",
      fieldConfidence: "Confidence",
      fieldTopic: "Topic",
      fieldSubTopic: "Sub-topic",
      fieldSentiment: "Sentiment",
      fieldRiskScore: "Risk Score",
      fieldRiskLevel: "Risk Level",
      reportLanguage: "Report Language",
      downloadReport: "Download Report",
      riskIncreaseMessage: "Risk may increase by {percent}% if decision is taken now.",
      awaitingAudioTitle: "Awaiting Audio Input",
      awaitingAudioText: "Record a mock financial conversation or type one in to see the AI analysis engine in action.",
      trySample: "Try a sample",
    },
    hi: {
      languageDetection: "भाषा पहचान",
      financialTopicDetection: "वित्तीय विषय पहचान",
      entityExtraction: "इकाई निष्कर्षण",
      sentimentAnalysis: "भाव विश्लेषण",
      intentDetection: "इरादा पहचान",
      riskScoreVisual: "जोखिम स्कोर (दृश्य)",
      structuredSummary: "संरचित सारांश",
      keyFinancialInsights: "मुख्य वित्तीय अंतर्दृष्टि",
      predictiveAnalysis: "पूर्वानुमानित विश्लेषण",
      smartSuggestions: "स्मार्ट सुझाव",
      fieldLanguage: "भाषा",
      fieldConfidence: "विश्वास",
      fieldTopic: "विषय",
      fieldSubTopic: "उप-विषय",
      fieldSentiment: "भाव",
      fieldRiskScore: "जोखिम स्कोर",
      fieldRiskLevel: "जोखिम स्तर",
      reportLanguage: "रिपोर्ट भाषा",
      downloadReport: "रिपोर्ट डाउनलोड करें",
      riskIncreaseMessage: "यदि अभी निर्णय लिया जाता है तो जोखिम {percent}% बढ़ सकता है।",
      awaitingAudioTitle: "ऑडियो इनपुट की प्रतीक्षा",
      awaitingAudioText: "एक नकली वित्तीय वार्ता रिकॉर्ड करें या इसे देखने के लिए एक टाइप करें।",
      trySample: "एक नमूना आज़माएं",
    },
    es: {
      languageDetection: "DETALLE DE IDIOMA",
      financialTopicDetection: "IDENTIFICACIÓN DE TEMA FINANCIERO",
      entityExtraction: "EXTRACCIÓN DE ENTIDADES",
      sentimentAnalysis: "ANÁLISIS DE SENTIMIENTO",
      intentDetection: "DETECCIÓN DE INTENCIÓN",
      riskScoreVisual: "PUNTAJE DE RIESGO (VISUAL)",
      structuredSummary: "RESUMEN ESTRUCTURADO",
      keyFinancialInsights: "PERSPECTIVAS FINANCIERAS CLAVE",
      predictiveAnalysis: "ANÁLISIS PREDICTIVO",
      smartSuggestions: "SUGERENCIAS INTELIGENTES",
      fieldLanguage: "Idioma",
      fieldConfidence: "Confianza",
      fieldTopic: "Tema",
      fieldSubTopic: "Subtema",
      fieldSentiment: "Sentimiento",
      fieldRiskScore: "Puntuación de riesgo",
      fieldRiskLevel: "Nivel de riesgo",
      reportLanguage: "Idioma del informe",
      downloadReport: "Descargar informe",
      riskIncreaseMessage: "El riesgo puede aumentar un {percent}% si se toma la decisión ahora.",
      awaitingAudioTitle: "Esperando entrada de audio",
      awaitingAudioText: "Grabe una conversación financiera de ejemplo o escriba una para ver el motor de análisis de IA en acción.",
      trySample: "Prueba una muestra",
    },
    fr: {
      languageDetection: "DÉTECTION DE LA LANGUE",
      financialTopicDetection: "DÉTECTION DU SUJET FINANCIER",
      entityExtraction: "EXTRACTION D'ENTITÉS",
      sentimentAnalysis: "ANALYSE DES SENTIMENTS",
      intentDetection: "DÉTECTION DE L'INTENTION",
      riskScoreVisual: "SCORE DE RISQUE (VISUEL)",
      structuredSummary: "RÉSUMÉ STRUCTURÉ",
      keyFinancialInsights: "APERÇUS FINANCIERS CLÉS",
      predictiveAnalysis: "ANALYSE PRÉDICTIVE",
      smartSuggestions: "SUGGESTIONS INTELLIGENTES",
      fieldLanguage: "Langue",
      fieldConfidence: "Confiance",
      fieldTopic: "Sujet",
      fieldSubTopic: "Sous-sujet",
      fieldSentiment: "Sentiment",
      fieldRiskScore: "Score de risque",
      fieldRiskLevel: "Niveau de risque",
      reportLanguage: "Langue du rapport",
      downloadReport: "Télécharger le rapport",
      riskIncreaseMessage: "Le risque peut augmenter de {percent}% si la décision est prise maintenant.",
      awaitingAudioTitle: "En attente de saisie audio",
      awaitingAudioText: "Enregistrez une conversation financière fictive ou tapez-en une pour voir le moteur d'analyse IA en action.",
      trySample: "Essayez un exemple",
    },
  } as const;

  const translateUI = (key: keyof typeof uiTranslations.en) => uiTranslations[downloadLanguage][key];

  const reportTranslations = {
    hi: {
      High: "उच्च",
      Medium: "मध्यम",
      Low: "निम्न",
      stable: "स्थिर",
      upward: "बढ़ रहा है",
      moderate: "मध्यम",
      uncertain: "अनिश्चित",
      increasing: "बढ़ रहा है",
      decreasing: "घट रहा है",
      "Loan Application": "लोन आवेदन",
      "EMI Management": "ईएमआई प्रबंधन",
      "SIP Investment": "एसआईपी निवेश",
      "Insurance Query": "बीमा प्रश्न",
      "Payment Processing": "भुगतान प्रसंस्करण",
      "Credit Score": "क्रेडिट स्कोर",
      "Home Loan": "होम लोन",
      "Car Loan": "कार लोन",
      "Personal Loan": "पर्सनल लोन",
      "SIP Top-up": "एसआईपी टॉप-अप",
      "Systematic Investment Plan": "सिस्टमैटिक इन्वेस्टमेंट प्लान",
      "Term Insurance": "टर्म इंश्योरेंस",
      "Health / Life Insurance": "स्वास्थ्य / जीवन बीमा",
      "Loan Amount": "ऋण राशि",
      EMI: "ईएमआई",
      Duration: "अवधि",
      "Investment amount": "निवेश राशि",
      "N/A": "एन/ए",
      English: "अंग्रेज़ी",
      "Hindi / Hinglish / English": "हिंदी / हिंग्लिश / अंग्रेज़ी",
      Unknown: "अज्ञात",
      General: "सामान्य",
      Planning: "योजना",
      Doubt: "संदेह",
      Decision: "निर्णय",
      "Seeking Information": "जानकारी खोज रहा है",
      "Ready to Purchase": "खरीदने के लिए तैयार",
      Positive: "सकारात्मक",
      Neutral: "तटस्थ",
      Concerned: "चिंतित",
      Cautious: "सावधान",
      "Reduce EMI burden by negotiating a lower rate.": "कम दर पर वार्ता करके ईएमआई बोझ कम करें।",
      "Increase savings buffer before approving the loan.": "लोन मंजूर करने से पहले बचत बफर बढ़ाएँ।",
      "Consider alternative plans with shorter tenure.": "छोटी अवधि के साथ विकल्प योजनाओं पर विचार करें।",
      "Maintain discipline with monthly SIP contributions.": "मासिक एसआईपी योगदान के साथ अनुशासन बनाए रखें।",
      "Increase savings to support future investment goals.": "भविष्य के निवेश लक्ष्यों का समर्थन करने के लिए बचत बढ़ाएँ।",
      "Consider alternative asset allocations for downside protection.": "डाउनसाइड सुरक्षा के लिए वैकल्पिक संपत्ति आवंटन पर विचार करें।",
      "Verify coverage adequacy against current liabilities.": "मौजूदा देनदारियों के खिलाफ कवरेज की पर्याप्तता सत्यापित करें।",
      "Review premium impact on monthly budget.": "मासिक बजट पर प्रीमियम के प्रभाव की समीक्षा करें।",
      "Consider riders only if they add clear value.": "केवल तभी राइडर्स पर विचार करें जब वे स्पष्ट मूल्य जोड़ें।",
      "Provide more details for precise financial classification.": "सटीक वित्तीय वर्गीकरण के लिए अधिक जानकारी प्रदान करें।",
      "The conversation is classified as": "वार्ता को वर्गीकृत किया गया है",
      "with": "के साथ",
      "context. The user’s tone is": "प्रसंग। उपयोगकर्ता की भावना है",
      "and the AI has extracted key financial parameters to support faster decision-making.": "और तेज निर्णय लेने के लिए एआई ने प्रमुख वित्तीय मानदंड निकाले हैं।",
      "EMI affordability should be confirmed before commitment.": "प्रतिबद्धता से पहले ईएमआई की वहनीयता की पुष्टि की जानी चाहिए।",
      "Long-term commitment may impact monthly cashflow.": "दीर्घकालिक प्रतिबद्धता मासिक नकदी प्रवाह को प्रभावित कर सकती है।",
      "Higher debt exposure creates potential financial stress.": "उच्च ऋण एक्सपोज़र संभावित वित्तीय तनाव पैदा करता है।",
      "SIP commitment indicates long-term planning.": "एसआईपी प्रतिबद्धता दीर्घकालिक योजना को दर्शाती है।",
      "Consistent contributions improve goal probability.": "सतत योगदान लक्ष्य की संभावना में सुधार करते हैं।",
      "Inflation may reduce real returns if not monitored.": "यदि गंभीरता से नहीं देखा गया तो मुद्रास्फीति वास्तविक प्रतिफल को कम कर सकती है।",
      "Insurance intent signals focus on protection needs.": "बीमा इरादा सुरक्षा आवश्यकताओं पर फोकस को संकेत करता है।",
      "Premium increases may affect affordability.": "प्रीमियम में वृद्धि वहनीयता को प्रभावित कर सकती है।",
      "Coverage should be aligned with dependents’ needs.": "कवरेज को आश्रितों की आवश्यकताओं के अनुसार संरेखित किया जाना चाहिए।",
      "Current input is too generic for concrete product recommendations.": "वर्तमान इनपुट ठोस उत्पाद सिफारिशों के लिए बहुत सामान्य है।",
      "Missing explicit amount or tenure information reduces accuracy.": "स्पष्ट राशि या अवधि की जानकारी की कमी सटीकता को कम करती है।",
      "Risk assessment is limited without structured figures.": "संरचित आंकड़ों के बिना जोखिम आकलन सीमित है।",
      "Risk may increase if current repayment capacity is not reviewed.": "यदि वर्तमान पुनर्भुगतान क्षमता की समीक्षा नहीं की जाती है तो जोखिम बढ़ सकता है।",
      "Risk may increase if contributions are interrupted or markets decline.": "यदि योगदान में रुकावट आती है या बाजार गिरते हैं तो जोखिम बढ़ सकता है।",
      "Risk may increase slightly if policy cost rises or coverage gaps remain.": "यदि पॉलिसी लागत बढ़ती है या कवरेज गैप बने रहते हैं तो जोखिम थोड़ा बढ़ सकता है।",
      "Risk may increase due to ambiguity in the user’s request.": "उपयोगकर्ता की अनुरोध में अस्पष्टता के कारण जोखिम बढ़ सकता है।",
    },
    es: {
      High: "Alto",
      Medium: "Medio",
      Low: "Bajo",
      stable: "Estable",
      upward: "En aumento",
      moderate: "Moderado",
      uncertain: "Incierto",
      increasing: "En aumento",
      decreasing: "Disminuyendo",
      "Loan Application": "Solicitud de préstamo",
      "EMI Management": "Gestión de EMI",
      "SIP Investment": "Inversión SIP",
      "Insurance Query": "Consulta de seguro",
      "Payment Processing": "Procesamiento de pago",
      "Credit Score": "Puntaje de crédito",
      "Home Loan": "Préstamo hipotecario",
      "Car Loan": "Préstamo para automóvil",
      "Personal Loan": "Préstamo personal",
      "SIP Top-up": "Complemento SIP",
      "Systematic Investment Plan": "Plan de inversión sistemático",
      "Term Insurance": "Seguro a término",
      "Health / Life Insurance": "Seguro de salud / vida",
      "Loan Amount": "Monto del préstamo",
      EMI: "EMI",
      Duration: "Duración",
      "Investment amount": "Monto de inversión",
      "N/A": "N/A",
      English: "Inglés",
      "Hindi / Hinglish / English": "Hindi / Hinglish / Inglés",
      Unknown: "Desconocido",
      General: "General",
      Planning: "Planificación",
      Doubt: "Duda",
      Decision: "Decisión",
      "Seeking Information": "Buscando información",
      "Ready to Purchase": "Listo para comprar",
      Positive: "Positivo",
      Neutral: "Neutral",
      Concerned: "Preocupado",
      Cautious: "Precavido",
      "Reduce EMI burden by negotiating a lower rate.": "Reduzca la carga de EMI negociando una tasa más baja.",
      "Increase savings buffer before approving the loan.": "Aumente el colchón de ahorros antes de aprobar el préstamo.",
      "Consider alternative plans with shorter tenure.": "Considere planes alternativos con un plazo más corto.",
      "Maintain discipline with monthly SIP contributions.": "Mantenga la disciplina con las contribuciones mensuales de SIP.",
      "Increase savings to support future investment goals.": "Aumente los ahorros para apoyar objetivos de inversión futuros.",
      "Consider alternative asset allocations for downside protection.": "Considere asignaciones de activos alternativas para protección a la baja.",
      "Verify coverage adequacy against current liabilities.": "Verifique la adecuación de la cobertura contra pasivos actuales.",
      "Review premium impact on monthly budget.": "Revise el impacto de la prima en el presupuesto mensual.",
      "Consider riders only if they add clear value.": "Considere riders solo si agregan un valor claro.",
      "Provide more details for precise financial classification.": "Brinde más detalles para una clasificación financiera precisa.",
      "The conversation is classified as": "La conversación se clasifica como",
      "with": "con",
      "context. The user’s tone is": "contexto. El tono del usuario es",
      "and the AI has extracted key financial parameters to support faster decision-making.": "y la IA ha extraído parámetros financieros clave para apoyar decisiones más rápidas.",
      "EMI affordability should be confirmed before commitment.": "Se debe confirmar la asequibilidad de EMI antes del compromiso.",
      "Long-term commitment may impact monthly cashflow.": "El compromiso a largo plazo puede afectar el flujo de caja mensual.",
      "Higher debt exposure creates potential financial stress.": "Una mayor exposición a la deuda crea estrés financiero potencial.",
      "SIP commitment indicates long-term planning.": "El compromiso SIP indica planificación a largo plazo.",
      "Consistent contributions improve goal probability.": "Las contribuciones consistentes mejoran la probabilidad de alcanzar el objetivo.",
      "Inflation may reduce real returns if not monitored.": "La inflación puede reducir los rendimientos reales si no se monitorea.",
      "Insurance intent signals focus on protection needs.": "La intención de seguro señala un enfoque en las necesidades de protección.",
      "Premium increases may affect affordability.": "Los aumentos de prima pueden afectar la asequibilidad.",
      "Coverage should be aligned with dependents’ needs.": "La cobertura debe alinearse con las necesidades de los dependientes.",
      "Current input is too generic for concrete product recommendations.": "La entrada actual es demasiado genérica para recomendaciones de producto concretas.",
      "Missing explicit amount or tenure information reduces accuracy.": "La falta de información explícita de monto o plazo reduce la precisión.",
      "Risk assessment is limited without structured figures.": "La evaluación de riesgos es limitada sin cifras estructuradas.",
      "Risk may increase if current repayment capacity is not reviewed.": "El riesgo puede aumentar si no se revisa la capacidad actual de pago.",
      "Risk may increase if contributions are interrupted or markets decline.": "El riesgo puede aumentar si las contribuciones se interrumpen o los mercados caen.",
      "Risk may increase slightly if policy cost rises or coverage gaps remain.": "El riesgo puede aumentar ligeramente si el costo de la póliza aumenta o permanecen brechas de cobertura.",
      "Risk may increase due to ambiguity in the user’s request.": "El riesgo puede aumentar debido a la ambigüedad en la solicitud del usuario.",
    },
    fr: {
      High: "Élevé",
      Medium: "Moyen",
      Low: "Faible",
      stable: "Stable",
      upward: "En hausse",
      moderate: "Modéré",
      uncertain: "Incertain",
      increasing: "En hausse",
      decreasing: "En baisse",
      "Loan Application": "Demande de prêt",
      "EMI Management": "Gestion de EMI",
      "SIP Investment": "Investissement SIP",
      "Insurance Query": "Demande d'assurance",
      "Payment Processing": "Traitement des paiements",
      "Credit Score": "Cote de crédit",
      "Home Loan": "Prêt immobilier",
      "Car Loan": "Prêt auto",
      "Personal Loan": "Prêt personnel",
      "SIP Top-up": "Complément SIP",
      "Systematic Investment Plan": "Plan d'investissement systématique",
      "Term Insurance": "Assurance temporaire",
      "Health / Life Insurance": "Assurance santé / vie",
      "Loan Amount": "Montant du prêt",
      EMI: "EMI",
      Duration: "Durée",
      "Investment amount": "Montant de l'investissement",
      "N/A": "N/A",
      English: "Anglais",
      "Hindi / Hinglish / English": "Hindi / Hinglish / Anglais",
      Unknown: "Inconnu",
      General: "Général",
      Planning: "Planification",
      Doubt: "Doute",
      Decision: "Décision",
      "Seeking Information": "Recherche d'informations",
      "Ready to Purchase": "Prêt à acheter",
      Positive: "Positif",
      Neutral: "Neutre",
      Concerned: "Préoccupé",
      Cautious: "Prudent",
      "Reduce EMI burden by negotiating a lower rate.": "Réduisez la charge EMI en négociant un taux plus bas.",
      "Increase savings buffer before approving the loan.": "Augmentez la réserve d'épargne avant d'approuver le prêt.",
      "Consider alternative plans with shorter tenure.": "Envisagez des plans alternatifs avec une durée plus courte.",
      "Maintain discipline with monthly SIP contributions.": "Maintenez la discipline avec des contributions SIP mensuelles.",
      "Increase savings to support future investment goals.": "Augmentez l'épargne pour soutenir les objectifs d'investissement futurs.",
      "Consider alternative asset allocations for downside protection.": "Envisagez des allocations d'actifs alternatives pour la protection à la baisse.",
      "Verify coverage adequacy against current liabilities.": "Vérifiez l'adéquation de la couverture par rapport aux passifs actuels.",
      "Review premium impact on monthly budget.": "Examinez l'impact de la prime sur le budget mensuel.",
      "Consider riders only if they add clear value.": "Envisagez des options supplémentaires uniquement si elles ajoutent une valeur claire.",
      "Provide more details for precise financial classification.": "Fournissez plus de détails pour une classification financière précise.",
      "The conversation is classified as": "La conversation est classée comme",
      "with": "avec",
      "context. The user’s tone is": "contexte. Le ton de l'utilisateur est",
      "and the AI has extracted key financial parameters to support faster decision-making.": "et l'IA a extrait des paramètres financiers clés pour soutenir une prise de décision plus rapide.",
      "EMI affordability should be confirmed before commitment.": "L'accessibilité de l'EMI doit être confirmée avant l'engagement.",
      "Long-term commitment may impact monthly cashflow.": "L'engagement à long terme peut affecter la trésorerie mensuelle.",
      "Higher debt exposure creates potential financial stress.": "Une exposition plus élevée à la dette crée un stress financier potentiel.",
      "SIP commitment indicates long-term planning.": "L'engagement SIP indique une planification à long terme.",
      "Consistent contributions improve goal probability.": "Des contributions cohérentes améliorent la probabilité d'atteindre l'objectif.",
      "Inflation may reduce real returns if not monitored.": "L'inflation peut réduire les rendements réels si elle n'est pas surveillée.",
      "Insurance intent signals focus on protection needs.": "L'intention d'assurance signale un accent sur les besoins de protection.",
      "Premium increases may affect affordability.": "Les augmentations de prime peuvent affecter l'accessibilité.",
      "Coverage should be aligned with dependents’ needs.": "La couverture doit être alignée sur les besoins des personnes à charge.",
      "Current input is too generic for concrete product recommendations.": "L'entrée actuelle est trop générique pour des recommandations de produits concrètes.",
      "Missing explicit amount or tenure information reduces accuracy.": "L'absence de montant explicite ou d'informations sur la durée réduit la précision.",
      "Risk assessment is limited without structured figures.": "L'évaluation des risques est limitée sans chiffres structurés.",
      "Risk may increase if current repayment capacity is not reviewed.": "Le risque peut augmenter si la capacité de remboursement actuelle n'est pas revue.",
      "Risk may increase if contributions are interrupted or markets decline.": "Le risque peut augmenter si les contributions sont interrompues ou si les marchés baissent.",
      "Risk may increase slightly if policy cost rises or coverage gaps remain.": "Le risque peut augmenter légèrement si le coût de la police augmente ou si des lacunes de couverture subsistent.",
      "Risk may increase due to ambiguity in the user’s request.": "Le risque peut augmenter en raison de l'ambiguïté de la demande de l'utilisateur.",
    },
  } as const;

  const translateValue = (value: string) =>
    downloadLanguage === "en"
      ? value
      : reportTranslations[downloadLanguage][value as keyof typeof reportTranslations["hi"]] ?? value;

  const translateText = (text: string) =>
    downloadLanguage === "en"
      ? text
      : reportTranslations[downloadLanguage][text as keyof typeof reportTranslations["hi"]] ?? text;

  const translateSummary = (analysis: AIAnalysis) => {
    if (downloadLanguage === "en") return analysis.summary;

    const topic = translateValue(analysis.topic);
    const subTopic = translateValue(analysis.subTopic);
    const sentiment = translateValue(analysis.sentiment.label);

    const prefix = translateText("The conversation is classified as");
    const withText = translateText("with");
    const toneText = translateText("context. The user’s tone is");
    const suffix = translateText("and the AI has extracted key financial parameters to support faster decision-making.");

    return `${prefix} ${topic} ${withText} ${subTopic} ${toneText} ${sentiment.toLowerCase()} ${suffix}`;
  };

  const createReportText = (analysis: AIAnalysis) => {
    return [
      translate("reportTitle"),
      `${translate("generated")}: ${new Date().toLocaleString()}`,
      "",
      `${translate("languageDetected")}: ${translateValue(analysis.language.detected)} (${(analysis.language.confidence * 100).toFixed(0)}%)`,
      `${translate("topic")}: ${translateValue(analysis.topic)}`,
      `${translate("subTopic")}: ${translateValue(analysis.subTopic)}`,
      `${translate("intent")}: ${translateValue(analysis.intent)}`,
      `${translate("sentiment")}: ${translateValue(analysis.sentiment.label)} (${(analysis.sentiment.score * 100).toFixed(0)}%)`,
      `${translate("riskScore")}: ${analysis.riskScore} / 100`,
      `${translate("confidence")}: ${analysis.confidenceScore}%`,
      "",
      `${translate("extractedEntities")}:`,
      ...analysis.entities.map((entity) => `- ${entity.type}: ${entity.value}`),
      "",
      `${translate("summary")}:`,
      translateSummary(analysis),
      "",
      `${translate("keyInsights")}:`,
      ...analysis.keyInsights.map((item) => `- ${translateText(item)}`),
      "",
      `${translate("predictiveAnalysis")}:`,
      `- ${translate("expectedRiskShift")}: ${analysis.predictiveRisk.increase}%`,
      `- ${translate("trend")}: ${translateValue(analysis.predictiveRisk.trend)}`,
      `- ${translateText(analysis.predictiveRisk.note)}`,
      "",
      `${translate("smartSuggestions")}:`,
      ...analysis.suggestions.map((item) => `- ${translateText(item)}`),
    ].join("\n");
  };

  const escapeHtml = (text: string) =>
    text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");

  const buildReportHtml = (analysis: AIAnalysis) => {
    const transcript = escapeHtml((editingTranscript ? editedTranscript : input).trim() || translate("noTranscript"));
    const renderList = (items: string[]) => items.map((item) => `<li style="margin-bottom:6px;">${escapeHtml(item)}</li>`).join("");

    return `
      <div style="font-family: Arial, sans-serif; color: #111827; padding: 24px; background: #ffffff; width: 100%; box-sizing: border-box;">
        <h1 style="font-size:24px; margin-bottom: 12px;">${escapeHtml(translate("reportTitle"))}</h1>
        <div style="font-size:12px; color:#4b5563; margin-bottom: 24px;">${escapeHtml(translate("generated"))}: ${escapeHtml(new Date().toLocaleString())}</div>

        <section style="margin-bottom:24px;">
          <h2 style="font-size:16px; margin-bottom:10px;">${escapeHtml(translate("conversationInput"))}</h2>
          <div style="font-size:13px; color:#111827; line-height:1.6;">${transcript}</div>
        </section>

        <section style="margin-bottom:24px;">
          <h2 style="font-size:16px; margin-bottom:10px;">${escapeHtml(translate("summary"))}</h2>
          <div style="font-size:13px; color:#111827; line-height:1.6;">${escapeHtml(translateSummary(analysis))}</div>
        </section>

        <section style="margin-bottom:24px;">
          <h2 style="font-size:16px; margin-bottom:10px;">${escapeHtml(translate("analysisOverview"))}</h2>
          <ul style="font-size:13px; color:#111827; line-height:1.8; padding-left:18px;">
            <li>${escapeHtml(`${translate("languageDetected")}: ${translateValue(analysis.language.detected)} (${(analysis.language.confidence * 100).toFixed(0)}%)`)}</li>
            <li>${escapeHtml(`${translate("topic")}: ${translateValue(analysis.topic)}`)}</li>
            <li>${escapeHtml(`${translate("subTopic")}: ${translateValue(analysis.subTopic)}`)}</li>
            <li>${escapeHtml(`${translate("intent")}: ${translateValue(analysis.intent)}`)}</li>
            <li>${escapeHtml(`${translate("sentiment")}: ${translateValue(analysis.sentiment.label)} (${(analysis.sentiment.score * 100).toFixed(0)}%)`)}</li>
            <li>${escapeHtml(`${translate("riskScore")}: ${analysis.riskScore} / 100`)}</li>
            <li>${escapeHtml(`${translate("confidence")}: ${analysis.confidenceScore}%`)}</li>
          </ul>
        </section>

        ${analysis.entities.length ? `
          <section style="margin-bottom:24px;">
            <h2 style="font-size:16px; margin-bottom:10px;">${escapeHtml(translate("extractedEntities"))}</h2>
            <ul style="font-size:13px; color:#111827; line-height:1.8; padding-left:18px;">
              ${analysis.entities
                .map((entity) => `<li>${escapeHtml(`${translateValue(entity.type)}: ${entity.value}`)}</li>`)
                .join("")}
            </ul>
          </section>
        ` : ""}

        ${analysis.keyInsights.length ? `
          <section style="margin-bottom:24px;">
            <h2 style="font-size:16px; margin-bottom:10px;">${escapeHtml(translate("keyInsights"))}</h2>
            <ul style="font-size:13px; color:#111827; line-height:1.8; padding-left:18px;">
              ${renderList(analysis.keyInsights.map((item) => translateText(item)))}
            </ul>
          </section>
        ` : ""}

        <section style="margin-bottom:24px;">
          <h2 style="font-size:16px; margin-bottom:10px;">${escapeHtml(translate("predictiveAnalysis"))}</h2>
          <ul style="font-size:13px; color:#111827; line-height:1.8; padding-left:18px;">
            <li>${escapeHtml(`${translate("expectedRiskShift")}: ${analysis.predictiveRisk.increase}%`)}</li>
            <li>${escapeHtml(`${translate("trend")}: ${translateValue(analysis.predictiveRisk.trend)}`)}</li>
            <li>${escapeHtml(translateText(analysis.predictiveRisk.note))}</li>
          </ul>
        </section>

        ${analysis.suggestions.length ? `
          <section style="margin-bottom:24px;">
            <h2 style="font-size:16px; margin-bottom:10px;">${escapeHtml(translate("smartSuggestions"))}</h2>
            <ul style="font-size:13px; color:#111827; line-height:1.8; padding-left:18px;">
              ${renderList(analysis.suggestions.map((item) => translateText(item)))}
            </ul>
          </section>
        ` : ""}
      </div>
    `;
  };

  const downloadReport = async () => {
    if (!safeResult) return;

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const html = buildReportHtml(safeResult);
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "-9999px";
    container.style.width = "800px";
    container.style.pointerEvents = "none";
    container.style.background = "#ffffff";
    container.style.display = "block";
    container.innerHTML = html;
    document.body.appendChild(container);

    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

    try {
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = margin;

      doc.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - margin * 2;

      while (heightLeft > 0) {
        doc.addPage();
        position = margin - (imgHeight - heightLeft);
        doc.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - margin * 2;
      }

      doc.save(`armor-ai-conversation-report-${downloadLanguage}-${Date.now()}.pdf`);
    } finally {
      document.body.removeChild(container);
    }
  };

  const safeResult = result ? {
    language: result.language ?? { detected: "Unknown", confidence: 0 },
    topic: result.topic ?? "Unknown",
    subTopic: result.subTopic ?? "General",
    intent: result.intent ?? "Unknown",
    sentiment: result.sentiment ?? { label: "Unknown", score: 0 },
    entities: result.entities ?? [],
    summary: result.summary ?? "No summary available",
    keyInsights: result.keyInsights ?? [],
    predictiveRisk: result.predictiveRisk ?? { increase: 0, trend: "stable", note: "No predictive analysis available." },
    suggestions: result.suggestions ?? [],
    riskScore: result.riskScore ?? 0,
    confidenceScore: result.confidenceScore ?? 0,
  } : null;

  return (
    <div className="min-h-screen pt-20 section-padding relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">
            Conversation <span className="gradient-text">Intelligence Engine</span>
          </h1>
          <p className="text-muted-foreground">Record or input a financial conversation to get instant AI-powered insights.</p>
        </motion.div>

        <AIInsightsBadge />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
            
            <div className={`glass-card p-6 space-y-4 transition-all duration-300 ${reviewMode ? 'ring-2 ring-primary/50' : ''}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  {reviewMode ? (
                    <><Edit3 className="w-4 h-4 text-primary" /> Review & Edit Transcript</>
                  ) : "Audio / Text Input"}
                </h3>
                {reviewMode && (
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full animate-pulse">
                    Action Required
                  </span>
                )}
              </div>

              <div className="relative">
                <textarea
                  className={`input-dark w-full h-48 resize-none font-mono text-sm transition-colors ${reviewMode ? 'bg-secondary/40 border-primary/40 focus:border-primary' : ''}`}
                  placeholder="Enter your financial conversation (e.g., EMI manage ho jayega kya?)"
                  value={editingTranscript ? editedTranscript : input}
                  onChange={(e) => {
                    if (editingTranscript) setEditedTranscript(e.target.value);
                    else setInput(e.target.value);
                  }}
                  disabled={recording || transcribing || analyzing}
                />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                  <span>Topic: <strong className="text-foreground">{transcriptTopic}</strong></span>
                  {recording && <span className="inline-flex items-center gap-2 text-primary font-semibold">{formattedTimer}</span>}
                </div>
                {error && (
                  <div className="mt-2 text-sm text-destructive font-medium" role="alert">
                    {error}
                  </div>
                )}
                <AnimatePresence>
                  {transcribing && (
                    <motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 z-10 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg border border-border"
                    >
                      <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin mb-3" />
                      <p className="text-sm font-medium text-foreground">Transcribing ({transcriptionLabel})...</p>
                      <p className="text-xs text-muted-foreground">Generating transcript and language metadata</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex flex-wrap gap-3 items-center">
                <button
                  type="button"
                  onClick={() => {
                    setEditingTranscript(true);
                    setEditedTranscript(input);
                  }}
                  disabled={!reviewMode || recording || transcribing || analyzing}
                  className="px-4 py-2 rounded-lg text-sm border border-primary/30 text-primary hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Edit Transcript
                </button>
                {editingTranscript && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTranscript(false);
                      setInput(editedTranscript);
                    }}
                    className="px-4 py-2 rounded-lg text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Save Transcript
                  </button>
                )}
              </div>

              {reviewMode && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-muted-foreground bg-primary/5 p-3 rounded-md border border-primary/10 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p>Transcription complete. Please review the text above for any code-mixed (Hinglish) errors, modify if necessary, then click Analyze.</p>
                </motion.div>
              )}

              <div className="flex items-center gap-3 flex-wrap">
                <button 
                  onClick={handleRecordToggle}
                  disabled={transcribing || analyzing}
                  className={`inline-flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                    recording ? "bg-destructive text-destructive-foreground animate-pulse-glow" : "btn-outline-glow"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {recording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  {recording ? "Stop Recording" : "Record Audio"}
                </button>
                
                <button 
                  onClick={handleAnalyze} 
                  disabled={!((editingTranscript ? editedTranscript : input).trim()) || analyzing || recording || transcribing} 
                  className="btn-glow inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" /> {reviewMode ? "Confirm & Analyze" : "Analyze"}
                </button>
                
                <button onClick={clearAll} className="px-4 py-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <AnimatePresence>
                {recording && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                    <span className="text-sm text-destructive font-medium">Listening...</span>
                    <div className="flex-1 flex items-center gap-0.5 h-6">
                      {Array.from({ length: 30 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-destructive/60 rounded-full"
                          animate={{ height: [4, Math.random() * 20 + 4, 4] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.05 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick samples */}
            {!reviewMode && !recording && !transcribing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{translateUI("trySample")}</h4>
                <div className="flex flex-wrap gap-2">
                  {sampleConversations.slice(0, 3).map((s) => (
                    <button key={s.id} onClick={() => setInput(s.input)} className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors text-left max-w-full truncate">
                      {s.input}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Output Panel */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <AnimatePresence mode="wait">
              {analyzing ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card p-12 flex flex-col items-center justify-center space-y-4 min-h-[400px]">
                  <div className="w-16 h-16 flex items-center justify-center relative">
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin" />
                    <Brain className="w-6 h-6 text-primary animate-pulse" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-sm font-medium text-foreground">Extracting Financial Parameters...</p>
                    <p className="text-xs text-muted-foreground">Running NLP Pipeline (Entities, Sentiment, Intent)</p>
                  </div>
                </motion.div>
              ) : result ? (
                <motion.div key="results" className="space-y-4">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <OutputCard label={translateUI("languageDetection")} value="" icon={<Globe className="w-4 h-4" />} delay={0}>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex justify-between gap-4">
                          <span>{translateUI("fieldLanguage")}</span>
                          <span className="font-semibold text-foreground">{translateValue(safeResult.language.detected)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span>{translateUI("fieldConfidence")}</span>
                          <span className="font-semibold text-foreground">{(safeResult.language.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </OutputCard>

                    <OutputCard label={translateUI("financialTopicDetection")} value="" icon={<Brain className="w-4 h-4" />} delay={0.05}>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex justify-between gap-4">
                          <span>{translateUI("fieldTopic")}</span>
                          <span className="font-semibold text-foreground">{translateValue(safeResult.topic)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span>{translateUI("fieldSubTopic")}</span>
                          <span className="font-semibold text-foreground">{translateValue(safeResult.subTopic)}</span>
                        </div>
                      </div>
                    </OutputCard>

                    <OutputCard label={translateUI("entityExtraction")} value="" icon={<Search className="w-4 h-4" />} delay={0.1}>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {[
                          { key: "Loan Amount", fallback: "N/A" },
                          { key: "EMI", fallback: "N/A" },
                          { key: "Duration", fallback: "N/A" },
                          { key: "Investment amount", fallback: "N/A" },
                        ].map((field) => {
                          const entity = safeResult.entities.find((it) => it.type.toLowerCase() === field.key.toLowerCase());
                          return (
                            <li key={field.key} className="flex justify-between items-center rounded-2xl bg-slate-950/80 px-4 py-3">
                              <span>{translateValue(field.key)}</span>
                              <span className="font-semibold text-foreground">{translateValue(entity?.value ?? field.fallback)}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </OutputCard>

                    <OutputCard label={translateUI("sentimentAnalysis")} value="" icon={<MessageSquare className="w-4 h-4" />} delay={0.15}>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex justify-between gap-4">
                          <span>{translateUI("fieldSentiment")}</span>
                          <span className="font-semibold text-foreground">{translateValue(safeResult.sentiment.label)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span>{translateUI("fieldConfidence")}</span>
                          <span className="font-semibold text-foreground">{(safeResult.sentiment.score * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </OutputCard>

                    <OutputCard label={translateUI("intentDetection")} value="" icon={<Target className="w-4 h-4" />} delay={0.2}>
                      <p className="text-sm text-muted-foreground">{translateValue(safeResult.intent)}</p>
                    </OutputCard>

                    <OutputCard label={translateUI("riskScoreVisual")} value="" icon={<AlertTriangle className="w-4 h-4" />} delay={0.25}>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{translateUI("fieldRiskScore")}</span>
                          <span className="font-semibold text-foreground">{safeResult.riskScore} / 100</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>{translateUI("fieldRiskLevel")}</span>
                          <span className={`font-bold ${safeResult.riskScore > 70 ? 'text-destructive' : safeResult.riskScore > 40 ? 'text-warning' : 'text-success'}`}>
                            {translateValue(safeResult.riskScore > 70 ? 'High' : safeResult.riskScore > 40 ? 'Medium' : 'Low')}
                          </span>
                        </div>
                        <RiskGauge score={safeResult.riskScore} size="lg" />
                        <div className="h-2 rounded-full bg-slate-900/70 overflow-hidden">
                          <div className={`${getRiskColor(safeResult.riskScore)} h-2 rounded-full`} style={{ width: `${safeResult.riskScore}%` }} />
                        </div>
                      </div>
                    </OutputCard>

                    <OutputCard label={translateUI("structuredSummary")} value="" icon={<FileText className="w-4 h-4" />} delay={0.3}>
                      <p className="text-sm text-foreground leading-relaxed">{translateSummary(safeResult)}</p>
                    </OutputCard>

                    <OutputCard label={translateUI("keyFinancialInsights")} value="" icon={<Sparkles className="w-4 h-4" />} delay={0.35}>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {safeResult.keyInsights.map((insight, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="mt-1 text-primary">•</span>
                            <span>{translateText(insight)}</span>
                          </li>
                        ))}
                      </ul>
                    </OutputCard>

                    <OutputCard label={translateUI("predictiveAnalysis")} value="" icon={<TrendingUp className="w-4 h-4" />} delay={0.4}>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p className="font-semibold text-foreground">{translateUI("riskIncreaseMessage").replace("{percent}", String(safeResult.predictiveRisk.increase))}</p>
                        <p>{translateText(safeResult.predictiveRisk.note)}</p>
                      </div>
                    </OutputCard>

                    <OutputCard label={translateUI("smartSuggestions")} value="" icon={<Lightbulb className="w-4 h-4 text-amber-500" />} delay={0.45}>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {safeResult.suggestions.map((suggestion, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="mt-1 text-violet-300">•</span>
                            <span>{translateText(suggestion)}</span>
                          </li>
                        ))}
                      </ul>
                    </OutputCard>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <label className="font-medium">{translateUI("reportLanguage")}</label>
                      <Select value={downloadLanguage} onValueChange={(value) => setDownloadLanguage(value as "en" | "hi" | "es" | "fr")}> 
                        <SelectTrigger className="min-w-[180px]">
                          <SelectValue placeholder={translateUI("reportLanguage")} />
                        </SelectTrigger>
                        <SelectContent>
                          {languageOptions.map((option) => (
                            <SelectItem key={option.code} value={option.code}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <button
                      type="button"
                      onClick={downloadReport}
                      className="px-5 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
                    >
                      {translateUI("downloadReport")}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 flex flex-col items-center justify-center space-y-4 min-h-[400px] text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-2 border border-primary/10 shadow-[0_0_30px_rgba(var(--primary),0.1)]">
                    <Mic className="w-8 h-8 text-primary/60" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{translateUI("awaitingAudioTitle")}</h3>
                  <p className="text-sm text-muted-foreground max-w-[250px]">
                    {translateUI("awaitingAudioText")}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
