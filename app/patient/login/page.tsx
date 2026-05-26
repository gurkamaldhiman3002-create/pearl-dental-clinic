import Link from "next/link";
import AuthLoginPage from "@/app/components/auth/AuthLoginPage";

export default function PatientLoginPage() {
  return (
    <AuthLoginPage
      checkingMessage="Checking patient session..."
      description="Welcome back. Sign in to check the appointments you have requested with Dr. Virdy and see their latest status."
      destination="/patient/dashboard"
      emailPlaceholder="jane@example.com"
      title="Patient Login"
      footer={
        <p className="text-sm text-slate-600">
          New patient?{" "}
          <Link
            href="/patient/signup"
            className="font-semibold text-[#23575a] hover:text-[#86632f]"
          >
            Create an account
          </Link>
        </p>
      }
    />
  );
}
