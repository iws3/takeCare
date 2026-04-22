"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { FileText, Calendar, Building2, User, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ActivityTableProps {
  records?: any[];
  onDelete?: (e: React.MouseEvent, id: string, type: string) => void;
  onView?: (record: any) => void;
  deletingId?: string | null;
}

export function ActivityTable({ records = [], onDelete, onView, deletingId }: ActivityTableProps) {
  const truncateWords = (text: string, maxWords: number) => {
    if (!text) return "";
    const words = text.split(/\s+/);
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(" ") + "...";
  };

  // If no real records, we can show a placeholder message or empty state
  const hasRecords = records.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mx-6 mt-4 mb-20 overflow-hidden rounded-[2.5rem] border border-black/5 bg-white shadow-medical lg:mx-0 flex flex-col"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-black/5 bg-black/1 px-8 py-7 gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="font-bricolage text-xl font-bold lg:text-3xl tracking-tight">Health History</h3>
          <p className="text-xs font-medium text-black/30 lg:text-sm">Your verified medical visits and clinical record chronology</p>
        </div>
        <Button variant="outline" className="rounded-2xl border-black/5 bg-black/5 font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all px-8 h-12 shadow-sm">
          {hasRecords ? "View Full Timeline" : "No Records Available"}
        </Button>
      </div>

      <div className="overflow-x-auto">
        {!hasRecords ? (
          <div className="flex flex-col items-center justify-center py-20 bg-black/1 px-6 text-center">
            <div className="h-20 w-20 rounded-4xl bg-black/5 flex items-center justify-center mb-6 animate-pulse">
               <Calendar className="h-10 w-10 text-black/10" />
            </div>
            <p className="text-sm font-black text-black/20 uppercase tracking-[0.3em]">Awaiting clinical verification</p>
            <p className="text-xs text-black/10 mt-3 font-bold max-w-xs leading-relaxed">Capture your first record in the Smart Care tab to populate this list.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <Table className="w-full">
                <TableHeader className="bg-black/3">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="py-6 pl-10 font-black text-black/40 uppercase tracking-[0.2em] text-[10px]">Date</TableHead>
                    <TableHead className="py-6 font-black text-black/40 uppercase tracking-[0.2em] text-[10px]">Source Record</TableHead>
                    <TableHead className="py-6 font-black text-black/40 uppercase tracking-[0.2em] text-[10px] hidden lg:table-cell">Type</TableHead>
                    <TableHead className="py-6 font-black text-black/40 uppercase tracking-[0.2em] text-[10px]">Clinical Summary</TableHead>
                    <TableHead className="py-6 pr-10 font-black text-black/40 uppercase tracking-[0.2em] text-[10px] text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record, idx) => (
                    <TableRow key={record.id || idx} className="group hover:bg-black/2 border-black/5 transition-all duration-300">
                      <TableCell className="py-7 pl-10 font-bold text-sm">
                        {new Date(record.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </TableCell>
                      <TableCell className="py-7 font-black text-sm lg:text-base text-primary/80 group-hover:text-primary transition-colors">
                        {record.fileName}
                      </TableCell>
                      <TableCell className="py-7 font-medium text-black/40 text-sm hidden lg:table-cell italic">{record.type}</TableCell>
                      <TableCell className="py-7">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-black text-sm max-w-[300px] leading-snug">
                              {truncateWords(record.analysis?.summary || record.fallbackSummary || "Analyzing context...", 29)}
                            </span>
                            {(record.analysis?.summary || record.fallbackSummary)?.split(/\s+/).length > 29 && (
                              <button 
                                onClick={() => onView?.(record)}
                                className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline text-left"
                              >
                                Read More
                              </button>
                            )}
                          </div>
                          <Badge variant="outline" className="rounded-full bg-black/5 text-black border-transparent font-black text-[9px] px-3 py-0.5 whitespace-nowrap self-start">
                            {record.analysis ? "Verified" : "Pending"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="py-7 pr-10 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Button 
                            onClick={() => onView?.(record)}
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 rounded-2xl bg-primary shadow-lg shadow-primary/20 text-white opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300 cursor-pointer"
                          >
                            <FileText className="h-5 w-5" />
                          </Button>
                          <Button 
                            onClick={(e) => onDelete?.(e, record.id, record.type)}
                            disabled={deletingId === record.id}
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 rounded-2xl bg-red-500 shadow-lg shadow-red-500/20 text-white opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300 delay-75 cursor-pointer"
                          >
                            {deletingId === record.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden flex flex-col divide-y divide-black/5">
              {records.map((record, idx) => (
                <div key={record.id || idx} className="p-6 flex flex-col gap-4 bg-white active:bg-black/2 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-black/30">
                        {new Date(record.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      </span>
                      <h4 className="font-outfit text-lg font-extrabold text-primary leading-tight">{record.fileName}</h4>
                    </div>
                    <Badge variant="outline" className="rounded-full bg-black/5 text-black border-transparent font-black text-[8px] px-2.5 py-0.5">
                      {record.analysis ? "Verified" : "Pending"}
                    </Badge>
                  </div>
                  
                  <div className="bg-black/2 p-4 rounded-2xl border border-black/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-2">Details:</p>
                    <p className="text-sm font-bold text-black leading-relaxed">
                      {truncateWords(record.analysis?.summary || record.fallbackSummary || "Status is pending...", 29)}
                    </p>
                    {(record.analysis?.summary || record.fallbackSummary)?.split(/\s+/).length > 29 && (
                      <button 
                        onClick={() => onView?.(record)}
                        className="text-[10px] font-black text-primary uppercase tracking-widest mt-2 block"
                      >
                        Read More
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-black/20 italic">{record.type}</span>
                    <div className="flex items-center gap-2">
                      <Button 
                        onClick={() => onView?.(record)}
                        variant="outline" 
                        size="sm" 
                        className="h-10 px-6 rounded-xl border-black/5 font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all cursor-pointer"
                      >
                        View Results
                      </Button>
                      <Button 
                        onClick={(e) => onDelete?.(e, record.id, record.type)}
                        disabled={deletingId === record.id}
                        variant="outline" 
                        size="sm" 
                        className="h-10 w-10 p-0 rounded-xl border-red-100 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                      >
                        {deletingId === record.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
