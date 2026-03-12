import React from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ActivityTable } from "@/components/dashboard/activity-table";
import { motion } from "framer-motion";

export default function DashboardPage() {
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
        <DashboardTabs />

        {/* Stats Grid */}
        <div className="mt-4">
          <StatsCards />
        </div>

        {/* Recent Activity Table */}
        <div className="mt-8">
          <ActivityTable />
        </div>
      </main>
    </div>
  );
}
