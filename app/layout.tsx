import type { Metadata } from "next";
import {
  Caveat,
  Cormorant_Garamond,
  Geist_Mono,
  Manrope,
} from "next/font/google";
import Chatbot from "@/app/components/chat/Chatbot";
import SiteFooter from "@/app/components/layout/SiteFooter";
import SiteHeader from "@/app/components/layout/SiteHeader";
import { clinicInformation } from "@/app/lib/clinicContent";
import { absoluteUrl, siteUrl } from "@/app/lib/seo";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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

const logoUrl = absoluteUrl("/images/logo.png");

const clinicStructuredData = {
  "@context": "https://schema.org",
  "@id": absoluteUrl("/#pearl-dental-clinic"),
  "@type": ["Dentist", "LocalBusiness"],
  address: {
    "@type": "PostalAddress",
    ...clinicInformation.address,
  },
  email: clinicInformation.email,
  hasMap: clinicInformation.mapHref,
  image: logoUrl,
  logo: logoUrl,
  medicalSpecialty: "Dentistry",
  name: clinicInformation.name,
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      closes: "14:00",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: "10:30",
    },
    {
      "@type": "OpeningHoursSpecification",
      closes: "18:30",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: "16:00",
    },
  ],
  slogan: clinicInformation.slogan,
  telephone: clinicInformation.phoneDisplay,
  url: siteUrl,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: `${clinicInformation.name} | ${clinicInformation.slogan}`,
  description:
    "Pearl Dental Clinic at Shagun Complex, Main Bhadson Road, Leela Bhawan, Patiala. Family dental care with Dr. Sukhpreet Virdy, B.D.S.",
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    apple: [
      {
        sizes: "180x180",
        type: "image/png",
        url: "/apple-icon",
      },
    ],
    icon: [
      {
        sizes: "64x64",
        type: "image/png",
        url: "/icon",
      },
      {
        sizes: "356x292",
        type: "image/png",
        url: "/images/logo.png",
      },
    ],
    shortcut: [
      {
        type: "image/png",
        url: "/icon",
      },
    ],
  },
  openGraph: {
    description:
      "Warm family dental care in Patiala with Dr. Sukhpreet Virdy, B.D.S.",
    images: [
      {
        alt: "Pearl Dental Clinic logo",
        height: 292,
        url: logoUrl,
        width: 356,
      },
    ],
    locale: "en_IN",
    siteName: clinicInformation.name,
    title: `${clinicInformation.name} | ${clinicInformation.slogan}`,
    type: "website",
    url: siteUrl,
  },
  twitter: {
    card: "summary",
    description:
      "Warm family dental care in Patiala with Dr. Sukhpreet Virdy, B.D.S.",
    images: [
      {
        alt: "Pearl Dental Clinic logo",
        url: logoUrl,
      },
    ],
    title: `${clinicInformation.name} | ${clinicInformation.slogan}`,
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
      className={`${manrope.variable} ${geistMono.variable} ${pearlSerif.variable} ${pearlScript.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F8F5EF] text-[#24302F]">
        <script
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(clinicStructuredData).replace(
              /</g,
              "\\u003c",
            ),
          }}
          type="application/ld+json"
        />
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
        <Chatbot />
      </body>
    </html>
  );
}
