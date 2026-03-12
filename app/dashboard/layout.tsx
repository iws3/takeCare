import React from "react";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white font-sans text-black selection:bg-black selection:text-white">
      {/* Background Decorative Elements - Matching Onboarding */}
      <div className="fixed top-0 left-0 h-full w-full pointer-events-none overflow-hidden opacity-30">
        <div className="absolute -top-[10%] -left-[10%] h-[50%] w-[70%] rounded-full bg-blue-100/50 blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] -right-[10%] h-[40%] w-[60%] rounded-full bg-orange-100/50 blur-[100px] animate-pulse [animation-delay:2s]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1440px] flex-col">
        {/* The children will contain the Header and Page content */}
        {children}
      </div>
    </div>
  );
}
