"use client";

import { CheckCircle2, LucideIcon, UserCircle2, ShieldOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { ReactElement } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface PersonalizationOptionProps {
  title: string;
  description: string;
  icon: LucideIcon;
  tags?: string[];
  onClick: () => void;
  variant?: "primary" | "secondary";
}

function PersonalizationOption({
  title,
  description,
  icon: Icon,
  tags,
  onClick,
  variant = "primary"
}: PersonalizationOptionProps) {
  const isPrimary = variant === "primary";

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex items-start gap-3 rounded-2xl border border-black/5 bg-white p-3.5 text-left transition-all hover:border-black/20 hover:bg-neutral-50 active:scale-[0.98] cursor-pointer lg:gap-4 lg:p-5"
      )}
    >
      <div className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors lg:h-12 lg:w-12",
        isPrimary ? "bg-black text-white group-hover:bg-primary" : "bg-neutral-100 text-black group-hover:bg-black group-hover:text-white"
      )}>
        <Icon className="h-5 w-5 lg:h-6 lg:w-6" />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-base font-bold text-black leading-tight lg:text-lg">{title}</span>
        <span className="text-xs text-black/50 leading-snug lg:text-sm lg:leading-relaxed">{description}</span>

        {tags && tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5 lg:mt-3 lg:gap-2">
            {tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider text-black/40 bg-black/5 px-1.5 py-0.5 rounded-full lg:text-[10px] lg:px-2">
                <CheckCircle2 className="h-2 w-2 text-primary lg:h-2.5 lg:w-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}

interface PersonalizationModalProps {
  trigger: ReactElement;
}

export function PersonalizationModal({ trigger }: PersonalizationModalProps) {
  const router = useRouter();

  const handlePersonalize = async () => {
    const { initSession } = await import("@/app/actions/medical");
    const { clerkId } = await initSession();
    localStorage.setItem("takecare-clerk-id", clerkId);
    router.push("/onboarding/personalize");
  };

  const handleAnonymous = async () => {
    const { loginAnonymous } = await import("@/app/actions/medical");
    const { clerkId } = await loginAnonymous();
    localStorage.setItem("takecare-clerk-id", clerkId);
    router.push("/dashboard");
  };

  return (
    <Dialog>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-[460px] max-w-[92vw] rounded-3xl border-none p-0 overflow-hidden shadow-2xl font-outfit">
        <div className="relative p-6 pt-10 lg:p-8 lg:pt-12">
          {/* Minimalist Background Pattern */}
          <div className="absolute top-0 right-0 -z-10 h-32 w-32 bg-primary/5 blur-3xl opacity-50 rounded-full" />

          <DialogHeader className="mb-6 lg:mb-8">
            <DialogTitle className="font-bricolage text-2xl font-extrabold tracking-tight leading-none text-black lg:text-3xl">
              Start your journey
            </DialogTitle>
            <DialogDescription className="text-black/50 text-base mt-1.5 lg:text-lg lg:mt-2">
              How would you like to experience TakeCare?
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 mt-4 lg:gap-4 lg:mt-6">
            <PersonalizationOption
              title="Personalize experience"
              description="Better diagnosis accuracy, tailored health insights, and proactive care reminders."
              icon={UserCircle2}
              tags={["AI Precision", "Health History", "Smart Alerts"]}
              onClick={handlePersonalize}
              variant="primary"
            />

            <PersonalizationOption
              title="Remain anonymous"
              description="Basic AI analysis without storing personal identifiers or health history."
              icon={ShieldOff}
              onClick={handleAnonymous}
              variant="secondary"
            />
            
            <div className="mt-4 flex flex-col items-center gap-3">
               <div className="h-px w-full bg-black/5" />
               <Button 
                variant="ghost" 
                onClick={async () => {
                  const email = prompt("Please enter the clinical email used for your personalization:");
                  if (email) {
                    const { restoreSessionByEmail } = await import("@/app/actions/medical");
                    const result = await restoreSessionByEmail(email);
                    if (result.success) {
                      localStorage.setItem("takecare-clerk-id", result.clerkId!);
                      router.push("/dashboard");
                    } else {
                      alert("Health profile not found for this email address. Please personalize first.");
                    }
                  }
                }}
                className="text-xs font-black uppercase tracking-[0.2em] text-black/30 hover:text-black"
               >
                 I already have a profile
               </Button>
            </div>
          </div>

          <p className="mt-6 text-center text-[10px] font-medium text-black/30 lg:mt-8 lg:text-xs">
            You can change these settings at any time in your profile.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
