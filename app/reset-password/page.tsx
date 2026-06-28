"use client";

import { type ChangeEvent, type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import AuthPanelLayout from "@/app/components/auth/AuthPanelLayout";
import { supabase } from "@/app/lib/supabase";

type PasswordForm = {
  confirmPassword: string;
  password: string;
};

const initialPasswordForm: PasswordForm = {
  confirmPassword: "",
  password: "",
};

const resetStorageKey = "pearlPasswordResetLoginPath";

function getReturnPath() {
  if (typeof window === "undefined") {
    return "/patient/login";
  }

  const storedPath = window.localStorage.getItem(resetStorageKey);

  if (storedPath === "/admin/login" || storedPath === "/patient/login") {
    return storedPath;
  }

  return "/patient/login";
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [passwordForm, setPasswordForm] =
    useState<PasswordForm>(initialPasswordForm);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setPasswordForm((currentForm) => ({
      ...currentForm,
      [name as keyof PasswordForm]: value,
    }));
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (passwordForm.password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    if (passwordForm.password !== passwordForm.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.auth.updateUser({
      password: passwordForm.password,
    });

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    const returnPath = getReturnPath();
    window.localStorage.removeItem(resetStorageKey);
    setPasswordForm(initialPasswordForm);
    setSuccessMessage("Your password has been updated. Redirecting to login...");
    void supabase.auth.signOut();

    window.setTimeout(() => {
      router.replace(returnPath);
    }, 1400);
  };

  return (
    <AuthPanelLayout
      title="Reset Password"
      description="Choose a new password for your Pearl Dental Clinic account. For your privacy, use a password you have not used elsewhere."
    >
      <form onSubmit={handlePasswordSubmit} className="grid gap-5">
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
          New Password
          <input
            required
            minLength={8}
            name="password"
            value={passwordForm.password}
            onChange={handlePasswordChange}
            className="mt-2 w-full rounded-xl border border-[rgba(201,168,106,0.22)] bg-[#F8F5EF] px-4 py-3 text-[#24302F] outline-none transition focus:border-[#C9A86A] focus:bg-white focus:ring-4 focus:ring-[#C9A86A]/15"
            placeholder="Enter new password"
            type="password"
          />
        </label>

        <label className="block text-sm font-semibold text-slate-700">
          Confirm Password
          <input
            required
            minLength={8}
            name="confirmPassword"
            value={passwordForm.confirmPassword}
            onChange={handlePasswordChange}
            className="mt-2 w-full rounded-xl border border-[rgba(201,168,106,0.22)] bg-[#F8F5EF] px-4 py-3 text-[#24302F] outline-none transition focus:border-[#C9A86A] focus:bg-white focus:ring-4 focus:ring-[#C9A86A]/15"
            placeholder="Confirm new password"
            type="password"
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting || Boolean(successMessage)}
          className="pearl-cta-primary text-base disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Updating Password" : "Update Password"}
        </button>
      </form>
    </AuthPanelLayout>
  );
}
