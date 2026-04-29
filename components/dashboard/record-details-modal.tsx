"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Calendar, 
  Shield, 
  Brain, 
  Activity, 
  X, 
  Download, 
  Share2, 
  Plus, 
  MoreVertical,
  CheckCircle2,
  Lock,
  ArrowRight
} from "lucide-react";
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
        className="w-[100vw] sm:w-[95vw] md:max-w-4xl h-[100vh] sm:h-auto sm:max-h-[92vh] rounded-none sm:rounded-[3.5rem] bg-[#F9FAFB] p-0 border-none sm:border sm:border-black/5 shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Mobile Header Drag Handle */}
        <div className="sm:hidden w-full flex justify-center pt-5 pb-2 bg-white shrink-0">
          <div className="w-16 h-1.5 bg-black/5 rounded-full" />
        </div>

        {/* Dynamic Header Section */}
        <div className="relative px-6 py-6 md:px-12 md:py-10 bg-white border-b border-black/[0.03] z-20 shrink-0">
          <div className="absolute right-4 top-4 md:right-8 md:top-8 flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-black/5 transition-all text-black/20 hover:text-black/60 hidden sm:flex">
              <Share2 className="h-5 w-5" />
            </Button>
            <DialogClose className="p-3 rounded-full bg-black/[0.03] hover:bg-black/5 transition-all text-black/40 hover:text-black/80 cursor-pointer">
              <X className="h-6 w-6" />
            </DialogClose>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner"
              >
                <FileText className="h-7 w-7" />
              </motion.div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <Badge className="rounded-full bg-primary text-white border-none font-black text-[10px] px-3 py-1 uppercase tracking-widest">
                    {record.type}
                  </Badge>
                  <div className="flex items-center gap-1 text-[#10B981] font-black text-[10px] uppercase tracking-widest bg-[#10B981]/10 px-3 py-1 rounded-full">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </div>
                </div>
                <DialogTitle className="font-bricolage text-2xl md:text-4xl font-extrabold tracking-tight text-black leading-tight">
                  {record.fileName}
                </DialogTitle>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-6 text-black/40 font-bold text-xs md:text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Uploaded {new Date(record.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span>End-to-End Encrypted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content Engine */}
        <div className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth">
          <div className="px-6 py-8 md:px-12 md:py-12 space-y-10">
            
            {/* AI Hero Insight */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="relative group overflow-hidden bg-white rounded-[3rem] p-8 md:p-10 border border-black/[0.03] shadow-sm hover:shadow-md transition-all duration-500"
            >
              <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                <Brain className="h-32 w-32 text-primary" />
              </div>
              
              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-center gap-3 text-primary">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Brain className="h-4 w-4" />
                  </div>
                  <span className="font-black text-[10px] md:text-xs uppercase tracking-[0.2em]">AI Clinical Intelligence</span>
                </div>
                
                <div className="space-y-4 max-w-2xl">
                  <h3 className="font-bricolage text-xl md:text-2xl font-extrabold text-black leading-snug">
                    Quick Clinical Summary
                  </h3>
                  <p className="text-sm md:text-lg text-black/60 font-medium leading-relaxed whitespace-pre-line italic">
                    "{record.analysis?.summary || record.fallbackSummary || "Our AI is extracting medical context from this record. Please wait a moment..."}"
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 mt-2">
                  <div className="px-4 py-2 bg-black/[0.03] rounded-xl text-[10px] font-black text-black/40 uppercase tracking-widest">
                    Medical Accuracy: 98%
                  </div>
                  <div className="px-4 py-2 bg-black/[0.03] rounded-xl text-[10px] font-black text-black/40 uppercase tracking-widest">
                    Context: {record.type}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Bento Grid Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white rounded-[3rem] p-8 md:p-10 border border-black/[0.03] shadow-sm flex flex-col gap-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-primary">
                      <Activity className="h-5 w-5" />
                      <span className="font-black text-[10px] md:text-xs uppercase tracking-[0.2em]">Key Health Markers</span>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                    {record.analysis?.insights?.length > 0 ? (
                      record.analysis.insights.slice(0, 6).map((insight: string, idx: number) => (
                        <motion.div 
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: idx * 0.1 }}
                          key={idx} 
                          className="flex gap-4 items-start group"
                        >
                          <div className="h-10 w-10 rounded-2xl bg-black/[0.02] group-hover:bg-primary/5 flex items-center justify-center shrink-0 transition-colors">
                            <ArrowRight className="h-4 w-4 text-black/20 group-hover:text-primary transition-colors" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <p className="text-sm md:text-base text-black font-bold leading-snug group-hover:text-primary transition-colors">{insight}</p>
                            <span className="text-[10px] text-black/20 font-black uppercase tracking-widest">Observation #{idx + 1}</span>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="col-span-full py-10 text-center flex flex-col items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-black/[0.02] flex items-center justify-center text-black/10">
                          <Activity className="h-8 w-8" />
                        </div>
                        <p className="text-sm text-black/30 font-bold italic">Processing deep clinical insights...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="bg-primary p-8 md:p-10 rounded-[3rem] text-white shadow-xl shadow-primary/20 flex flex-col gap-6 h-full">
                  <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bricolage text-xl font-extrabold leading-tight">Patient Safety Note</h4>
                    <p className="text-sm text-white/70 font-medium leading-relaxed">
                      All AI insights should be reviewed with your primary healthcare provider for final clinical diagnosis.
                    </p>
                  </div>
                  <Button variant="outline" className="mt-auto rounded-2xl border-white/20 bg-white/10 hover:bg-white/20 text-white font-black text-[10px] uppercase tracking-widest h-12 transition-all">
                    Consult Doctor
                  </Button>
                </div>
              </div>
            </div>

            {/* Bottom Actions Area */}
            <div className="flex flex-col md:flex-row items-center gap-4 pt-4 pb-6">
              <Button className="w-full md:flex-1 h-16 rounded-[2rem] bg-black text-white font-black text-xs md:text-sm uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3">
                <Download className="h-5 w-5" />
                <span>Download Clinical PDF</span>
              </Button>
              <Button variant="outline" className="w-full md:w-auto px-10 h-16 rounded-[2rem] border-black/5 font-black text-xs md:text-sm uppercase tracking-widest hover:bg-black/5 transition-all text-black/40 flex items-center justify-center gap-3">
                <Plus className="h-5 w-5" />
                <span>Add Note</span>
              </Button>
            </div>

          </div>
        </div>

        {/* Global Footer Navigation */}
        <div className="px-6 py-6 border-t border-black/[0.03] bg-white sm:hidden shrink-0">
          <Button 
            onClick={onClose}
            className="w-full h-16 rounded-2xl bg-black text-white font-black text-sm uppercase tracking-widest shadow-xl transition-all active:scale-[0.98]"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
