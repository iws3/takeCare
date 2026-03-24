"use client";

import React, { useState, useRef, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Mic,
  MessageSquareText,
  BarChart3,
  Send,
  Paperclip,
  Bot,
  User,
  Activity,
  Zap,
  Search,
  FileText,
  Watch,
  X,
  Plus,
  ArrowRight,
  PhoneOff,
  Video,
  MicOff,
  Circle,
  FileUp,
  Camera,
  Loader2,
  Trash2,
  ChevronDown,
  ExternalLink,
  Heart,
  Brain,
  Pill,
  Clock,
  ChevronRight,
  FileDown,
  ArrowLeft
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SYNTHETIC_DOCTOR_DATA } from "@/lib/doctor-data";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Vapi from "@vapi-ai/web";
import { getVapiConfiguration } from "@/app/actions/vapi";
import { getMedicalHistory } from "@/app/actions/medical";


const SMART_CARE_TABS = [
  { id: "talk", label: "Talk", icon: Mic, description: "Voice interaction with AI medical agent" },
  { id: "text", label: "Text", icon: MessageSquareText, description: "Secure chat with medical AI" },
  { id: "analyze", label: "Analyze", icon: BarChart3, description: "Deep analysis of health records" },
];

export function SmartCareSection() {
  const [activeTab, setActiveTab] = useState("text");
  const [medicalContext, setMedicalContext] = useState<any>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);


  // Automatically load the extracted context from the database
  useEffect(() => {
    async function loadHistory() {
      try {
        const clerkId = "demo-user-123"; // Using mock ID as in dashboard
        const data = await getMedicalHistory(clerkId);
        
        if (data && data.medicalRecords && data.medicalRecords.length > 0) {
          // Find the most recent record with an analysis
          const recentRecord = data.medicalRecords.find(r => r.analysis);
          if (recentRecord && recentRecord.analysis) {
             setMedicalContext(recentRecord.analysis.rawJson);
             setAnalysisResult(recentRecord.analysis.summary);
          }
        } else {

          // Fallback to demo data if no records found
          const extractedData = {
            patient_summary: {
              name: "Sarah Jenkins",
              id: "TC-8291",
              latest_vitals: {
                weight: "57kg", height: "1.58m", bmi: "22.83",
                blood_pressure: "113/63 mmHg", heart_rate: "74 bpm",
                resp_rate: "15 c/m", temperature: "36.5°C"
              },
              lab_results: {
                malaria_test_mp: "NEGATIVE",
                widal_test: "Positive",
                titers: { "TO": "1/320", "BO": "1/320", "AO": "1/160", "CO": "1/160", "TH": "1/160", "CH": "1/160" }
              },
              diagnosis: "Severe Salmonellosis (Typhoid Fever)",
              symptoms: ["Headache", "Bitter mouth", "Fever", "Insomnia", "Stomach grumbling", "Nausea"],
              medications: [
                { name: "Cipro", dosage: "750mg", frequency: "Twice daily" },
                { name: "Metro", dosage: "500mg", frequency: "Twice daily" },
                { name: "Dexa", dosage: "0.5mg", frequency: "Twice daily" },
                { name: "Quick Reliever", frequency: "As needed" }
              ]
            }
          };
          setMedicalContext(extractedData);
        }
      } catch (error) {
        console.error("Failed to load medical history:", error);
      }
    }
    loadHistory();
  }, []);


  return (
    <div className="px-6 lg:px-12 mt-4 flex flex-col gap-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-black/5 p-1 rounded-2xl w-full lg:w-fit h-auto flex gap-1 mb-6">
          {SMART_CARE_TABS.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn(
                "rounded-xl px-6 py-2.5 transition-all duration-300 cursor-pointer flex-1 lg:flex-none",
                "data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 data-[state=active]:scale-[1.05]",
                "flex items-center justify-center gap-2 font-outfit font-bold text-sm"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="talk" key="talk">
            <VoiceAgentView medicalContext={medicalContext} />
          </TabsContent>
          <TabsContent value="text" key="text">
            <ChatbotView />
          </TabsContent>
          <TabsContent value="analyze" key="analyze">
            <AnalysisView 
              medicalContext={medicalContext} 
              onContextUpdate={setMedicalContext} 
              analysisResult={analysisResult}
              setAnalysisResult={setAnalysisResult}
            />
          </TabsContent>


        </AnimatePresence>
      </Tabs>
    </div>
  );
}

function VoiceAgentView({ medicalContext }: { medicalContext: any }) {

  const [callStatus, setCallStatus] = useState<"inactive" | "connecting" | "active">("inactive");
  const [isDoctorSpeaking, setIsDoctorSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [vapiInstance, setVapiInstance] = useState<any>(null);

  useEffect(() => {
    // Initialize Vapi client using the environment variable
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    if (!publicKey) {
      console.error("Vapi Public Key is missing in environment variables!");
      return;
    }
    const v = new Vapi(publicKey);
    setVapiInstance(v);

    v.on("call-start", () => setCallStatus("active"));
    v.on("call-end", () => {
      setCallStatus("inactive");
      setIsDoctorSpeaking(false);
    });
    v.on("speech-start", () => setIsDoctorSpeaking(true));
    v.on("speech-end", () => setIsDoctorSpeaking(false));
    v.on("error", (e) => {
      console.error("Vapi Error:", e);
      setCallStatus("inactive");
      setIsDoctorSpeaking(false);
    });

    return () => {
      v.stop();
    };
  }, []);

  const [selectedMeds, setSelectedMeds] = useState<string[]>([]);

  useEffect(() => {
    // Pre-select most recent/active medications if available
    if (medicalContext?.patient_summary?.medications) {
      setSelectedMeds(medicalContext.patient_summary.medications.map((m: any) => m.name));
    }
  }, [medicalContext]);

  const toggleMedication = (name: string) => {
    setSelectedMeds(prev => 
      prev.includes(name) ? prev.filter(m => m !== name) : [...prev, name]
    );
  };

  const toggleVoiceConsultation = async () => {
    if (callStatus === "active") {
      vapiInstance?.stop();
      return;
    }

    setCallStatus("connecting");
    setIsDoctorSpeaking(false);

    try {
      const result = await getVapiConfiguration();
      const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

      if (!result.success || !result.config) {
        console.warn("Failed to retrieve Vapi config", result.error);
        setCallStatus("inactive");
        return;
      }

      const selectedMedDetails = medicalContext?.patient_summary?.medications?.filter((m: any) => selectedMeds.includes(m.name)) || [];

      // Create dynamic context-aware prompt
      const contextPrompt = medicalContext ? `
        PATIENT MEDICAL CONTEXT (JSON):
        ${JSON.stringify(medicalContext, null, 2)}
        
        SELECTED MEDICATIONS TO DISCUSS:
        ${JSON.stringify(selectedMedDetails, null, 2)}

        INSTRUCTIONS:
        You are Sarah's AI Medical Assistant. Use her latest records to provide advice.
        - She has been diagnosed with Salmonellosis (Typhoid).
        - IMPORTANT: She specifically wants to talk about these medications: ${selectedMeds.join(", ")}.
        - Ensure she is taking them correctly according to the prescribed frequency.
        - Talk to her about her symptoms (stomach grumbling, nausea).
        - Be professional, empathetic, and clear.
      ` : result.config.systemPrompt;

      const firstMessage = selectedMeds.length > 0 
        ? `Hello Sarah, I've reviewed your results. I see you want to discuss your treatment using ${selectedMeds.join(" and ")}. How have you been feeling since you started them?`
        : medicalContext 
          ? `Hello Sarah, I've reviewed your latest results. How are you feeling today?`
          : `Hello, this is your TakeCare AI Assistant. How are you feeling today?`;

      await vapiInstance?.start(assistantId, {
        name: "TakeCare AI Doctor",
        firstMessage,
        model: {
          provider: "openai",
          model: "gpt-4o",
          messages: [{ role: "system", content: contextPrompt }],
          temperature: 0.6,
        },
        voice: {
          provider: "vapi",
          voiceId: "Leah",
        },
        backgroundDenoisingEnabled: true,
      });


    } catch (error) {
      console.error("Failed to start voice:", error);
      setCallStatus("inactive");
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    vapiInstance?.setMuted(nextMuted);
  };

  const endCall = () => {
    vapiInstance?.stop();
    setCallStatus("inactive");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative flex flex-col lg:flex-row p-6 lg:p-12 rounded-[3.5rem] border border-black/5 bg-white shadow-2xl overflow-hidden min-h-[600px] gap-8 lg:gap-12"
    >
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -mr-64 -mt-64 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-vital-orange/5 rounded-full blur-3xl -ml-40 -mb-40 pointer-events-none" />

      {/* LEFT SIDE: Doctor Image & Call Controls */}
      <div className="w-full lg:w-5/12 flex flex-col items-center justify-center gap-6 relative z-10">
        {/* Dynamic Doctor Avatar Container */}
        <div className="relative h-72 w-72 lg:h-96 lg:w-full lg:max-w-sm rounded-[3rem] overflow-hidden shadow-2xl border-[6px] border-white group">
          <AnimatePresence>
            {isDoctorSpeaking && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                className="absolute inset-0 bg-primary/30 rounded-[3rem] z-0 blur-lg"
              />
            )}
          </AnimatePresence>

          <img
            src="https://i.ibb.co/N2C49pPK/Chat-GPT-Image-Mar-21-2026-10-06-09-PM.png"
            alt="Dr. Leah"
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-all duration-700 z-10",
              callStatus === "active" ? "scale-105" : "scale-100 grayscale-[20%]"
            )}
          />

          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/40 to-transparent p-6 z-20 flex flex-col justify-end h-1/2">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                {callStatus === "active" ? (
                  <>
                    <div className="h-3 w-3 bg-green-500 rounded-full" />
                    <div className="absolute h-3 w-3 bg-green-500 rounded-full animate-ping" />
                  </>
                ) : (
                  <div className="h-3 w-3 bg-white/40 rounded-full" />
                )}
              </div>
              <h3 className="font-bricolage text-2xl font-bold text-white tracking-tight">Dr. Leah</h3>
            </div>
            <p className="text-white/60 text-sm font-medium mt-1">TakeCare Clinical AI</p>
          </div>
        </div>

        {/* Floating Call Controls Dashboard */}
        <div className="flex flex-wrap items-center justify-center gap-2 lg:gap-3 bg-white/80 backdrop-blur-2xl p-3 lg:p-4 rounded-[2rem] border border-black/5 shadow-xl w-fit relative z-20">
          <button
            onClick={toggleMute}
            disabled={callStatus !== "active"}
            className={cn(
              "h-12 w-12 lg:h-14 lg:w-14 rounded-2xl flex items-center justify-center transition-all",
              isMuted ? "bg-red-50 text-red-500" : "bg-black/5 text-black hover:bg-black/10",
              callStatus !== "active" && "opacity-40 cursor-not-allowed"
            )}
            title="Mute Microphone"
          >
            {isMuted ? <MicOff className="h-5 w-5 lg:h-6 lg:w-6" /> : <Mic className="h-5 w-5 lg:h-6 lg:w-6" />}
          </button>
          <button
            disabled={callStatus !== "active"}
            className="h-12 w-12 lg:h-14 lg:w-14 rounded-2xl flex items-center justify-center transition-all bg-black/5 text-black hover:bg-black/10 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Share Camera"
          >
            <Video className="h-5 w-5 lg:h-6 lg:w-6" />
          </button>
          <button
            disabled={callStatus !== "active"}
            className="h-12 w-12 lg:h-14 lg:w-14 rounded-2xl flex items-center justify-center transition-all bg-black/5 text-black hover:bg-black/10 disabled:opacity-40 disabled:cursor-not-allowed hidden sm:flex"
            title="Record Call"
          >
            <Circle className="h-5 w-5 lg:h-6 lg:w-6 text-red-500 fill-red-500/20" />
          </button>
          <button
            disabled={callStatus !== "active"}
            className="h-12 w-12 lg:h-14 lg:w-14 rounded-2xl flex items-center justify-center transition-all bg-black/5 text-black hover:bg-black/10 disabled:opacity-40 disabled:cursor-not-allowed hidden sm:flex"
            title="View Transcript"
          >
            <FileText className="h-5 w-5 lg:h-6 lg:w-6" />
          </button>

          <div className="w-[1px] h-8 bg-black/10 mx-1 hidden sm:block" />

          {callStatus === "active" ? (
            <button
              onClick={endCall}
              className="h-12 px-4 lg:h-14 lg:px-6 rounded-2xl flex items-center gap-2 transition-all bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 font-bold tracking-wide"
            >
              <PhoneOff className="h-5 w-5" />
              <span className="hidden sm:inline">End</span>
            </button>
          ) : (
            <button
              disabled={callStatus === "connecting"}
              onClick={toggleVoiceConsultation}
              className="h-12 px-6 lg:h-14 lg:px-8 rounded-2xl flex items-center gap-2 transition-all bg-black hover:scale-105 text-white shadow-xl shadow-black/20 font-bold tracking-wide"
            >
              {callStatus === "connecting" ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
              {callStatus === "connecting" ? "Connecting..." : "Connect"}
            </button>
          )}
        </div>
      </div>

      {/* RIGHT SIDE: Interactive Clinical Context */}
      <div className="w-full lg:w-7/12 flex flex-col justify-center gap-8 relative z-10 px-0 lg:px-4 text-center lg:text-left mt-4 lg:mt-0">
        <div className="space-y-4 flex flex-col items-center lg:items-start">
          <Badge
            className={cn(
              "px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] w-fit",
              callStatus === "active" ? "bg-green-500/10 text-green-600 border border-green-500/20" : "bg-black/5 text-black/40 shadow-inner",
              callStatus !== "inactive" && "animate-pulse"
            )}
          >
            {callStatus === "active" ? (isDoctorSpeaking ? "Doctor is Speaking..." : "Listening...") : callStatus === "connecting" ? "Secure Connection..." : "AI Voice Consultation"}
          </Badge>

          <h2 className="font-bricolage text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-black max-w-xl">
            {callStatus === "active" ? "How can I help you, Sarah?" : "Start your session."}
          </h2>
          <p className="text-black/40 font-bold text-base sm:text-xl max-w-md leading-relaxed">
            {medicalContext 
              ? `Ready to discuss your Salmonellosis treatment and latest vitals.`
              : `Securely discuss your latest medical results in real-time.`}
          </p>

        </div>

        {/* Insight Cards Grid with Medication Selection */}
        <div className="flex flex-col gap-4 mt-2">
           <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] px-2">Select Medications to discuss:</p>
           <div className="flex flex-wrap gap-2">
             {medicalContext?.patient_summary?.medications?.map((med: any) => (
                <button
                  key={med.name}
                  onClick={() => toggleMedication(med.name)}
                  className={cn(
                    "px-4 py-2.5 rounded-2xl border transition-all flex items-center gap-2",
                    selectedMeds.includes(med.name) 
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.05]" 
                      : "bg-white text-black/60 border-black/5 hover:border-black/10 shadow-sm"
                  )}
                >
                  <Pill className={cn("h-3.5 w-3.5", selectedMeds.includes(med.name) ? "text-white" : "text-primary")} />
                  <span className="text-xs font-bold leading-none">{med.name}</span>
                  {selectedMeds.includes(med.name) && <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />}
                </button>
             ))}
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <div className="p-5 lg:p-6 rounded-3xl bg-black/[0.02] border border-black/5 text-left flex flex-col gap-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group">
              <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                <Activity className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1.5">Selected Count</p>
                <p className="text-sm lg:text-base font-bold text-black leading-snug">{selectedMeds.length} Items ready for discussion</p>
              </div>
            </div>

            <div className="p-5 lg:p-6 rounded-3xl bg-black/[0.02] border border-black/5 text-left flex flex-col gap-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group">
              <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                <Zap className="h-5 w-5 lg:h-6 lg:w-6 text-vital-orange" />
              </div>
              <div>
                <p className="text-[10px] font-black text-vital-orange uppercase tracking-[0.2em] mb-1.5">Doctor's Focus</p>
                <p className="text-sm lg:text-base font-bold text-black leading-snug">Strict adherence monitoring</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ChatbotView() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello Sarah! I'm your Smart Care assistant. How are you feeling today?" }
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // Mock AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I understand. Based on your recent health records, I'd recommend monitoring your activity levels today. Would you like me to analyze your latest blood test results?"
      }]);
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="flex flex-col h-[650px] rounded-[2.5rem] border border-black/5 bg-white shadow-2xl shadow-black/5 overflow-hidden"
    >
      {/* Chat Header */}
      <div className="px-8 py-6 border-b border-black/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bricolage text-xl font-bold">Smart Care AI</h3>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] uppercase font-black tracking-widest text-black/40">Always active</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
          <Zap className="h-5 w-5 text-primary" />
        </Button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 no-scrollbar">
        {messages.map((msg, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10, x: msg.role === "user" ? 20 : -20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            key={i}
            className={cn(
              "flex gap-4 max-w-[85%]",
              msg.role === "user" ? "ml-auto flex-row-reverse" : ""
            )}
          >
            <div className={cn(
              "h-10 w-10 shrink-0 rounded-xl flex items-center justify-center",
              msg.role === "user" ? "bg-black" : "bg-primary/10"
            )}>
              {msg.role === "user" ? <User className="h-5 w-5 text-white" /> : <Bot className="h-5 w-5 text-primary" />}
            </div>
            <div className={cn(
              "px-6 py-4 rounded-4xl",
              msg.role === "user"
                ? "bg-black text-white rounded-tr-none"
                : "bg-black/5 text-black rounded-tl-none"
            )}>
              <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input */}
      <div className="p-6 border-t border-black/5 bg-black/2">
        <div className="max-w-4xl mx-auto flex gap-3 items-center">
          <Button variant="ghost" size="icon" className="rounded-full shrink-0">
            <Paperclip className="h-5 w-5 text-black/40" />
          </Button>
          <div className="relative flex-1">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask anything about your health..."
              className="h-14 rounded-2xl border-black/5 bg-white shadow-sm pl-6 pr-14 text-sm font-bold focus-visible:ring-primary/20"
            />
            <Button
              onClick={handleSend}
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl bg-black hover:bg-primary transition-all group"
            >
              <Send className="h-4 w-4 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AnalysisView({ 
  medicalContext, 
  onContextUpdate,
  analysisResult,
  setAnalysisResult
}: { 
  medicalContext: any, 
  onContextUpdate: (ctx: any) => void,
  analysisResult: string | null,
  setAnalysisResult: (res: string | null) => void
}) {
  const [analysisTab, setAnalysisTab] = useState<"upload" | "results">("upload");

  const [analyzing, setAnalyzing] = useState(false);
  const [showSim, setShowSim] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // AI Analysis State
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isIngesting, setIsIngesting] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Bluetooth State
  const [bleDevice, setBleDevice] = useState<any>(null);
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const intentionalDisconnectRef = useRef(false);

  useEffect(() => {
    if (analyzing) {
      const interval = setInterval(() => {
        setProgress(prev => (prev < 100 ? prev + 1 : 100));
      }, 50);
      if (progress === 100) {
        setTimeout(() => {
          setAnalyzing(false);
          setProgress(0);
        }, 1000);
      }
      return () => clearInterval(interval);
    }
  }, [analyzing, progress]);

  const onDisconnected = async (event: any) => {
    const device = event.target;
    setHeartRate(null);
    setBatteryLevel(null);
    if (intentionalDisconnectRef.current) {
      setBleDevice(null);
      return;
    }

    // Auto-reconnect with exponential backoff
    setConnectionError("Connection lost. Trying to reconnect...");
    setIsConnecting(true);
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts && !intentionalDisconnectRef.current) {
      try {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts - 1)));
        console.log(`Reconnection attempt ${attempts}...`);

        await setupGattServer(device);
        setConnectionError(null);
        setIsConnecting(false);
        return; // Success
      } catch (error) {
        console.error("Reconnection attempt failed:", error);
      }
    }

    setConnectionError("Failed to reconnect after multiple attempts. Please pair again.");
    setIsConnecting(false);
    setBleDevice(null);
  };

  const setupGattServer = async (device: any) => {
    const server = await device.gatt.connect();

    // Heart Rate
    try {
      const service = await server.getPrimaryService('heart_rate');
      const characteristic = await service.getCharacteristic('heart_rate_measurement');

      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
        try {
          const value = event.target.value;
          const flags = value.getUint8(0);
          const rate16Bits = flags & 0x1;
          let hr: number;
          if (rate16Bits) {
            hr = value.getUint16(1, true); // littleEndian
          } else {
            hr = value.getUint8(1);
          }
          setHeartRate(hr);
        } catch (e) {
          console.error("Error parsing heart rate:", e);
        }
      });
    } catch (serviceErr) {
      console.warn("Heart Rate service not found or could not be loaded.", serviceErr);
    }

    // Battery Level
    try {
      const batService = await server.getPrimaryService('battery_service');
      const batChar = await batService.getCharacteristic('battery_level');

      const val = await batChar.readValue();
      setBatteryLevel(val.getUint8(0));

      await batChar.startNotifications();
      batChar.addEventListener('characteristicvaluechanged', (event: any) => {
        setBatteryLevel(event.target.value.getUint8(0));
      });
    } catch (err) {
      console.warn("Battery service not found.", err);
    }
  };

  const handleDisconnect = () => {
    if (bleDevice && bleDevice.gatt) {
      intentionalDisconnectRef.current = true;
      bleDevice.gatt.disconnect();
      setBleDevice(null);
      setHeartRate(null);
      setBatteryLevel(null);
    }
  };

  const connectDevice = async () => {
    setConnectionError(null);
    setHeartRate(null);
    setBatteryLevel(null);
    intentionalDisconnectRef.current = false;

    try {
      setIsConnecting(true);
      const bluetooth = navigator.bluetooth;
      if (!bluetooth) {
        throw new Error("Web Bluetooth is not supported in this browser. Please use Chrome or Edge.");
      }
      let device: any = await bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['heart_rate', 'battery_service', 'device_information']
      });
      setBleDevice(device);
      device.addEventListener('gattserverdisconnected', onDisconnected);
      await setupGattServer(device);
    } catch (error: any) {
      console.error("BLE Connection failed:", error);
      let msg = "Connection failed.";
      if (error.name === 'NotAllowedError') msg = "Pairing cancelled or denied.";
      else if (error.name === 'NotFoundError') msg = "Device not found. Check pairing mode.";
      else msg = error.message;
      setConnectionError(msg);
      setBleDevice(null);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const runMedicalAnalysis = async () => {
    if (selectedFiles.length === 0) return;

    setIsIngesting(true);
    setAnalysisError(null);
    setAnalysisResult(null);

    const formData = new FormData();
    selectedFiles.forEach(file => formData.append("file", file));
    formData.append("clerkId", "demo-user-123"); // Mock clerkId for db integration


    try {
      // For simulation purposes, we'll use the hardcoded context if it matches our demo
      // In a real app, this would use the Gemini response
      const response = await fetch("/api/analyze-record", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Analysis failed. Please try again.");
      }

      const data = await response.json();
      setAnalysisResult(data.analysis);
      
      // If we got structured data, update the global context
      if (data.structuredData) {
        onContextUpdate(data.structuredData);
      }
      
      // Auto-transition to results tab
      setTimeout(() => {
        setAnalysisTab("results");
      }, 1500);
    } catch (err: any) {
      setAnalysisError(err.message || "Failed to analyze record.");
    } finally {
      setIsIngesting(false);
    }

  };

  const cards = [
    {
      id: "records",
      title: "Analyze Medical Records",
      label: "FULL RECORD SCAN",
      description: "Upload your PDFs, X-rays or prescriptions for a deep AI analysis.",
      icon: FileText,
      color: "bg-blue-500",
      content: selectedFiles.length > 0 ? `${selectedFiles.length} File(s) Ready` : "0 Records found"
    },
    {
      id: "research",
      title: "Health Research",
      label: "ISSUE EXPLORER",
      description: "Search across 10M+ medical papers validated by specialists.",
      icon: Search,
      color: "bg-purple-500",
      content: "Browse Database"
    },
    {
      id: "wearables",
      title: "Wearables & IoT",
      label: "LIVE CONNECTION",
      description: "Connect your smart bracelet, watch or scale for real-time monitoring.",
      icon: Watch,
      color: "bg-orange-500",
      content: bleDevice ? "CONNECTED" : "DISCONNECTED"
    }
  ];

  return (
    <div className="relative">
      <div className="flex gap-2 mb-8 bg-black/5 p-1 rounded-2xl w-fit">
        <button
          onClick={() => setAnalysisTab("upload")}
          className={cn(
            "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
            analysisTab === "upload" ? "bg-white text-black shadow-sm" : "text-black/40 hover:text-black/60"
          )}
        >
          Source Records
        </button>
        <button
          onClick={() => setAnalysisTab("results")}
          disabled={!medicalContext}
          className={cn(
            "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
            analysisTab === "results" ? "bg-white text-black shadow-sm" : "text-black/40 hover:text-black/60",
            !medicalContext && "opacity-30 cursor-not-allowed"
          )}
        >
          Clinical Results
        </button>
      </div>

      <AnimatePresence mode="wait">
        {analysisTab === "upload" ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {cards.map((card) => (
              <motion.div
                key={card.id}
                whileHover={{ y: -8 }}
                onClick={() => setShowSim(card.id)}
                className="group relative p-8 rounded-[2.5rem] border border-black/5 bg-white shadow-sm overflow-hidden cursor-pointer"
              >
                <div className={cn("absolute -top-12 -right-12 h-32 w-32 blur-[60px] opacity-20", card.color)} />
                <div className="relative z-10 h-full flex flex-col gap-10">
                  <div className="flex items-start justify-between">
                    <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center", card.color + "10")}>
                      <card.icon className={cn("h-7 w-7", card.color.replace('bg-', 'text-'))} />
                    </div>
                    {card.id === 'wearables' && bleDevice && (
                      <span className="flex h-2 w-2 rounded-full bg-green-500 animate-ping absolute top-8 right-12" />
                    )}
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/20">{card.label}</span>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-bricolage text-2xl font-extrabold tracking-tight">{card.title}</h3>
                    <p className="text-sm font-medium text-black/50 leading-relaxed">{card.description}</p>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <span className={cn(
                      "text-xs font-bold",
                      card.id === 'wearables' && bleDevice ? "text-green-500" : "text-black/30"
                    )}>
                      {card.content}
                    </span>
                    <Button size="icon" className="rounded-full bg-black transform group-hover:scale-110 transition-transform">
                      <Plus className="h-5 w-5 text-white" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}

            <div className="lg:col-span-3 p-10 rounded-[2.5rem] border border-primary/10 bg-black text-white flex flex-col lg:flex-row items-center justify-between gap-8 mt-4 overflow-hidden relative">
              <div className="absolute top-0 right-0 h-full w-1/2 bg-linear-to-l from-primary/20 to-transparent pointer-events-none" />
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 rounded-3xl bg-primary/20 flex items-center justify-center">
                  <Activity className={cn("h-8 w-8 text-primary", analyzing && "animate-bounce")} />
                </div>
                <div className="space-y-1" >
                  <h4 className="font-bricolage text-2xl font-bold">
                    {analyzing ? `Analyzing Data... ${progress}%` : "Deep Health Context"}
                  </h4>
                  <p className="text-white/50 text-sm font-medium">
                    {analyzing ? "Synthesizing medical history and wearable metrics." : "Your AI context is 85% complete based on merged data."}
                  </p>
                </div>
              </div>
              <Button
                disabled={analyzing}
                onClick={() => setAnalyzing(true)}
                className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-xl shadow-primary/25 disabled:opacity-50"
              >
                {analyzing ? "Scanning..." : "Run Full Analysis"}
              </Button>
              {analyzing && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="absolute bottom-0 left-0 h-1 bg-primary"
                />
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex flex-col gap-6"
          >
            {/* Clinical Dashboard Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40 backdrop-blur-xl p-6 rounded-[2rem] border border-black/5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Heart className="h-7 w-7 text-primary animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bricolage text-2xl font-black tracking-tight">Clinical Intelligence</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-xs font-bold text-black/40 uppercase tracking-widest">Digital Health Twin Synchronized</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setAnalysisTab("upload")}
                  className="rounded-full border-black/10 text-xs font-black uppercase tracking-widest hover:bg-black/5 h-10 px-6"
                >
                  <ArrowLeft className="h-3 w-3 mr-2" />
                  Update Records
                </Button>
                <div className="h-10 px-6 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-black/10">
                  {medicalContext.patient_summary.id}
                </div>
              </div>
            </div>

            <ScrollArea className="h-[calc(100vh-400px)] pr-4">
              <div className="flex flex-col gap-8 pb-10">
                {/* Main Stats & Insights Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* AI Clinical Sentiment Card (Markdown Insight) */}
                  <div className="md:col-span-2 p-8 rounded-[2.5rem] bg-white border border-black/5 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                      <Search className="h-40 w-40" />
                    </div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                          <Brain className="h-5 w-5 text-blue-500" />
                        </div>
                        <h4 className="font-bricolage text-xl font-bold">AI Clinical Analysis</h4>
                      </div>
                      <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[9px] uppercase tracking-widest">Gemini 1.5 Pro</Badge>
                    </div>
                    
                    <div className="prose prose-sm max-w-none prose-headings:font-bricolage prose-headings:text-black prose-p:text-black/60 prose-strong:text-black prose-strong:font-bold leading-relaxed">
                      {analysisResult ? (
                        <ReactMarkdown>{analysisResult}</ReactMarkdown>
                      ) : (
                        <div className="space-y-4 py-4">
                          <div className="h-4 w-full bg-black/5 rounded-full animate-pulse" />
                          <div className="h-4 w-3/4 bg-black/5 rounded-full animate-pulse" />
                          <div className="h-4 w-5/6 bg-black/5 rounded-full animate-pulse" />
                          <div className="h-20 w-full bg-black/5 rounded-2xl animate-pulse" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* High-Impact Vitals Card */}
                  <div className="p-8 rounded-[2.5rem] bg-black text-white shadow-2xl flex flex-col justify-between">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <Activity className="h-8 w-8 text-primary" />
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Core Status</span>
                      </div>
                      
                      <div className="space-y-8">
                        <div className="flex items-end justify-between border-b border-white/10 pb-4">
                          <div>
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Blood Pressure</p>
                            <p className="text-3xl font-bricolage font-black tracking-tighter italic">{medicalContext.patient_summary.latest_vitals.blood_pressure}</p>
                          </div>
                          <Badge className="bg-primary/20 text-primary border-none mb-2">Stable</Badge>
                        </div>
                        
                        <div className="flex items-end justify-between border-b border-white/10 pb-4">
                          <div>
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Heart Rate</p>
                            <p className="text-3xl font-bricolage font-black tracking-tighter italic">{medicalContext.patient_summary.latest_vitals.heart_rate}</p>
                          </div>
                          <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
                            <Activity className="h-4 w-4 text-white/20" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Temp</p>
                            <p className="text-xl font-bold">{medicalContext.patient_summary.latest_vitals.temperature}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">BMI</p>
                            <p className="text-xl font-bold">{medicalContext.patient_summary.latest_vitals.bmi}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button className="mt-8 w-full h-14 rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 border-none group">
                      Health Report PDF
                      <FileDown className="ml-2 h-4 w-4 group-hover:translate-y-1 transition-transform" />
                    </Button>
                  </div>
                </div>

                {/* Secondary Diagnostics & Therapeutics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Detailed Lab Matrix */}
                  <div className="p-8 rounded-[3rem] bg-white border border-black/5 shadow-sm space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-vital-orange/10 flex items-center justify-center">
                          <Zap className="h-6 w-6 text-vital-orange" />
                        </div>
                        <div>
                          <h4 className="font-bricolage text-xl font-bold">Lab Matrix</h4>
                          <p className="text-xs font-medium text-black/30">Validated Clinical Markers</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="h-8 rounded-full border-black/5 text-black/40 font-bold px-4">Latest Scan</Badge>
                    </div>

                    <div className="space-y-4">
                      {/* Featured Lab Result */}
                      <div className="p-6 rounded-[2rem] bg-vital-orange/[0.03] border border-vital-orange/10 flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-vital-orange uppercase tracking-widest">Malaria MP Test</p>
                          <p className="text-2xl font-bricolage font-black tracking-tight">{medicalContext.patient_summary.lab_results.malaria_test_mp}</p>
                        </div>
                        <div className="h-12 w-12 rounded-full border border-vital-orange/20 flex items-center justify-center animate-pulse">
                          <div className="h-2 w-2 rounded-full bg-vital-orange shadow-[0_0_10px_#f97316]" />
                        </div>
                      </div>

                      <div className="p-6 rounded-[2rem] bg-red-50/30 border border-red-100/50 space-y-4">
                        <div className="flex justify-between items-center">
                           <span className="text-sm font-black text-black/40 uppercase tracking-widest">Widal Serology</span>
                           <Badge className="bg-red-100 text-red-600 border-none font-black text-[9px] uppercase tracking-widest">{medicalContext.patient_summary.lab_results.widal_test}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(medicalContext.patient_summary.lab_results.titers).map((entry: any) => (
                            <div key={entry[0]} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-black/5 shadow-sm">
                              <span className="text-[10px] font-bold text-black/40 tracking-wider">T-{entry[0]}</span>
                              <div className="h-3 w-px bg-black/10" />
                              <span className="text-xs font-black text-red-500">{entry[1]}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Therapeutic Regimen */}
                  <div className="p-8 rounded-[3rem] bg-white border border-black/5 shadow-sm space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                          <Pill className="h-6 w-6 text-blue-500" />
                        </div>
                        <div>
                          <h4 className="font-bricolage text-xl font-bold">Therapeutic Regimen</h4>
                          <p className="text-xs font-medium text-black/30">Active Medications</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {medicalContext.patient_summary.medications.map((med: any, i: number) => (
                        <div key={i} className="group flex items-center justify-between p-5 rounded-[2rem] bg-blue-50/20 border border-blue-100/30 hover:bg-blue-50/40 transition-all cursor-pointer">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                              <div className="h-6 w-6 rounded-full border-2 border-blue-500 flex items-center justify-center">
                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-base font-black tracking-tight">{med.name}</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Clock className="h-3 w-3 text-black/20" />
                                <span className="text-[10px] font-bold text-black/30 uppercase tracking-widest">{med.dosage} - {med.frequency}</span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-black/10 transition-transform group-hover:translate-x-1" />
                        </div>
                      ))}
                    </div>

                    <div className="p-6 rounded-[2rem] border-2 border-dashed border-black/5 bg-black/[0.01] flex items-center justify-between group cursor-pointer hover:border-black/10 transition-all">
                      <div className="flex items-center gap-3">
                        <Plus className="h-5 w-5 text-black/20 group-hover:text-black/40 transition-colors" />
                        <span className="text-xs font-black text-black/20 group-hover:text-black/40 uppercase tracking-widest">Add OTC Medication</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Patient Summary & Footer Actions */}
                <div className="p-10 rounded-[4rem] bg-indigo-50/50 border border-indigo-100 flex flex-col md:flex-row items-center gap-10">
                  <div className="h-20 w-20 rounded-[2rem] bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-200 shrink-0">
                    <User className="h-10 w-10 text-white" />
                  </div>
                  <div className="flex-1 space-y-2 text-center md:text-left">
                    <h3 className="font-bricolage text-3xl font-black text-indigo-950">Patient Overview</h3>
                    <p className="text-lg font-medium text-indigo-800/60 leading-relaxed">
                      This analysis suggest a primary diagnosis of <span className="text-indigo-600 font-black">{medicalContext.patient_summary.diagnosis}</span>. 
                      The clinical data shows <span className="text-indigo-600 font-bold">{medicalContext.patient_summary.symptoms.length} core symptoms</span> that align with your recent hospital record.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Simulation Overlay */}
      <AnimatePresence>
        {showSim && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[3rem] p-8 lg:p-12 w-full max-w-4xl shadow-2xl relative overflow-hidden"
            >
              <button
                onClick={() => setShowSim(null)}
                className="absolute top-8 right-8 h-12 w-12 rounded-2xl bg-black/5 flex items-center justify-center hover:bg-black/10 transition-colors"
              >
                <X className="h-6 w-6 text-black" />
              </button>

              {showSim === "records" && (
                <div className="space-y-8 flex flex-col h-full max-h-[85vh]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                        <FileText className="h-7 w-7 text-blue-500" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bricolage font-extrabold tracking-tight underline decoration-blue-500/20 underline-offset-8">Record Intelligence</h2>
                        <p className="text-black/50 font-medium">Capture or upload records for AI Ingestion</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 overflow-hidden">
                    {/* Left Side: Upload / File List */}
                    <div className="flex flex-col gap-6 overflow-y-auto pr-2 no-scrollbar">
                      {/* Action Buttons */}                      {/* Ingestion Zone */}
                      <div 
                        className="relative group cursor-pointer"
                        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-primary'); }}
                        onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-primary'); }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('border-primary');
                          const files = Array.from(e.dataTransfer.files);
                          if (files.length > 0) {
                            setSelectedFiles(prev => [...prev, ...files]);
                          }
                        }}
                      >
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-primary rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200" />
                        <div className="relative grid grid-cols-2 gap-4">
                          <Button
                            onClick={() => fileInputRef.current?.click()}
                            variant="outline"
                            className="h-36 rounded-[2rem] border-2 border-dashed border-blue-200 bg-white/50 backdrop-blur-sm flex flex-col gap-3 group/btn hover:bg-blue-50/50 hover:border-blue-400 transition-all font-black text-[10px] uppercase tracking-widest"
                          >
                            <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                              <FileUp className="h-6 w-6 text-blue-500" />
                            </div>
                            <span>Upload Files</span>
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileSelect}
                              multiple
                              accept="image/*,application/pdf"
                              className="hidden"
                            />
                          </Button>
                          <Button
                            onClick={() => cameraInputRef.current?.click()}
                            variant="outline"
                            className="h-36 rounded-[2rem] border-2 border-dashed border-primary/20 bg-white/50 backdrop-blur-sm flex flex-col gap-3 group/btn hover:bg-primary/5 hover:border-primary transition-all font-black text-[10px] uppercase tracking-widest"
                          >
                            <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                              <Camera className="h-6 w-6 text-primary" />
                            </div>
                            <span>Snap Record</span>
                            <input
                              type="file"
                              ref={cameraInputRef}
                              onChange={handleFileSelect}
                              multiple
                              accept="image/*"
                              capture="environment"
                              className="hidden"
                            />
                          </Button>
                        </div>
                      </div>


                      {/* File Queue */}
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-black/40">Ready for Analysis</h4>
                        <AnimatePresence>
                          {selectedFiles.length === 0 ? (
                            <div className="py-12 text-center rounded-[2.5rem] border border-black/5 bg-black/[0.01] flex flex-col items-center justify-center gap-3">
                              <div className="h-12 w-12 rounded-full border border-black/5 flex items-center justify-center text-black/10">
                                <Search className="h-5 w-5" />
                              </div>
                              <p className="text-xs font-black text-black/20 uppercase tracking-widest">Awaiting digital artifacts</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 gap-3">
                              {selectedFiles.map((file, i) => (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.9 }}
                                  key={i}
                                  className="p-4 rounded-3xl bg-white border border-black/5 flex items-center justify-between group hover:shadow-lg hover:shadow-black/5 transition-all"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-2xl bg-black flex items-center justify-center overflow-hidden border border-black/5 shadow-inner">
                                       {file.type.startsWith('image/') ? (
                                         <img 
                                           src={URL.createObjectURL(file)} 
                                           alt="preview" 
                                           className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                                         />
                                       ) : (
                                         <FileText className="h-6 w-6 text-white/40" />
                                       )}
                                    </div>
                                    <div className="max-w-[140px]">
                                      <p className="text-sm font-black text-black truncate tracking-tight">{file.name}</p>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                        <p className="text-[10px] text-black/30 font-bold uppercase tracking-widest">{(file.size / 1024).toFixed(0)} KB</p>
                                      </div>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                                    className="h-12 w-12 rounded-2xl text-black/10 hover:text-red-500 hover:bg-red-50 transition-colors"
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </Button>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="mt-auto space-y-4">
                        <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100/50">
                          <p className="text-[10px] font-bold text-blue-600/60 uppercase tracking-widest leading-tight">RAG Context Status</p>
                          <p className="text-xs font-medium text-blue-800/80 mt-1">Files in queue will be vector-indexed for assistant awareness.</p>
                        </div>

                        <Button
                          onClick={runMedicalAnalysis}
                          disabled={selectedFiles.length === 0 || isIngesting}
                          className="w-full h-18 rounded-2xl bg-black text-white hover:bg-blue-600 shadow-xl shadow-black/10 font-bold text-lg disabled:opacity-30 group relative overflow-hidden transition-all"
                        >
                          {isIngesting ? (
                            <div className="flex items-center gap-3 relative z-10">
                              <Loader2 className="h-6 w-6 animate-spin" />
                              <span>AI Context Syncing...</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 relative z-10 px-4">
                              <span>Start Clinical Extraction</span>
                              <div className="h-6 w-px bg-white/20 mx-2" />
                              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </div>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Right Side: Analysis View */}
                    <div className="flex flex-col rounded-3xl border border-black/5 bg-black/[0.01] overflow-hidden">
                      <div className="px-6 py-4 border-b border-black/5 bg-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-black/60">Live Analysis Output</span>
                        </div>
                        <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100 font-bold">Smart Care</Badge>
                      </div>

                      <div className="flex-1 overflow-y-auto p-8 no-scrollbar bg-white/50">
                        {isIngesting ? (
                          <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
                            <div className="relative">
                              <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute -inset-10 rounded-full bg-blue-500 blur-3xl pointer-events-none"
                              />
                              <div className="h-20 w-20 rounded-3xl bg-blue-500/10 flex items-center justify-center">
                                <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                              </div>
                            </div>
                            <p className="text-sm font-bold text-black/40 max-w-xs uppercase tracking-tighter">Scanning clinical data & mapping to RAG system knowledge base...</p>
                          </div>
                        ) : analysisResult ? (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="prose prose-sm font-medium text-black/80 max-w-none prose-p:leading-relaxed prose-headings:font-bricolage prose-headings:font-extrabold"
                          >
                            <ReactMarkdown>{analysisResult}</ReactMarkdown>
                          </motion.div>
                        ) : analysisError ? (
                          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                            <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
                              <X className="h-8 w-8 text-red-500" />
                            </div>
                            <h4 className="font-bold text-red-600">Analysis Error</h4>
                            <p className="text-sm text-red-500/60 mt-2">{analysisError}</p>
                            <Button variant="outline" onClick={() => setSelectedFiles([])} className="mt-6 rounded-xl border-red-200 text-red-600">Clear and Retry</Button>
                          </div>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center p-10 text-center">
                            <div className="h-20 w-20 rounded-full bg-black/[0.02] flex items-center justify-center mb-6 border-4 border-dashed border-black/5">
                              <Bot className="h-8 w-8 text-black/10" />
                            </div>
                            <h4 className="font-bricolage text-xl font-bold text-black/40">Waiting for Data Ingestion</h4>
                            <p className="text-sm text-black/20 font-medium max-w-[240px] mx-auto mt-2">Upload medical records to populate the RAG system context for Sarah.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {showSim === "wearables" && (
                <div className="space-y-8 min-h-[500px] flex flex-col">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                      <Watch className="h-7 w-7 text-orange-500" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bricolage font-extrabold tracking-tight">Wearable Sync</h2>
                      <p className="text-black/50 font-medium">{bleDevice ? `Live data from ${bleDevice.name}` : 'Connect your smart bracelet via Bluetooth'}</p>
                    </div>
                  </div>

                  {!bleDevice && !isConnecting ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex-1 flex flex-col items-center justify-center gap-10 py-10"
                    >
                      {/* Radar Animation */}
                      <div className="relative h-48 w-48 flex items-center justify-center">
                        <motion.div
                          animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                          transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                          className="absolute inset-0 rounded-full bg-orange-500/20 border border-orange-500/30"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
                          transition={{ repeat: Infinity, duration: 2, ease: "easeOut", delay: 0.5 }}
                          className="absolute inset-0 rounded-full bg-orange-500/10 border border-orange-500/20"
                        />
                        <div className="relative z-10 h-24 w-24 rounded-full bg-white shadow-2xl flex items-center justify-center border border-orange-100">
                          <Watch className="h-10 w-10 text-orange-500" />
                        </div>
                      </div>

                      <div className="text-center space-y-3 max-w-sm">
                        <h4 className="text-xl font-bold font-bricolage">Ready to pair</h4>
                        <p className="text-sm font-medium text-black/40">Ensure your TakeCare bracelet is turned on and within 3 feet of this device.</p>
                        {connectionError && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold mt-2"
                          >
                            ⚠️ {connectionError}
                          </motion.div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                        {[
                          { step: "01", label: "Turn on BT" },
                          { step: "02", label: "Keep Proximity" },
                          { step: "03", label: "Accept Pairing" }
                        ].map((s) => (
                          <div key={s.step} className="p-4 rounded-2xl bg-black/2 border border-black/5 flex flex-col items-center gap-1">
                            <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{s.step}</span>
                            <span className="text-xs font-bold text-black/60">{s.label}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-col gap-4 w-full max-w-xs">
                        <Button
                          onClick={connectDevice}
                          className="h-14 px-12 rounded-2xl bg-orange-600 text-white hover:bg-orange-700 shadow-xl shadow-orange-500/25 font-bold text-lg group w-full"
                        >
                          Start Scanning
                          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <p className="text-[10px] text-center text-black/30 font-medium">
                          Tip: If it&apos;s connected to your phone&apos;s app, disconnect it there first.
                        </p>
                      </div>
                    </motion.div>
                  ) : bleDevice ? (
                    <div className="space-y-8 flex-1">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { icon: Activity, label: "Heart Rate", val: heartRate || "--", unit: "bpm", color: "text-red-500", live: !!heartRate },
                          { icon: Zap, label: "Battery", val: batteryLevel || "--", unit: "%", color: "text-yellow-500", live: !!batteryLevel },
                          { icon: Watch, label: "Steps", val: "Mock", unit: "", color: "text-blue-500", live: false },
                          { icon: Bot, label: "Stress", val: "Mock", unit: "", color: "text-green-500", live: false }
                        ].map((metric, i) => (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            key={metric.label}
                            className={cn(
                              "p-6 rounded-3xl bg-black/5 flex flex-col items-center text-center gap-2 border transition-all",
                              metric.live ? "border-red-200 shadow-lg shadow-red-500/5 bg-red-50/30" : "border-transparent"
                            )}
                          >
                            <metric.icon className={cn("h-6 w-6 mb-2", metric.color, metric.live && "animate-pulse")} />
                            <span className="text-2xl font-black font-bricolage">{metric.val}</span>
                            <span className="text-[10px] font-bold text-black/30 uppercase tracking-widest">{metric.label} {metric.unit}</span>
                          </motion.div>
                        ))}
                      </div>

                      <div className="p-8 rounded-4xl bg-green-50 border border-green-100 flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                            <Watch className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-bold text-green-900">{bleDevice.name || "Smart Bracelet"}</p>
                            <p className="text-xs text-green-700/60 font-medium flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                              Linked and Transmitting
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={handleDisconnect}
                          className="rounded-xl border-red-200 text-red-700 hover:bg-red-50"
                        >
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center gap-6">
                      <div className="h-24 w-24 rounded-full border-4 border-orange-100 border-t-orange-500 animate-spin" />
                      <div className="text-center">
                        <h4 className="text-xl font-bold font-bricolage">Searching for devices</h4>
                        <p className="text-sm font-medium text-black/40">Please follow the browser instructions...</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {showSim === "research" && (
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                      <Search className="h-7 w-7 text-purple-500" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bricolage font-extrabold tracking-tight">Issue Explorer</h2>
                      <p className="text-black/50 font-medium">Validated health research for your context</p>
                    </div>
                  </div>

                  <Input
                    placeholder="Search symptoms, conditions, or medications..."
                    className="h-16 rounded-2xl border-black/5 bg-black/5 pl-6 text-lg font-bold"
                  />

                  <div className="space-y-4">
                    <p className="text-xs font-black text-black/20 uppercase tracking-widest">Trending Insights for you</p>
                    {[
                      "Optimizing Vitamin D for better sleep",
                      "Recent study on cardio-respiratory health",
                      "Impact of screen time on eye fatigue"
                    ].map((topic, i) => (
                      <div key={topic} className="p-5 rounded-2xl bg-white border border-black/5 flex items-center justify-between hover:border-purple-200 transition-colors cursor-pointer group">
                        <span className="font-bold text-sm text-black/70 group-hover:text-purple-600 transition-colors">{topic}</span>
                        <ArrowRight className="h-4 w-4 text-black/20 group-hover:translate-x-1 transition-transform" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
