"use client";

import React, { useState, useEffect, useRef } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send, Phone, UserPlus, ArrowRight, CheckCircle2, Bell, BellRing, Settings, MoreVertical, Paperclip, Smile, Mic, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const PLATFORMS = [
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "text-[#25D366]", bg: "bg-[#25D366]/10" },
  { id: "telegram", label: "Telegram", icon: Send, color: "text-[#0088cc]", bg: "bg-[#0088cc]/10" },
  { id: "gmail", label: "Gmail", icon: Mail, color: "text-red-500", bg: "bg-red-500/10" },
];

interface Message {
  id: string;
  text: string;
  sender: "user" | "doctor";
  timestamp: string;
  type?: string;     // text, image, voice, audio, video
  mediaUrl?: string; // URL for the media
}

export function MessengerSection({ onNotificationSync }: { onNotificationSync?: (count: number) => void }) {
  const [platform, setPlatform] = useState("whatsapp");
  const [isInvited, setIsInvited] = useState(false);
  const [isChatActive, setIsChatActive] = useState(false);
  const [doctorName, setDoctorName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [initialMessage, setInitialMessage] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [lastSeenTimestamp, setLastSeenTimestamp] = useState<string | null>(new Date().toISOString());
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync with parent
  useEffect(() => {
    if (onNotificationSync) {
      onNotificationSync(notificationCount);
    }
  }, [notificationCount, onNotificationSync]);

  const clearNotifications = () => {
    setNotificationCount(0);
    if (onNotificationSync) onNotificationSync(0);
  };

  // Sound Notification
  const playNotificationSound = () => {
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3"); // Simple ping
    audio.play().catch(e => console.log("Sound error:", e));
  };

  // Real-time Polling for new doctor messages (Multi-modal)
  useEffect(() => {
    if (!isChatActive) return;

    const pollInterval = setInterval(async () => {
      try {
        const url = `/api/messenger/check?lastSeen=${lastSeenTimestamp || ""}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.success && data.messages.length > 0) {
          const incoming = data.messages.map((m: any) => ({
            id: m.id,
            text: m.text,
            sender: "doctor",
            timestamp: m.timestamp,
            type: m.type,
            mediaUrl: m.mediaUrl
          }));

          setMessages(prev => [...prev, ...incoming]);
          setNotificationCount(n => n + data.messages.length);
          setLastSeenTimestamp(data.latestTimestamp);
          playNotificationSound();
          
          console.log("[FAANG Ingestion] Multi-modal Data Ready for AI:", incoming);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 4000); // Faster polling for real-time feel

    return () => clearInterval(pollInterval);
  }, [isChatActive, lastSeenTimestamp]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Normalize to digits only for API if it's a phone number
    let formattedNumber = platform === "gmail" ? contactInfo : contactInfo.replace(/\D/g, "");

    try {
      const response = await fetch("/api/messenger/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatsappNumber: formattedNumber,
          contactName: doctorName,
          doctorName: doctorName,
          initialMessage: initialMessage,
          platform: platform,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setIsInvited(true);
        // After showing the success modal, we stay on this page 
        // and just reset the form after a while, per user request.
        setTimeout(() => {
          setIsInvited(false);
          setDoctorName("");
          setContactInfo("");
          setInitialMessage("");
          setIsChatActive(true); // Auto-activate chat for demo or real use
        }, 5000);
      } else {
        alert(`WhatsApp Delivery Error: ${result.error}. Check campaign: ${process.env.NEXT_PUBLIC_CAMPAIGN || 'health_check'}`);
      }
    } catch (err) {
      console.error(err);
      alert("Network Error: Could not reach WhatsApp Gateway.");
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMsg]);
    setNewMessage("");
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div className="px-6 lg:px-12 mt-4 flex flex-col gap-8 relative">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bricolage font-black tracking-tighter">Communications Center</h2>
        <div className="relative group cursor-pointer" onClick={clearNotifications}>
          <div className="p-3 bg-white/50 backdrop-blur-md rounded-2xl border border-black/5 shadow-sm group-hover:bg-white transition-all">
            {notificationCount > 0 ? (
              <BellRing className="w-6 h-6 text-red-500 animate-bounce" />
            ) : (
              <Bell className="w-6 h-6 text-black/40" />
            )}
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg border-2 border-white">
                {notificationCount}
              </span>
            )}
          </div>
        </div>
      </div>

      {!isChatActive ? (
        <Tabs value={platform} onValueChange={setPlatform} className="w-full">
          <TabsList className="bg-black/5 p-1 rounded-2xl w-full lg:w-fit h-auto flex gap-1">
            {PLATFORMS.map((p) => (
              <TabsTrigger
                key={p.id}
                value={p.id}
                className={cn(
                  "rounded-xl px-6 py-2.5 transition-all duration-300 cursor-pointer flex-1 lg:flex-none",
                  "data-[state=active]:bg-[#007AFF] data-[state=active]:text-white shadow-medical active:scale-95 flex items-center justify-center gap-2 font-outfit font-bold text-sm"
                )}
              >
                <p.icon className={cn("h-4 w-4 transition-colors", platform === p.id ? "text-white" : p.color)} />
                {p.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <AnimatePresence mode="wait">
            {PLATFORMS.map((p) => (
              <TabsContent value={p.id} key={p.id}>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="mt-4 md:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center rounded-3xl md:rounded-5xl border border-black/5 bg-white p-5 md:p-8 lg:p-12 shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -ml-32 -mb-32" />

                  <div className="flex items-center justify-center lg:justify-start">
                    <div className={cn("relative flex h-56 w-56 lg:h-80 lg:w-80 items-center justify-center rounded-4xl shadow-2xl transition-transform hover:scale-105 duration-500", p.bg)}>
                      <div className="absolute inset-0 animate-pulse-ring rounded-4xl bg-current opacity-20" />
                      <p.icon className={cn("h-28 w-28 lg:h-44 lg:w-44", p.color)} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-10">
                    <div className="space-y-3">
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-black/5 text-[10px] font-black tracking-widest uppercase text-black/40">
                        Secure Connection
                      </div>
                      <h3 className="font-bricolage text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                        Invite your Doctor via <span className={p.color}>{p.label}</span>
                      </h3>
                      <p className="text-base font-medium text-black/40 lg:text-lg max-w-sm">
                        {p.id === "gmail" 
                          ? "Send a secure invitation directly to their Gmail inbox."
                          : `Direct ${p.label} integration for context-aware diagnostics.`}
                      </p>
                    </div>

                    <form onSubmit={handleInvite} className="grid gap-6">
                      <div className="grid gap-3">
                        <Label htmlFor={`doctor-name-${p.id}`} className="text-xs font-black uppercase tracking-[0.2em] text-black/30">
                          Doctor's Full Name
                        </Label>
                        <Input
                          id={`doctor-name-${p.id}`}
                          placeholder="e.g. Dr. Sarah Jenkins"
                          required
                          value={doctorName}
                          onChange={(e) => setDoctorName(e.target.value)}
                          className="h-16 rounded-2xl border-black/5 bg-black/5 pl-6 text-lg font-bold transition-all focus:bg-white focus:ring-4 focus:ring-primary/5 shadow-inner hover:bg-black/10"
                        />
                      </div>

                      <div className="grid gap-3">
                        <Label htmlFor={`contact-${p.id}`} className="text-xs font-black uppercase tracking-[0.2em] text-black/30">
                          {p.id === "gmail" ? "Doctor's Gmail" : `${p.label} Number`}
                        </Label>
                        <Input
                          id={`contact-${p.id}`}
                          type={p.id === "gmail" ? "email" : "tel"}
                          required
                          placeholder={p.id === "gmail" ? "docker@gmail.com" : "Ex: 237670000000"}
                          value={contactInfo}
                          onChange={(e) => setContactInfo(e.target.value)}
                          className="h-16 rounded-2xl border-black/5 bg-black/5 pl-6 text-lg font-bold transition-all focus:bg-white focus:ring-4 focus:ring-primary/5 shadow-inner hover:bg-black/10"
                        />
                      </div>

                      <div className="grid gap-3">
                        <Label htmlFor={`message-${p.id}`} className="text-xs font-black uppercase tracking-[0.2em] text-black/30">
                          Optional Message
                        </Label>
                        <textarea
                          id={`message-${p.id}`}
                          placeholder="Add a personalized message..."
                          value={initialMessage}
                          onChange={(e) => setInitialMessage(e.target.value)}
                          className="min-h-24 resize-none rounded-2xl border border-black/5 bg-black/5 p-4 text-base font-medium transition-all focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 shadow-inner hover:bg-black/10"
                        />
                      </div>

                      <Button type="submit" className="h-16 md:h-20 rounded-3xl md:rounded-4xl bg-black text-white font-black text-lg md:text-xl hover:scale-[1.02] active:scale-95 shadow-2xl mt-4">
                        Send {p.label} Invitation
                      </Button>
                    </form>
                  </div>
                </motion.div>
              </TabsContent>
            ))}
          </AnimatePresence>
        </Tabs>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col min-h-[600px] lg:h-[750px] w-full bg-white rounded-4xl border border-black/5 shadow-2xl overflow-hidden relative"
        >
          <div className="p-6 bg-white border-b border-black/5 flex justify-between items-center z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#25D366]/10 flex items-center justify-center shadow-inner relative">
                <MessageCircle className="w-7 h-7 text-[#25D366]" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <div className="flex flex-col">
                <h3 className="font-bricolage text-xl font-bold">{doctorName}</h3>
                <span className="text-xs font-bold text-green-500 uppercase">Live via WhatsApp</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="rounded-xl opacity-40"><Phone className="w-5 h-5" /></Button>
              <Button variant="ghost" size="icon" className="rounded-xl opacity-40"><Bell className="w-5 h-5" /></Button>
            </div>
          </div>

          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-8 space-y-8 bg-black/[0.02]"
          >
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col max-w-[85%] ${m.sender === "user" ? "ml-auto items-end" : "items-start"}`}
              >
                <div className={cn(
                  "p-5 rounded-3xl text-sm leading-relaxed shadow-sm overflow-hidden",
                  m.sender === "user" 
                    ? "bg-black text-white rounded-tr-none" 
                    : "bg-white text-black border border-black/5 rounded-tl-none"
                )}>
                  {m.type === "image" && m.mediaUrl && (
                    <div className="mb-3 rounded-xl overflow-hidden shadow-lg border border-black/5">
                      <img src={m.mediaUrl} alt="Clinical Attachment" className="w-full h-auto max-h-80 object-cover" />
                    </div>
                  )}
                  {(m.type === "audio" || m.type === "voice") && m.mediaUrl && (
                    <div className="mb-3 p-4 bg-black/5 rounded-2xl flex items-center gap-3">
                       <Mic className="w-5 h-5 text-primary" />
                       <audio src={m.mediaUrl} controls className="h-10 w-48" />
                    </div>
                  )}
                  <p className="font-medium">{m.text}</p>
                </div>
                <span className="text-[10px] font-black text-black/20 mt-2 px-2 uppercase tracking-widest">{m.timestamp}</span>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 p-4 bg-black/5 rounded-2xl w-fit"
              >
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-black/40 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-black/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-black/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="text-[10px] font-black text-black/40 uppercase tracking-widest">Doctor is typing</span>
              </motion.div>
            )}
          </div>

          <form onSubmit={sendMessage} className="p-6 bg-white border-t border-black/5 flex gap-4 items-center">
            <Button type="button" variant="ghost" size="icon" className="rounded-xl opacity-40"><Smile /></Button>
            <Button type="button" variant="ghost" size="icon" className="rounded-xl opacity-40"><Paperclip /></Button>
            <div className="flex-1 relative">
              <Input
                placeholder="Direct message to Doctor..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="h-14 rounded-2xl border-black/5 bg-black/5 pl-6 text-base font-bold transition-all focus:bg-white focus:ring-0 shadow-inner"
              />
            </div>
            <Button type="submit" className="h-14 w-14 rounded-2xl bg-black text-white shadow-xl">
               <Send className="w-6 h-6" />
            </Button>
          </form>
        </motion.div>
      )}

      <AnimatePresence>
        {isInvited && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xl px-6"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              className="flex flex-col items-center justify-center gap-6 rounded-4xl bg-white p-10 lg:p-14 shadow-2xl border border-black/5 w-full max-w-lg text-center relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1.5 bg-[#25D366] animate-progress" />
              <CheckCircle2 className="h-12 w-12 text-[#25D366]" />
              <div className="space-y-2">
                <h3 className="font-bricolage text-2xl font-extrabold text-black">Invitation Sent!</h3>
                <p className="text-sm font-medium text-black/40">Connecting to {doctorName}...</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(1.1); opacity: 0; }
        }
        .animate-pulse-ring {
          animation: pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
        }
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0); }
        }
        .animate-progress {
          animation: progress 5s linear;
        }
      `}</style>
    </div>
  );
}
