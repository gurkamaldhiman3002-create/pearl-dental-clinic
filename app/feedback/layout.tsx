import type { Metadata } from "next";
import { clinicInformation } from "@/app/lib/clinicContent";
import { absoluteUrl } from "@/app/lib/seo";

const logoUrl = absoluteUrl("/images/logo.png");

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
        alt: "Pearl Dental Clinic logo",
        height: 292,
        url: logoUrl,
        width: 356,
      },
    ],
    title: `Patient Feedback | ${clinicInformation.name}`,
    url: absoluteUrl("/feedback"),
  },
  twitter: {
    card: "summary",
    description:
      "Patient feedback and visit reviews for Pearl Dental Clinic in Patiala.",
    images: [
      {
        alt: "Pearl Dental Clinic logo",
        url: logoUrl,
      },
    ],
    title: `Patient Feedback | ${clinicInformation.name}`,
  },
};

export default function FeedbackLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
