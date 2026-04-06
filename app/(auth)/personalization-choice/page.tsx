"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { UserCircle, ShieldAlert, ArrowRight, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PersonalizationChoicePage() {
  const router = useRouter();

  const handleChoice = (isAnonymous: boolean) => {
    // We could make an API call to save their preference, but for now we just route.
    if (isAnonymous) {
      router.push("/dashboard"); // Skip personalization
    } else {
      router.push("/personalization-onboarding"); // Route to actual personalization flow
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Dynamic Animated Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[150px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/10 blur-[150px] animate-pulse delay-700" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-2xl w-full space-y-8 bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200/50 z-10"
      >
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
            className="w-20 h-20 bg-black rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-black/10"
          >
            <Activity className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Tailor Your Experience
          </h2>
          <p className="text-lg text-slate-600 max-w-md mx-auto">
            Welcome to TakeCare. You have the power to choose how your health data is handled. Provide details for a curated experience, or stay anonymous.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-10">
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group cursor-pointer"
            onClick={() => handleChoice(false)}
          >
            <div className="h-full bg-white border border-slate-200 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 p-6 rounded-3xl transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <UserCircle className="w-24 h-24 text-blue-600" />
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 ring-4 ring-white shadow-sm">
                <UserCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Personalized</h3>
              <p className="text-sm text-slate-500 font-medium mb-6">
                Unlock AI-driven health insights curated specifically for your profile, allergies, and goals. Recommended.
              </p>
              <div className="flex items-center text-blue-600 font-semibold mt-auto group-hover:text-blue-700">
                Setup Profile <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group cursor-pointer"
            onClick={() => handleChoice(true)}
          >
            <div className="h-full bg-white border border-slate-200 hover:border-slate-400 p-6 rounded-3xl transition-all relative overflow-hidden hover:shadow-lg hover:shadow-slate-200/50">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <ShieldAlert className="w-24 h-24 text-slate-600" />
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 ring-4 ring-white shadow-sm">
                <ShieldAlert className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Anonymous</h3>
              <p className="text-sm text-slate-500 font-medium mb-6">
                Skip the health setup. We won't ask for any personalization details. You can always change this later.
              </p>
              <div className="flex items-center text-slate-600 font-semibold mt-auto group-hover:text-slate-800">
                Skip for now <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
