"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, MessageSquare, Bell, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "messenger", label: "Messenger", icon: MessageSquare },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "smart-care", label: "Smart Care", icon: Sparkles },
];

export function DashboardTabs() {
  return (
    <div className="px-6 lg:px-12 my-4">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-black/5 p-1 rounded-2xl w-full lg:w-fit h-auto grid grid-cols-2 lg:flex lg:gap-1">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn(
                "rounded-xl px-4 py-2.5 lg:px-8 lg:py-3 transition-all duration-300 cursor-pointer",
                "data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:scale-[1.02]",
                "flex items-center justify-center gap-2 font-outfit font-bold text-sm lg:text-base"
              )}
            >
              <tab.icon className="h-4 w-4 lg:h-5 lg:w-5" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
