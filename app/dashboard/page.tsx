"use client";

import React, { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ActivityTable } from "@/components/dashboard/activity-table";
import { MessengerSection } from "@/components/dashboard/messenger-section";
import { SmartCareSection } from "@/components/dashboard/smart-care-section";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [messengerUnreadCount, setMessengerUnreadCount] = useState(0);

  return (
    <div className="flex flex-1 flex-col pb-12 min-h-screen relative overflow-hidden bg-transparent">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/2 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/2 rounded-full blur-[120px] translate-y-1/2 pointer-events-none" />

      <div className="relative z-10 w-full border-b border-black/5">
        <div className="responsive-container">
          <DashboardHeader />
        </div>
      </div>

      <main className="flex flex-1 flex-col responsive-container w-full">
        {/* Welcome Section */}
        <div className="px-6 py-6 lg:px-0 lg:py-14 animate-fade-up">
          <h1 className="font-bricolage text-3xl font-extrabold tracking-tighter lg:text-6xl flex items-center gap-3">
             <span className="text-black/30">Welcome back,</span> Sarah.
             <span className="p-2 bg-primary/10 rounded-full animate-bounce h-10 w-10 flex items-center justify-center text-sm leading-none grow-0 shrink-0">👋</span>
          </h1>
          <p className="mt-3 text-sm font-medium text-black/40 lg:text-xl max-w-2xl leading-relaxed">
            Here's what's happening with your <span className="text-black font-bold underline decoration-primary/40 underline-offset-4 cursor-help">health profile</span> today.
          </p>
        </div>

        {/* Dashboard Navigation */}
        <div className="lg:px-0">
          <DashboardTabs
            value={activeTab}
            onValueChange={setActiveTab}
            notificationCount={unreadNotifications}
            messengerCount={messengerUnreadCount}
          />
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "overview" ? (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mt-6 flex flex-col gap-10">
                <StatsCards />
                <ActivityTable />
              </div>
            </motion.div>
          ) : activeTab === "messenger" ? (
            <motion.div
              key="messenger"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mt-6 mb-12">
                <MessengerSection onNotificationSync={setMessengerUnreadCount} />
              </div>
            </motion.div>
          ) : activeTab === "smart-care" ? (
            <motion.div
              key="smart-care"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mt-6">
                <SmartCareSection />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-40 text-black/10 font-black uppercase tracking-[0.4em] gap-6"
            >
              <div className="w-20 h-20 rounded-full border-4 border-dashed border-black/5 animate-spin duration-[10s]" />
              Notifications Content Coming Soon
            </motion.div>
          )}
        </AnimatePresence>
      </main>

    </div>
  );
}
