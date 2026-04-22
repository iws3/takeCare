"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, FileText, Send, CheckCircle2, ShieldCheck, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";

import { getDoctorInvitation } from "@/app/actions/medical";

export default function DoctorDashboardPage({ params }: { params: Promise<{ inviteId: string }> }) {
  const { inviteId } = React.use(params);
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [invitation, setInvitation] = useState<any>(null);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await getDoctorInvitation(inviteId);
        if (!data) {
          router.push("/doctor/verify");
          return;
        }
        setInvitation(data);
      } catch (error) {
        console.error("Failed to load patient data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
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

  const patient = invitation?.user;
  const latestAnalysis = patient?.medicalRecords?.[0]?.analysis;

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
            
            {!isLoading && patient ? (
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center overflow-hidden">
                    {patient.avatarUrl ? (
                      <img src={patient.avatarUrl} alt={patient.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-black/40" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bricolage text-2xl font-black">{patient.name || "Anonymous Patient"}</h3>
                    <p className="text-sm font-medium text-black/60">
                      {patient.personalization?.bloodType ? `${patient.personalization.bloodType} • ` : ""}
                      {patient.email}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-black/5">
                  {latestAnalysis && (
                    <div>
                      <p className="text-[10px] font-bold uppercase text-black/40">Latest Health Summary</p>
                      <p className="font-semibold text-black/80 text-sm mt-1 line-clamp-3">
                        {latestAnalysis.summary}
                      </p>
                      <Badge className={cn(
                        "mt-2 text-[9px] font-black uppercase tracking-widest",
                        latestAnalysis.severity === "HIGH" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                        latestAnalysis.severity === "MEDIUM" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                        "bg-green-500/10 text-green-500 border-green-500/20"
                      )}>
                        {latestAnalysis.severity || "LOW"} SEVERITY
                      </Badge>
                    </div>
                  )}
                  
                  {patient.personalization?.allergies?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase text-black/40 mb-2">Allergies</p>
                      <div className="flex flex-wrap gap-1.5">
                        {patient.personalization.allergies.map((allergy: string) => (
                          <span key={allergy} className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-[9px] font-bold uppercase tracking-wider border border-red-100">
                            {allergy}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-[10px] font-bold uppercase text-black/40">Reference ID</p>
                    <p className="font-mono text-[10px] text-black/40 bg-black/5 px-2 py-1 rounded inline-block mt-1">
                      {inviteId.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-pulse flex flex-col gap-4">
                <div className="h-16 w-16 bg-black/10 rounded-full" />
                <div className="h-6 w-3/4 bg-black/10 rounded-full" />
                <div className="h-4 w-1/2 bg-black/10 rounded-full" />
                <div className="h-20 w-full bg-black/5 rounded-2xl mt-4" />
              </div>
            )}
          </div>

          <div className="bg-primary/5 rounded-4xl p-6 border border-primary/10">
            <h3 className="font-bold text-primary flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4" /> HIPAA Compliant
            </h3>
            <p className="text-[11px] text-primary/70 font-medium leading-relaxed">
              Your assessment is securely encrypted. Only the patient and their authorized care team can access this record.
            </p>
          </div>
        </div>

        {/* Action Area */}
        <div className="bg-white rounded-4xl p-8 lg:p-12 shadow-2xl border border-black/5 relative">
          <div className="absolute top-0 right-0 p-8">
             <div className="h-12 w-12 rounded-2xl bg-black/5 flex items-center justify-center">
                <FileText className="h-6 w-6 text-black/20" />
             </div>
          </div>
          
          <h2 className="text-3xl font-bricolage font-black mb-2 tracking-tighter">Clinical Assessment</h2>
          <p className="text-sm font-medium text-black/40 mb-10 max-w-md">
            Provide your expert medical guidance for {patient?.name || "this patient"}. This will be added to their health record immediately.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            <div className="grid gap-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 pl-1 flex items-center justify-between">
                <span>Diagnostic Notes & Advice</span>
                {note.length > 0 && <span className="text-primary">{note.length} characters</span>}
              </Label>
              <Textarea 
                required
                value={note}
                onChange={(e: any) => setNote(e.target.value)}
                placeholder="Ex: Patient shows stable vitals. I recommend increasing hydration and following up in 2 weeks..."
                className="min-h-[300px] resize-none rounded-3xl bg-black/[0.03] border-none p-8 font-medium focus-visible:ring-2 focus-visible:ring-primary placeholder:text-black/20 text-lg transition-all"
              />
            </div>

            <div className="flex flex-col gap-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 pl-1">
                Supplementary Evidence (Optional)
              </Label>
              <div className="border-2 border-dashed border-black/5 rounded-3xl p-10 flex flex-col items-center justify-center gap-4 hover:bg-black/[0.01] transition-all cursor-pointer group">
                <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <FileUp className="w-7 h-7 text-black/30" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm">Upload Medical Reports</p>
                  <p className="text-[11px] text-black/40 mt-1">PDF, DICOM, or High-Res Images</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-black/5 flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-black/30 uppercase tracking-widest">System Ready</span>
               </div>
               
              <Button 
                type="submit" 
                disabled={isSubmitting || !note.trim()}
                className="h-16 px-10 bg-black hover:bg-black/90 text-white rounded-3xl font-black text-base transition-all shadow-2xl shadow-black/20 disabled:opacity-50 flex items-center gap-3 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Transmitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" /> Sign & Submit Record
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
