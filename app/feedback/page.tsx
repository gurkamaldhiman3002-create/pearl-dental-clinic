"use client";

import Link from "next/link";
import { type ChangeEvent, type FormEvent, useState } from "react";
import RatingStars from "@/app/components/feedback/RatingStars";
import { clinicInformation, treatmentOptions } from "@/app/lib/clinicContent";
import { getErrorMessage } from "@/app/lib/errors";
import { submitPatientFeedback } from "@/app/services/feedbackApi";
import type { PatientFeedbackSubmission } from "@/app/types/feedback";

const successMessage =
  "Thank you for sharing your experience. Your feedback may be displayed after review.";

const initialFeedbackForm: PatientFeedbackSubmission = {
  feedback: "",
  name: "",
  rating: 0,
  treatment: "",
};

export default function FeedbackPage() {
  const [feedbackForm, setFeedbackForm] =
    useState<PatientFeedbackSubmission>(initialFeedbackForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedbackChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;

    setFeedbackForm((currentForm) => ({
      ...currentForm,
      [name as keyof PatientFeedbackSubmission]: value,
    }));
  };

  const handleRatingChange = (rating: number) => {
    setFeedbackForm((currentForm) => ({
      ...currentForm,
      rating,
    }));
  };

  const handleFeedbackSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (feedbackForm.rating < 1) {
      setFormError("Please choose a rating before sending your feedback.");
      return;
    }

    setIsSubmitting(true);

    try {
      await submitPatientFeedback(feedbackForm);
      setFeedbackForm(initialFeedbackForm);
      setFormSuccess(successMessage);
    } catch (error) {
      setFormError(
        getErrorMessage(
          error,
          "We could not save your feedback. Please try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="pearl-editorial pearl-portal min-h-screen text-[#303937]">
      <section className="relative isolate overflow-hidden border-b border-[#eadfcf] px-6 py-16 lg:px-8 lg:py-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,#f1e2c7,transparent_32%),linear-gradient(135deg,#fffdf9_0%,#fbf8f1_48%,#e8eee7_100%)]" />
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase text-[#86632f]">
              Tell us about your visit
            </p>
            <h1 className="text-5xl leading-tight text-[#183f41] sm:text-6xl">
              Your experience helps us care a little better.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              If you visited {clinicInformation.name}, Dr. Virdy would be
              grateful to hear how it felt. A few honest words from patients
              help nearby families feel more comfortable before they walk in.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/#booking"
                className="rounded-full bg-[#205356] px-6 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-[#183f41]/15 transition hover:bg-[#183f41]"
              >
                Book Appointment
              </Link>
              <Link
                href="/#contact"
                className="rounded-full border border-[#dbc59b] bg-[#fffdf9] px-6 py-3 text-center text-sm font-semibold text-[#23575a] transition hover:border-[#c7a464] hover:bg-[#f5efe4]"
              >
                Contact Clinic
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#eadfcf] bg-[#fffdf9]/92 p-6 shadow-2xl shadow-[#183f41]/10 backdrop-blur md:p-8">
            <form onSubmit={handleFeedbackSubmit} className="grid gap-5">
              {formSuccess ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
                  {formSuccess}
                </div>
              ) : null}

              {formError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
                  {formError}
                </div>
              ) : null}

              <label className="block text-sm font-semibold text-slate-700">
                Name
                <input
                  required
                  name="name"
                  value={feedbackForm.name}
                  onChange={handleFeedbackChange}
                  className="mt-2 w-full rounded-xl border border-[#eadfcf] bg-[#f8f3ea] px-4 py-3 text-slate-900 outline-none transition focus:border-[#347376] focus:bg-[#fffdf9] focus:ring-4 focus:ring-[#205356]/15"
                  placeholder="Your name"
                  type="text"
                />
              </label>

              <fieldset>
                <legend className="text-sm font-semibold text-slate-700">
                  Rating out of 5 stars
                </legend>
                <div className="mt-2 flex flex-wrap items-center gap-2 rounded-xl border border-[#eadfcf] bg-[#f8f3ea] p-3">
                  {Array.from({ length: 5 }, (_, index) => {
                    const rating = index + 1;

                    return (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => handleRatingChange(rating)}
                        className={`flex h-11 w-11 items-center justify-center rounded-full text-2xl transition ${
                          rating <= feedbackForm.rating
                            ? "bg-[#f1e3c7] text-[#b38235] shadow-sm"
                            : "text-[#b9aa91] hover:bg-[#f5efe4] hover:text-[#86632f]"
                        }`}
                        aria-label={`${rating} out of 5 stars`}
                      >
                        <span aria-hidden="true">&#9733;</span>
                      </button>
                    );
                  })}
                  <span className="ml-1 text-sm font-semibold text-[#66706c]">
                    {feedbackForm.rating
                      ? `${feedbackForm.rating}/5`
                      : "Choose a rating"}
                  </span>
                </div>
              </fieldset>

              <label className="block text-sm font-semibold text-slate-700">
                Treatment received
                <div className="relative mt-2">
                  <select
                    required
                    name="treatment"
                    value={feedbackForm.treatment}
                    onChange={handleFeedbackChange}
                    className={`w-full cursor-pointer appearance-none rounded-xl border border-[#eadfcf] bg-[#f8f3ea] px-4 py-3 pr-12 outline-none transition focus:border-[#347376] focus:bg-[#fffdf9] focus:ring-4 focus:ring-[#205356]/15 ${
                      feedbackForm.treatment
                        ? "text-slate-900"
                        : "text-slate-500"
                    }`}
                  >
                    <option value="" disabled>
                      Choose a treatment
                    </option>
                    {treatmentOptions.map((treatment) => (
                      <option
                        key={treatment}
                        value={treatment}
                        className="text-slate-900"
                      >
                        {treatment}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#23575a]">
                    v
                  </span>
                </div>
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Feedback
                <textarea
                  required
                  name="feedback"
                  value={feedbackForm.feedback}
                  onChange={handleFeedbackChange}
                  className="mt-2 min-h-36 w-full resize-y rounded-xl border border-[#eadfcf] bg-[#f8f3ea] px-4 py-3 text-slate-900 outline-none transition focus:border-[#347376] focus:bg-[#fffdf9] focus:ring-4 focus:ring-[#205356]/15"
                  placeholder="Share a few words about your visit."
                />
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-[#205356] px-7 py-3 text-base font-semibold text-white shadow-lg shadow-[#183f41]/15 transition hover:bg-[#183f41] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Sending Feedback" : "Share Feedback"}
              </button>

              <div className="flex items-center justify-between gap-4 border-t border-[#eee2cf] pt-4 text-sm text-slate-600">
                <span>Feedback is reviewed before it appears online.</span>
                <RatingStars rating={feedbackForm.rating || 5} />
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
