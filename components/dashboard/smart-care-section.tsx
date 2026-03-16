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
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
  const [isListening, setIsListening] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative flex flex-col items-center justify-center p-12 lg:p-24 rounded-[3rem] border border-white/20 bg-linear-to-br from-primary/5 via-primary/10 to-transparent backdrop-blur-3xl overflow-hidden min-h-[500px]"
    >
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full" />
      
      <div className="relative z-10 flex flex-col items-center gap-12 w-full max-w-2xl text-center">
        <div className="space-y-4">
          <h2 className="font-bricolage text-4xl lg:text-6xl font-extrabold tracking-tighter">
            {isListening ? "Listening..." : "How can I help you today?"}
          </h2>
          <p className="text-black/50 font-medium text-lg lg:text-xl">
            Talk to our AI Medical Agent about your symptoms or medical concerns.
          </p>
        </div>

        {/* Voice Visualizer */}
        <div className="relative h-64 w-64 flex items-center justify-center">
          <AnimatePresence>
            {isListening && (
              <>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                  className="absolute inset-0 bg-primary/20 rounded-full"
                />
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeOut", delay: 0.5 }}
                  className="absolute inset-0 bg-primary/10 rounded-full"
                />
              </>
            )}
          </AnimatePresence>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsListening(!isListening)}
            className={cn(
              "z-10 h-32 w-32 rounded-full flex items-center justify-center transition-all duration-500 cursor-pointer",
              isListening ? "bg-primary shadow-[0_0_50px_rgba(var(--primary),0.5)]" : "bg-black"
            )}
          >
            <Mic className={cn("h-12 w-12 text-white", isListening && "animate-pulse")} />
          </motion.div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {["Tell me about my reports", "Schedule a follow-up", "Check symptom"].map((prompt) => (
            <button
              key={prompt}
              className="px-6 py-3 rounded-2xl bg-white/50 border border-black/5 hover:bg-white hover:shadow-xl hover:shadow-black/5 transition-all text-sm font-bold font-outfit"
            >
              "{prompt}"
            </button>
          ))}
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
      content: "Connected: 1 Device"
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
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/20">{card.label}</span>
              </div>

              <div className="space-y-3">
                <h3 className="font-bricolage text-2xl font-extrabold tracking-tight">{card.title}</h3>
                <p className="text-sm font-medium text-black/50 leading-relaxed">{card.description}</p>
              </div>

              <div className="mt-auto flex items-center justify-between">
                <span className="text-xs font-bold text-black/30">{card.content}</span>
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
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                      <Watch className="h-7 w-7 text-orange-500" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bricolage font-extrabold tracking-tight">Wearable Sync</h2>
                      <p className="text-black/50 font-medium">Real-time biometrics from your Smart Bracelet</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { icon: Activity, label: "Heart Rate", val: "72", unit: "bpm", color: "text-red-500" },
                      { icon: Zap, label: "Energy", val: "84", unit: "%", color: "text-yellow-500" },
                      { icon: Watch, label: "Steps", val: "8,432", unit: "", color: "text-blue-500" },
                      { icon: Bot, label: "Stress", val: "Low", unit: "", color: "text-green-500" }
                    ].map((metric, i) => (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        key={metric.label}
                        className="p-6 rounded-3xl bg-black/5 flex flex-col items-center text-center gap-2"
                      >
                        <metric.icon className={cn("h-6 w-6 mb-2", metric.color)} />
                        <span className="text-2xl font-black font-bricolage">{metric.val}</span>
                        <span className="text-[10px] font-bold text-black/30 uppercase tracking-widest">{metric.label} {metric.unit}</span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="p-8 rounded-4xl bg-orange-50 border border-orange-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-orange-500 flex items-center justify-center text-white">
                        <Watch className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-bold text-orange-900">TakeCare Bracelet Pro</p>
                        <p className="text-xs text-orange-700/60 font-medium">Last synced: Just now</p>
                      </div>
                    </div>
                    <Button variant="outline" className="rounded-xl border-orange-200 text-orange-700 hover:bg-orange-100">
                      Settings
                    </Button>
                  </div>
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
