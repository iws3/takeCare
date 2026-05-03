"use client";

import React, { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { 
  ArrowUp,
  Plus,
  Paperclip,
  Wand2,
  Stethoscope,
  Microscope,
  FileSearch,
  MessageSquarePlus,
  ChevronUp,
  History,
  Activity,
  Search,
  ShieldCheck,
  Bot,
  Sparkles,
  Zap,
  Brain,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface ChatbotViewProps {
  userName: string;
  messages: any[];
  sendMessage: (content: string) => void;
  status: string;
  setMessages: (messages: any[]) => void;
}

export function ChatbotView({ 
  userName, 
  messages, 
  sendMessage, 
  status,
  setMessages 
}: ChatbotViewProps) {
  const isLoading = status === "submitting" || status === "streaming";
  
  // Use local state for the input to guarantee responsiveness and bypass any hook-related typing issues
  const [localInput, setLocalInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const [isToolMenuOpen, setIsToolMenuOpen] = useState(false);

  const tools = [
    { id: "records", label: "Search Medical History", icon: History, prompt: "Search my medical records for " },
    { id: "vitals", label: "Check Latest Vitals", icon: Activity, prompt: "What are my latest vitals?" },
    { id: "notes", label: "Review Doctor Notes", icon: FileSearch, prompt: "What did my doctor note in the last session?" },
    { id: "literature", label: "Search Medical Research", icon: Microscope, prompt: "Search medical literature about " },
  ];

  const handleToolSelect = (toolPrompt: string) => {
    setLocalInput(toolPrompt);
    
    // Also try to update the SDK state in the background
    if (typeof setInput === 'function') {
      setInput(toolPrompt);
    }
    
    setIsToolMenuOpen(false);
    
    // Focus the input field after selection
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localInput.trim() || isLoading) return;

    const messageToSend = localInput.trim();
    
    // Clear local input immediately for better UX
    setLocalInput("");

    try {
      // Direct call to sendMessage which is the correct method for this SDK version
      if (typeof sendMessage === "function") {
        sendMessage({ text: messageToSend });
      } else {
        console.error("Critical: sendMessage is not a function in this SDK version", { status, sendMessage });
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      // Fallback: restore input if it failed
      setLocalInput(messageToSend);
    }
  };

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-slot="scroll-area-viewport"]');
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: "smooth",
        });
      }
    }
  }, [messages, isLoading]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col flex-1 h-[calc(100vh-220px)] bg-white rounded-[2.5rem] border border-black/5 shadow-2xl overflow-hidden relative"
    >
      {/* Chat Header */}
      <div className="px-8 py-4 border-b border-black/5 bg-slate-50/50 backdrop-blur-xl flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bricolage font-black text-sm tracking-tight">Dr. Leo</h3>
            <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">Always Online</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">Secure AI Node</span>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
        <div className="flex flex-col gap-6 max-w-3xl mx-auto">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex flex-col gap-2",
                msg.role === "user" ? "items-end" : "items-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] md:max-w-[75%] px-5 py-4 rounded-[1.8rem] text-sm font-medium shadow-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-primary text-white rounded-tr-none"
                    : "bg-slate-100/80 text-black/80 rounded-tl-none border border-black/5"
                )}
              >
                {/* Check for parts (AI SDK v4+) */}
                {msg.parts ? (
                  <div className="flex flex-col gap-3">
                    {msg.parts.map((part, i) => {
                      if (part.type === "text") {
                        return (
                          <div
                            key={i}
                            className={cn(
                              "prose prose-sm max-w-none",
                              msg.role === "user" ? "prose-invert" : "prose-emerald"
                            )}
                          >
                            <ReactMarkdown>
                              {part.text}
                            </ReactMarkdown>
                          </div>
                        );
                      }
                      if (part.type === "tool-invocation") {
                        const call = part.toolInvocation;
                        return (
                          <div
                            key={i}
                            className="bg-white/40 backdrop-blur-sm rounded-2xl p-3 border border-black/5 flex items-center gap-3"
                          >
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              {call.toolName.toLowerCase().includes("history") ? (
                                <History className="h-4 w-4 text-primary" />
                              ) : call.toolName.toLowerCase().includes("vital") ? (
                                <Activity className="h-4 w-4 text-primary" />
                              ) : (
                                <Search className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black uppercase tracking-widest text-black/40">
                                {call.state === "result" ? "Tool Used" : "AI is using tool"}
                              </span>
                              <span className="text-xs font-bold text-black/70">
                                {call.toolName === "searchMedicalHistory" && "Scanning medical records..."}
                                {call.toolName === "getLatestVitals" && "Retrieving latest vitals..."}
                                {call.toolName === "searchMedicalLiterature" && "Consulting medical literature..."}
                                {call.toolName === "getDoctorNotes" && "Checking doctor notes..."}
                                {call.toolName === "searchVoiceHistory" && "Reviewing voice consultations..."}
                                {call.toolName === "getDoctorIntelligence" && "Synthesizing doctor intelligence..."}
                              </span>
                            </div>
                            {call.state === "result" && (
                              <div className="ml-auto">
                                <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center">
                                  <ShieldCheck className="h-3 w-3 text-green-600" />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                ) : (
                  <div
                    className={cn(
                      "prose prose-sm max-w-none",
                      msg.role === "user" ? "prose-invert" : "prose-emerald"
                    )}
                  >
                    <ReactMarkdown>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
              <span className="text-[9px] font-black text-black/20 uppercase tracking-widest px-2">
                {msg.role === "user" ? "You" : "Dr. Leo"} • {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </motion.div>
          ))}
          
          {isLoading && !messages[messages.length - 1]?.parts?.some(p => p.type === 'text') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-black/30 font-black text-[10px] uppercase tracking-[0.2em] ml-2"
            >
              <div className="flex gap-1">
                <span className="animate-bounce">.</span>
                <span className="animate-bounce delay-100">.</span>
                <span className="animate-bounce delay-200">.</span>
              </div>
              Leo is thinking
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-6 bg-slate-50/50 backdrop-blur-xl border-t border-black/5 shrink-0">
        <div className="max-w-3xl mx-auto flex flex-col gap-3">
          {/* Tool Suggestion Chips */}
          {!localInput && !isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
            >
              {tools.slice(0, 3).map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => handleToolSelect(tool.prompt)}
                  className="whitespace-nowrap px-4 py-2 rounded-full bg-white border border-black/5 text-[10px] font-black uppercase tracking-widest text-black/40 hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all flex items-center gap-2 shadow-sm"
                >
                  <tool.icon className="h-3 w-3" />
                  {tool.label}
                </button>
              ))}
            </motion.div>
          )}

          <form
            onSubmit={onFormSubmit}
            className="flex items-center gap-2 bg-white rounded-[2rem] p-2 pl-2 border border-black/5 shadow-2xl shadow-black/5 focus-within:border-primary/30 transition-all relative group"
          >
            {/* Claude-style Tool/Plus Menu */}
            <DropdownMenu open={isToolMenuOpen} onOpenChange={setIsToolMenuOpen}>
              <DropdownMenuTrigger
                render={(triggerProps) => (
                  <Button
                    {...triggerProps}
                    variant="ghost"
                    className="h-12 w-12 rounded-full hover:bg-slate-100 text-black/40 hover:text-black transition-all shrink-0"
                  >
                    <Plus className={cn("h-6 w-6 transition-transform duration-300", isToolMenuOpen && "rotate-45")} />
                  </Button>
                )}
              />
              <DropdownMenuContent align="start" className="w-64 p-2 rounded-2xl border-black/5 shadow-2xl bg-white/95 backdrop-blur-xl">
                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 px-3 py-2">Select Health Tool</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-black/5" />
                {tools.map((tool) => (
                  <DropdownMenuItem
                    key={tool.id}
                    onSelect={() => handleToolSelect(tool.prompt)}
                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-primary/5 group"
                  >
                    <div className="h-8 w-8 rounded-lg bg-black/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <tool.icon className="h-4 w-4 text-black/40 group-hover:text-primary" />
                    </div>
                    <span className="text-xs font-bold text-black/70 group-hover:text-black">{tool.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <input
              ref={inputRef}
              value={localInput}
              onChange={(e) => setLocalInput(e.target.value)}
              placeholder="Ask Dr. Leo or select a tool..."
              className="flex-1 bg-transparent border-none outline-none px-2 py-3 text-sm font-bold placeholder:text-black/20 text-black/70"
            />

            <button
              type="submit"
              disabled={isLoading || !localInput?.trim()}
              className={cn(
                "h-12 w-12 rounded-full flex items-center justify-center transition-all shadow-lg",
                localInput?.trim() 
                  ? "bg-black text-white shadow-black/20 hover:scale-105 active:scale-95" 
                  : "bg-black/5 text-black/20 scale-95"
              )}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ArrowUp className="h-5 w-5" />
              )}
            </button>
          </form>

          <div className="flex items-center justify-center gap-6 text-[9px] font-black text-black/20 uppercase tracking-[0.15em] pt-1">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-green-500/50" /> Secure Sync</span>
            <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-primary/50" /> Gemini 2.5</span>
            <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-vital-orange/50" /> Low Latency</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
