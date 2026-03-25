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
import { FileText, Calendar, Building2, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActivityTableProps {
  records?: any[];
}

export function ActivityTable({ records = [] }: ActivityTableProps) {
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
        <Button variant="outline" className="rounded-2xl border-black/5 bg-black/5 font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all px-8 h-12 shadow-sm">
          {hasRecords ? "View Full Timeline" : "No Records Available"}
        </Button>
      </div>

      <div className="overflow-x-auto">
        {!hasRecords ? (
          <div className="flex flex-col items-center justify-center py-20 bg-black/[0.01]">
            <div className="h-16 w-16 rounded-3xl bg-black/5 flex items-center justify-center mb-4">
               <Calendar className="h-8 w-8 text-black/10" />
            </div>
            <p className="text-sm font-bold text-black/20 uppercase tracking-[0.2em]">Awaiting clinical verification</p>
            <p className="text-xs text-black/10 mt-2 font-medium">Capture your first record in the Smart Care tab to populate this list.</p>
          </div>
        ) : (
          <Table className="w-full min-w-[700px] sm:min-w-0">
            <TableHeader className="bg-black/3">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="py-5 pl-10 font-black text-black/40 uppercase tracking-[0.2em] text-[10px]">Date</TableHead>
                <TableHead className="py-5 font-black text-black/40 uppercase tracking-[0.2em] text-[10px]">Source Record</TableHead>
                <TableHead className="py-5 font-black text-black/40 uppercase tracking-[0.2em] text-[10px] hidden md:table-cell">Type</TableHead>
                <TableHead className="py-5 font-black text-black/40 uppercase tracking-[0.2em] text-[10px]">Clinical Summary</TableHead>
                <TableHead className="py-5 pr-10 font-black text-black/40 uppercase tracking-[0.2em] text-[10px] text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record, idx) => (
                <TableRow key={record.id || idx} className="group hover:bg-black/2 border-black/5 transition-all duration-300">
                  <TableCell className="py-6 pl-10 font-bold text-sm">
                    {new Date(record.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </TableCell>
                  <TableCell className="py-6 font-black text-sm lg:text-base text-primary/80 group-hover:text-primary transition-colors">
                    {record.fileName}
                  </TableCell>
                  <TableCell className="py-6 font-medium text-black/40 text-sm hidden md:table-cell italic">{record.type}</TableCell>
                  <TableCell className="py-6">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-black text-sm max-w-[200px] truncate">{record.analysis?.summary || "Analyzing context..."}</span>
                      <Badge variant="outline" className="rounded-full bg-black/5 text-black border-transparent font-black text-[9px] px-3 py-0.5 whitespace-nowrap">
                        {record.analysis ? "Verified" : "Pending"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="py-6 pr-10 text-right">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl bg-black shadow-lg text-white opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                      <FileText className="h-5 w-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </motion.div>
  );
}
