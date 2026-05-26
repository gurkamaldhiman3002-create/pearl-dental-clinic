import type { Metadata } from "next";
import { Caveat, Cormorant_Garamond, Geist, Geist_Mono } from "next/font/google";
import Chatbot from "@/app/components/chat/Chatbot";
import SiteFooter from "@/app/components/layout/SiteFooter";
import SiteHeader from "@/app/components/layout/SiteHeader";
import { clinicInformation } from "@/app/lib/clinicContent";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pearlSerif = Cormorant_Garamond({
  variable: "--font-pearl-serif",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const pearlScript = Caveat({
  variable: "--font-pearl-script",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  title: `${clinicInformation.name} | ${clinicInformation.slogan}`,
  description:
    "A warm, family dental clinic in Patiala with Dr. Sukhpreet Virdy, B.D.S. Request an appointment at Pearl Dental Clinic.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${pearlSerif.variable} ${pearlScript.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
        <Chatbot />
      </body>
    </html>
  );
}
