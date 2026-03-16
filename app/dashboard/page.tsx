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

  return (
    <div className="flex flex-1 flex-col pb-12">
      <DashboardHeader />
      
      <main className="flex flex-1 flex-col">
        {/* Welcome Section */}
        <div className="px-6 py-6 lg:px-12 lg:py-10 animate-fade-up">
          <h1 className="font-bricolage text-3xl font-extrabold tracking-tighter lg:text-5xl">
            Welcome back, Sarah.
          </h1>
          <p className="mt-2 text-sm font-medium text-black/50 lg:text-lg">
            Here's what's happening with your health profile today.
          </p>
        </div>

        {/* Dashboard Navigation */}
        <DashboardTabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          notificationCount={unreadNotifications}
        />

        <AnimatePresence mode="wait">
          {activeTab === "overview" ? (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mt-4">
                <StatsCards />
              </div>
              <div className="mt-8">
                <ActivityTable />
              </div>
            </motion.div>
          ) : activeTab === "messenger" ? (
            <motion.div
              key="messenger"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <MessengerSection />
            </motion.div>
          ) : activeTab === "smart-care" ? (
            <motion.div
              key="smart-care"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <SmartCareSection />
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center p-20 text-black/20 font-bold uppercase tracking-widest"
            >
              Notifications Content Coming Soon
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
