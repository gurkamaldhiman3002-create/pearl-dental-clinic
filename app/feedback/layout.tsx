import type { Metadata } from "next";
import { clinicInformation } from "@/app/lib/clinicContent";
import { absoluteUrl } from "@/app/lib/seo";

export const metadata: Metadata = {
  title: `Patient Feedback | ${clinicInformation.name}`,
  description:
    "Share your visit experience with Pearl Dental Clinic in Patiala, or read approved patient feedback.",
  alternates: {
    canonical: absoluteUrl("/feedback"),
  },
  openGraph: {
    description:
      "Patient feedback and visit reviews for Pearl Dental Clinic in Patiala.",
    images: [
      {
        alt: "Pearl Dental Clinic reception",
        height: 630,
        url: absoluteUrl("/images/reception.jpeg"),
        width: 1200,
      },
    ],
    title: `Patient Feedback | ${clinicInformation.name}`,
    url: absoluteUrl("/feedback"),
  },
};

export default function FeedbackLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
