"use client";

import Image from "next/image";
import Link from "next/link";
import { type ChangeEvent, type FormEvent, useState } from "react";
import ServiceIcon from "@/app/components/home/ServiceIcon";
import {
  clinicHours,
  clinicInformation,
  familyReasons,
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
    <main className="pearl-editorial overflow-hidden bg-[#fbf8f1] text-[#303937]">
      <section
        id="home"
        className="group relative isolate overflow-hidden border-b border-[#e7dccb] bg-gradient-to-br from-[#fffdf9] via-[#faf4e9] to-[#e8eee7]"
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
          <div className="absolute inset-0 bg-gradient-to-t from-[#183f41]/25 via-transparent to-[#fffdf9]/15 md:bg-gradient-to-l md:from-transparent md:to-[#faf4e9]/75" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#fffdf9] via-[#fffdf9]/95 to-[#fffdf9]/45 md:via-[#fffdf9]/90 md:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#f7efe1]/75 via-transparent to-[#fffdf9]/40" />

        <div className="relative mx-auto flex min-h-[38rem] max-w-7xl items-center px-6 py-16 lg:min-h-[43rem] lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#dbc59b] bg-[#fffdf9]/85 px-4 py-2 text-sm font-semibold text-[#23575a] shadow-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[#ba9250]" />
              Sarabha Nagar, Patiala
            </p>
            <h1 className="max-w-xl text-5xl leading-[1.06] text-[#183f41] sm:text-6xl lg:text-7xl">
              Come in, ask your questions, and let us care for your smile.
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-8 text-[#5d6865]">
              I know a dental visit can feel worrying. I take time to listen,
              explain things clearly, and care for each patient as someone I
              hope to see for years to come.
            </p>
            <p className="mt-5 text-sm font-semibold text-[#23575a]">
              Dr. Sukhpreet Virdy, B.D.S. | Pearl Dental Clinic
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/#booking"
                className="inline-flex items-center justify-center rounded-full bg-[#205356] px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#183f41]/15 transition hover:bg-[#173f41] hover:shadow-xl"
              >
                Request an Appointment
              </Link>
              <Link
                href="/patient/dashboard"
                className="inline-flex items-center justify-center rounded-full border border-[#dbc59b] bg-[#fffdf9]/80 px-7 py-3.5 text-base font-semibold text-[#23575a] backdrop-blur transition hover:border-[#ba9250] hover:bg-[#fffdf9]"
              >
                View My Appointments
              </Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-sm font-medium text-[#66706c]">
              <span className="flex items-center gap-2">
                <span className="text-[#86632f]">+</span> Families welcome
              </span>
              <span className="flex items-center gap-2">
                <span className="text-[#86632f]">+</span> Monday - Saturday
              </span>
              <span className="flex items-center gap-2">
                <span className="text-[#86632f]">+</span> Patiala, Punjab
              </span>
            </div>
          </div>
          <div className="absolute bottom-8 right-8 hidden rounded-2xl border border-[#e5d6bd] bg-[#fffdf9]/92 px-7 py-5 shadow-xl shadow-[#183f41]/10 backdrop-blur md:block">
            <p className="pearl-handwritten text-3xl text-[#23575a]">
              My care... your smile
            </p>
            <p className="mt-1 text-sm font-medium text-[#66706c]">
              - Dr. Sukhpreet Virdy
            </p>
          </div>
        </div>
      </section>

      <section aria-label="Patient trust highlights" className="px-6 py-10 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {trustBadges.map((badge) => (
            <article
              key={badge.title}
              className="group rounded-2xl border border-[#ecdfcc] bg-[#fffdf9] p-5 shadow-sm shadow-[#183f41]/5 transition hover:-translate-y-0.5 hover:border-[#dcc495] hover:shadow-lg hover:shadow-[#183f41]/5"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f4ebdb] text-[#23575a] transition group-hover:bg-[#205356] group-hover:text-white">
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
          <div className="group overflow-hidden rounded-3xl border border-[#eadfcf] bg-[#fffdf9] p-5 shadow-xl shadow-[#183f41]/5">
            <div className="relative aspect-[504/449] overflow-hidden rounded-2xl bg-[#f4ebdb]">
              <Image
                src="/images/dentist-photo.jpeg"
                alt="Dr. Sukhpreet Virdy at Pearl Dental Clinic"
                fill
                sizes="(max-width: 1023px) 100vw, 38vw"
                className="object-cover transition duration-700 ease-out group-hover:scale-[1.035]"
              />
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#183f41]/35 to-transparent" />
            </div>
            <div className="mt-5 flex items-start justify-between gap-4 rounded-2xl bg-[#f5efe4] p-4">
              <div>
                <p className="pearl-serif text-xl text-[#183f41]">
                  {clinicInformation.dentistName}
                </p>
                <p className="mt-1 text-sm text-[#66706c]">
                  Bachelor of Dental Surgery
                </p>
              </div>
              <span className="rounded-full bg-[#fffdf9] px-3 py-1 text-xs font-bold text-[#23575a] shadow-sm">
                B.D.S.
              </span>
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold uppercase text-[#86632f]">
              Meet your dentist
            </p>
            <h2 className="text-4xl text-[#183f41] sm:text-5xl">
              Hello, I am Dr. Sukhpreet Virdy.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              For me, dentistry begins with listening. The most meaningful
              part of my work is earning the trust of families who return,
              bring their children, and recommend someone they care about.
            </p>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              I understand that many patients walk in feeling unsure or
              nervous. I will explain what I see in plain language, answer
              your questions, and help you feel comfortable before we decide
              on the next step together.
            </p>
            <div className="mt-8 flex flex-col gap-5 rounded-2xl border border-[#eadfcf] bg-[#fffdf9] p-4 shadow-sm sm:flex-row sm:items-center">
              <figure className="group relative aspect-[1.42/1] w-full shrink-0 overflow-hidden rounded-xl bg-[#f5efe4] sm:w-56">
                <Image
                  alt={`${clinicInformation.qualification} degree certificate for ${clinicInformation.dentistName}`}
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  fill
                  sizes="(max-width: 639px) 100vw, 224px"
                  src={clinicInformation.degreeImagePath}
                />
              </figure>
              <div>
                <p className="text-xs font-semibold uppercase text-[#86632f]">
                  My qualification
                </p>
                <p className="pearl-serif mt-2 text-2xl text-[#183f41]">
                  {clinicInformation.qualification}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  I display my degree here because your trust in your dentist
                  matters.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-label="Pearl Dental Clinic gallery"
        className="border-y border-[#e8dcc8] bg-[#f5efe4]/60 px-6 py-16 lg:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="mb-3 text-sm font-semibold uppercase text-[#86632f]">
                Our clinic
              </p>
              <h2 className="text-4xl text-[#183f41] sm:text-5xl">
                A small clinic, prepared with care.
              </h2>
            </div>
            <p className="max-w-md text-base leading-7 text-slate-600">
              Our reception and treatment room are kept simple, clean, and
              ready for families visiting us in Patiala.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <figure className="group relative aspect-[4/3] overflow-hidden rounded-3xl border border-[#eadfcf] bg-[#fffdf9] shadow-xl shadow-[#183f41]/[0.08]">
              <Image
                src="/images/reception.jpeg"
                alt="Reception desk at Pearl Dental Clinic"
                fill
                sizes="(max-width: 767px) 100vw, 50vw"
                className="object-cover object-center transition duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#183f41]/70 via-[#183f41]/5 to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="pearl-serif text-2xl">Reception</p>
                <p className="mt-1 text-sm text-[#eee6da]">
                  A familiar welcome when you arrive.
                </p>
              </figcaption>
            </figure>
            <figure className="group relative aspect-[4/3] overflow-hidden rounded-3xl border border-[#eadfcf] bg-[#fffdf9] shadow-xl shadow-[#183f41]/[0.08] md:translate-y-8">
              <Image
                src="/images/treatment-room.jpeg"
                alt="Dental treatment room with modern clinical equipment"
                fill
                sizes="(max-width: 767px) 100vw, 50vw"
                className="object-cover object-center transition duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#183f41]/70 via-[#183f41]/5 to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="pearl-serif text-2xl">Treatment Room</p>
                <p className="mt-1 text-sm text-[#eee6da]">
                  A calm space for your dental visit.
                </p>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section id="services" className="bg-[#fffdf9] px-6 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="mb-3 text-sm font-semibold uppercase text-[#86632f]">
                Treatments we offer
              </p>
              <h2 className="text-4xl text-[#183f41] sm:text-5xl">
                Care for everyday visits and the days your tooth cannot wait.
              </h2>
            </div>
            <p className="max-w-md text-base leading-7 text-slate-600">
              From a routine cleaning to relief for a painful tooth, we will
              explain your options before deciding anything together.
            </p>
          </div>

          <div className="mt-11 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.title}
                className="group relative overflow-hidden rounded-2xl border border-[#eadfcf] bg-[#fffdf9] p-6 shadow-sm shadow-[#183f41]/[0.04] transition duration-300 hover:-translate-y-1 hover:border-[#dcc495] hover:shadow-xl hover:shadow-[#183f41]/[0.07]"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#d6bc86] via-[#438080] to-[#1e5053] opacity-0 transition duration-300 group-hover:opacity-100" />
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-[#eadabb] bg-[#f5efe4] text-[#23575a] transition duration-300 group-hover:border-[#205356] group-hover:bg-[#205356] group-hover:text-white">
                  <ServiceIcon type={service.icon} />
                </div>
                <h3 className="text-2xl text-[#183f41]">
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

      <section className="border-y border-[#e8dcc8] bg-[#f5efe4]/55 px-6 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase text-[#86632f]">
              A clinic built on trust
            </p>
            <h2 className="text-4xl text-[#183f41] sm:text-5xl">
              Why families keep coming back
            </h2>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {familyReasons.map((reason, index) => (
              <article
                key={reason.title}
                className="rounded-2xl border border-[#e7d9c4] bg-[#fffdf9] p-7 shadow-sm shadow-[#183f41]/5"
              >
                <p className="pearl-serif text-4xl text-[#bc9452]">
                  0{index + 1}
                </p>
                <h3 className="mt-5 text-2xl text-[#183f41]">
                  {reason.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {reason.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase text-[#86632f]">
              Kind words from nearby families
            </p>
            <h2 className="text-4xl text-[#183f41] sm:text-5xl">
              The kind of trust we value most.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <figure
                key={testimonial.patient}
                className="rounded-2xl border border-[#eadfcf] bg-[#fffdf9] p-7 shadow-sm shadow-[#183f41]/5"
              >
                <span className="pearl-serif block text-6xl leading-none text-[#c1a060]">
                  &ldquo;
                </span>
                <blockquote className="-mt-2 text-base leading-7 text-slate-700">
                  {testimonial.quote}
                </blockquote>
                <figcaption className="mt-6 border-t border-[#eee2cf] pt-4">
                  <p className="font-semibold text-[#183f41]">
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

      <section id="booking" className="bg-[#fffdf9] px-6 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <p className="mb-3 text-sm font-semibold uppercase text-[#86632f]">
              Book a visit
            </p>
            <h2 className="text-4xl text-[#183f41] sm:text-5xl">
              Tell us when you would like to come in.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Share what you need help with and a preferred time in{" "}
              {clinicInformation.timeZoneLabel}. We will check the clinic
              diary and get back to you by email.
            </p>
            <div className="mt-8 grid gap-3">
              {["Send your request", "We check the available time", "We confirm your visit"].map(
                (step, index) => (
                  <div
                    key={step}
                    className="flex items-center gap-4 rounded-2xl border border-[#eadfcf] bg-[#f8f2e8] p-4"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#205356] text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <p className="text-sm font-semibold text-blue-950">{step}</p>
                  </div>
                ),
              )}
            </div>
            {submittedBooking ? (
              <div className="mt-8 rounded-2xl border border-[#dbc59b] bg-[#f5efe4] p-5 text-[#183f41]">
                <p className="font-semibold">We have received your request.</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Thank you, {submittedBooking.fullName}. We will check
                  availability for {submittedBooking.treatment.toLowerCase()}{" "}
                  and contact you shortly.
                </p>
              </div>
            ) : null}
            {bookingError ? (
              <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-5 text-red-900">
                <p className="font-bold">We could not send your request.</p>
                <p className="mt-2 text-sm leading-6 text-red-700">
                  {bookingError}
                </p>
              </div>
            ) : null}
          </div>

          <form
            onSubmit={handleBookingSubmit}
            className="grid gap-5 rounded-3xl border border-[#eadfcf] bg-[#fffdf9] p-6 shadow-xl shadow-[#183f41]/[0.06] sm:grid-cols-2 md:p-8"
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
                placeholder="Tell us if you are nervous, in discomfort, or have a preferred time."
              />
            </label>

            <button
              suppressHydrationWarning
              type="submit"
              disabled={isSubmittingBooking}
              className="rounded-full bg-blue-700 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 disabled:cursor-wait disabled:opacity-70 sm:col-span-2"
            >
              {isSubmittingBooking
                ? "Sending Request"
                : "Send Appointment Request"}
            </button>
          </form>
        </div>
      </section>

      <section className="px-6 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="rounded-3xl bg-[#183f41] p-7 text-white shadow-xl shadow-[#183f41]/15 md:p-8">
            <p className="text-sm font-semibold uppercase text-[#dfc58c]">
              Clinic hours ({clinicInformation.timeZoneLabel})
            </p>
            <h2 className="mt-3 text-4xl text-white">When you can visit</h2>
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
              If you are in discomfort or worried about a tooth, call us and
              we will guide you on arranging a visit.
            </p>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold uppercase text-[#86632f]">
              Questions patients often ask
            </p>
            <h2 className="text-4xl text-[#183f41]">
              It is all right to feel unsure.
            </h2>
            <div className="mt-7 grid gap-3">
              {frequentlyAskedQuestions.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-2xl border border-[#eadfcf] bg-[#fffdf9] px-5 py-4 shadow-sm open:border-[#dcc495] open:shadow-md"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-blue-950">
                    {item.question}
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f5efe4] text-[#23575a] transition group-open:rotate-45">
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

      <section id="contact" className="bg-[#fffdf9] px-6 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl overflow-hidden rounded-3xl border border-[#d8c59e] bg-gradient-to-r from-[#183f41] to-[#23575a] text-white shadow-xl shadow-[#183f41]/15 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-8 md:p-12">
            <p className="mb-3 text-sm font-semibold uppercase text-[#dfc58c]">
              Visit or speak with us
            </p>
            <h2 className="text-4xl text-white sm:text-5xl">
              We are here when your family needs dental care.
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-8 text-blue-100">
              Call or send a WhatsApp message to ask about an appointment. You
              will be speaking with a local clinic in Patiala, not a call
              centre.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={clinicInformation.whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-[#d8bb7d] px-6 py-3.5 font-semibold text-[#183f41] transition hover:bg-[#e3cb98]"
              >
                WhatsApp the Clinic
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
            <p className="pearl-serif text-3xl text-[#e5cb94]">
              {clinicInformation.name}
            </p>
            <div className="mt-5 text-sm leading-6 text-blue-100">
              {clinicInformation.addressLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <p className="mt-3 text-sm text-blue-100">
              Monday - Saturday visits ({clinicInformation.timeZoneLabel})
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
            <div className="mt-7 overflow-hidden rounded-2xl border border-white/15 bg-white">
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
