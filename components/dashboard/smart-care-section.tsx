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
  Circle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SYNTHETIC_DOCTOR_DATA } from "@/lib/doctor-data";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Vapi from "@vapi-ai/web";
import { getVapiConfiguration } from "@/app/actions/vapi";

const SMART_CARE_TABS = [
  { id: "talk", label: "Talk", icon: Mic, description: "Voice interaction with AI medical agent" },
  { id: "text", label: "Text", icon: MessageSquareText, description: "Secure chat with medical AI" },
  { id: "analyze", label: "Analyze", icon: BarChart3, description: "Deep analysis of health records" },
];

export function SmartCareSection() {
  const [activeTab, setActiveTab] = useState("text");

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
            <VoiceAgentView />
          </TabsContent>
          <TabsContent value="text" key="text">
            <ChatbotView />
          </TabsContent>
          <TabsContent value="analyze" key="analyze">
            <AnalysisView />
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}

function VoiceAgentView() {
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

      // STARTING THE CALL USING THE PERSISTED ASSISTANT ID WITH DYNAMIC OVERRIDES
      // This allows Vapi to use the base configuration from the dashboard but injects
      // our dynamic context seamlessly as an override at runtime.
      if (!assistantId) {
        console.warn("Missing NEXT_PUBLIC_VAPI_ASSISTANT_ID in .env!");
        setCallStatus("inactive");
        return;
      }

      await vapiInstance?.start(assistantId, {
        name: "TakeCare AI Doctor",
        firstMessage: `Hello ${SYNTHETIC_DOCTOR_DATA.patientName}, this is your TakeCare AI Assistant calling on behalf of ${SYNTHETIC_DOCTOR_DATA.doctorName}. How are you feeling today?`,
        model: {
          provider: "openai",
          model: "gpt-4o",
          messages: [{ role: "system", content: result.config.systemPrompt }],
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
            src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=800&auto=format&fit=crop" 
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
            Securely discuss your latest medical results and {SYNTHETIC_DOCTOR_DATA.doctorName}'s plan in real-time.
          </p>
        </div>

        {/* Insight Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <div className="p-5 lg:p-6 rounded-3xl bg-black/[0.02] border border-black/5 text-left flex flex-col gap-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group">
            <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
              <Activity className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1.5">Medication Target</p>
              <p className="text-sm lg:text-base font-bold text-black leading-snug">Propranolol: 10mg Twice Daily</p>
            </div>
          </div>
          
          <div className="p-5 lg:p-6 rounded-3xl bg-black/[0.02] border border-black/5 text-left flex flex-col gap-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group">
            <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
              <Zap className="h-5 w-5 lg:h-6 lg:w-6 text-vital-orange" />
            </div>
            <div>
              <p className="text-[10px] font-black text-vital-orange uppercase tracking-[0.2em] mb-1.5">Doctor's Observation</p>
              <p className="text-sm lg:text-base font-bold text-black leading-snug">Variability remains slightly low.</p>
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

  function AnalysisView() {
    const [analyzing, setAnalyzing] = useState(false);
    const [showSim, setShowSim] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

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

        // Use acceptAllDevices so the native browser picker doesn't hide devices.
        // Many cheap smart bands do not properly advertise the Heart Rate service UUID, 
        // preventing them from appearing in filtered searches.
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
        else if (error.name === 'SecurityError') msg = "Security error. Must be initiated by user gesture.";
        else if (error.name === 'NetworkError') msg = "Network/Bluetooth disabled. Please turn on Bluetooth.";
        else msg = error.message;
        setConnectionError(msg);
        setBleDevice(null);
      } finally {
        setIsConnecting(false);
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
        content: "3 Records found"
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
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

          {/* Main Analysis Status */}
          <div className="lg:col-span-3 p-10 rounded-[2.5rem] border border-primary/10 bg-black text-white flex flex-col lg:flex-row items-center justify-between gap-8 mt-4 overflow-hidden relative">
            <div className="absolute top-0 right-0 h-full w-1/2 bg-linear-to-l from-primary/20 to-transparent pointer-events-none" />

            <div className="flex items-center gap-6">
              <div className="h-16 w-16 rounded-3xl bg-primary/20 flex items-center justify-center">
                <Activity className={cn("h-8 w-8 text-primary", analyzing && "animate-bounce")} />
              </div>
              <div className="space-y-1">
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
                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                        <FileText className="h-7 w-7 text-blue-500" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bricolage font-extrabold tracking-tight">Record Intelligence</h2>
                        <p className="text-black/50 font-medium">Scanning 3 uploaded documents for insights</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { name: "Blood_Test_Mar.pdf", date: "Mar 12, 2026", insight: "LDL Cholesterol is slightly elevated" },
                        { name: "Prescription_X.jpg", date: "Feb 28, 2026", insight: "Interactions check passed" }
                      ].map((doc, i) => (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          key={doc.name}
                          className="p-6 rounded-3xl bg-black/5 border border-black/5 space-y-4"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold font-outfit">{doc.name}</span>
                            <span className="text-[10px] font-black text-black/20">{doc.date}</span>
                          </div>
                          <div className="p-3 bg-white rounded-xl text-xs font-bold text-blue-600 flex items-center gap-2">
                            <Zap className="h-3 w-3" />
                            AI Insight: {doc.insight}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="relative h-40 rounded-3xl bg-blue-50 overflow-hidden flex flex-col items-center justify-center border-2 border-dashed border-blue-200">
                      <motion.div
                        animate={{ y: [0, 160, 0] }}
                        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                        className="absolute top-0 left-0 w-full h-1 bg-blue-500/50 shadow-[0_0_20px_blue]"
                      />
                      <Plus className="h-8 w-8 text-blue-300 mb-2" />
                      <p className="text-sm font-bold text-blue-400">Drag more medical records here</p>
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
