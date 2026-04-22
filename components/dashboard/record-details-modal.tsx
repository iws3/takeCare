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
        className="w-[95vw] sm:max-w-3xl rounded-[3rem] bg-white p-0 border border-black/5 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Mobile Header with Drag Handle Look */}
        <div className="md:hidden w-full flex justify-center pt-4 pb-1 bg-white shrink-0">
          <div className="w-12 h-1.5 bg-black/5 rounded-full" />
        </div>

        {/* Header Section (Fixed) */}
        <div className="relative px-8 pt-6 pb-6 md:px-12 md:pt-10 md:pb-8 border-b border-black/5 bg-white z-10 shrink-0">
          <DialogClose className="absolute right-6 top-6 md:right-10 md:top-10 p-2 rounded-full hover:bg-black/5 transition-all text-black/20 hover:text-black/60 z-50">
            <X className="h-6 w-6" />
          </DialogClose>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <Badge variant="outline" className="rounded-full bg-black/5 text-black border-transparent font-black text-[9px] px-3 py-0.5 uppercase tracking-widest">
                {record.type}
              </Badge>
            </div>
            
            <DialogTitle className="font-bricolage text-2xl md:text-3xl font-extrabold tracking-tight text-black leading-tight max-w-[85%]">
              {record.fileName}
            </DialogTitle>
            
            <div className="flex flex-wrap items-center gap-5 text-black/30 font-bold text-xs">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(record.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </div>
              <div className="flex items-center gap-1.5 text-primary/40">
                <Shield className="h-3.5 w-3.5" />
                Verified Record
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/[0.01]">
          <div className="px-8 py-10 md:px-12 md:py-12">
            <div className="flex flex-col gap-8">
              {/* Analysis Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm flex flex-col gap-5">
                  <div className="flex items-center gap-3 text-primary">
                    <Brain className="h-5 w-5" />
                    <span className="font-black text-xs uppercase tracking-widest">Clinical Analysis</span>
                  </div>
                  <div className="space-y-4">
                    <p className="text-sm md:text-base text-black/70 font-medium leading-relaxed whitespace-pre-line">
                      {record.analysis?.summary || record.fallbackSummary || "Clinical context is being processed by the AI health engine..."}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm flex flex-col gap-5">
                    <div className="flex items-center gap-3 text-primary">
                      <Activity className="h-5 w-5" />
                      <span className="font-black text-xs uppercase tracking-widest">Key Insights</span>
                    </div>
                    <div className="space-y-4">
                       {record.analysis?.insights?.length > 0 ? (
                         record.analysis.insights.slice(0, 5).map((insight: string, idx: number) => (
                           <div key={idx} className="flex gap-4 items-start group">
                             <div className="h-2 w-2 rounded-full bg-primary/20 mt-1.5 shrink-0 group-hover:bg-primary transition-colors" />
                             <p className="text-xs md:text-sm text-black/60 font-bold leading-relaxed">{insight}</p>
                           </div>
                         ))
                       ) : (
                         <p className="text-xs text-black/30 font-bold italic">No specific insights extracted for this record type yet.</p>
                       )}
                    </div>
                  </div>

                  <div className="bg-primary/5 p-8 rounded-[2.5rem] border border-primary/10 flex flex-col gap-2">
                    <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Health Tip</p>
                    <p className="text-xs font-bold text-primary/70 leading-relaxed">
                      Regularly updating your clinical records helps our AI provide more accurate health trends.
                    </p>
                  </div>
                </div>
              </div>

              {/* Technical Details Area */}
              <div className="bg-black/5 p-8 rounded-[2.5rem] border border-black/5 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-col gap-2 items-center md:items-start text-center md:text-left">
                  <p className="text-[10px] font-black text-black/20 uppercase tracking-widest">Security Protocol</p>
                  <p className="text-[10px] font-mono text-black/30 break-all max-w-[250px]">
                    Encrypted Record: {record.id}
                  </p>
                </div>
                <Button className="w-full md:w-auto rounded-2xl bg-black text-white h-14 px-10 font-black text-xs uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-black/10">
                  Download Full PDF
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Area (Fixed for Mobile) */}
        <div className="md:hidden p-6 border-t border-black/5 bg-white shrink-0">
          <Button 
            onClick={onClose}
            className="w-full h-16 rounded-2xl bg-black/5 text-black font-black text-xs uppercase tracking-widest transition-all"
          >
            Close Details
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
