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
      description="Create an account so your family's appointment requests stay easy to find whenever you need to check them."
    >
      <form onSubmit={handleSignupSubmit} className="grid gap-5">
            {errorMessage ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
                {errorMessage}
              </div>
            ) : null}

            {successMessage ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
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
                className="mt-2 w-full rounded-xl border border-[rgba(201,168,106,0.22)] bg-[#F8F5EF] px-4 py-3 text-[#24302F] outline-none transition focus:border-[#C9A86A] focus:bg-white focus:ring-4 focus:ring-[#C9A86A]/15"
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
                className="mt-2 w-full rounded-xl border border-[rgba(201,168,106,0.22)] bg-[#F8F5EF] px-4 py-3 text-[#24302F] outline-none transition focus:border-[#C9A86A] focus:bg-white focus:ring-4 focus:ring-[#C9A86A]/15"
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
                className="mt-2 w-full rounded-xl border border-[rgba(201,168,106,0.22)] bg-[#F8F5EF] px-4 py-3 text-[#24302F] outline-none transition focus:border-[#C9A86A] focus:bg-white focus:ring-4 focus:ring-[#C9A86A]/15"
                placeholder="Create a password"
                type="password"
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="pearl-cta-primary text-base disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Creating Account" : "Create Account"}
            </button>

            <p className="text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                href="/patient/login"
                className="font-semibold text-[#173D3F] hover:text-[#C9A86A]"
              >
                Sign in
              </Link>
            </p>
      </form>
    </AuthPanelLayout>
  );
}
