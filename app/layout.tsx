import type { Metadata } from "next";
import { Syne, Space_Grotesk, Outfit, Geist, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "600", "700", "800"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "TakeCare AI — Intelligent Health Companion",
  description:
    "TakeCare AI is your next-generation healthcare assistant. Powered by the latest in AI and computer vision to help you stay on top of your health.",
  keywords: ["healthcare", "AI", "medication", "reminders", "health assistant"],
  openGraph: {
    title: "TakeCare AI",
    description: "Your intelligent health companion. Coming soon.",
    type: "website",
  },
};

import { BackgroundGrid } from "@/components/ui/background-grid";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn("scroll-smooth", "font-sans", geist.variable)}>
      <body
        className={`${syne.variable} ${spaceGrotesk.variable} ${outfit.variable} ${bricolage.variable} antialiased`}
      >
        <BackgroundGrid />
        {children}
        <Toaster closeButton position="top-center" expand visibleToasts={1} />
      </body>
    </html>
  );
}
