"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, FileText, Send, CheckCircle2, ShieldCheck, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";

export default function DoctorDashboardPage({ params }: { params: Promise<{ inviteId: string }> }) {
  const { inviteId } = React.use(params);
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [patientData, setPatientData] = useState<any>(null); // Normally fetched from backend
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // In a real app, we'd verify the `inviteId` from localStorage here
    // const storedInvite = localStorage.getItem("takecare_doctor_invite");
    // if (storedInvite !== inviteId) { router.push("/doctor/verify"); }

    // Mock patient data for UI
    setPatientData({
      name: "John Doe",
      age: 42,
      gender: "Male",
      lastVisit: "2023-10-15",
      primaryConcern: "Routine Checkup / Vitals Tracking"
    });
  }, [inviteId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/doctor/submit-record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          inviteId: inviteId, 
          note: note 
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit record");
      }

      setIsSuccess(true);
      setNote("");
    } catch (error) {
      console.error(error);
      alert("Failed to submit record. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-black/2">
      {/* Top Navigation */}
      <header className="bg-white border-b border-black/5 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <ShieldCheck className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bricolage font-black text-xl leading-none">TakeCare AI</h1>
              <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mt-1">Doctor Portal</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="text-black/60 font-bold hover:bg-black/5 rounded-xl"
            onClick={() => {
              localStorage.removeItem("takecare_doctor_invite");
              router.push("/");
            }}
          >
            Sign Out
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 grid lg:grid-cols-[1fr_2fr] gap-8">
        
        {/* Patient Context Sidebar */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-4xl p-8 shadow-xl shadow-black/5 border border-black/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-16 -mt-16" />
            
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-black/40 mb-6">Patient Context</h2>
            
            {patientData ? (
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center">
                    <User className="w-8 h-8 text-black/40" />
                  </div>
                  <div>
                    <h3 className="font-bricolage text-2xl font-black">{patientData.name}</h3>
                    <p className="text-sm font-medium text-black/60">{patientData.age} yrs • {patientData.gender}</p>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-black/5">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-black/40">Primary Concern</p>
                    <p className="font-semibold text-black/80">{patientData.primaryConcern}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-black/40">Patient ID Reference</p>
                    <p className="font-mono text-xs text-black/60 bg-black/5 px-2 py-1 rounded inline-block mt-1">
                      {inviteId.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-pulse flex flex-col gap-4">
                <div className="h-16 w-16 bg-black/10 rounded-full" />
                <div className="h-6 w-3/4 bg-black/10 rounded-full" />
                <div className="h-4 w-1/2 bg-black/10 rounded-full" />
              </div>
            )}
          </div>

          <div className="bg-[#4f46e5]/10 rounded-4xl p-6 border border-[#4f46e5]/20">
            <h3 className="font-bold text-[#4f46e5] flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4" /> Secure Transmission
            </h3>
            <p className="text-xs text-[#4f46e5]/80 font-medium">
              Data submitted here is encrypted and added directly to the patient's TakeCare AI Digital Twin.
            </p>
          </div>
        </div>

        {/* Action Area */}
        <div className="bg-white rounded-4xl p-8 lg:p-10 shadow-2xl border border-black/5">
          <h2 className="text-2xl font-bricolage font-black mb-2">Clinical Assessment</h2>
          <p className="text-sm font-medium text-black/50 mb-8">
            Add diagnostic notes, prescriptions, or upload medical records for {patientData?.name || "the patient"}.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-black/40 pl-1">
                Clinical Notes
              </Label>
              <Textarea 
                required
                value={note}
                onChange={(e: any) => setNote(e.target.value)}
                placeholder="Patient presents with normal vitals. Recommend continued monitoring..."
                className="min-h-[200px] resize-none rounded-2xl bg-black/5 border-none p-6 font-medium focus-visible:ring-2 focus-visible:ring-black placeholder:text-black/30"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-black/40 pl-1">
                Attach Medical Documents (Optional)
              </Label>
              <div className="border-2 border-dashed border-black/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:bg-black/5 transition-colors cursor-pointer group">
                <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileUp className="w-6 h-6 text-black/40" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm">Click to upload or drag and drop</p>
                  <p className="text-xs text-black/40 mt-1">PDF, JPG, PNG (max 10MB)</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-black/5 flex justify-end">
              <Button 
                type="submit" 
                disabled={isSubmitting || !note.trim()}
                className="h-14 px-8 bg-black hover:bg-black/80 text-white rounded-2xl font-bold text-base transition-all shadow-xl shadow-black/10 disabled:opacity-70 flex items-center gap-2"
              >
                {isSubmitting ? "Transmitting..." : (
                  <>
                    <Send className="w-5 h-5" /> Submit to Patient Record
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-xl px-6"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              className="flex flex-col items-center justify-center gap-6 rounded-4xl bg-white p-10 lg:p-14 shadow-2xl border border-black/5 w-full max-w-md text-center relative overflow-hidden"
            >
              <CheckCircle2 className="h-16 w-16 text-[#25D366]" />
              <div className="space-y-2">
                <h3 className="font-bricolage text-2xl font-extrabold text-black">Record Secured</h3>
                <p className="text-sm font-medium text-black/50">
                  Your clinical notes have been encrypted and added directly to the patient's Digital Health Twin.
                </p>
              </div>
              <Button 
                onClick={() => setIsSuccess(false)}
                className="w-full h-12 mt-4 rounded-xl bg-black text-white font-bold"
              >
                Add Another Note
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
