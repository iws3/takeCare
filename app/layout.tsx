import type { Metadata } from "next";
import { Syne, Space_Grotesk, Outfit } from "next/font/google";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${syne.variable} ${spaceGrotesk.variable} ${outfit.variable} antialiased bg-[#050811] text-white`}
      >
        {children}
      </body>
    </html>
  );
}
