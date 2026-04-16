"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, MessageSquare, Bell, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "messenger", label: "Messenger", icon: MessageSquare },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "smart-care", label: "Smart Care", icon: Plus },
];

export function DashboardTabs({
  value,
  onValueChange,
  notificationCount = 0,
  messengerCount = 0
}: {
  value: string;
  onValueChange: (val: string) => void;
  notificationCount?: number;
  messengerCount?: number;
}) {
  return (
    <div className="px-6 lg:px-0 my-8 lg:my-12">
      <Tabs value={value} onValueChange={onValueChange} className="w-full">
        <TabsList className="bg-white/60 backdrop-blur-3xl p-1 md:p-1.5 rounded-3xl md:rounded-4xl w-full lg:w-fit h-auto flex gap-1 md:gap-1.5 overflow-x-auto no-scrollbar border border-black/[0.03] shadow-sm relative">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn(
                "rounded-2xl md:rounded-3xl px-5 py-3 md:px-10 md:py-4 transition-all duration-500 cursor-pointer whitespace-nowrap relative group shrink-0",
                "data-[state=active]:text-white",
                "data-[state=inactive]:text-black/40 data-[state=inactive]:hover:text-black/60 data-[state=inactive]:hover:bg-black/5",
                "flex items-center justify-center gap-2 md:gap-4 font-outfit font-black text-xs md:text-base border border-transparent"
              )}
            >
              <div className="relative">
                <tab.icon className={cn(
                  "h-4 w-4 md:h-6 md:w-6 transition-transform duration-500 group-hover:scale-110 group-data-[state=active]:scale-110",
                  tab.id === "smart-care" && value !== "smart-care" && "text-vital-orange animate-pulse"
                )} />

                {/* Messenger Badge */}
                {tab.id === "messenger" && messengerCount > 0 && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -top-1.5 -right-1.5 flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-linear-to-tr from-[#25D366] to-[#128C7E] text-[8px] md:text-[10px] font-black text-white shadow-lg shadow-[#25D366]/40 border-2 border-white"
                  >
                    {messengerCount}
                  </motion.span>
                )}

                {/* Notifications Badge */}
                {tab.id === "notifications" && notificationCount > 0 && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -top-1.5 -right-1.5 flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-linear-to-tr from-[#FF3B30] to-[#D70015] text-[8px] md:text-[10px] font-black text-white shadow-lg shadow-[#FF3B30]/40 border-2 border-white"
                  >
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </motion.span>
                )}
              </div>

              <span className="uppercase text-[10px] md:text-xs font-black tracking-[0.2em] md:tracking-[0.25em]">{tab.label}</span>

              {value === tab.id && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-primary rounded-2xl md:rounded-3xl -z-10 shadow-xl shadow-primary/20"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
                />
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
