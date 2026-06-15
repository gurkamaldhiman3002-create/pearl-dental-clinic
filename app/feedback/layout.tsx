import type { Metadata } from "next";
import { clinicInformation } from "@/app/lib/clinicContent";

export const metadata: Metadata = {
  title: `Patient Feedback | ${clinicInformation.name}`,
  description:
    "Share your visit experience with Pearl Dental Clinic in Patiala, or read approved patient feedback.",
  alternates: {
    canonical: "/feedback",
  },
  openGraph: {
    description:
      "Patient feedback and visit reviews for Pearl Dental Clinic in Patiala.",
    images: [
      {
        alt: "Pearl Dental Clinic reception",
        height: 630,
        url: "/images/reception.jpeg",
        width: 1200,
      },
    ],
    title: `Patient Feedback | ${clinicInformation.name}`,
    url: "/feedback",
  },
};

export default function FeedbackLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
