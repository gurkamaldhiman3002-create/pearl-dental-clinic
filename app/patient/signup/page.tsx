"use client";

import { type ChangeEvent, type FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthPanelLayout from "@/app/components/auth/AuthPanelLayout";
import { supabase } from "@/app/lib/supabase";

type SignupForm = {
  name: string;
  email: string;
  password: string;
};

const initialSignupForm: SignupForm = {
  name: "",
  email: "",
  password: "",
};

export default function PatientSignupPage() {
  const router = useRouter();
  const [signupForm, setSignupForm] =
    useState<SignupForm>(initialSignupForm);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignupChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setSignupForm((currentForm) => ({
      ...currentForm,
      [name as keyof SignupForm]: value,
    }));
  };

  const handleSignupSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    const { data, error } = await supabase.auth.signUp({
      email: signupForm.email,
      password: signupForm.password,
      options: {
        data: {
          name: signupForm.name,
        },
      },
    });

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSignupForm(initialSignupForm);

    if (data.session) {
      router.replace("/patient/dashboard");
      return;
    }

    setSuccessMessage(
      "Account created. Check your email to confirm your account, then sign in.",
    );
  };

  return (
    <AuthPanelLayout
      title="Create Patient Account"
      description="Create an account to track appointment requests and treatment status from your patient dashboard."
    >
      <form onSubmit={handleSignupSubmit} className="grid gap-5">
            {errorMessage ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
                {errorMessage}
              </div>
            ) : null}

            {successMessage ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
                {successMessage}
              </div>
            ) : null}

            <label className="block text-sm font-semibold text-slate-700">
              Name
              <input
                required
                name="name"
                value={signupForm.name}
                onChange={handleSignupChange}
                className="mt-2 w-full rounded-lg border border-blue-100 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                placeholder="Jane Smith"
                type="text"
              />
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Email
              <input
                required
                name="email"
                value={signupForm.email}
                onChange={handleSignupChange}
                className="mt-2 w-full rounded-lg border border-blue-100 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                placeholder="jane@example.com"
                type="email"
              />
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Password
              <input
                required
                minLength={6}
                name="password"
                value={signupForm.password}
                onChange={handleSignupChange}
                className="mt-2 w-full rounded-lg border border-blue-100 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                placeholder="Create a password"
                type="password"
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-blue-700 px-7 py-3 text-base font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Creating Account" : "Create Account"}
            </button>

            <p className="text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                href="/patient/login"
                className="font-semibold text-blue-700 hover:text-blue-900"
              >
                Sign in
              </Link>
            </p>
      </form>
    </AuthPanelLayout>
  );
}
