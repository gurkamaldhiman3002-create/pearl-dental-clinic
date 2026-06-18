import type { Metadata } from "next";
import { clinicInformation } from "@/app/lib/clinicContent";

export const metadata: Metadata = {
  title: `Reset Password | ${clinicInformation.name}`,
  description: "Reset your Pearl Dental Clinic account password.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function ResetPasswordLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
