"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, Search, Settings } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="flex items-center justify-between px-6 py-4 lg:px-12 lg:py-8 animate-slide-right">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black shadow-2xl lg:h-12 lg:w-12">
          <span className="font-syne text-xl font-extrabold text-white lg:text-2xl">T</span>
        </div>
        <div className="flex flex-col">
          <span className="font-outfit text-lg font-bold tracking-tight lg:text-xl leading-none">TakeCare</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40 lg:text-[10px]">Dashboard</span>
        </div>
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        <div className="hidden items-center gap-2 rounded-full bg-black/5 px-4 py-2 lg:flex">
          <Search className="h-4 w-4 text-black/40" />
          <input 
            type="text" 
            placeholder="Search health records..." 
            className="bg-transparent text-sm font-medium outline-none placeholder:text-black/20"
          />
        </div>
        
        <div className="flex items-center gap-2 lg:gap-3">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-black/5 h-10 w-10">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-black/5 h-10 w-10">
            <Settings className="h-5 w-5" />
          </Button>
          
          <div className="h-8 w-px bg-black/5 mx-2" />
          
          <div className="flex items-center gap-3">
            <div className="hidden flex-col items-end lg:flex">
              <span className="text-sm font-bold leading-none">Sarah Jenkins</span>
              <span className="text-[10px] font-bold text-black/40 uppercase tracking-wider mt-1">Patient ID #8291</span>
            </div>
            <Avatar className="h-10 w-10 border-2 border-white shadow-lg lg:h-12 lg:w-12">
              <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop" />
              <AvatarFallback className="bg-primary text-white font-bold">SJ</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}
