"use client";

import * as React from "react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowRight,
  ArrowLeft,
  User,
  ShieldCheck,
  HeartPulse,
  MessageSquare,
  Stethoscope,
  Bell,
  ShieldAlert,
  Target,
  ChevronDown,
  CalendarDays,
  Scale,
  Ruler,
  AlertTriangle,
  Focus,
  Activity,
  CheckCircle2
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ensureUser, savePersonalization } from "@/app/actions/medical";


const STEP_IMAGES = {
  1: "/images/onboarding/step1.png",
  2: "/images/onboarding/step2.png",
  3: "/images/onboarding/step3.png",
  4: "/images/onboarding/step4.png",
  5: "/images/onboarding/step5.png",
  success: "/images/onboarding/success.png"
};

const stepVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const visualVariants = {
  initial: { opacity: 0, scale: 0.8, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.8, y: 20 },
};

// Form Steps Implementation
const STEPS = [
  { id: 1, title: "Identity", icon: User },
  { id: 2, title: "Vitals", icon: HeartPulse },
  { id: 3, title: "Medical", icon: ShieldCheck },
  { id: 4, title: "Goals", icon: Target },
  { id: 5, title: "AI Tone", icon: MessageSquare },
];

export function PersonalizationForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [dobOpen, setDobOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "",
    dob: "",
    height: "",
    weight: "",
    activity: "",
    conditions: [] as string[],
    allergies: "",
    goal: "",
    aiTone: "",
    emergencyContact: "",
  });

  const progress = (currentStep / 5) * 100;

  const handleConditionToggle = (condition: string) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.includes(condition)
        ? prev.conditions.filter(c => c !== condition)
        : [...prev.conditions, condition]
    }));
  };

  const [error, setError] = useState<string | null>(null);

  const validateStep = (step: number) => {
    setError(null);
    switch (step) {
      case 1:
        if (!formData.name || !formData.email || !formData.gender || !formData.dob) return "Please complete all biological identification fields.";
        if (!formData.email.includes("@")) return "Please provide a valid clinical email address.";
        return null;
      case 2:
        if (!formData.height || !formData.weight || !formData.activity) return "Baseline body metrics are required for AI calibration.";
        return null;
      case 4:
        if (!formData.goal) return "Please select a health goal to focus your AI companion.";
        return null;
      case 5:
        if (!formData.aiTone || !formData.emergencyContact) return "AI interaction style and emergency contacts are vital for safety.";
        return null;
      default:
        return null;
    }
  };

  const nextStep = async () => {
    const errorMsg = validateStep(currentStep);
    if (errorMsg) {
       setError(errorMsg);
       return;
    }

    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      setError(null);
    } else {

      setIsCompleted(true);
      try {
        const clerkId = "demo-user-123"; 
        
        // Ensure user exists first
        await ensureUser(clerkId, formData.email, formData.name);
        
        // Save the personalization data
        await savePersonalization(clerkId, {
           healthGoals: [formData.goal],
           bloodType: "Unknown", // Can be set in health profile later
           allergies: formData.conditions,
           emergencyPhone: formData.emergencyContact,
           theme: "default"
        });

        // SUCCESS: Professional Redirection to the Clinical Dashboard with vibrant UX
        setTimeout(() => {
          router.push("/dashboard");
        }, 3000); // 3 seconds of success animation before redirect

      } catch (error) {
        console.error("Personalization storage failed:", error);
        setError("Failed to sync clinical profile. Please contact support.");
        setIsCompleted(false);
      }
    }
  };



  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (isCompleted) {
    return (
      <div className="relative flex flex-col items-center justify-center space-y-8 py-16 text-center max-w-2xl mx-auto overflow-visible">
        {/* Animated Success Visual */}
        <div className="fixed bottom-0 right-0 z-0 h-80 w-80 lg:h-[600px] lg:w-[600px] pointer-events-none p-12 overflow-visible">
          <Image
            src={STEP_IMAGES.success}
            alt="Success"
            fill
            className="object-contain"
          />
        </div>

        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-black text-white shadow-2xl">
              <ShieldCheck className="h-12 w-12" />
            </div>
          </div>
        </div>
        <h2 className="font-bricolage text-4xl font-extrabold tracking-tighter">Profile Completed.</h2>
        <p className="text-lg text-black/50 font-medium leading-relaxed">
          Your Health Blueprint has been securely processed. TakeCare AI is now calibrated to your biological markers.
        </p>
        <div className="pt-4">
          <div className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary">
            <div className="h-2 w-2 animate-bounce rounded-full bg-primary" />
            Redirecting to Health Hub...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-2xl bg-white p-2 overflow-visible">
      {/* Progress Header */}
      <div className="mb-12">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex gap-2">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-500",
                  currentStep >= step.id
                    ? "bg-black text-white border-black"
                    : "bg-white text-black/20 border-black/10"
                )}
              >
                <step.icon className="h-5 w-5" />
              </div>
            ))}
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-black/20 uppercase tracking-widest">Step</span>
            <div className="font-bricolage text-3xl font-black">{currentStep}/5</div>
          </div>
        </div>
        <Progress value={progress} className="h-1.5 bg-black/5" />
      </div>

      {/* Form Content with Animation */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3"
              >
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="text-sm font-bold text-red-600">{error}</span>
              </motion.div>
            )}

            {currentStep === 1 && (

              <div className="space-y-8">
                <header>
                  <h2 className="font-bricolage text-4xl font-extrabold tracking-tighter lg:text-5xl">Tell us who <br />you are.</h2>
                  <p className="mt-4 text-lg text-black/50 font-medium">Your biological foundation helps our AI tailor its diagnostic precision just for you.</p>
                </header>

                <div className="grid gap-6 pt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="text-xs font-black uppercase tracking-[0.2em] text-black/30">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-black/20" />
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="h-14 rounded-2xl border-black/5 bg-black/5 pl-12 text-lg font-bold transition-all focus:bg-white focus:ring-black/5"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-xs font-black uppercase tracking-[0.2em] text-black/30">Email Address</Label>
                    <div className="relative">
                      <MessageSquare className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-black/20" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="h-14 rounded-2xl border-black/5 bg-black/5 pl-12 text-lg font-bold transition-all focus:bg-white focus:ring-black/5"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label className="text-xs font-black uppercase tracking-[0.2em] text-black/30">Biological Sex</Label>
                      <Select value={formData.gender} onValueChange={(val) => setFormData({ ...formData, gender: val as string })}>
                        <SelectTrigger className="h-14 rounded-2xl border-black/5 bg-black/5 text-lg font-bold focus:bg-white">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-black/5 font-outfit font-bold">
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label className="text-xs font-black uppercase tracking-[0.2em] text-black/30">Date of Birth</Label>
                      <div className="relative">
                        <CalendarDays className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-black/20" />
                        <Input
                          type="date"
                          value={formData.dob}
                          onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                          className="h-14 rounded-2xl border-black/5 bg-black/5 pl-12 text-lg font-bold focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-8">
                <header>
                  <h2 className="font-bricolage text-4xl font-extrabold tracking-tighter lg:text-5xl">Body Metrics <br />& Vitality.</h2>
                  <p className="mt-4 text-lg text-black/50 font-medium">Baseline calories and activity tracking start with these numbers.</p>
                </header>

                <div className="grid gap-6 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label className="text-xs font-black uppercase tracking-[0.2em] text-black/30">Height (cm)</Label>
                      <Input
                        type="number"
                        placeholder="175"
                        value={formData.height}
                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                        className="h-14 rounded-2xl border-black/5 bg-black/5 text-lg font-bold focus:bg-white"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-xs font-black uppercase tracking-[0.2em] text-black/30">Weight (kg)</Label>
                      <Input
                        type="number"
                        placeholder="70"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        className="h-14 rounded-2xl border-black/5 bg-black/5 text-lg font-bold focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-xs font-black uppercase tracking-[0.2em] text-black/30">Daily Activity Level</Label>
                    <Select value={formData.activity} onValueChange={(val) => setFormData({ ...formData, activity: val as string })}>
                      <SelectTrigger className="h-14 rounded-2xl border-black/5 bg-black/5 text-lg font-bold focus:bg-white">
                        <SelectValue placeholder="How active are you?" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-black/5 font-outfit font-bold">
                        <SelectItem value="sedentary">Sedentary (Office worker)</SelectItem>
                        <SelectItem value="moderate">Moderate (3-4 times/week)</SelectItem>
                        <SelectItem value="active">Active (Daily exercise)</SelectItem>
                        <SelectItem value="athlete">Athlete (Pro-level training)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-8">
                <header>
                  <h2 className="font-bricolage text-4xl font-extrabold tracking-tighter lg:text-5xl">Medical <br />Shield.</h2>
                  <p className="mt-4 text-lg text-black/50 font-medium">This is the most crucial layer for the AI to ensure it never suggests something harmful.</p>
                </header>

                <div className="space-y-6 pt-4">
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-[0.2em] text-black/30">Chronic Conditions</Label>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {["Diabetes", "Hypertension", "Asthma", "Heart Disease"].map((condition) => (
                        <div
                          key={condition}
                          onClick={() => handleConditionToggle(condition)}
                          className={cn(
                            "flex items-center space-x-3 rounded-xl border p-4 transition-all cursor-pointer",
                            formData.conditions.includes(condition)
                              ? "bg-black text-white border-black"
                              : "bg-black/5 border-black/5 hover:bg-white hover:border-black/10"
                          )}
                        >
                          <Checkbox id={condition} checked={formData.conditions.includes(condition)} />
                          <Label htmlFor={condition} className="text-sm font-bold cursor-pointer">{condition}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-xs font-black uppercase tracking-[0.2em] text-black/30">Drug Allergies (if any)</Label>
                    <div className="relative">
                      <AlertTriangle className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-black/20" />
                      <Input
                        placeholder="e.g. Penicillin, Aspirin"
                        value={formData.allergies}
                        onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                        className="h-14 rounded-2xl border-black/5 bg-black/5 pl-12 text-lg font-bold focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-8">
                <header>
                  <h2 className="font-bricolage text-4xl font-extrabold tracking-tighter lg:text-5xl">Personal <br />Intent.</h2>
                  <p className="mt-4 text-lg text-black/50 font-medium">What is your primary focus for using TakeCare AI?</p>
                </header>

                <div className="grid gap-3 pt-4">
                  {[
                    { id: "anxiety", title: "Reduce Anxiety", icon: Focus, desc: "Mental wellness & calming exercises" },
                    { id: "meds", title: "Medication Management", icon: ShieldCheck, desc: "Reliable tracking & interaction alerts" },
                    { id: "performance", title: "Peak Performance", icon: Activity, desc: "Fitness, nutrition & sleep optimization" },
                  ].map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() => setFormData({ ...formData, goal: goal.id })}
                      className={cn(
                        "group relative flex items-center gap-4 rounded-2xl border p-4 text-left transition-all active:scale-[0.98]",
                        formData.goal === goal.id
                          ? "bg-black border-black"
                          : "bg-black/5 border-black/5 hover:border-black/20 hover:bg-white"
                      )}
                    >
                      <div className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
                        formData.goal === goal.id ? "bg-white text-black" : "bg-black text-white group-hover:bg-primary"
                      )}>
                        <goal.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className={cn("font-bold", formData.goal === goal.id ? "text-white" : "text-black")}>{goal.title}</div>
                        <div className={cn("text-xs font-medium", formData.goal === goal.id ? "text-white/60" : "text-black/40")}>{goal.desc}</div>
                      </div>
                      <div className={cn(
                        "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors",
                        formData.goal === goal.id ? "border-white bg-white" : "border-black/5 group-hover:border-primary"
                      )}>
                        {formData.goal === goal.id && <CheckCircle2 className="h-4 w-4 text-black" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-8">
                <header>
                  <h2 className="font-bricolage text-4xl font-extrabold tracking-tighter lg:text-5xl">AI Interaction <br />& Safety.</h2>
                  <p className="mt-4 text-lg text-black/50 font-medium">How should TakeCare AI speak to you and who should we alert in emergencies?</p>
                </header>

                <div className="grid gap-6 pt-4">
                  <div className="grid gap-2">
                    <Label className="text-xs font-black uppercase tracking-[0.2em] text-black/30">AI Interaction Tone</Label>
                    <Select value={formData.aiTone} onValueChange={(val) => setFormData({ ...formData, aiTone: val as string })}>
                      <SelectTrigger className="h-14 rounded-2xl border-black/5 bg-black/5 text-lg font-bold focus:bg-white">
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-black/5 font-outfit font-bold">
                        <SelectItem value="empathetic">Empathetic & Supportive</SelectItem>
                        <SelectItem value="technical">Technical & Precise</SelectItem>
                        <SelectItem value="casual">Casual & Friendly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-xs font-black uppercase tracking-[0.2em] text-black/30">Emergency Contact Number</Label>
                    <Input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                      className="h-14 rounded-2xl border-black/5 bg-black/5 text-lg font-bold focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Form Actions */}
      <div className="mt-12 flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="h-14 flex-1 rounded-2xl font-bold uppercase tracking-widest text-xs disabled:opacity-0"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button
          onClick={nextStep}
          className="h-14 flex-2 rounded-2xl bg-black font-bold uppercase tracking-widest text-xs text-white hover:bg-black/90"
        >
          {currentStep === 5 ? "Finish Setup" : "Continue Journey"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      {/* Firebase-style Floating Visual Container */}
      <div className="fixed bottom-0 right-0 z-0 h-64 w-64 lg:h-[540px] lg:w-[540px] pointer-events-none p-8 overflow-visible">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={visualVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 20,
              duration: 0.6
            }}
            className="relative h-full w-full"
          >
            <Image
              src={STEP_IMAGES[currentStep as keyof typeof STEP_IMAGES]}
              alt={`Step ${currentStep} illustration`}
              fill
              className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-transform duration-700 hover:scale-105"
              priority
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
