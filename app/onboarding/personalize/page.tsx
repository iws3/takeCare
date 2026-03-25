"use client";

import React, { useEffect } from "react";

import { PersonalizationForm } from "@/components/onboarding/personalization-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { hasPersonalized } from "@/app/actions/medical";
import { useRouter } from "next/navigation";

export default function PersonalizePage() {
  const router = useRouter();

  useEffect(() => {
    async function checkStatus() {
      const storedId = localStorage.getItem("takecare-clerk-id");
      if (!storedId) {
        router.push("/");
        return;
      }
      const personalized = await hasPersonalized(storedId);
      if (personalized) {
        // router.push("/dashboard");
      }
    }
    checkStatus();
  }, [router]);

  return (
    <main className="relative min-h-screen w-full bg-white font-outfit text-black selection:bg-black selection:text-white">
      {/* Background Decorative Gradient */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[60%] rounded-full bg-blue-50/50 blur-[100px]" />
        <div className="absolute bottom-[-5%] right-[-5%] h-[30%] w-[50%] rounded-full bg-teal-50/50 blur-[80px]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-6 py-8 lg:px-16 lg:py-12">
        {/* Navigation / Header */}
        <header className="mb-12 flex items-center justify-between">
          <Link 
            href="/" 
            className="group flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-black/40 transition-colors hover:text-black"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black">
              <span className="font-bricolage text-xl font-extrabold text-white">T</span>
            </div>
            <span className="hidden font-outfit text-xl font-bold lg:block">TakeCare AI</span>
          </div>
        </header>

        {/* Form Container */}
        <div className="flex flex-1 items-center justify-center">
          <PersonalizationForm />
        </div>

        {/* Footer Info */}
        <footer className="mt-12 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-black/20">
          Your data is encrypted and secure — HIPAA Compliant AI
        </footer>
      </div>
    </main>
  );
}
