import Link from "next/link";
import AuthLoginPage from "@/app/components/auth/AuthLoginPage";

export default function PatientLoginPage() {
  return (
    <AuthLoginPage
      checkingMessage="Checking patient session..."
      description="Sign in to view appointment history, treatment details, and current request status."
      destination="/patient/dashboard"
      emailPlaceholder="jane@example.com"
      title="Patient Login"
      footer={
        <p className="text-sm text-slate-600">
          New patient?{" "}
          <Link
            href="/patient/signup"
            className="font-semibold text-blue-700 hover:text-blue-900"
          >
            Create an account
          </Link>
        </p>
      }
    />
  );
}
