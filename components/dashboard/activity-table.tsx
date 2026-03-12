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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="mx-6 mt-8 mb-12 overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm lg:mx-12"
    >
      <div className="flex items-center justify-between border-b border-black/5 bg-black/2 px-6 py-4 lg:px-8">
        <div className="flex flex-col">
          <h3 className="font-outfit text-lg font-bold lg:text-xl">Health Activity</h3>
          <p className="text-xs font-medium text-black/40">Your recent medical visits and records</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-full border-black/10 font-bold hover:bg-black hover:text-white transition-all">
          View All History
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-black/5">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="py-4 font-bold text-black uppercase tracking-wider text-[10px]">Date</TableHead>
              <TableHead className="py-4 font-bold text-black uppercase tracking-wider text-[10px]">Doctor</TableHead>
              <TableHead className="py-4 font-bold text-black uppercase tracking-wider text-[10px]">Hospital</TableHead>
              <TableHead className="py-4 font-bold text-black uppercase tracking-wider text-[10px]">Details</TableHead>
              <TableHead className="py-4 font-bold text-black uppercase tracking-wider text-[10px] text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ACTIVITIES.map((activity, idx) => (
              <TableRow key={idx} className="group hover:bg-black/1 border-black/5 transition-colors">
                <TableCell className="py-5 font-medium text-sm lg:text-base">{activity.date}</TableCell>
                <TableCell className="py-5 font-bold text-sm lg:text-base">{activity.doctor}</TableCell>
                <TableCell className="py-5 font-medium text-black/60 text-sm lg:text-base">{activity.hospital}</TableCell>
                <TableCell className="py-5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-black/80 text-sm lg:text-base">{activity.details}</span>
                    <Badge variant="outline" className="rounded-full bg-primary/5 text-primary border-primary/20 text-[10px] py-0">
                      {activity.status}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="py-5 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <FileText className="h-4 w-4 text-primary" />
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
