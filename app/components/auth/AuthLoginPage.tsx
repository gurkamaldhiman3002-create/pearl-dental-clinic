"use client";

import { type ChangeEvent, type FormEvent, type ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import AuthPanelLayout from "@/app/components/auth/AuthPanelLayout";
import { useRedirectIfAuthenticated } from "@/app/hooks/useRedirectIfAuthenticated";
import { supabase } from "@/app/lib/supabase";

type LoginForm = {
  email: string;
  password: string;
};

type AuthLoginPageProps = {
  checkingMessage: string;
  description: string;
  destination: string;
  emailPlaceholder: string;
  footer?: ReactNode;
  title: string;
};

const initialLoginForm: LoginForm = {
  email: "",
  password: "",
};

export default function AuthLoginPage({
  checkingMessage,
  description,
  destination,
  emailPlaceholder,
  footer,
  title,
}: AuthLoginPageProps) {
  const router = useRouter();
  const { isCheckingSession, sessionError } =
    useRedirectIfAuthenticated(destination);
  const [loginForm, setLoginForm] = useState<LoginForm>(initialLoginForm);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const errorMessage = submitError ?? sessionError;

  const handleLoginChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setLoginForm((currentForm) => ({
      ...currentForm,
      [name as keyof LoginForm]: value,
    }));
  };

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: loginForm.email,
      password: loginForm.password,
    });

    setIsSubmitting(false);

    if (error) {
      setSubmitError(error.message);
      return;
    }

    setLoginForm(initialLoginForm);
    router.replace(destination);
  };

  return (
    <AuthPanelLayout description={description} title={title}>
      {isCheckingSession ? (
        <div className="rounded-lg border border-blue-100 bg-slate-50 p-5 text-slate-600">
          {checkingMessage}
        </div>
      ) : (
        <form onSubmit={handleLoginSubmit} className="grid gap-5">
          {errorMessage ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
              {errorMessage}
            </div>
          ) : null}

          <label className="block text-sm font-semibold text-slate-700">
            Email
            <input
              required
              name="email"
              value={loginForm.email}
              onChange={handleLoginChange}
              className="mt-2 w-full rounded-lg border border-blue-100 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              placeholder={emailPlaceholder}
              type="email"
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Password
            <input
              required
              name="password"
              value={loginForm.password}
              onChange={handleLoginChange}
              className="mt-2 w-full rounded-lg border border-blue-100 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              placeholder="Enter password"
              type="password"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-blue-700 px-7 py-3 text-base font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Signing In" : "Sign In"}
          </button>

          {footer}
        </form>
      )}
    </AuthPanelLayout>
  );
}
