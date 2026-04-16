"use client";

import React, { useState, useRef, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  ArrowLeft,
  ShieldCheck
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SYNTHETIC_DOCTOR_DATA } from "@/lib/doctor-data";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Vapi from "@vapi-ai/web";
import { getVapiConfiguration } from "@/app/actions/vapi";
import { getMyMedicalHistory } from "@/app/actions/medical";
import { useSession } from "next-auth/react";


const SMART_CARE_TABS = [
  { id: "talk", label: "Talk", icon: Mic, description: "Voice interaction with AI medical agent" },
  { id: "text", label: "Text", icon: MessageSquareText, description: "Secure chat with medical AI" },
  { id: "analyze", label: "Analyze", icon: BarChart3, description: "Deep analysis of health records" },
];

export function SmartCareSection({ userName = "Patient" }: { userName?: string }) {
  const [activeTab, setActiveTab] = useState("text");
  const [medicalContext, setMedicalContext] = useState<any>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [allRecords, setAllRecords] = useState<any[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [patientId, setPatientId] = useState<string | null>(null);

  const { data: session, status } = useSession();

  // Automatically load the extracted context from the database
  useEffect(() => {
    async function loadHistory() {
      if (status !== "authenticated") return;
      
      try {
        const data = await getMyMedicalHistory();

        if (data && data.medicalRecords && data.medicalRecords.length > 0) {
          setAllRecords(data.medicalRecords);
          // Find the most recent record with a valid analysis
          const recentRecord = data.medicalRecords.find((r: any) => r.analysis);
          if (recentRecord && recentRecord.analysis) {
            setMedicalContext(recentRecord.analysis.rawJson || null);
            setAnalysisResult(recentRecord.analysis.summary);
            setSelectedRecordId(recentRecord.id);
          }

        } else {
          // No records found for this user, leave context null
          setMedicalContext(null);
          setAllRecords([]);
          setAnalysisResult(null);
        }
      } catch (error) {
        console.error("Failed to load medical history:", error);
      }
    }
    loadHistory();
  }, []);


  return (
    <div className="px-6 lg:px-12 mt-2 md:mt-4 flex flex-col gap-4 md:gap-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white/60 backdrop-blur-3xl p-1 md:p-1.5 rounded-3xl md:rounded-4xl w-full lg:w-fit h-auto flex gap-1 md:gap-1.5 mb-6 md:mb-10 border border-black/3 shadow-sm">
          {SMART_CARE_TABS.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn(
                "rounded-2xl md:rounded-3xl px-4 py-2.5 md:px-8 md:py-3 transition-all duration-500 cursor-pointer flex-1 lg:flex-none relative group",
                "data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-primary/20",
                "data-[state=inactive]:text-black/60 data-[state=inactive]:hover:bg-primary/5 data-[state=inactive]:hover:text-primary",
                "flex items-center justify-center gap-2 md:gap-3 font-outfit font-black text-[10px] md:text-xs uppercase tracking-widest"
              )}
            >
              <tab.icon className="h-3.5 w-3.5 md:h-4 md:w-4 transition-transform duration-500 group-hover:scale-110 group-data-[state=active]:scale-110" />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="smart-active-pill"
                  className="absolute inset-0 bg-primary rounded-2xl md:rounded-3xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="talk" key="talk">
            <VoiceAgentView
              medicalContext={medicalContext}
              userName={userName}
              allConsultations={allRecords.filter(r => r.analysis)}
              onSelectionChange={(record: any) => {
                setSelectedRecordId(record.id);
                setMedicalContext(record.analysis.rawJson);
                setAnalysisResult(record.analysis.summary);
              }}
              selectedRecordId={selectedRecordId}
            />
          </TabsContent>

          <TabsContent value="text" key="text">
            <ChatbotView userName={userName} />
          </TabsContent>
          <TabsContent value="analyze" key="analyze">
            <AnalysisView
              medicalContext={medicalContext}
              userName={userName}
              onContextUpdate={setMedicalContext}
              analysisResult={analysisResult}
              setAnalysisResult={setAnalysisResult}
              patientId={patientId}
            />
          </TabsContent>


        </AnimatePresence>
      </Tabs>
    </div>
  );
}
function VoiceAgentView({
  medicalContext,
  userName,
  allConsultations,
  onSelectionChange,
  selectedRecordId
}: {
  medicalContext: any,
  userName: string,
  allConsultations: any[],
  onSelectionChange: (record: any) => void,
  selectedRecordId: string | null
}) {

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
        You are ${userName}'s AI Medical Assistant. Use the latest records to provide advice.
        - Discuss specific medications: ${selectedMeds.join(", ")}.
        - Address symptoms and provide empathetic, clear guidance.
        - Address the user by their first name: ${userName.split(' ')[0]}.
        - Be professional, empathetic, and clear.
      ` : result.config.systemPrompt;

      const firstMessage = selectedMeds.length > 0
        ? `Hello ${userName.split(' ')[0]}, I've reviewed your results. I see you want to discuss your treatment using ${selectedMeds.join(" and ")}. How have you been feeling since you started them?`
        : medicalContext
          ? `Hello ${userName.split(' ')[0]}, I've reviewed your latest results. How are you feeling today?`
          : `Hello ${userName.split(' ')[0]}, this is your TakeCare AI Assistant. How can I help you today?`;

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
          voiceId: "Leo",
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
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex flex-col lg:flex-row p-4 md:p-8 lg:p-12 rounded-3xl md:rounded-[3.5rem] border border-black/5 bg-white shadow-2xl overflow-hidden min-h-[500px] lg:min-h-[600px] gap-6 md:gap-8 lg:gap-12"
    >
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -mr-64 -mt-64 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-vital-orange/5 rounded-full blur-3xl -ml-40 -mb-40 pointer-events-none" />

      {/* LEFT SIDE: Doctor Image & Call Controls */}
      <div className="w-full lg:w-5/12 flex flex-col items-center justify-center gap-4 md:gap-6 relative z-10 shrink-0">
        <div className="relative h-48 w-48 sm:h-64 sm:w-64 md:h-80 md:w-80 lg:h-96 lg:w-full lg:max-w-sm rounded-4xl md:rounded-[3rem] overflow-hidden shadow-2xl border-4 md:border-[6px] border-white group shrink-0">
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
            src="https://i.ibb.co/C3w7WQnk/doc.jpg"
            alt="TakeCare Doc"
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-all duration-700 z-10",
              callStatus === "active" ? "scale-105" : "scale-100 grayscale-[20%]"
            )}
          />

          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/40 to-transparent p-4 md:p-6 z-20 flex flex-col justify-end h-3/4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="relative flex items-center justify-center">
                {callStatus === "active" ? (
                  <>
                    <div className="h-2 w-2 md:h-3 md:w-3 bg-green-500 rounded-full" />
                    <div className="absolute h-2 w-2 md:h-3 md:w-3 bg-green-500 rounded-full animate-ping" />
                  </>
                ) : (
                  <div className="h-2 w-2 md:h-3 md:w-3 bg-white/40 rounded-full" />
                )}
              </div>
              <h3 className="font-bricolage text-xl md:text-2xl font-bold text-white tracking-tight">Dr. Leo</h3>
            </div>
            <p className="text-white/60 text-[10px] md:text-sm font-medium mt-0.5 md:mt-1">TakeCare Clinical AI Assistant</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 md:gap-3 bg-white/80 backdrop-blur-2xl p-2.5 md:p-4 rounded-3xl md:rounded-4xl border border-black/5 shadow-xl w-fit relative z-20">
          <button
            onClick={toggleMute}
            disabled={callStatus !== "active"}
            className={cn(
              "h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-all",
              isMuted ? "bg-red-50 text-red-500" : "bg-black/5 text-black hover:bg-black/10",
              callStatus !== "active" && "opacity-40 cursor-not-allowed"
            )}
          >
            {isMuted ? <MicOff className="h-4 w-4 md:h-6 md:w-6" /> : <Mic className="h-4 w-4 md:h-6 md:w-6" />}
          </button>

          <button
            disabled={callStatus !== "active"}
            className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-all bg-black/5 text-black hover:bg-black/10 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Video className="h-4 w-4 md:h-6 md:w-6" />
          </button>

          <div className="w-[1px] h-6 md:h-8 bg-black/10 mx-0.5 md:mx-1" />

          {callStatus === "active" ? (
            <button
              onClick={endCall}
              className="h-10 px-4 md:h-14 md:px-6 rounded-xl md:rounded-2xl flex items-center gap-2 transition-all bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 font-black text-[10px] md:text-xs uppercase tracking-widest"
            >
              <PhoneOff className="h-4 w-4" />
              <span>End Call</span>
            </button>
          ) : (
            <button
              disabled={callStatus === "connecting"}
              onClick={toggleVoiceConsultation}
              className="h-10 px-5 md:h-14 md:px-8 rounded-xl md:rounded-2xl flex items-center gap-2 transition-all bg-black hover:scale-105 text-white shadow-xl shadow-black/20 font-black text-[10px] md:text-xs uppercase tracking-widest"
            >
              {callStatus === "connecting" ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
              {callStatus === "connecting" ? "Connecting" : "Consult Now"}
            </button>
          )}
        </div>
      </div>

      {/* RIGHT SIDE: Interactive Clinical Context */}
      <div className="w-full lg:w-7/12 flex flex-col gap-6 md:gap-8 relative z-10 text-center lg:text-left">
        <div className="space-y-3 md:space-y-4 flex flex-col items-center lg:items-start pt-2 md:pt-4 lg:pt-0">
          <Badge
            className={cn(
              "px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[9px] md:text-xs font-black uppercase tracking-[0.2em] w-fit",
              callStatus === "active" ? "bg-green-500/10 text-green-600 border border-green-500/20" : "bg-black/5 text-black/40 shadow-inner",
              callStatus !== "inactive" && "animate-pulse"
            )}
          >
            {callStatus === "active" ? (isDoctorSpeaking ? "Doctor Speaking..." : "Listening...") : callStatus === "connecting" ? "Secure Handshake..." : "AI Health Orchestration"}
          </Badge>

          <h2 className="font-bricolage text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter leading-tight text-black max-w-xl">
            {callStatus === "active" ? `Ready to assist, ${userName.split(' ')[0]}?` : "Digital Voice Consultation."}
          </h2>
          <p className="text-black/40 font-bold text-sm md:text-xl max-w-md leading-relaxed">
            {medicalContext
              ? `Reviewing your ${medicalContext?.patient_summary?.diagnosis || "health trends"} in real-time.`
              : `Select a patient record below to initiate a context-aware consultation.`}
          </p>
        </div>

        {/* CONSULTATION SELECTION UI */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <p className="text-[9px] md:text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Patient Records Library:</p>
            <Badge variant="outline" className="text-[8px] md:text-[9px] font-black border-black/5 opacity-40">{allConsultations.length} RECORDS</Badge>
          </div>

          <div className="flex flex-row overflow-x-auto gap-3 pb-4 no-scrollbar -mx-4 px-4 lg:grid lg:grid-cols-2 lg:max-h-[220px] lg:overflow-y-auto lg:pr-2 lg:mx-0 lg:px-1">
            {allConsultations.length > 0 ? allConsultations.map((record) => (
              <button
                key={record.id}
                onClick={() => onSelectionChange(record)}
                className={cn(
                  "p-4 rounded-2xl md:rounded-3xl border transition-all text-left flex flex-col gap-3 group relative overflow-hidden min-w-[240px] md:min-w-[280px] lg:min-w-0 md:bg-white",
                  selectedRecordId === record.id
                    ? "bg-black text-white border-black shadow-xl"
                    : "bg-white text-black border-black/5 hover:border-black/10 shadow-sm hover:scale-[1.02]"
                )}
              >
                {selectedRecordId === record.id && (
                  <motion.div layoutId="active-consult" className="absolute top-0 right-0 p-3">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                  </motion.div>
                )}
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "h-8 w-8 rounded-xl flex items-center justify-center shrink-0",
                    selectedRecordId === record.id ? "bg-white/10" : "bg-black/5"
                  )}>
                    <FileText className={cn("h-4 w-4", selectedRecordId === record.id ? "text-white" : "text-black/40")} />
                  </div>
                  <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest truncate max-w-[140px]">
                    {record.fileName}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] md:text-xs font-bold line-clamp-1 opacity-80">{record.description || "Medical Record Analysis"}</p>
                  <p className="text-[9px] font-medium opacity-40 mt-1">{new Date(record.createdAt).toLocaleDateString()} • {record.type}</p>
                </div>
              </button>
            )) : (
              <div className="col-span-full p-8 md:p-10 rounded-3xl md:rounded-4xl border-2 border-dashed border-black/5 bg-black/1 flex flex-col items-center justify-center gap-3 w-full">
                <Bot className="h-8 w-8 text-black/10" />
                <p className="text-[9px] md:text-[10px] font-black text-black/20 uppercase tracking-widest text-center leading-relaxed">No medical records found.<br />Upload in the Analyze section.</p>
              </div>
            )}
          </div>
        </div>

        {/* Medication Selection UI */}
        {medicalContext && (
          <div className="flex flex-col gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <p className="text-[9px] md:text-[10px] font-black text-black/40 uppercase tracking-[0.2em] px-1">Consultation Topics:</p>
            <div className="flex flex-nowrap overflow-x-auto gap-2 pb-2 no-scrollbar px-1">
              {medicalContext?.patient_summary?.medications?.map((med: any) => (
                <button
                  key={med.name}
                  onClick={() => toggleMedication(med.name)}
                  className={cn(
                    "px-4 py-2 rounded-xl md:rounded-2xl border transition-all flex items-center gap-2 shrink-0",
                    selectedMeds.includes(med.name)
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.05]"
                      : "bg-white text-black/60 border-black/5 hover:border-black/10 shadow-sm hover:scale-105"
                  )}
                >
                  <Pill className={cn("h-3 w-3 md:h-3.5 md:w-3.5", selectedMeds.includes(med.name) ? "text-white" : "text-primary")} />
                  <span className="text-[10px] md:text-xs font-bold whitespace-nowrap">{med.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:mt-2">
          <div className="p-4 md:p-6 rounded-2xl md:rounded-3xl bg-black/2 border border-black/5 text-left flex flex-col gap-3 md:gap-4 shadow-sm group">
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl md:rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm">
              <Activity className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            </div>
            <div>
              <p className="text-[8px] md:text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Queue</p>
              <p className="text-[11px] md:text-sm font-bold text-black leading-tight">{selectedMeds.length} Contexts Active</p>
            </div>
          </div>

          <div className="p-4 md:p-6 rounded-2xl md:rounded-3xl bg-black/2 border border-black/5 text-left flex flex-col gap-3 md:gap-4 shadow-sm group">
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl md:rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm">
              <Zap className="h-4 w-4 md:h-5 md:w-5 text-vital-orange" />
            </div>
            <div>
              <p className="text-[8px] md:text-[10px] font-black text-vital-orange uppercase tracking-[0.2em] mb-1">AI Focus</p>
              <p className="text-[11px] md:text-sm font-bold text-black leading-tight">Proactive Monitoring</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}



function ChatbotView({ userName }: { userName: string }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: `Hello ${userName.split(' ')[0]}! I'm your Smart Care assistant. How are you feeling today?` }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (content: string) => {
    const userMsg = { role: "user", content };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Mock AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I understand. Based on your recent health records, I'd recommend monitoring your activity levels today. Would you like me to analyze your latest blood test results?"
      }]);
      setIsLoading(false);
    }, 1000);
  };


  return (    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col h-[500px] md:h-[650px] bg-white rounded-3xl md:rounded-[3rem] border border-black/5 shadow-2xl overflow-hidden"
    >
      <div className="p-4 md:p-6 border-b border-black/5 bg-black/[0.02] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="relative">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 z-10 relative">
              <Bot className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: '2s' }} />
          </div>
          <div>
            <h3 className="font-bricolage text-base md:text-xl font-bold text-black tracking-tight">Clinical Assistant</h3>
            <div className="flex items-center gap-1.5 md:gap-2">
              <span className="h-1.5 w-1.5 md:h-2 md:w-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] md:text-xs font-black text-black/30 uppercase tracking-widest">Always Online</span>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4 md:p-8">
        <div className="flex flex-col gap-4 md:gap-6">
          {messages.map((msg, idx) => (
            <motion.div
              initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              key={idx}
              className={cn(
                "flex flex-col max-w-[85%] md:max-w-[70%]",
                msg.role === "user" ? "ml-auto items-end" : "items-start"
              )}
            >
              <div
                className={cn(
                  "p-3.5 md:p-5 rounded-2xl md:rounded-3xl text-xs md:text-sm font-bold leading-relaxed shadow-sm",
                  msg.role === "user"
                    ? "bg-primary text-white rounded-tr-none shadow-primary/20"
                    : "bg-black/[0.03] text-black rounded-tl-none border border-black/5"
                )}
              >
                <div className="prose prose-sm md:prose-base !max-w-none text-inherit font-inherit">
                  <ReactMarkdown>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
              <span className="text-[9px] md:text-[10px] font-black text-black/20 uppercase tracking-widest mt-1.5 md:mt-2 px-1">
                {msg.role === "user" ? "YOU" : "TAKECARE AI"} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </motion.div>
          ))}
          <div ref={chatEndRef} />
        </div>
      </ScrollArea>

      <div className="p-4 md:p-8 bg-black/[0.01] border-t border-black/5 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const input = e.currentTarget.elements.namedItem("message") as HTMLInputElement;
            if (input.value.trim()) {
              handleSendMessage(input.value);
              input.value = "";
            }
          }}
          className="relative group"
        >
          <input
            name="message"
            disabled={isLoading}
            autoComplete="off"
            placeholder="Describe your symptoms or ask about medications..."
            className="w-full bg-white border border-black/10 rounded-2xl md:rounded-3xl py-4 md:py-5 pl-5 md:pl-6 pr-14 md:pr-16 text-xs md:text-sm font-medium placeholder:text-black/20 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-sm group-hover:shadow-md disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-2 top-2 bottom-2 px-3 md:px-4 bg-primary text-white rounded-xl md:rounded-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 disabled:hover:scale-100 shadow-md shadow-primary/20"
          >
            {isLoading ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="h-4 w-4 md:h-5 md:w-5" />
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
}

function AnalysisView({
  medicalContext,
  userName,
  onContextUpdate,
  analysisResult,
  setAnalysisResult,
  patientId
}: {
  medicalContext: any,
  userName: string,
  onContextUpdate: (ctx: any) => void,
  analysisResult: string | null,
  setAnalysisResult: (res: string | null) => void,
  patientId: string | null
}) {
  const [analysisTab, setAnalysisTab] = useState<"upload" | "results">("upload");

  const [analyzing, setAnalyzing] = useState(false);
  const [showSim, setShowSim] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [fullAnalysisResult, setFullAnalysisResult] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const reportRef = useRef<HTMLElement>(null);

  const handleDownloadReport = async () => {
    if (!reportRef.current || isDownloading) return;
    
    const toastId = toast.loading("Preparing your professional health report...");
    
    try {
      setIsDownloading(true);
      console.log("Initializing stable PDF capture sequence...");
      
      const element = reportRef.current;
      if (!element) {
        throw new Error("Target report element not found in DOM");
      }

      // Ensure the element is visible for capture
      element.scrollIntoView({ behavior: 'auto', block: 'center' });
      
      // Small timeout to ensure DOM paints are set
      await new Promise(resolve => setTimeout(resolve, 300));

      const captureWidth = 820; 
      
      const canvas = await html2canvas(element, {
        scale: 1, 
        useCORS: true,
        logging: true,
        backgroundColor: "#ffffff",
        width: captureWidth,
        windowWidth: captureWidth,
        onclone: (clonedDoc) => {
          // IMPORTANT: html2canvas does not support modern color functions like oklch/oklab
          // We must force legacy-compatible colors in the cloned document
          const style = clonedDoc.createElement('style');
          style.innerHTML = `
            #takecare-pdf-report, #takecare-pdf-report * {
              color: #000000 !important;
              border-color: #e5e7eb !important;
              background-color: transparent !important;
              text-shadow: none !important;
              box-shadow: none !important;
            }
            #takecare-pdf-report {
              background-color: #ffffff !important;
              width: ${captureWidth}px !important;
              padding: 60px !important;
              margin: 0 !important;
            }
            /* Reset prose to basic elements for cleaner capture */
            #takecare-pdf-report h1, #takecare-pdf-report h2, #takecare-pdf-report h3 {
              color: #000000 !important;
              font-family: sans-serif !important;
            }
          `;
          clonedDoc.head.appendChild(style);

          const report = clonedDoc.getElementById('takecare-pdf-report');
          if (report) {
            report.style.display = 'block';
            report.style.visibility = 'visible';
            report.style.opacity = '1';
          }
        }
      });
      
      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error("Canvas generation returned an empty result");
      }

      const imgData = canvas.toDataURL("image/jpeg", 0.8);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgHeightInPdf = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = imgHeightInPdf;
      let position = 0;

      while (heightLeft > 0) {
        pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, imgHeightInPdf, undefined, 'FAST');
        heightLeft -= pdfHeight;
        
        if (heightLeft > 0) {
          pdf.addPage();
          position = -pdfHeight * (pdf.internal.pages.length - 1);
        }
      }

      const dateStr = new Date().toISOString().split('T')[0];
      pdf.save(`TakeCare_Health_Synthesis_${dateStr}.pdf`);
      
      toast.success("Health report generated successfully!", { id: toastId });
    } catch (error: any) {
      console.error("PDF engine crash detail:", error);
      toast.error("Format compatibility error.", { 
        id: toastId,
        description: `Technical details: ${error.message}. We've force-simplified the colors for the PDF.`
      });
    } finally {
      setIsDownloading(false);
    }
  };

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
      }, 30); // Faster simulation
      if (progress === 100) {
        setTimeout(() => {
          setAnalyzing(false);
          setProgress(0);

          // Generate a comprehensive mock report
          const mockReport = `
# 🩺 TakeCare Clinical Intelligence Report
---
**Patient Name:** ${userName}
**Patient ID:** ${ps?.id || "TC-0000"}  
**Date:** ${new Date().toLocaleDateString()}

## Executive Summary
Based on the synthesized data from your medical records and wearable sensors, your overall health trajectory is **positive**. 

## Key Findings
- **Cardiovascular Health:** Heart rate variability (HRV) shows a 12% improvement over the last 30 days.
- **Inflammatory Markers:** Recent blood work indicates stabilizing levels of C-reactive protein.
- **Sleep Quality:** Deep sleep cycles have increased, correlating with the medication adjustment.

## Recommended Actions
1. **Hydration:** Increase daily water intake by 500ml to support kidney function.
2. **Activity:** Maintain 30 min of moderate walking 4x/week.
3. **Follow-up:** Schedule a standard consultation in 3 weeks to review medication efficacy.

---
*This report was generated by TakeCare Digital Clinical Intelligence.*
          `;
          setFullAnalysisResult(mockReport.trim());
          setShowAnalysisModal(true);
        }, 800);
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
        return;
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
            hr = value.getUint16(1, true);
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
        throw new Error("Web Bluetooth is not supported in this browser.");
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
      if (error.name === 'NotAllowedError') msg = "Pairing cancelled.";
      else if (error.name === 'NotFoundError') msg = "Device not found.";
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

    try {
      console.log("[SmartCare] Analysis requested. Session status:", status);
      
      if (status === "unauthenticated") {
        toast.error("Session expired. Please log in again.");
        return;
      }

      if (status === "loading") {
        toast.info("Establishing secure session... Please try again in a moment.");
        return;
      }

      const response = await fetch("/api/analyze-record", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expired. Please log in again.");
        }
        throw new Error(`Analysis failed (Status: ${response.status}). Please try again.`);
      }

      const data = await response.json();
      
      // Robustly extract the human-readable clinical summary
      const clinicalSummary = typeof data.analysis === 'string' 
        ? data.analysis 
        : (data.analysis?.clinicalSummary || data.analysis?.summary || JSON.stringify(data.analysis || data, null, 2));

      setAnalysisResult(clinicalSummary);
      setFullAnalysisResult(clinicalSummary); // Sync with PDF report preview

      if (data.structuredData) {
        onContextUpdate(data.structuredData);
      }

      setTimeout(() => {
        setAnalysisTab("results");
        loadHistory(); 
      }, 2500);
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

  // Safely extract patient summary data with fallbacks
  const ps = medicalContext?.patient_summary;
  const vitals = ps?.latest_vitals;
  const labs = ps?.lab_results;
  const meds = ps?.medications || [];
  const symptoms = ps?.symptoms || [];

  return (
    <div className="relative">
      <div className="flex flex-col sm:flex-row gap-2 mb-6 md:mb-10 bg-white/40 backdrop-blur-xl p-1 md:p-1.5 rounded-2xl md:rounded-3xl w-full sm:w-fit border border-black/5 shadow-lg shadow-black/[0.01]">
        <button
          onClick={() => setAnalysisTab("upload")}
          className={cn(
            "px-6 md:px-8 py-2 md:py-2.5 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-500 relative overflow-hidden group flex-1 sm:flex-none",
            analysisTab === "upload"
              ? "bg-black text-white shadow-2xl shadow-black/20"
              : "text-black/40 hover:text-black/60 hover:bg-black/5"
          )}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <div className={cn("h-1.5 w-1.5 rounded-full", analysisTab === "upload" ? "bg-primary animate-pulse" : "bg-black/20")} />
            Source Records
          </span>
        </button>
        <button
          onClick={() => setAnalysisTab("results")}
          disabled={!medicalContext}
          className={cn(
            "px-6 md:px-8 py-2 md:py-2.5 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-500 relative overflow-hidden group flex-1 sm:flex-none",
            analysisTab === "results"
              ? "bg-black text-white shadow-2xl shadow-black/20"
              : "text-black/40 hover:text-black/60 hover:bg-black/5",
            !medicalContext && "opacity-30 cursor-not-allowed"
          )}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <div className={cn("h-1.5 w-1.5 rounded-full", analysisTab === "results" ? "bg-green-500 animate-pulse" : "bg-black/20")} />
            Clinical Results
          </span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {analysisTab === "upload" ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
          >
            {cards.map((card) => (
              <motion.div
                key={card.id}
                whileHover={{ y: -8 }}
                onClick={() => setShowSim(card.id)}
                className="group relative p-6 md:p-8 rounded-3xl md:rounded-4xl border border-black/5 bg-white shadow-sm overflow-hidden cursor-pointer"
              >
                <div className={cn("absolute -top-12 -right-12 h-32 w-32 blur-[60px] opacity-20", card.color)} />
                <div className="relative z-10 h-full flex flex-col gap-6 md:gap-10">
                  <div className="flex items-start justify-between">
                    <div className={cn("h-12 w-12 md:h-14 md:w-14 rounded-xl md:rounded-2xl flex items-center justify-center", card.color + "10")}>
                      <card.icon className={cn("h-6 w-6 md:h-7 md:w-7", card.color.replace('bg-', 'text-'))} />
                    </div>
                    {card.id === 'wearables' && bleDevice && (
                      <span className="flex h-2 w-2 rounded-full bg-green-500 animate-ping absolute top-8 right-12" />
                    )}
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-black/20">{card.label}</span>
                  </div>
                  <div className="space-y-2 md:space-y-3">
                    <h3 className="font-bricolage text-xl md:text-2xl font-extrabold tracking-tight">{card.title}</h3>
                    <p className="text-xs md:text-sm font-medium text-black/50 leading-relaxed">{card.description}</p>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <span className={cn(
                      "text-[10px] md:text-xs font-bold",
                      card.id === 'wearables' && bleDevice ? "text-green-500" : "text-black/30"
                    )}>
                      {card.content}
                    </span>
                    <Button size="icon" className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-black transform group-hover:scale-110 transition-transform">
                      <Plus className="h-4 w-4 md:h-5 md:w-5 text-white" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}

            <div className="md:col-span-2 lg:col-span-3 p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-primary/10 bg-white flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-8 mt-2 md:mt-4 overflow-hidden relative shadow-2xl shadow-primary/5">
              <div className="absolute top-0 right-0 h-full w-1/2 bg-linear-to-l from-primary/5 to-transparent pointer-events-none" />
              <div className="flex items-center gap-4 md:gap-6 flex-1 w-full text-center lg:text-left flex-col lg:flex-row">
                <div className="h-14 w-14 md:h-16 md:w-16 rounded-2xl md:rounded-3xl bg-primary/10 flex items-center justify-center">
                  <Activity className={cn("h-7 w-7 md:h-8 md:w-8 text-primary", analyzing && "animate-bounce")} />
                </div>
                <div className="space-y-1" >
                  <h4 className="font-bricolage text-xl md:text-2xl font-bold text-black">
                    {analyzing ? `Analyzing... ${progress}%` : "Synthesis Ready"}
                  </h4>
                  <p className="text-black/40 text-[11px] md:text-sm font-medium">
                    {analyzing ? "Synthesizing medical history and metrics." : `Your clinical context is ${medicalContext ? "85%" : "0%"} complete.`}
                  </p>
                </div>
              </div>
              <Button
                disabled={analyzing}
                onClick={() => setAnalyzing(true)}
                className="w-full lg:w-auto h-12 md:h-14 px-8 md:px-10 rounded-xl md:rounded-2xl bg-black hover:bg-primary text-white font-black text-xs md:text-base shadow-xl shadow-black/25 disabled:opacity-50 transition-all duration-300 uppercase tracking-widest"
              >
                {analyzing ? "Scanning..." : "Sync Health Data"}
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40 backdrop-blur-xl p-5 md:p-6 rounded-3xl md:rounded-4xl border border-black/5 shadow-sm">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Heart className="h-6 w-6 md:h-7 md:w-7 text-primary animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bricolage text-xl md:text-2xl font-black tracking-tight leading-tight">Clinical Intelligence</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span className="text-[9px] md:text-xs font-bold text-black/40 uppercase tracking-widest whitespace-nowrap">Health Twin Synchronized</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAnalysisTab("upload")}
                  className="flex-1 md:flex-none rounded-2xl border-black/10 text-[10px] font-black uppercase tracking-widest hover:bg-black/5 h-10 px-4 md:px-6"
                >
                  <ArrowLeft className="h-3 w-3 mr-2" />
                  Records
                </Button>
                <div className="h-10 px-4 md:px-6 rounded-2xl bg-black text-white flex items-center justify-center text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-black/10">
                  {ps?.id || "TC-0000"}
                </div>
              </div>
            </div>

            <ScrollArea className="h-[calc(100vh-320px)] md:h-[calc(100vh-400px)] pr-2 md:pr-4 no-scrollbar">
              <div className="flex flex-col gap-6 md:gap-8 pb-10">
                {/* Main Stats & Insights Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                  {/* AI Clinical Sentiment Card (Markdown Insight) */}
                  <div className="lg:col-span-2 p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] bg-white border border-black/5 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                      <Search className="h-32 w-32 md:h-40 md:w-40" />
                    </div>
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                          <Brain className="h-5 w-5 text-blue-500" />
                        </div>
                        <h4 className="font-bricolage text-lg md:text-xl font-bold">AI Clinical Analysis</h4>
                      </div>
                      <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[9px] uppercase tracking-widest">Gemini 1.5</Badge>
                    </div>

                    <div className="prose prose-sm max-w-none prose-headings:font-bricolage prose-headings:text-black prose-p:text-black/60 prose-strong:text-black prose-strong:font-bold leading-relaxed overflow-x-hidden">
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
                  <div className="p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] bg-white border border-black/5 shadow-2xl shadow-black/[0.03] flex flex-col justify-between relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors duration-700" />

                    <div className="space-y-6 md:space-y-8 relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-black flex items-center justify-center shadow-lg shadow-black/10">
                          <Activity className="h-5 w-5 md:h-6 md:w-6 text-white" />
                        </div>
                        <span className="text-[9px] md:text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">Core Status</span>
                      </div>

                      <div className="space-y-6 md:space-y-8">
                        <div className="flex items-end justify-between border-b border-black/5 pb-4">
                          <div>
                            <p className="text-[9px] md:text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-1">Blood Pressure</p>
                            <p className="text-2xl md:text-3xl font-bricolage font-black tracking-tighter text-black">{vitals?.blood_pressure || "--"}</p>
                          </div>
                          <Badge className="bg-primary/10 text-primary border-none font-black text-[9px] md:text-[10px] uppercase tracking-widest px-2.5 py-1">Stable</Badge>
                        </div>

                        <div className="flex items-end justify-between border-b border-black/5 pb-4">
                          <div>
                            <p className="text-[9px] md:text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-1">Heart Rate</p>
                            <p className="text-2xl md:text-3xl font-bricolage font-black tracking-tighter text-black">{vitals?.heart_rate || "--"}</p>
                          </div>
                          <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center">
                            <Activity className="h-4 w-4 text-primary animate-pulse" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                          <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-black/[0.02] border border-black/5">
                            <p className="text-[8px] md:text-[9px] font-black text-black/30 uppercase tracking-[0.2em] mb-1">Temp</p>
                            <p className="text-lg md:text-xl font-black text-black">{vitals?.temperature || "--"}</p>
                          </div>
                          <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-black/[0.02] border border-black/5">
                            <p className="text-[8px] md:text-[9px] font-black text-black/30 uppercase tracking-[0.2em] mb-1">BMI</p>
                            <p className="text-lg md:text-xl font-black text-black">{vitals?.bmi || "--"}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={() => setShowAnalysisModal(true)}
                      disabled={!analysisResult && !fullAnalysisResult}
                      className="mt-8 w-full h-12 md:h-14 rounded-xl md:rounded-2xl bg-black hover:bg-primary text-white font-black uppercase text-[10px] md:text-xs tracking-[0.2em] shadow-2xl shadow-black/20 border-none group hover:scale-[1.02] transition-all"
                    >
                      Health Report PDF
                      <FileDown className="ml-2 h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                    </Button>
                  </div>
                </div>

                {/* Secondary Diagnostics & Therapeutics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  {/* Detailed Lab Matrix */}
                  <div className="p-6 md:p-8 rounded-3xl md:rounded-[3rem] bg-white border border-black/5 shadow-sm space-y-6 md:space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-vital-orange/10 flex items-center justify-center">
                          <Zap className="h-5 w-5 md:h-6 md:w-6 text-vital-orange" />
                        </div>
                        <div>
                          <h4 className="font-bricolage text-lg md:text-xl font-bold">Lab Matrix</h4>
                          <p className="text-[10px] md:text-xs font-medium text-black/30">Validated Clinical Markers</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="h-7 md:h-8 rounded-full border-black/5 text-black/40 font-bold px-3 md:px-4 text-[10px]">Latest</Badge>
                    </div>

                    <div className="space-y-4">
                      {/* Featured Lab Result */}
                      <div className="p-5 md:p-6 rounded-2xl md:rounded-4xl bg-vital-orange/[0.03] border border-vital-orange/10 flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-[9px] md:text-[10px] font-black text-vital-orange uppercase tracking-widest">Malaria MP Test</p>
                          <p className="text-xl md:text-2xl font-bricolage font-black tracking-tight">{labs?.malaria_test_mp || "Pending"}</p>
                        </div>
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-full border border-vital-orange/20 flex items-center justify-center animate-pulse">
                          <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-vital-orange shadow-[0_0_10px_#f97316]" />
                        </div>
                      </div>

                      <div className="p-5 md:p-6 rounded-2xl md:rounded-4xl bg-red-50/30 border border-red-100/50 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black text-black/40 uppercase tracking-widest">Widal Serology</span>
                          <Badge className="bg-red-100 text-red-600 border-none font-black text-[9px] uppercase tracking-widest">{labs?.widal_test || "N/A"}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {labs?.titers ? Object.entries(labs.titers).map((entry: any) => (
                            <div key={entry[0]} className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white border border-black/5 shadow-sm">
                              <span className="text-[9px] font-bold text-black/40 tracking-wider">T-{entry[0]}</span>
                              <div className="h-3 w-px bg-black/10" />
                              <span className="text-[10px] font-black text-red-500">{entry[1]}</span>
                            </div>
                          )) : (
                            <p className="text-[9px] font-medium text-black/20 italic">No specific titers available</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Therapeutic Regimen */}
                  <div className="p-6 md:p-8 rounded-3xl md:rounded-[3rem] bg-white border border-black/5 shadow-sm space-y-6 md:space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-blue-500/10 flex items-center justify-center">
                          <Pill className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
                        </div>
                        <div>
                          <h4 className="font-bricolage text-lg md:text-xl font-bold">Therapeutic Regimen</h4>
                          <p className="text-[10px] md:text-xs font-medium text-black/30">Active Medications</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {meds.length > 0 ? meds.map((med: any, i: number) => (
                        <div key={i} className="group flex items-center justify-between p-4 md:p-5 rounded-2xl md:rounded-4xl bg-blue-50/20 border border-blue-100/30 hover:bg-blue-50/40 transition-all cursor-pointer">
                          <div className="flex items-center gap-3 md:gap-4">
                            <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                              <div className="h-5 w-5 md:h-6 md:w-6 rounded-full border-2 border-blue-500 flex items-center justify-center">
                                <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-blue-500" />
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm md:text-base font-black tracking-tight">{med.name}</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Clock className="h-2.5 w-2.5 text-black/20" />
                                <span className="text-[9px] md:text-[10px] font-bold text-black/30 uppercase tracking-widest">{med.dosage} - {med.frequency}</span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-black/10 transition-transform group-hover:translate-x-1" />
                        </div>
                      )) : (
                        <p className="text-xs font-medium text-black/20 p-6 text-center italic">No current medications listed</p>
                      )}
                    </div>

                    <div className="p-5 md:p-6 rounded-2xl md:rounded-4xl border-2 border-dashed border-black/5 bg-black/[0.01] flex items-center justify-between group cursor-pointer hover:border-black/10 transition-all">
                      <div className="flex items-center gap-3">
                        <Plus className="h-4 w-4 md:h-5 md:w-5 text-black/20 group-hover:text-black/40 transition-colors" />
                        <span className="text-[10px] font-black text-black/20 group-hover:text-black/40 uppercase tracking-widest">Add OTC Medication</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Patient Summary & Footer Actions */}
                <div className="p-6 md:p-10 rounded-3xl md:rounded-5xl bg-indigo-50/50 border border-indigo-100 flex flex-col md:flex-row items-center gap-6 md:gap-10">
                  <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl md:rounded-[2rem] bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-200 shrink-0">
                    <User className="h-8 w-8 md:h-10 md:w-10 text-white" />
                  </div>
                  <div className="flex-1 space-y-2 text-center md:text-left">
                    <h3 className="font-bricolage text-2xl md:text-3xl font-black text-indigo-950 leading-tight">Patient Overview</h3>
                    <p className="text-base md:text-lg font-medium text-indigo-800/60 leading-relaxed">
                      Analysis suggests <span className="text-indigo-600 font-black">{ps?.diagnosis || "Incomplete data"}</span>.
                      Clinical data shows <span className="text-indigo-600 font-bold">{symptoms.length || 0} core symptoms</span> aligned.
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
              className="bg-white rounded-3xl md:rounded-4xl p-4 md:p-8 lg:p-12 w-full max-w-4xl shadow-2xl relative overflow-hidden h-full max-h-[90vh] md:h-auto overflow-y-auto"
            >
              <button
                onClick={() => setShowSim(null)}
                className="absolute top-4 right-4 md:top-8 md:right-8 h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-black/5 flex items-center justify-center hover:bg-black/10 transition-colors z-20"
              >
                <X className="h-5 w-5 md:h-6 md:w-6 text-black" />
              </button>

              {showSim === "records" && (
                <div className="space-y-8 flex flex-col h-full max-h-[85vh]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0">
                        <FileText className="h-6 w-6 md:h-7 md:w-7 text-blue-500" />
                      </div>
                      <div>
                        <h2 className="text-xl md:text-3xl font-bricolage font-extrabold tracking-tight underline decoration-blue-500/20 underline-offset-4 md:underline-offset-8">Record Intelligence</h2>
                        <p className="text-[10px] md:text-sm text-black/50 font-medium">Capture or upload records for AI Ingestion</p>
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
                            <p className="text-sm text-black/20 font-medium max-w-[240px] mx-auto mt-2">Upload medical records to populate the intelligence engine for {userName}.</p>
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

      {/* Full Analysis Results Preview Modal */}
      <Dialog open={showAnalysisModal} onOpenChange={setShowAnalysisModal}>
        <DialogContent className="max-w-[95vw] lg:max-w-5xl xl:max-w-6xl h-[92vh] lg:h-[85vh] flex flex-col p-0 overflow-hidden rounded-[2rem] lg:rounded-[3rem] border-none shadow-2xl backdrop-blur-3xl bg-white/95">
          <div className="absolute top-0 left-0 w-full h-2 bg-primary" />

          <DialogHeader className="px-6 py-6 lg:px-12 lg:py-10 bg-white border-b border-black/5 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6">
              <div className="h-14 w-14 lg:h-20 lg:w-20 rounded-2xl lg:rounded-[2rem] bg-primary/10 flex items-center justify-center shadow-inner shrink-0">
                <ShieldCheck className="h-7 w-7 lg:h-10 lg:w-10 text-primary" />
              </div>
              <div className="space-y-1">
                <DialogTitle className="font-bricolage text-2xl lg:text-5xl font-black tracking-tighter text-black leading-tight">Health Synthesis Report</DialogTitle>
                <DialogDescription className="text-black/40 font-bold text-[10px] lg:text-base uppercase tracking-widest">Verified by TakeCare Clinical Intelligence</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4 lg:p-12 bg-black/[0.02]">
            <article
              id="takecare-pdf-report"
              ref={reportRef}
              className="bg-white p-6 lg:p-20 rounded-[2rem] lg:rounded-[4rem] border border-black/5 shadow-2xl shadow-black/[0.02] max-w-none min-h-full flex flex-col"
            >
              {/* Report Header Logo & Title */}
              <div className="flex justify-between items-start border-b-[3px] border-black pb-10 mb-12">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-black flex items-center justify-center text-white">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <span className="text-xl font-black uppercase tracking-tighter">TakeCare</span>
                  </div>
                  <h1 className="text-4xl lg:text-5xl font-bricolage font-black tracking-tighter text-black uppercase mt-4">Clinical Synthesis</h1>
                  <p className="text-[11px] font-black text-black/30 uppercase tracking-[0.3em]">Precision Intelligence Record</p>
                </div>
                <div className="text-right space-y-2">
                  <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-black text-white text-[10px] font-black uppercase tracking-widest mb-4">
                    Verified Analysis
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-black/20">Generated On</p>
                  <p className="text-lg font-bold text-black">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>

              {/* Patient Identity Section */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 p-10 rounded-[2.5rem] bg-black/2 border border-black/5 mb-16">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-2">Subject Name</p>
                  <p className="text-2xl font-black text-black font-bricolage">{userName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-2">Clinical Reference</p>
                  <p className="text-2xl font-bold text-black font-mono">#{patientId?.slice(-6).toUpperCase() || "PAT-00X"}</p>
                </div>
                <div className="col-span-2 lg:col-span-1 border-t lg:border-t-0 lg:border-l border-black/5 pt-6 lg:pt-0 lg:pl-8">
                  <p className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-2">Report Status</p>
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" />
                    <p className="text-base font-black text-blue-600 uppercase">Live Context Sync</p>
                  </div>
                </div>
              </div>

              {/* Clinical Analysis Content */}
              <div className="flex-1 prose prose-sm md:prose-base lg:prose-xl max-w-none prose-headings:font-bricolage prose-headings:text-black prose-headings:font-black prose-headings:tracking-tighter prose-headings:uppercase prose-p:text-black/80 prose-p:leading-relaxed prose-strong:text-black prose-strong:font-black prose-ul:list-disc prose-li:text-black/70">
                {fullAnalysisResult && (
                  <ReactMarkdown
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-3xl border-l-4 border-black pl-5 my-10" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-xl bg-black/5 p-4 rounded-xl mt-12 mb-6" {...props} />,
                      ul: ({node, ...props}) => <ul className="space-y-2 mt-4" {...props} />,
                      li: ({node, ...props}) => <li className="bg-white border border-black/5 p-3 rounded-2xl list-none flex items-start gap-4 before:content-['•'] before:text-black before:font-bold before:text-xl" {...props} />,
                    }}
                  >
                    {fullAnalysisResult}
                  </ReactMarkdown>
                )}
              </div>

              {/* Professional Footer */}
              <div className="mt-24 pt-10 border-t border-black/10 flex flex-col md:flex-row justify-between items-center gap-6 opacity-30">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-black" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]">TakeCare V2.4 Clinical Intelligence Engine</p>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Confidential Medical Asset &copy; 2026</p>
              </div>
            </article>
          </div>

          <DialogFooter className="px-6 py-6 lg:px-12 lg:py-8 bg-white border-t border-black/5 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
            <Button
              variant="outline"
              onClick={() => setShowAnalysisModal(false)}
              className="w-full sm:w-auto rounded-2xl border-black/10 font-black text-[10px] lg:text-xs uppercase tracking-[0.2em] px-10 h-14 hover:bg-black/10 transition-all font-outfit"
            >
              Close Preview
            </Button>
            <div className="w-full sm:w-auto flex items-center gap-3">
              <Button
                onClick={handleDownloadReport}
                disabled={isDownloading}
                className="w-full sm:w-auto rounded-2xl bg-black hover:bg-primary text-white font-black text-[10px] lg:text-xs uppercase tracking-[0.2em] px-12 h-14 group transition-all shadow-xl shadow-black/20 font-outfit"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <FileDown className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                    Download Report
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
