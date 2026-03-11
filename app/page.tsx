import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PersonalizationModal } from "@/components/onboarding/personalization-modal";

export default function OnboardingPage() {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-white font-sans text-black selection:bg-black selection:text-white">
      {/* Background Decorative Elements - Subtle and Premium */}
      <div className="absolute top-0 left-0 h-full w-full pointer-events-none overflow-hidden opacity-40">
        <div className="absolute -top-[10%] -left-[10%] h-[50%] w-[70%] rounded-full bg-blue-100/50 blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] -right-[10%] h-[40%] w-[60%] rounded-full bg-orange-100/50 blur-[100px] animate-pulse [animation-delay:2s]" />
        <div className="absolute bottom-[-10%] left-[20%] h-[30%] w-[40%] rounded-full bg-teal-50 blur-[80px]" />
      </div>

      <div className="relative mx-auto flex h-full w-full max-w-[1440px] flex-col px-6 py-8 lg:px-16 lg:py-12">
        {/* Header / Logo */}
        <header className="mb-6 lg:mb-12 animate-slide-right">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black shadow-2xl lg:h-14 lg:w-14">
              <span className="font-syne text-xl font-extrabold text-white lg:text-3xl">T</span>
            </div>
            <div className="flex flex-col">
              <span className="font-outfit text-lg font-bold tracking-tight lg:text-2xl leading-none">TakeCare AI</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40 lg:text-xs">Intelligence</span>
            </div>
          </div>
        </header>

        {/* Hero Section - Responsive Grid */}
        <section className="flex flex-1 flex-col lg:grid lg:grid-cols-2 lg:items-center lg:gap-16">

          {/* Left Content Column */}
          <div className="z-20 flex flex-col items-start justify-center">
            <div className="animate-fade-up">
              <h1 className="font-syne text-[48px] font-extrabold leading-[0.95] tracking-tighter lg:text-[100px] lg:leading-[0.9]">
                Tailored care <br />
                for your <br />
                <span className="relative inline-block text-primary">
                  unique needs.
                  <div className="absolute -bottom-2 left-0 h-2 w-full bg-primary/10 lg:h-4" />
                </span>
              </h1>

              <p className="mt-6 max-w-[280px] font-outfit text-base leading-relaxed text-black/50 lg:mt-10 lg:max-w-[480px] lg:text-2xl">
                Your intelligent health companion powered by AI. Personalized healthcare starts here, designed precisely for you.
              </p>
            </div>

            {/* CTA Button Section */}
            <div className="mt-10 flex items-center gap-6 lg:mt-16 animate-scale-in">
              <PersonalizationModal
                trigger={
                  <Button
                    size="lg"
                    className="h-14 rounded-full cursor-pointer bg-black px-8 text-base font-bold text-white transition-all hover:scale-105 hover:bg-black/90 active:scale-95 lg:h-20 lg:px-12 lg:text-xl"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5 lg:h-6 lg:w-6" />
                  </Button>
                }
              />

              <div className="hidden flex-col lg:flex">
                <span className="text-sm font-bold text-black lg:text-base">Trust by 10k+ users</span>
                <span className="text-xs font-medium text-black/40 lg:text-sm">Global health network</span>
              </div>
            </div>
          </div>

          {/* Right Image Column - Responsive Position */}
          <div className="relative mt-auto -mx-6 h-[50vh] overflow-visible lg:mt-0 lg:mx-0 lg:h-full lg:w-full">
            <div className="relative h-full w-full animate-fade-up [animation-delay:400ms] lg:mask-edge-side lg:mask-edge-bottom">
              <Image
                src="/onboarding/patient.png"
                alt="Patient in healthcare consultation"
                fill
                className="object-contain object-bottom scale-110 lg:scale-100 lg:object-bottom-right transition-transform duration-700 hover:scale-[1.05] cursor-pointer"
                priority
              />

              {/* Desktop specific masks */}
              <div className="absolute inset-0 hidden bg-linear-to-r from-white via-transparent to-transparent lg:block" />
              <div className="absolute inset-x-0 bottom-0 hidden h-40 bg-linear-to-t from-white to-transparent lg:block" />
            </div>
          </div>
        </section>

        {/* Footer / Status Bar Indicator Simulation */}
        <footer className="mt-auto flex items-center justify-between font-outfit text-[10px] font-bold text-black/20 lg:py-6 lg:text-sm">
          <div className="flex gap-2">
            <div className="h-1 w-8 rounded-full bg-black lg:h-1.5 lg:w-16" />
            <div className="h-1 w-1 rounded-full bg-black/10 lg:h-1.5 lg:w-1.5" />
            <div className="h-1 w-1 rounded-full bg-black/10 lg:h-1.5 lg:w-1.5" />
          </div>
          <span className="uppercase tracking-[0.3em]">Precision Healthcare — v1.0</span>
        </footer>
      </div>
    </main>
  );
}