"use client";

import React, { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ActivityTable } from "@/components/dashboard/activity-table";
import { MessengerSection } from "@/components/dashboard/messenger-section";
import { SmartCareSection } from "@/components/dashboard/smart-care-section";
import { motion, AnimatePresence } from "framer-motion";
import { hasPersonalized, getMedicalHistory } from "@/app/actions/medical";
import { useRouter } from "next/navigation";

import { Heart, Activity, Pill, ShieldCheck, Loader2 } from "lucide-react";

function DashboardLoading() {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-vital-orange/5 rounded-full blur-[100px] animate-pulse delay-700 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center gap-12">
        {/* Animated Icon Cluster */}
        <div className="relative h-40 w-40 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="absolute inset-0 bg-primary/10 rounded-full blur-2xl"
          />
          
          <motion.div
            animate={{ 
              rotate: 360,
              borderRadius: ["40%", "50%", "40%"]
            }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            className="absolute inset-0 border-2 border-dashed border-primary/20"
          />

          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="relative z-20 h-24 w-24 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center border border-primary/10"
          >
            <Heart className="h-10 w-10 text-primary fill-primary/10" />
          </motion.div>

          {/* Floating Orbiting Icons */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
            className="absolute inset-0"
          >
            <motion.div className="absolute -top-4 left-1/2 -translate-x-1/2 h-10 w-10 bg-white rounded-xl shadow-lg border border-black/5 flex items-center justify-center">
              <Pill className="h-5 w-5 text-vital-orange" />
            </motion.div>
            <motion.div className="absolute top-1/2 -right-4 -translate-y-1/2 h-10 w-10 bg-white rounded-xl shadow-lg border border-black/5 flex items-center justify-center">
              <Activity className="h-5 w-5 text-blue-500" />
            </motion.div>
            <motion.div className="absolute bottom-1/2 -left-4 translate-y-1/2 h-10 w-10 bg-white rounded-xl shadow-lg border border-black/5 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-green-500" />
            </motion.div>
          </motion.div>
        </div>

        {/* Text Section */}
        <div className="text-center space-y-4">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-bricolage text-3xl font-black tracking-tight text-black"
          >
            Synchronizing <span className="text-primary italic">Health Hub</span>
          </motion.h2>
          
          <div className="flex flex-col items-center gap-2">
            <div className="w-64 h-1.5 bg-black/5 rounded-full overflow-hidden relative">
              <motion.div
                initial={{ left: "-100%" }}
                animate={{ left: "100%" }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="absolute top-0 bottom-0 w-1/2 bg-linear-to-r from-transparent via-primary to-transparent"
              />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              Secure Clinical Data Sync
            </p>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex gap-3">
          {["Vitals", "Lab Records", "Medications"].map((status, i) => (
            <motion.div
              key={status}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.2 }}
              className="px-4 py-1.5 rounded-full bg-black/5 border border-black/5 text-[9px] font-bold uppercase tracking-widest text-black/40"
            >
              {status}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-12 inset-x-0 flex flex-col items-center gap-2 opacity-20">
         <p className="text-[10px] font-bold tracking-widest uppercase">HIPAA Compliant & End-to-End Encrypted</p>
         <div className="flex gap-4">
            <div className="h-1 w-8 bg-black rounded-full" />
            <div className="h-1 w-8 bg-black rounded-full" />
            <div className="h-1 w-8 bg-black rounded-full" />
         </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [messengerUnreadCount, setMessengerUnreadCount] = useState(0);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const clerkId = "demo-user-123"; // Using mock ID

  useEffect(() => {
    async function initDashboard() {
      try {
        const personalized = await hasPersonalized(clerkId);
        if (!personalized && clerkId !== "demo-user-123") {
           // router.push("/onboarding/personalize");
           // For demo, we'll just load the record
        }
        
        const data = await getMedicalHistory(clerkId);
        setUserData(data);
      } catch (e) {
        console.error(e);
      } finally {
        setTimeout(() => setLoading(false), 2000); // Artificial delay to enjoy the animation
      }
    }
    initDashboard();
  }, [router]);

  if (loading) return <DashboardLoading />;

  return (
    <div className="flex flex-1 flex-col pb-12 min-h-screen relative overflow-hidden bg-transparent">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/2 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/2 rounded-full blur-[120px] translate-y-1/2 pointer-events-none" />

      <div className="relative z-10 w-full border-b border-black/5">
        <div className="responsive-container">
          <DashboardHeader user={userData} />
        </div>
      </div>


      <main className="flex flex-1 flex-col responsive-container w-full">
        {/* Welcome Section */}
        <div className="px-6 py-6 lg:px-0 lg:py-14 animate-fade-up">
          <h1 className="font-bricolage text-3xl font-extrabold tracking-tighter lg:text-6xl flex items-center gap-3">
             <span className="text-black/30">Welcome back,</span> {userData?.name?.split(' ')[0] || "Patient"}.
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
