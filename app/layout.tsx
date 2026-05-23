import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: `${clinicInformation.name} | ${clinicInformation.slogan}`,
  description:
    "Pearl Dental Clinic in Patiala provides professional dental care by Dr. Sukhpreet Virdy, B.D.S., with online appointment requests.",
  icons: {
    icon: "/images/logo.png.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
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
