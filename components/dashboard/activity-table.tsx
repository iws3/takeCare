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
import { FileText, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

const ACTIVITIES = [
  {
    date: "Mars 12, 2026",
    doctor: "Dr. Elena Smith",
    hospital: "City Heart Center",
    details: "Cardiology Consultation",
    status: "Completed",
  },
  {
    date: "Mars 10, 2026",
    doctor: "Dr. Marcus Johnson",
    hospital: "General Med Clinic",
    details: "Routine Full Checkup",
    status: "Reviewed",
  },
  {
    date: "Mars 08, 2026",
    doctor: "Sarah Mitchell",
    hospital: "St. Marys Hospital",
    details: "Blood Test Analysis",
    status: "Pending",
  },
  {
    date: "Mars 05, 2026",
    doctor: "Dr. Robert Chen",
    hospital: "Orthopedic Specialists",
    details: "Physical Therapy Plan",
    status: "Active",
  },
];

export function ActivityTable() {
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
          <p className="text-xs font-medium text-black/30 lg:text-sm">Your recent medical visits & record updates</p>
        </div>
        <Button variant="outline" className="rounded-2xl border-black/5 bg-black/5 font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all px-8 h-12 shadow-sm">
          View Full Timeline
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table className="w-full min-w-[700px] sm:min-w-0">
          <TableHeader className="bg-black/3">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="py-5 pl-10 font-black text-black/40 uppercase tracking-[0.2em] text-[10px]">Date</TableHead>
              <TableHead className="py-5 font-black text-black/40 uppercase tracking-[0.2em] text-[10px]">Medical Professional</TableHead>
              <TableHead className="py-5 font-black text-black/40 uppercase tracking-[0.2em] text-[10px] hidden md:table-cell">Facility</TableHead>
              <TableHead className="py-5 font-black text-black/40 uppercase tracking-[0.2em] text-[10px]">Consultation Details</TableHead>
              <TableHead className="py-5 pr-10 font-black text-black/40 uppercase tracking-[0.2em] text-[10px] text-right">Records</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ACTIVITIES.map((activity, idx) => (
              <TableRow key={idx} className="group hover:bg-black/2 border-black/5 transition-all duration-300">
                <TableCell className="py-6 pl-10 font-bold text-sm">{activity.date}</TableCell>
                <TableCell className="py-6 font-black text-sm lg:text-base text-primary/80 group-hover:text-primary transition-colors">{activity.doctor}</TableCell>
                <TableCell className="py-6 font-medium text-black/40 text-sm hidden md:table-cell italic">{activity.hospital}</TableCell>
                <TableCell className="py-6">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-black text-sm">{activity.details}</span>
                    <Badge variant="outline" className="rounded-full bg-black/5 text-black border-transparent font-black text-[9px] px-3 py-0.5">
                      {activity.status}
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
      </div>
    </motion.div>
  );
}

