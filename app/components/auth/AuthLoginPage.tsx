"use client";

import {
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import AuthPanelLayout from "@/app/components/auth/AuthPanelLayout";
import { useRedirectIfAuthenticated } from "@/app/hooks/useRedirectIfAuthenticated";
import { supabase } from "@/app/lib/supabase";

type LoginForm = {
  email: string;
  password: string;
};

type ResetForm = {
  email: string;
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

const initialResetForm: ResetForm = {
  email: "",
};

const resetRedirectUrl = "https://pearldentalpatiala.in/reset-password";
const resetStorageKey = "pearlPasswordResetLoginPath";
const resetSuccessMessage =
  "If an account exists for this email, a password reset link has been sent.";

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
  const [resetForm, setResetForm] = useState<ResetForm>(initialResetForm);
  const [isResetMode, setIsResetMode] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const errorMessage = isResetMode
    ? resetError
    : submitError ?? sessionError;

  const handleLoginChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setLoginForm((currentForm) => ({
      ...currentForm,
      [name as keyof LoginForm]: value,
    }));
  };

  const handleResetChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setResetForm((currentForm) => ({
      ...currentForm,
      [name as keyof ResetForm]: value,
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

  const openResetForm = () => {
    setIsResetMode(true);
    setResetError(null);
    setResetMessage(null);
    setResetForm({
      email: loginForm.email,
    });
  };

  const closeResetForm = () => {
    setIsResetMode(false);
    setResetError(null);
    setResetMessage(null);
  };

  const handleResetSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResetError(null);
    setResetMessage(null);
    setIsSendingReset(true);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        resetStorageKey,
        destination === "/admin" ? "/admin/login" : "/patient/login",
      );
    }

    const { error } = await supabase.auth.resetPasswordForEmail(
      resetForm.email,
      {
        redirectTo: resetRedirectUrl,
      },
    );

    setIsSendingReset(false);

    if (error) {
      setResetError("We could not send a reset link right now. Please try again later.");
      return;
    }

    setResetForm(initialResetForm);
    setResetMessage(resetSuccessMessage);
  };

  return (
    <AuthPanelLayout description={description} title={title}>
      {isCheckingSession ? (
        <div className="rounded-2xl border border-[#eadfcf] bg-[#f8f3ea] p-5 text-slate-600">
          {checkingMessage}
        </div>
      ) : isResetMode ? (
        <form onSubmit={handleResetSubmit} className="grid gap-5">
          {errorMessage ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
              {errorMessage}
            </div>
          ) : null}

          {resetMessage ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
              {resetMessage}
            </div>
          ) : null}

          <label className="block text-sm font-semibold text-slate-700">
            Email
            <input
              required
              name="email"
              value={resetForm.email}
              onChange={handleResetChange}
              className="mt-2 w-full rounded-xl border border-[#eadfcf] bg-[#f8f3ea] px-4 py-3 text-slate-900 outline-none transition focus:border-[#347376] focus:bg-[#fffdf9] focus:ring-4 focus:ring-[#205356]/15"
              placeholder="Enter your email"
              type="email"
            />
          </label>

          <button
            type="submit"
            disabled={isSendingReset}
            className="rounded-full bg-[#205356] px-7 py-3 text-base font-semibold text-white shadow-lg shadow-[#183f41]/15 transition hover:bg-[#183f41] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSendingReset ? "Sending Reset Link" : "Send Reset Link"}
          </button>

          <button
            type="button"
            onClick={closeResetForm}
            className="text-left text-sm font-semibold text-[#23575a] transition hover:text-[#86632f]"
          >
            Back to sign in
          </button>
        </form>
      ) : (
        <form onSubmit={handleLoginSubmit} className="grid gap-5">
          {errorMessage ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
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
              className="mt-2 w-full rounded-xl border border-[#eadfcf] bg-[#f8f3ea] px-4 py-3 text-slate-900 outline-none transition focus:border-[#347376] focus:bg-[#fffdf9] focus:ring-4 focus:ring-[#205356]/15"
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
              className="mt-2 w-full rounded-xl border border-[#eadfcf] bg-[#f8f3ea] px-4 py-3 text-slate-900 outline-none transition focus:border-[#347376] focus:bg-[#fffdf9] focus:ring-4 focus:ring-[#205356]/15"
              placeholder="Enter password"
              type="password"
            />
          </label>

          <button
            type="button"
            onClick={openResetForm}
            className="w-fit text-sm font-semibold text-[#23575a] transition hover:text-[#86632f]"
          >
            Forgot password?
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-[#205356] px-7 py-3 text-base font-semibold text-white shadow-lg shadow-[#183f41]/15 transition hover:bg-[#183f41] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Signing In" : "Sign In"}
          </button>

          {footer}
        </form>
      )}
    </AuthPanelLayout>
  );
}
