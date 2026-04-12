"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, Droplet, HeartPulse, Phone, CheckCircle, Loader2 } from "lucide-react";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];
const COMMON_GOALS = ["Weight Loss", "Muscle Gain", "Better Sleep", "Stress Reduction", "Heart Health", "Increase Energy", "Mental Clarity", "Maintain Fitness"];

export default function PersonalizationOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    bloodType: "",
    allergies: [] as string[],
    healthGoals: [] as string[],
    emergencyPhone: "",
    theme: "system",
  });

  const [allergyInput, setAllergyInput] = useState("");

  const handleNext = () => setStep((s) => Math.min(s + 1, 4));
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const toggleGoal = (goal: string) => {
    setFormData((prev) => ({
      ...prev,
      healthGoals: prev.healthGoals.includes(goal)
        ? prev.healthGoals.filter((g) => g !== goal)
        : [...prev.healthGoals, goal],
    }));
  };

  const addAllergy = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ((e as React.KeyboardEvent).key === "Enter" || e.type === "click") {
      e.preventDefault();
      if (allergyInput.trim() && !formData.allergies.includes(allergyInput.trim())) {
        setFormData((prev) => ({
          ...prev,
          allergies: [...prev.allergies, allergyInput.trim()],
        }));
        setAllergyInput("");
      }
    }
  };

  const removeAllergy = (allergy: string) => {
    setFormData((prev) => ({ ...prev, allergies: prev.allergies.filter((a) => a !== allergy) }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { saveMyPersonalization } = await import("@/app/actions/medical");
      await saveMyPersonalization({
        healthGoals: formData.healthGoals,
        bloodType: formData.bloodType || undefined,
        allergies: formData.allergies,
        emergencyPhone: formData.emergencyPhone || undefined,
        theme: formData.theme || undefined,
      });

      toast.success("Profile fully configured!");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden text-slate-900">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-600/10 blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[150px]" />
      </div>

      <div className="w-full max-w-2xl z-10 relative">
        <div className="flex justify-between items-center mb-8 px-2">
          {/* Progress Indicators */}
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="flex-1 flex items-center">
              <div
                className={`h-2 rounded-full flex-1 transition-all duration-500 mx-1 ${
                  step >= num ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-slate-200"
                }`}
              />
            </div>
          ))}
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden min-h-[500px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="h-full flex flex-col">
                <div className="flex bg-blue-100 w-16 h-16 rounded-2xl items-center justify-center mb-6 text-blue-600 ring-4 ring-white shadow-sm">
                  <Droplet size={32} />
                </div>
                <h2 className="text-3xl font-bold mb-2">Health Basics</h2>
                <p className="text-slate-500 mb-8">Tell us your fundamental medical traits to tailor your interactions.</p>

                <div className="space-y-6 flex-1">
                  <div className="space-y-3">
                    <Label className="text-lg">Blood Type</Label>
                    <div className="flex flex-wrap gap-3">
                      {BLOOD_TYPES.map((type) => (
                        <button
                          key={type}
                          onClick={() => setFormData({ ...formData, bloodType: type })}
                          className={`px-4 py-2 rounded-xl border transition-all ${
                            formData.bloodType === type
                              ? "bg-blue-600 border-blue-600 text-white font-semibold shadow-md shadow-blue-500/20"
                              : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-lg">Known Allergies</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g. Peanuts, Penicillin"
                        className="bg-white border-slate-200 focus-visible:ring-blue-500 focus-visible:border-blue-500 placeholder:text-slate-400"
                        value={allergyInput}
                        onChange={(e) => setAllergyInput(e.target.value)}
                        onKeyDown={addAllergy}
                      />
                      <Button onClick={(e) => addAllergy(e)} variant="secondary" className="bg-slate-100 hover:bg-slate-200 text-slate-800">Add</Button>
                    </div>
                    {formData.allergies.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {formData.allergies.map((a) => (
                          <div key={a} className="bg-rose-100 border border-rose-200 text-rose-700 px-3 py-1 rounded-full text-sm flex items-center">
                            {a}
                            <button onClick={() => removeAllergy(a)} className="ml-2 hover:text-rose-900 font-bold">&times;</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="h-full flex flex-col">
                <div className="flex bg-rose-100 w-16 h-16 rounded-2xl items-center justify-center mb-6 text-rose-600 ring-4 ring-white shadow-sm">
                  <HeartPulse size={32} />
                </div>
                <h2 className="text-3xl font-bold mb-2">Health Goals</h2>
                <p className="text-slate-500 mb-8">What are you hoping to achieve with TakeCare?</p>

                <div className="flex flex-wrap gap-3 flex-1 content-start">
                  {COMMON_GOALS.map((goal) => {
                    const isSelected = formData.healthGoals.includes(goal);
                    return (
                      <button
                        key={goal}
                        onClick={() => toggleGoal(goal)}
                        className={`px-5 py-3 rounded-2xl border transition-all duration-300 ${
                          isSelected
                            ? "bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-500/20"
                            : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                        }`}
                      >
                        {goal}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="h-full flex flex-col">
                <div className="flex bg-amber-100 w-16 h-16 rounded-2xl items-center justify-center mb-6 text-amber-600 ring-4 ring-white shadow-sm">
                  <Phone size={32} />
                </div>
                <h2 className="text-3xl font-bold mb-2">Emergency Contact</h2>
                <p className="text-slate-500 mb-8">Someone we or medical responders can reach out to in case of urgency.</p>

                <div className="space-y-4 flex-1">
                  <div className="space-y-3">
                    <Label className="text-lg">Phone Number</Label>
                    <Input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      className="bg-white border-slate-200 h-14 text-lg focus-visible:ring-blue-500 focus-visible:border-blue-500 placeholder:text-slate-400"
                      value={formData.emergencyPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                    />
                  </div>
                  <p className="text-sm text-slate-500">We will never spam or share this contact outside of explicit life-threatening scenarios.</p>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="h-full flex flex-col items-center justify-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                  className="flex bg-emerald-100 w-32 h-32 rounded-full items-center justify-center mb-8 text-emerald-600 ring-8 ring-white shadow-lg"
                >
                  <CheckCircle size={64} />
                </motion.div>
                <h2 className="text-4xl font-extrabold mb-4 text-slate-900">You're All Set!</h2>
                <p className="text-lg text-slate-500 max-w-sm mb-10">Your health profile is crafted. Our AI will now contextualize advice utilizing your personalized profile.</p>

                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full max-w-sm h-16 text-lg rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20"
                >
                  {loading ? <Loader2 className="animate-spin w-6 h-6" /> : "Dive In"}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Controls */}
          {step < 4 && (
            <div className="flex justify-between items-center mt-10 pt-6 border-t border-slate-200">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={step === 1}
                className="text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              >
                <ArrowLeft className="mr-2" size={18} /> Back
              </Button>
              <Button
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 shadow-sm shadow-blue-500/20"
              >
                Next <ArrowRight className="ml-2" size={18} />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
