"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, Building2, Activity } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  delay?: number;
}

function StatCard({ title, value, subtitle, icon: Icon, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="group relative overflow-hidden rounded-3xl border border-black/5 bg-white p-6 shadow-sm shadow-black/5 transition-all hover:shadow-xl hover:shadow-primary/5 hover:border-primary/10"
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5 transition-transform group-hover:scale-150 group-hover:bg-primary/10" />
      
      <div className="relative flex flex-col gap-3 md:gap-4">
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-2xl bg-primary transition-all shadow-lg shadow-primary/20 group-hover:scale-110">
            <Icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
          </div>
          <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-black/30 group-hover:text-primary/50 transition-colors">
            {title}
          </span>
        </div>
        
        <div className="flex flex-col">
          <span className="font-outfit text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tighter">
            {value}
          </span>
          <span className="font-outfit text-xs md:text-sm font-bold text-black/50 lg:text-base">
            {subtitle}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 px-6 lg:px-0">
      <StatCard
        title="Invitations"
        value="2"
        subtitle="Doctors Invited"
        icon={Users}
        delay={0.1}
      />
      <StatCard
        title="Check-ins"
        value="4"
        subtitle="Hospitals Visited"
        icon={Building2}
        delay={0.2}
      />
      <StatCard
        title="Health Score"
        value="98%"
        subtitle="Smart Care Status"
        icon={Activity}
        delay={0.3}
      />
    </div>
  );
}

