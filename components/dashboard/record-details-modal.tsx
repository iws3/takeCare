"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, Building2, User, X, Shield, Brain, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface RecordDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: any;
}

export function RecordDetailsModal({
  isOpen,
  onClose,
  record
}: RecordDetailsModalProps) {
  if (!record) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        showCloseButton={false}
        className="w-[95vw] sm:max-w-2xl rounded-[2.5rem] bg-white p-0 border border-black/5 shadow-2xl overflow-hidden"
      >
        {/* Mobile Header with Drag Handle Look */}
        <div className="md:hidden w-full flex justify-center pt-4 pb-2">
          <div className="w-12 h-1.5 bg-black/5 rounded-full" />
        </div>

        <div className="relative px-8 pt-6 pb-10 md:p-12">
          <DialogClose className="absolute right-8 top-8 md:right-12 md:top-12 p-2 rounded-full hover:bg-black/5 transition-all text-black/20 hover:text-black/60 z-50">
            <X className="h-6 w-6" />
          </DialogClose>

          <div className="flex flex-col gap-8">
            {/* Header Section */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <FileText className="h-6 w-6" />
                </div>
                <Badge variant="outline" className="rounded-full bg-black/5 text-black border-transparent font-black text-[10px] px-4 py-1 uppercase tracking-widest">
                  {record.type}
                </Badge>
              </div>
              
              <DialogTitle className="font-bricolage text-3xl md:text-4xl font-extrabold tracking-tight text-black leading-tight">
                {record.fileName}
              </DialogTitle>
              
              <div className="flex flex-wrap items-center gap-6 text-black/40 font-bold text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(record.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Verified Record
                </div>
              </div>
            </div>

            {/* Analysis Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-black/[0.02] p-8 rounded-[2rem] border border-black/5 flex flex-col gap-4">
                <div className="flex items-center gap-3 text-primary">
                  <Brain className="h-5 w-5" />
                  <span className="font-black text-xs uppercase tracking-widest">AI Clinical Summary</span>
                </div>
                <p className="text-sm md:text-base text-black/70 font-medium leading-relaxed">
                  {record.analysis?.summary || record.fallbackSummary || "Clinical context is being processed by the AI health engine..."}
                </p>
              </div>

              <div className="bg-primary/[0.03] p-8 rounded-[2rem] border border-primary/5 flex flex-col gap-4">
                <div className="flex items-center gap-3 text-primary">
                  <Activity className="h-5 w-5" />
                  <span className="font-black text-xs uppercase tracking-widest">Key Insights</span>
                </div>
                <div className="space-y-3">
                   {record.analysis?.insights?.slice(0, 3).map((insight: string, idx: number) => (
                     <div key={idx} className="flex gap-3 items-start">
                       <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                       <p className="text-xs md:text-sm text-black/60 font-bold">{insight}</p>
                     </div>
                   )) || (
                     <p className="text-xs text-black/30 font-bold italic">No specific insights extracted for this record type yet.</p>
                   )}
                </div>
              </div>
            </div>

            {/* Technical Metadata (Optional/Bottom) */}
            <div className="pt-4 flex items-center justify-between border-t border-black/5 mt-4">
               <div className="flex flex-col gap-1">
                 <p className="text-[10px] font-black text-black/20 uppercase tracking-widest">Record UUID</p>
                 <p className="text-[10px] font-mono text-black/10 truncate max-w-[150px]">{record.id}</p>
               </div>
               <Button variant="outline" className="rounded-2xl border-black/5 h-12 px-8 font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm">
                 Download PDF
               </Button>
            </div>
          </div>
        </div>

        {/* Bottom Action for Mobile */}
        <div className="md:hidden p-6 pt-0">
          <Button 
            onClick={onClose}
            className="w-full h-16 rounded-2xl bg-black text-white font-black text-xs uppercase tracking-widest shadow-xl transition-all"
          >
            Close Details
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
