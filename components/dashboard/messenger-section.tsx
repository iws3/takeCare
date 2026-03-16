"use client";

import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send, Phone, UserPlus, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const PLATFORMS = [
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "text-[#25D366]", bg: "bg-[#25D366]/10" },
  { id: "telegram", label: "Telegram", icon: Send, color: "text-[#0088cc]", bg: "bg-[#0088cc]/10" },
  { id: "call", label: "Normal Call", icon: Phone, color: "text-primary", bg: "bg-primary/10" },
];

export function MessengerSection() {
  const [platform, setPlatform] = useState("whatsapp");
  const [isInvited, setIsInvited] = useState(false);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setIsInvited(true);
    setTimeout(() => setIsInvited(false), 3000); // Hide modal after 3 seconds
  };

  return (
    <div className="px-6 lg:px-12 mt-4 flex flex-col gap-8">
      {/* Sub-navigation */}
      <Tabs value={platform} onValueChange={setPlatform} className="w-full">
        <TabsList className="bg-black/5 p-1 rounded-2xl w-full lg:w-fit h-auto flex gap-1">
          {PLATFORMS.map((p) => (
            <TabsTrigger
              key={p.id}
              value={p.id}
              className={cn(
                "rounded-xl px-6 py-2.5 transition-all duration-300 cursor-pointer flex-1 lg:flex-none",
                "data-[state=active]:bg-[#007AFF] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25 data-[state=active]:scale-[1.05]",
                "flex items-center justify-center gap-2 font-outfit font-bold text-sm"
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
                className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center rounded-3xl border border-black/5 bg-white p-8 lg:p-12 shadow-sm"
              >
                {/* Left Side: Large Logo */}
                <div className="flex items-center justify-center lg:justify-start">
                  <div className={cn(
                    "relative flex h-48 w-48 lg:h-72 lg:w-72 items-center justify-center rounded-full transition-all duration-500",
                    p.bg
                  )}>
                    <div className="absolute inset-0 animate-pulse-ring rounded-full bg-current opacity-20" />
                    <p.icon className={cn("h-24 w-24 lg:h-40 lg:w-40", p.color)} />
                  </div>
                </div>

                {/* Right Side: Form */}
                <div className="flex flex-col gap-8">
                  <div className="space-y-2">
                    <h3 className="font-bricolage text-3xl font-extrabold tracking-tighter lg:text-4xl">
                      Invite your Doctor via {p.label}
                    </h3>
                    <p className="text-sm font-medium text-black/50 lg:text-base">
                      Connect with your healthcare professional directly on their preferred platform.
                    </p>
                  </div>

                  <form onSubmit={handleInvite} className="grid gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor={`doctor-name-${p.id}`} className="text-xs font-black uppercase tracking-[0.2em] text-black/30">
                        Doctor's Full Name
                      </Label>
                      <div className="relative">
                        <UserPlus className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-black/20" />
                        <Input
                          id={`doctor-name-${p.id}`}
                          placeholder="e.g. Dr. Sarah Jenkins"
                          required
                          className="h-14 rounded-2xl border-black/5 bg-black/5 pl-12 text-lg font-bold transition-all focus:bg-white focus:ring-black/5"
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor={`phone-${p.id}`} className="text-xs font-black uppercase tracking-[0.2em] text-black/30">
                        Phone Number
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-black/20" />
                        <Input
                          id={`phone-${p.id}`}
                          type="tel"
                          required
                          placeholder="+1 (555) 000-0000"
                          className="h-14 rounded-2xl border-black/5 bg-black/5 pl-12 text-lg font-bold transition-all focus:bg-white focus:ring-black/5"
                        />
                      </div>
                    </div>

                    <Button type="submit" className="h-16 rounded-full bg-black text-white font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10 mt-4 group">
                      Send Invitation
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </form>

                  <p className="text-[10px] font-medium text-black/30 uppercase tracking-widest text-center lg:text-left">
                    Secured by TakeCare AI Encryption
                  </p>
                </div>
              </motion.div>
            </TabsContent>
          ))}
        </AnimatePresence>
      </Tabs>
      <AnimatePresence>
        {isInvited && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm px-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="flex flex-col items-center justify-center gap-4 rounded-3xl bg-white/70 p-8 lg:p-12 shadow-2xl backdrop-blur-2xl border border-white/50 w-full max-w-sm"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#25D366]/10 shadow-inner">
                <CheckCircle2 className="h-10 w-10 text-[#25D366]" />
              </div>
              <h3 className="font-outfit text-3xl font-extrabold tracking-tight text-black mt-2">Invitation Sent!</h3>
              <p className="text-sm font-medium text-black/50 text-center">
                We've sent a secure connection request. The status has been updated in your dashboard.
              </p>
              <Button
                onClick={() => setIsInvited(false)}
                className="w-full mt-4 h-12 rounded-xl bg-black text-white font-bold"
              >
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
