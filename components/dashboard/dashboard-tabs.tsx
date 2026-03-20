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
    <div className="px-6 lg:px-12 my-6">
      <Tabs value={value} onValueChange={onValueChange} className="w-full">
        <TabsList className="bg-black/[0.03] p-1.5 rounded-2xl w-full lg:w-fit h-auto flex gap-1 overflow-x-auto no-scrollbar mask-fade-right">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn(
                "rounded-xl px-6 py-3 lg:px-10 lg:py-4 transition-all duration-500 cursor-pointer whitespace-nowrap relative",
                "data-active:bg-white/40 data-active:backdrop-blur-xl data-active:text-primary data-active:shadow-[0_8px_32px_rgba(0,0,0,0.04)] data-active:border data-active:border-white/20 data-active:scale-[1.02]",
                "flex items-center justify-center gap-3 font-outfit font-bold text-sm lg:text-base border border-transparent"
              )}
            >
              <div className="relative">
                <tab.icon className={cn(
                  "h-5 w-5",
                  tab.id === "smart-care" && "text-red-500 fill-red-500/20"
                )} />
                {/* Messenger Badge */}
                {tab.id === "messenger" && messengerCount > 0 && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#25D366] text-[10px] font-bold text-white shadow-[0_2px_8px_rgba(37,211,102,0.4)]"
                  >
                    {messengerCount}
                  </motion.span>
                )}
                {/* Notifications Badge */}
                {tab.id === "notifications" && notificationCount > 0 && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF3B30] text-[10px] font-bold text-white shadow-[0_2px_8px_rgba(255,59,48,0.4)]"
                  >
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </motion.span>
                )}
              </div>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
