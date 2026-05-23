"use client";

import Image from "next/image";
import Link from "next/link";
import { type ChangeEvent, type FormEvent, useState } from "react";
import ServiceIcon from "@/app/components/home/ServiceIcon";
import {
  certifications,
  clinicHours,
  clinicInformation,
  frequentlyAskedQuestions,
  services,
  testimonials,
  trustBadges,
} from "@/app/lib/clinicContent";
import { getErrorMessage } from "@/app/lib/errors";
import {
  formatIndianPhoneInput,
  getIndianPhoneValidationMessage,
  indianMobileExample,
  indianMobilePattern,
  normalizeIndianPhone,
} from "@/app/lib/indianPhone";
import { supabase } from "@/app/lib/supabase";
import { submitAppointmentRequest } from "@/app/services/appointmentApi";
import type { BookingForm } from "@/app/types/appointments";

const initialBookingForm: BookingForm = {
  fullName: "",
  email: "",
  phone: "",
  treatment: "",
  preferredDate: "",
  preferredTime: "",
  notes: "",
};

export default function Home() {
  const [bookingForm, setBookingForm] =
    useState<BookingForm>(initialBookingForm);
  const [submittedBooking, setSubmittedBooking] = useState<BookingForm | null>(
    null,
  );
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [phoneValidationMessage, setPhoneValidationMessage] = useState<
    string | null
  >(null);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  const handleBookingChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = event.target;
    const nextValue = name === "phone" ? formatIndianPhoneInput(value) : value;

    if (name === "phone") {
      event.target.setCustomValidity("");
      setPhoneValidationMessage(null);
    }

    setBookingForm((currentForm) => ({
      ...currentForm,
      [name as keyof BookingForm]: nextValue,
    }));
  };

  const validateBookingPhone = (phone: string) => {
    const message = getIndianPhoneValidationMessage(phone);
    setPhoneValidationMessage(message);
    return message;
  };

  const handleBookingSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedPhone = normalizeIndianPhone(bookingForm.phone);

    if (!normalizedPhone) {
      validateBookingPhone(bookingForm.phone);
      return;
    }

    setBookingError(null);
    setSubmittedBooking(null);
    setIsSubmittingBooking(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const appointment = {
      full_name: bookingForm.fullName,
      email: bookingForm.email,
      phone: normalizedPhone,
      treatment: bookingForm.treatment,
      preferred_date: bookingForm.preferredDate,
      preferred_time: bookingForm.preferredTime,
      notes: bookingForm.notes,
      status: "pending" as const,
    };

    try {
      await submitAppointmentRequest(appointment, session?.access_token);
      setSubmittedBooking(bookingForm);
      setBookingForm(initialBookingForm);
      setPhoneValidationMessage(null);
    } catch (error) {
      setBookingError(
        getErrorMessage(
          error,
          "We could not submit your appointment request. Please try again.",
        ),
      );
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  return (
    <main className="overflow-hidden bg-[#f5fbff] text-slate-900">
      <section
        id="home"
        className="group relative isolate overflow-hidden border-b border-sky-100 bg-gradient-to-br from-white via-cyan-50 to-sky-100"
      >
        <div className="absolute inset-y-0 right-0 w-full md:w-[48%] lg:w-[46%]">
          <Image
            src="/images/clinic-front.jpeg"
            alt="Exterior entrance of Pearl Dental Clinic"
            fill
            priority
            sizes="(max-width: 767px) 100vw, 48vw"
            className="object-cover object-center transition duration-1000 ease-out group-hover:scale-[1.025] md:object-contain md:object-right"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-950/20 via-transparent to-white/15 md:bg-gradient-to-l md:from-transparent md:to-cyan-50/70" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/45 md:via-white/90 md:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-50/75 via-transparent to-white/40" />

        <div className="relative mx-auto flex min-h-[34rem] max-w-7xl items-center px-6 py-16 lg:min-h-[38rem] lg:px-8">
          <div className="max-w-xl">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/85 px-4 py-2 text-sm font-semibold text-blue-800 shadow-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-cyan-500" />
              {clinicInformation.slogan}
            </p>
            <h1 className="text-4xl font-bold leading-tight text-blue-950 sm:text-5xl lg:text-6xl">
              {clinicInformation.name}
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
              Professional dental care in Patiala led by{" "}
              {clinicInformation.dentistName}, with thoughtful treatment
              planning for healthier, confident smiles.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/#booking"
                className="inline-flex items-center justify-center rounded-full bg-blue-700 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 hover:shadow-xl"
              >
                Book Appointment
              </Link>
              <Link
                href="/patient/dashboard"
                className="inline-flex items-center justify-center rounded-full border border-blue-200 bg-white/80 px-7 py-3.5 text-base font-semibold text-blue-800 backdrop-blur transition hover:border-sky-400 hover:bg-white"
              >
                View My Appointments
              </Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-sm font-medium text-slate-600">
              <span className="flex items-center gap-2">
                <span className="text-cyan-600">+</span> Mon - Sat care
              </span>
              <span className="flex items-center gap-2">
                <span className="text-cyan-600">+</span> Digital diagnostics
              </span>
              <span className="flex items-center gap-2">
                <span className="text-cyan-600">+</span> Clear approvals
              </span>
            </div>
          </div>
          <div className="absolute bottom-8 right-8 hidden rounded-lg border border-white/70 bg-white/90 px-5 py-4 shadow-xl shadow-blue-950/10 backdrop-blur md:block">
            <p className="text-xs font-bold uppercase tracking-[0.17em] text-sky-600">
              Visit our clinic
            </p>
            <p className="mt-2 text-sm font-semibold text-blue-950">
              Modern care in a welcoming setting
            </p>
          </div>
        </div>
      </section>

      <section aria-label="Patient trust highlights" className="px-6 py-10 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {trustBadges.map((badge) => (
            <article
              key={badge.title}
              className="group rounded-lg border border-sky-100 bg-white p-5 shadow-sm shadow-blue-950/5 transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-lg hover:shadow-blue-950/5"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-blue-700 transition group-hover:bg-blue-700 group-hover:text-white">
                  <ServiceIcon type={badge.icon} />
                </span>
                <div>
                  <h2 className="font-bold text-blue-950">{badge.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {badge.description}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="about" className="px-6 py-14 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
          <div className="group overflow-hidden rounded-lg border border-sky-100 bg-white p-5 shadow-xl shadow-blue-950/5">
            <div className="relative aspect-[504/449] overflow-hidden rounded-lg bg-cyan-50">
              <Image
                src="/images/dentist-photo.jpeg"
                alt="Dentist at Pearl Dental Clinic"
                fill
                sizes="(max-width: 1023px) 100vw, 38vw"
                className="object-cover transition duration-700 ease-out group-hover:scale-[1.035]"
              />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-blue-950/25 to-transparent" />
            </div>
            <div className="mt-5 flex items-start justify-between gap-4 rounded-lg bg-sky-50 p-4">
              <div>
                <p className="font-bold text-blue-950">Clinic Dentist</p>
                <p className="mt-1 text-sm text-slate-600">
                  {clinicInformation.dentistName}
                </p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-blue-700 shadow-sm">
                B.D.S.
              </span>
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-sky-600">
              Clinical expertise
            </p>
            <h2 className="text-3xl font-bold text-blue-950 sm:text-4xl">
              Qualified dental care with professional attention.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              {clinicInformation.dentistName} holds a{" "}
              {clinicInformation.qualification}. Our clinic supports each
              treatment plan with clear communication and a comfort-focused
              patient experience.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {certifications.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-lg border border-sky-100 bg-white p-4 text-sm font-semibold text-slate-700 shadow-sm"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-xs text-blue-700">
                    +
                  </span>
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-7 flex flex-col gap-5 rounded-lg border border-sky-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
              <figure className="group relative aspect-[1.42/1] w-full shrink-0 overflow-hidden rounded-lg bg-slate-50 sm:w-56">
                <Image
                  alt={`${clinicInformation.qualification} degree certificate for ${clinicInformation.dentistName}`}
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  fill
                  sizes="(max-width: 639px) 100vw, 224px"
                  src={clinicInformation.degreeImagePath}
                />
              </figure>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-600">
                  Professional qualification
                </p>
                <p className="mt-2 font-bold text-blue-950">
                  {clinicInformation.qualification}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Degree credential displayed for patient confidence and
                  transparent care.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-label="Pearl Dental Clinic gallery"
        className="border-y border-sky-100 bg-cyan-50/45 px-6 py-16 lg:px-8 lg:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-sky-600">
                Our clinic
              </p>
              <h2 className="text-3xl font-bold text-blue-950 sm:text-4xl">
                A prepared space for comfortable care.
              </h2>
            </div>
            <p className="max-w-md text-base leading-7 text-slate-600">
              From arrival to treatment, our clinical spaces are arranged for
              focused, efficient appointments.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <figure className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-white bg-white shadow-xl shadow-blue-950/[0.08]">
              <Image
                src="/images/reception.jpeg"
                alt="Reception desk at Pearl Dental Clinic"
                fill
                sizes="(max-width: 767px) 100vw, 50vw"
                className="object-cover object-center transition duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-950/65 via-blue-950/5 to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="text-lg font-bold">Reception</p>
                <p className="mt-1 text-sm text-blue-100">
                  A straightforward welcome and check-in experience.
                </p>
              </figcaption>
            </figure>
            <figure className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-white bg-white shadow-xl shadow-blue-950/[0.08]">
              <Image
                src="/images/treatment-room.jpeg"
                alt="Dental treatment room with modern clinical equipment"
                fill
                sizes="(max-width: 767px) 100vw, 50vw"
                className="object-cover object-center transition duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-950/65 via-blue-950/5 to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="text-lg font-bold">Treatment Room</p>
                <p className="mt-1 text-sm text-blue-100">
                  Modern equipment for precise everyday dentistry.
                </p>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section id="services" className="bg-white px-6 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-sky-600">
                Services
              </p>
              <h2 className="text-3xl font-bold text-blue-950 sm:text-4xl">
                Precision treatment for complete smile care.
              </h2>
            </div>
            <p className="max-w-md text-base leading-7 text-slate-600">
              Preventive, restorative, and cosmetic care delivered with
              contemporary diagnostics and a comfort-first approach.
            </p>
          </div>

          <div className="mt-11 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.title}
                className="group relative overflow-hidden rounded-lg border border-sky-100 bg-white p-6 shadow-sm shadow-blue-950/[0.04] transition duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-xl hover:shadow-blue-950/[0.07]"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-300 via-sky-500 to-blue-700 opacity-0 transition duration-300 group-hover:opacity-100" />
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-lg border border-cyan-100 bg-cyan-50 text-blue-700 transition duration-300 group-hover:border-blue-700 group-hover:bg-blue-700 group-hover:text-white">
                  <ServiceIcon type={service.icon} />
                </div>
                <h3 className="text-lg font-bold text-blue-950">
                  {service.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {service.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-sky-600">
              Patient feedback
            </p>
            <h2 className="text-3xl font-bold text-blue-950 sm:text-4xl">
              A reassuring experience from booking to care.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <figure
                key={testimonial.patient}
                className="rounded-lg border border-sky-100 bg-white p-6 shadow-sm shadow-blue-950/5"
              >
                <div
                  className="flex gap-1.5"
                  aria-label="5 out of 5 rating"
                >
                  {Array.from({ length: 5 }).map((_, index) => (
                    <span
                      key={index}
                      className="h-2.5 w-2.5 rounded-full bg-cyan-400"
                    />
                  ))}
                </div>
                <blockquote className="mt-5 text-base leading-7 text-slate-700">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 border-t border-sky-50 pt-4">
                  <p className="font-bold text-blue-950">
                    {testimonial.patient}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {testimonial.treatment}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="booking" className="bg-white px-6 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-sky-600">
              Book a visit
            </p>
            <h2 className="text-3xl font-bold text-blue-950 sm:text-4xl">
              Request an appointment in a few simple steps.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Choose your treatment and preferred time in{" "}
              {clinicInformation.timeZoneLabel}. Our team will review your
              request and email your appointment status.
            </p>
            <div className="mt-8 grid gap-3">
              {["Submit your request", "Our team reviews availability", "Receive your status update"].map(
                (step, index) => (
                  <div
                    key={step}
                    className="flex items-center gap-4 rounded-lg border border-sky-100 bg-cyan-50/50 p-4"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <p className="text-sm font-semibold text-blue-950">{step}</p>
                  </div>
                ),
              )}
            </div>
            {submittedBooking ? (
              <div className="mt-8 rounded-lg border border-cyan-200 bg-cyan-50 p-5 text-blue-950">
                <p className="font-bold">Appointment request received.</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Thank you, {submittedBooking.fullName}. We will follow up
                  about {submittedBooking.treatment.toLowerCase()} at your
                  preferred time.
                </p>
              </div>
            ) : null}
            {bookingError ? (
              <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-5 text-red-900">
                <p className="font-bold">Appointment request failed.</p>
                <p className="mt-2 text-sm leading-6 text-red-700">
                  {bookingError}
                </p>
              </div>
            ) : null}
          </div>

          <form
            onSubmit={handleBookingSubmit}
            className="grid gap-5 rounded-lg border border-sky-100 bg-[#fbfeff] p-6 shadow-xl shadow-blue-950/[0.06] sm:grid-cols-2 md:p-8"
          >
            <label className="block text-sm font-semibold text-slate-700">
              Full Name
              <input
                suppressHydrationWarning
                required
                name="fullName"
                value={bookingForm.fullName}
                onChange={handleBookingChange}
                className="mt-2 w-full rounded-lg border border-sky-100 bg-white px-4 py-3 text-slate-900 outline-none transition hover:border-cyan-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                placeholder="Jane Smith"
                type="text"
              />
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Email
              <input
                suppressHydrationWarning
                required
                name="email"
                value={bookingForm.email}
                onChange={handleBookingChange}
                className="mt-2 w-full rounded-lg border border-sky-100 bg-white px-4 py-3 text-slate-900 outline-none transition hover:border-cyan-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                placeholder="jane@example.com"
                type="email"
              />
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Phone Number
              <input
                suppressHydrationWarning
                required
                name="phone"
                value={bookingForm.phone}
                onChange={handleBookingChange}
                onBlur={() => validateBookingPhone(bookingForm.phone)}
                onInvalid={(event) => {
                  const message =
                    getIndianPhoneValidationMessage(bookingForm.phone) ??
                    `Enter an Indian mobile number, for example ${indianMobileExample}.`;
                  event.currentTarget.setCustomValidity(message);
                  setPhoneValidationMessage(message);
                }}
                aria-describedby={
                  phoneValidationMessage ? "booking-phone-error" : undefined
                }
                aria-invalid={phoneValidationMessage ? true : undefined}
                autoComplete="tel"
                className={`mt-2 w-full rounded-lg border bg-white px-4 py-3 text-slate-900 outline-none transition focus:ring-4 ${
                  phoneValidationMessage
                    ? "border-red-300 hover:border-red-400 focus:border-red-500 focus:ring-red-100"
                    : "border-sky-100 hover:border-cyan-200 focus:border-blue-500 focus:ring-blue-100"
                }`}
                inputMode="tel"
                maxLength={15}
                pattern={indianMobilePattern}
                placeholder={indianMobileExample}
                title={`Enter an Indian mobile number in this format: ${indianMobileExample}`}
                type="tel"
              />
              {phoneValidationMessage ? (
                <p
                  className="mt-2 text-xs font-medium text-red-700"
                  id="booking-phone-error"
                >
                  {phoneValidationMessage}
                </p>
              ) : null}
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Select Treatment
              <div className="relative mt-2">
                <select
                  suppressHydrationWarning
                  required
                  name="treatment"
                  value={bookingForm.treatment}
                  onChange={handleBookingChange}
                  className={`peer w-full cursor-pointer appearance-none rounded-lg border border-sky-100 bg-white px-4 py-3 pr-12 text-sm outline-none transition hover:border-cyan-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${
                    bookingForm.treatment ? "text-slate-900" : "text-slate-500"
                  }`}
                >
                  <option value="" disabled>
                    Choose a treatment
                  </option>
                  {services.map((service) => (
                    <option
                      key={service.title}
                      value={service.title}
                      className="text-slate-900"
                    >
                      {service.title}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-blue-700">
                  v
                </span>
              </div>
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Preferred Date
              <input
                suppressHydrationWarning
                required
                name="preferredDate"
                value={bookingForm.preferredDate}
                onChange={handleBookingChange}
                className="mt-2 w-full rounded-lg border border-sky-100 bg-white px-4 py-3 text-slate-900 outline-none transition hover:border-cyan-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                type="date"
              />
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Preferred Time ({clinicInformation.timeZoneLabel})
              <input
                suppressHydrationWarning
                required
                name="preferredTime"
                value={bookingForm.preferredTime}
                onChange={handleBookingChange}
                className="mt-2 w-full rounded-lg border border-sky-100 bg-white px-4 py-3 text-slate-900 outline-none transition hover:border-cyan-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                type="time"
              />
            </label>

            <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">
              Notes
              <textarea
                suppressHydrationWarning
                name="notes"
                value={bookingForm.notes}
                onChange={handleBookingChange}
                className="mt-2 min-h-32 w-full resize-y rounded-lg border border-sky-100 bg-white px-4 py-3 text-slate-900 outline-none transition hover:border-cyan-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                placeholder="Share timing preferences or accessibility needs."
              />
            </label>

            <button
              suppressHydrationWarning
              type="submit"
              disabled={isSubmittingBooking}
              className="rounded-full bg-blue-700 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 disabled:cursor-wait disabled:opacity-70 sm:col-span-2"
            >
              {isSubmittingBooking
                ? "Submitting Appointment Request"
                : "Submit Appointment Request"}
            </button>
          </form>
        </div>
      </section>

      <section className="px-6 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="rounded-lg bg-blue-950 p-7 text-white shadow-xl shadow-blue-950/15 md:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-200">
              Clinic hours ({clinicInformation.timeZoneLabel})
            </p>
            <h2 className="mt-3 text-2xl font-bold">Plan your visit</h2>
            <div className="mt-7 space-y-4">
              {clinicHours.map((row) => (
                <div
                  key={`${row.day}-${row.hours}`}
                  className="flex items-center justify-between gap-4 border-b border-white/10 pb-4 text-sm"
                >
                  <span className="text-blue-100">{row.day}</span>
                  <span className="font-semibold text-white">{row.hours}</span>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm leading-6 text-blue-100">
              For urgent concerns, call the clinic directly so our team can
              guide your next step.
            </p>
          </div>

          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-sky-600">
              FAQ
            </p>
            <h2 className="text-3xl font-bold text-blue-950">
              Helpful answers before your visit.
            </h2>
            <div className="mt-7 grid gap-3">
              {frequentlyAskedQuestions.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-lg border border-sky-100 bg-white px-5 py-4 shadow-sm open:border-cyan-200 open:shadow-md"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-blue-950">
                    {item.question}
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-blue-700 transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 border-t border-sky-50 pt-4 text-sm leading-7 text-slate-600">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="bg-white px-6 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl overflow-hidden rounded-lg border border-sky-100 bg-gradient-to-r from-blue-950 to-blue-800 text-white shadow-xl shadow-blue-950/15 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-8 md:p-12">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-cyan-200">
              Contact our team
            </p>
            <h2 className="text-3xl font-bold sm:text-4xl">
              {clinicInformation.slogan}
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-8 text-blue-100">
              Request an appointment online, call our front desk, or start a
              WhatsApp conversation for scheduling assistance.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={clinicInformation.whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-6 py-3.5 font-semibold text-blue-950 transition hover:bg-cyan-300"
              >
                WhatsApp Our Team
              </a>
              <a
                href={clinicInformation.phoneHref}
                className="inline-flex items-center justify-center rounded-full border border-white/25 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10"
              >
                Call {clinicInformation.phoneDisplay}
              </a>
            </div>
          </div>
          <div className="border-t border-white/10 bg-white/5 p-8 md:p-12 lg:border-l lg:border-t-0">
            <p className="font-bold text-cyan-200">{clinicInformation.name}</p>
            <div className="mt-5 text-sm leading-6 text-blue-100">
              {clinicInformation.addressLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <p className="mt-3 text-sm text-blue-100">
              Monday - Saturday consultations ({clinicInformation.timeZoneLabel})
            </p>
            <div className="mt-7 space-y-2 text-sm">
              <a
                className="block font-semibold text-white transition hover:text-cyan-200"
                href={clinicInformation.phoneHref}
              >
                {clinicInformation.phoneDisplay}
              </a>
              <a
                className="block text-cyan-100 transition hover:text-white"
                href={clinicInformation.emailHref}
              >
                {clinicInformation.email}
              </a>
            </div>
            <div className="mt-7 overflow-hidden rounded-lg border border-white/15 bg-white">
              <iframe
                className="h-56 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={clinicInformation.mapEmbedUrl}
                title="Pearl Dental Clinic location map"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
