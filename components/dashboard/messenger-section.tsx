"use client";

import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send, Phone, UserPlus, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const PLATFORMS = [
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "text-[#25D366]", bg: "bg-[#25D366]/10" },
  { id: "telegram", label: "Telegram", icon: Send, color: "text-[#0088cc]", bg: "bg-[#0088cc]/10" },
  { id: "call", label: "Normal Call", icon: Phone, color: "text-primary", bg: "bg-primary/10" },
];

export function MessengerSection() {
  const [platform, setPlatform] = useState("whatsapp");

  return (
    <div className="px-6 lg:px-12 mt-4 flex flex-col gap-8">
      {/* Sub-navigation */}
      <Tabs value={platform} onValueChange={setPlatform} className="w-full">
        <TabsList className="bg-black/[0.03] p-1.5 rounded-2xl w-full lg:w-fit h-auto flex gap-1 overflow-x-auto no-scrollbar">
          {PLATFORMS.map((p) => (
            <TabsTrigger
              key={p.id}
              value={p.id}
              className={cn(
                "rounded-xl px-6 py-3 transition-all duration-500 cursor-pointer flex-1 lg:flex-none whitespace-nowrap",
                "data-active:bg-white/40 data-active:backdrop-blur-xl data-active:text-primary data-active:shadow-[0_8px_32px_rgba(0,0,0,0.04)] data-active:border data-active:border-white/20 data-active:scale-[1.02]",
                "flex items-center justify-center gap-3 font-outfit font-bold text-sm border border-transparent"
              )}
            >
              <p.icon className={cn("h-5 w-5 transition-colors", platform === p.id ? "text-primary" : p.color)} />
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

                  <div className="grid gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor={`doctor-name-${p.id}`} className="text-xs font-black uppercase tracking-[0.2em] text-black/30">
                        Doctor's Full Name
                      </Label>
                      <div className="relative">
                        <UserPlus className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-black/20" />
                        <Input
                          id={`doctor-name-${p.id}`}
                          placeholder="e.g. Dr. Sarah Jenkins"
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
                          placeholder="+1 (555) 000-0000"
                          className="h-14 rounded-2xl border-black/5 bg-black/5 pl-12 text-lg font-bold transition-all focus:bg-white focus:ring-black/5"
                        />
                      </div>
                    </div>

                    <Button className="h-16 rounded-full bg-black text-white font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10 mt-4 group">
                      Send Invitation
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>

                  <p className="text-[10px] font-medium text-black/30 uppercase tracking-widest text-center lg:text-left">
                    Secured by TakeCare AI Encryption
                  </p>
                </div>
              </motion.div>
            </TabsContent>
          ))}
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
