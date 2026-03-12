"use client";

import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  CheckCircle2, 
  HeartPulse, 
  ShieldCheck, 
  Zap, 
  MessageSquare, 
  User, 
  Calendar as CalendarIcon,
  AlertTriangle,
  Activity,
  Focus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

// Form Steps Implementation
const STEPS = [
  { id: 1, title: "Identity", icon: CheckCircle2 },
  { id: 2, title: "Vitals", icon: HeartPulse },
  { id: 3, title: "Medical", icon: ShieldCheck },
  { id: 4, title: "Goals", icon: Zap },
  { id: 5, title: "AI Tone", icon: MessageSquare },
];

export function PersonalizationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(20);
  const [isCompleted, setIsCompleted] = useState(false);
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
  const router = useRouter();

  const handleConditionToggle = (condition: string) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.includes(condition)
        ? prev.conditions.filter(c => c !== condition)
        : [...prev.conditions, condition]
    }));
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      setProgress((currentStep + 1) * 20);
    } else {
      setIsCompleted(true);
      // Simulate submission/analysis
      setTimeout(() => {
        router.push("/");
      }, 3000);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setProgress((currentStep - 1) * 20);
    }
  };

  if (isCompleted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6 max-w-md mx-auto"
      >
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-black text-white shadow-2xl">
              <ShieldCheck className="h-12 w-12" />
            </div>
          </div>
        </div>
        <h2 className="font-bricolage text-4xl font-extrabold tracking-tighter">Profile Synced.</h2>
        <p className="text-lg text-black/50 font-medium leading-relaxed">
          Your Health Blueprint has been securely processed. TakeCare AI is now calibrated to your biological markers.
        </p>
        <div className="pt-4">
          <div className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary">
            <div className="h-2 w-2 animate-bounce rounded-full bg-primary" />
            Redirecting to Health Hub...
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-2xl bg-white p-2">
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
                      <Select value={formData.gender || ""} onValueChange={(val) => setFormData({ ...formData, gender: val })}>
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
                        <CalendarIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-black/20" />
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
                    <Select value={formData.activity || ""} onValueChange={(val) => setFormData({ ...formData, activity: val })}>
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
                    <Select value={formData.aiTone || ""} onValueChange={(val) => setFormData({ ...formData, aiTone: val })}>
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
    </div>
  );
}
