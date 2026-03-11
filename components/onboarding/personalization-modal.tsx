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
        "group relative flex items-start gap-4 rounded-2xl border border-black/5 bg-white p-5 text-left transition-all hover:border-black/20 hover:bg-neutral-50 active:scale-[0.98] cursor-pointer"
      )}
    >
      <div className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors",
        isPrimary ? "bg-black text-white group-hover:bg-primary" : "bg-neutral-100 text-black group-hover:bg-black group-hover:text-white"
      )}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-lg font-bold text-black leading-none">{title}</span>
        <span className="text-sm text-black/50 leading-relaxed">{description}</span>
        
        {tags && tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-black/40 bg-black/5 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="h-2.5 w-2.5 text-primary" />
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
  return (
    <Dialog>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-[500px] rounded-3xl border-none p-0 overflow-hidden shadow-2xl font-outfit">
        <div className="relative p-8 pt-12">
          {/* Minimalist Background Pattern */}
          <div className="absolute top-0 right-0 -z-10 h-32 w-32 bg-primary/5 blur-3xl opacity-50 rounded-full" />
          
          <DialogHeader className="mb-8">
            <DialogTitle className="font-syne text-3xl font-extrabold tracking-tight leading-none text-black">
              Start your journey
            </DialogTitle>
            <DialogDescription className="text-black/50 text-lg mt-2">
              How would you like to experience TakeCare?
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 mt-6">
            <PersonalizationOption
              title="Personalize experience"
              description="Better diagnosis accuracy, tailored health insights, and proactive care reminders."
              icon={UserCircle2}
              tags={["AI Precision", "Health History", "Smart Alerts"]}
              onClick={() => {}}
              variant="primary"
            />

            <PersonalizationOption
              title="Remain anonymous"
              description="Basic AI analysis without storing personal identifiers or health history."
              icon={ShieldOff}
              onClick={() => {}}
              variant="secondary"
            />
          </div>

          <p className="mt-8 text-center text-xs font-medium text-black/30">
            You can change these settings at any time in your profile.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
