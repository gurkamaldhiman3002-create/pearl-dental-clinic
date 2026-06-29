"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import RatingStars from "@/app/components/feedback/RatingStars";
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
import { recoverFromInvalidRefreshToken } from "@/app/lib/authRecovery";
import { supabase } from "@/app/lib/supabase";
import { submitAppointmentRequest } from "@/app/services/appointmentApi";
import { fetchApprovedFeedback } from "@/app/services/feedbackApi";
import type { BookingForm } from "@/app/types/appointments";
import type { ApprovedPatientFeedback } from "@/app/types/feedback";

const initialBookingForm: BookingForm = {
  fullName: "",
  email: "",
  phone: "",
  treatment: "",
  preferredDate: "",
  preferredTime: "",
  notes: "",
};

const quickAccessCards = [
  {
    description: "Send your preferred date and treatment request.",
    href: "/#booking",
    icon: "approval",
    label: "Start here",
    title: "Book an Appointment",
  },
  {
    description: "See the dental care we offer for families in Patiala.",
    href: "/#services",
    icon: "equipment",
    label: "View care",
    title: "View Treatments",
  },
  {
    action: "chat",
    description: "Ask about timings, treatments, or how booking works.",
    icon: "gentle",
    label: "Open chat",
    title: "Talk to Clinic Assistant",
  },
  {
    description: "Share a kind note after your visit.",
    href: "/feedback",
    icon: "family",
    label: "Write review",
    title: "Leave Feedback",
  },
] as const;

function getShortFeedback(feedback: string) {
  const trimmedFeedback = feedback.trim();

  if (trimmedFeedback.length <= 150) {
    return trimmedFeedback;
  }

  return `${trimmedFeedback.slice(0, 147).trim()}...`;
}

export default function Home() {
  const router = useRouter();
  const [bookingForm, setBookingForm] =
    useState<BookingForm>(initialBookingForm);
  const [approvedFeedback, setApprovedFeedback] = useState<
    ApprovedPatientFeedback[]
  >([]);
  const [submittedBooking, setSubmittedBooking] = useState<BookingForm | null>(
    null,
  );
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [feedbackPreviewError, setFeedbackPreviewError] = useState<
    string | null
  >(null);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(true);
  const [phoneValidationMessage, setPhoneValidationMessage] = useState<
    string | null
  >(null);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadApprovedFeedback() {
      try {
        const feedback = await fetchApprovedFeedback();

        if (!isActive) {
          return;
        }

        setApprovedFeedback(feedback);
      } catch {
        if (!isActive) {
          return;
        }

        setFeedbackPreviewError(
          "We are gathering patient feedback for this page. Please check back soon.",
        );
      } finally {
        if (isActive) {
          setIsLoadingFeedback(false);
        }
      }
    }

    void loadApprovedFeedback();

    return () => {
      isActive = false;
    };
  }, []);

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
      error: sessionError,
    } = await supabase.auth.getSession();

    if (
      sessionError &&
      (await recoverFromInvalidRefreshToken(sessionError))
    ) {
      setIsSubmittingBooking(false);
      router.replace("/patient/login");
      return;
    }

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

  const openClinicAssistant = () => {
    window.dispatchEvent(new Event("pearl-chatbot:open"));
  };

  return (
    <main className="pearl-editorial pearl-page-gradient overflow-hidden text-[#1F2A27]">
      <section
        id="home"
        className="relative isolate overflow-hidden border-b border-[rgba(198,161,91,0.28)]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,214,163,0.20),transparent_28%),linear-gradient(125deg,#FFFCF7_0%,#F7F1E8_48%,#EFE4D4_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#F7F1E8] to-transparent" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:py-16 lg:min-h-[40rem] lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:px-8 lg:py-20">
          <div className="pearl-reveal max-w-xl">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[rgba(198,161,91,0.28)] bg-[#FFFCF7]/85 px-4 py-2 text-sm font-semibold text-[#063B35] shadow-sm shadow-[#063B35]/[0.04] backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[#C6A15B]" />
              Pearl Dental Clinic, Patiala
            </p>
            <h1 className="pearl-hero-title max-w-lg text-[#063B35]">
              Dental care that feels personal.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-8 text-[#6B746F] sm:text-lg">
              At Pearl Dental Clinic, we take time to listen, explain clearly,
              and make every visit feel calm and comfortable.
            </p>
            <div className="mt-6 w-fit rounded-[1.75rem] border border-[rgba(198,161,91,0.32)] bg-[#FFFCF7]/88 px-5 py-4 shadow-[0_24px_70px_rgba(6,59,53,0.10)] backdrop-blur">
              <p className="pearl-handwritten text-2xl leading-none text-[#063B35] sm:text-3xl">
                My care... your smile
              </p>
              <p className="mt-2 text-sm font-semibold text-[#6B746F]">
                - Dr. Sukhpreet Virdy, B.D.S.
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/#booking"
                className="pearl-cta-primary text-base"
              >
                Book Appointment
              </Link>
              <Link
                href="/#about"
                className="pearl-cta-secondary text-base"
              >
                Meet Dr. Virdy
              </Link>
            </div>
            <a
              href={clinicInformation.phoneHref}
              className="mt-4 inline-flex text-sm font-semibold text-[#063B35] underline decoration-[#C6A15B]/50 underline-offset-4 transition hover:text-[#C6A15B]"
            >
              Call Clinic: {clinicInformation.phoneDisplay}
            </a>
            <dl className="mt-8 grid max-w-lg gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-[rgba(198,161,91,0.28)] bg-[#FFFCF7]/72 p-4 backdrop-blur">
                <dt className="font-bold text-[#063B35]">Mon-Sat</dt>
                <dd className="mt-1 text-[#6B746F]">Clinic visits</dd>
              </div>
              <div className="rounded-[1.5rem] border border-[rgba(198,161,91,0.28)] bg-[#FFFCF7]/72 p-4 backdrop-blur">
                <dt className="font-bold text-[#063B35]">B.D.S.</dt>
                <dd className="mt-1 text-[#6B746F]">Qualified care</dd>
              </div>
              <div className="rounded-[1.5rem] border border-[rgba(198,161,91,0.28)] bg-[#FFFCF7]/72 p-4 backdrop-blur">
                <dt className="font-bold text-[#063B35]">Patiala</dt>
                <dd className="mt-1 text-[#6B746F]">Local clinic</dd>
              </div>
            </dl>
          </div>

          <div className="pearl-reveal relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="group relative aspect-[4/3] overflow-hidden rounded-[2.5rem] border border-[rgba(198,161,91,0.32)] bg-[#EFE4D4] shadow-[0_24px_70px_rgba(6,59,53,0.10)] lg:aspect-[5/4]">
              <Image
                src="/images/clinic-front.jpeg"
                alt="Exterior entrance of Pearl Dental Clinic"
                fill
                priority
                sizes="(max-width: 1023px) 100vw, 48vw"
                className="object-cover object-center transition duration-1000 ease-out group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#063B35]/58 via-[#063B35]/8 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7">
                <p className="pearl-serif text-2xl sm:text-3xl">
                  A calm stop on Main Bhadson Road.
                </p>
                <p className="mt-3 max-w-sm text-sm leading-6 text-[#F7F1E8]">
                  Pearl Dental Clinic welcomes families from Leela Bhawan,
                  Sarabha Nagar, and nearby Patiala neighborhoods.
                </p>
              </div>
              <div className="absolute left-6 top-6 h-px w-24 bg-[#C6A15B]/70" />
            </div>
          </div>
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pb-12 lg:px-8 lg:pb-16">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {quickAccessCards.map((card) => {
              const cardClassName =
                "pearl-surface pearl-lift pearl-reveal group flex h-full flex-col rounded-[1.75rem] p-5 text-left sm:p-6";
              const cardContent = (
                <>
                  <div className="mb-6 flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFE4D4] text-[#063B35] transition group-hover:bg-[#063B35] group-hover:text-white">
                      <ServiceIcon type={card.icon} />
                    </span>
                    <span className="rounded-full border border-[rgba(198,161,91,0.28)] bg-[#EFE4D4] px-3 py-1 text-xs font-bold text-[#063B35] transition group-hover:border-[#063B35]/25 group-hover:bg-[#063B35] group-hover:text-white">
                      {card.label}
                    </span>
                  </div>
                  <h2 className="text-2xl text-[#063B35]">{card.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-[#6B746F]">
                    {card.description}
                  </p>
                </>
              );

              return "href" in card ? (
                <Link key={card.title} href={card.href} className={cardClassName}>
                  {cardContent}
                </Link>
              ) : (
                <button
                  key={card.title}
                  type="button"
                  onClick={openClinicAssistant}
                  className={cardClassName}
                >
                  {cardContent}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section aria-label="Patient trust highlights" className="px-6 py-12 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {trustBadges.map((badge) => (
            <article
              key={badge.title}
              className="pearl-surface-soft pearl-lift pearl-reveal group rounded-3xl p-5"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f4ebdb] text-[#23575a] transition group-hover:bg-[#205356] group-hover:text-white">
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

      <section id="about" className="px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="pearl-surface pearl-lift pearl-reveal group overflow-hidden rounded-[2rem] p-5">
            <div className="relative aspect-[504/449] overflow-hidden rounded-2xl bg-[#f4ebdb]">
              <Image
                src="/images/dentist-photo.jpeg"
                alt="Dr. Sukhpreet Virdy at Pearl Dental Clinic"
                fill
                sizes="(max-width: 1023px) 100vw, 38vw"
                className="object-cover transition duration-700 ease-out group-hover:scale-[1.02]"
              />
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#063B35]/35 to-transparent" />
            </div>
            <div className="mt-5 flex items-start justify-between gap-4 rounded-2xl bg-[#f5efe4] p-5">
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

          <div className="pearl-reveal">
            <p className="pearl-kicker mb-3">
              Meet your dentist
            </p>
            <h2 className="pearl-section-title text-[#183f41]">
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
            <hr className="pearl-gold-line mt-8" />

          <div className="pearl-surface-soft pearl-lift mt-8 flex flex-col gap-5 rounded-3xl p-4 sm:flex-row sm:items-center">
              <figure className="group relative aspect-[1.42/1] w-full shrink-0 overflow-hidden rounded-xl bg-[#f5efe4] sm:w-56">
                <Image
                  alt={`${clinicInformation.qualification} degree certificate for ${clinicInformation.dentistName}`}
                  className="object-cover transition duration-500 group-hover:scale-[1.02]"
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
        className="border-y border-[rgba(198,161,91,0.28)] bg-[#EFE4D4]/60 px-6 py-20 lg:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="pearl-kicker mb-3">
                Our clinic
              </p>
              <h2 className="pearl-section-title text-[#183f41]">
                A small clinic, prepared with care.
              </h2>
            </div>
            <p className="max-w-md text-base leading-7 text-slate-600">
              Our reception and treatment room are kept simple, clean, and
              ready for families visiting us in Patiala.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <figure className="pearl-lift pearl-reveal group relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-[rgba(198,161,91,0.28)] bg-[#FFFCF7] shadow-xl shadow-[#063B35]/[0.10]">
              <Image
                src="/images/reception.jpeg"
                alt="Reception desk at Pearl Dental Clinic"
                fill
                sizes="(max-width: 767px) 100vw, 50vw"
                className="object-cover object-center transition duration-700 ease-out group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#063B35]/70 via-[#063B35]/5 to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="pearl-serif text-2xl">Reception</p>
                <p className="mt-1 text-sm text-[#eee6da]">
                  A familiar welcome when you arrive.
                </p>
              </figcaption>
            </figure>
            <figure className="pearl-lift pearl-reveal group relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-[rgba(198,161,91,0.28)] bg-[#FFFCF7] shadow-xl shadow-[#063B35]/[0.10] md:translate-y-8">
              <Image
                src="/images/treatment-room.jpeg"
                alt="Dental treatment room with modern clinical equipment"
                fill
                sizes="(max-width: 767px) 100vw, 50vw"
                className="object-cover object-center transition duration-700 ease-out group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#063B35]/70 via-[#063B35]/5 to-transparent" />
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

      <section id="services" className="bg-[#FFFCF7] px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="pearl-kicker mb-3">
                Treatments we offer
              </p>
              <h2 className="pearl-section-title text-[#183f41]">
                Care for everyday visits and the days your tooth cannot wait.
              </h2>
            </div>
            <p className="max-w-md text-base leading-7 text-slate-600">
              From a routine cleaning to relief for a painful tooth, we will
              explain your options before deciding anything together.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.title}
                className="pearl-surface pearl-lift pearl-reveal group relative min-h-[17rem] overflow-hidden rounded-[1.75rem] p-7 lg:p-8"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#E8D6A3] via-[#C6A15B] to-[#063B35] opacity-0 transition duration-300 group-hover:opacity-100" />
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-[rgba(198,161,91,0.28)] bg-[#EFE4D4] text-[#063B35] transition duration-300 group-hover:border-[#063B35] group-hover:bg-[#063B35] group-hover:text-white">
                  <ServiceIcon type={service.icon} />
                </div>
                <h3 className="text-2xl leading-tight text-[#183f41]">
                  {service.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {service.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[rgba(198,161,91,0.28)] bg-[#EFE4D4]/55 px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="pearl-kicker mb-3">
              A clinic built on trust
            </p>
            <h2 className="pearl-section-title text-[#183f41]">
              Why families keep coming back
            </h2>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {familyReasons.map((reason, index) => (
              <article
                key={reason.title}
                className="pearl-surface pearl-lift pearl-reveal rounded-[1.75rem] p-7"
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

      <section className="px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="pearl-kicker mb-3">
              Kind words from nearby families
            </p>
            <h2 className="pearl-section-title text-[#183f41]">
              The kind of trust we value most.
            </h2>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <figure
                key={testimonial.patient}
                className="pearl-surface pearl-lift pearl-reveal flex flex-col rounded-[1.75rem] p-7"
              >
                <span className="pearl-serif block text-5xl leading-none text-[#C6A15B] opacity-70">
                  &ldquo;
                </span>
                <blockquote className="-mt-1 grow text-base leading-7 text-[#46524f]">
                  {testimonial.quote}
                </blockquote>
                <div className="mt-6">
                  <hr className="pearl-gold-line mb-4" />
                  <figcaption>
                    <p className="font-semibold text-[#063B35]">
                      {testimonial.patient}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#C6A15B]">
                      {testimonial.treatment}
                    </p>
                  </figcaption>
                </div>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section
        id="reviews"
        className="border-y border-[rgba(198,161,91,0.28)] bg-[#EFE4D4] px-6 py-20 lg:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="pearl-kicker mb-3">
                After the visit
              </p>
              <h2 className="pearl-section-title text-[#183f41]">
                Kind words from our patients.
              </h2>
            </div>
            <Link
              href="/feedback"
              className="pearl-cta-secondary w-fit text-sm"
            >
              Tell us about your visit
            </Link>
          </div>

          {isLoadingFeedback ? (
            <div className="mt-10 rounded-3xl border border-[#eadfcf] bg-[#fffdf9] p-7 text-slate-600 shadow-sm shadow-[#183f41]/5">
              Loading recent patient feedback...
            </div>
          ) : approvedFeedback.length > 0 ? (
            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {approvedFeedback.map((feedback) => (
                <article
                  key={feedback.id}
                  className="pearl-surface pearl-lift pearl-reveal group flex h-full flex-col rounded-[1.75rem] p-7 md:p-8"
                >
                  <div className="flex items-center justify-between gap-3">
                    <RatingStars rating={feedback.rating} className="text-lg" />
                    <span className="rounded-full border border-[rgba(198,161,91,0.28)] bg-[#EFE4D4] px-3 py-1 text-[0.68rem] font-bold uppercase tracking-wide text-[#063B35]">
                      {feedback.treatment}
                    </span>
                  </div>
                  <span className="pearl-serif mt-4 block text-4xl leading-none text-[#C6A15B] opacity-60">
                    &ldquo;
                  </span>
                  <blockquote className="-mt-1 grow text-[15px] leading-8 text-[#46524f]">
                    {getShortFeedback(feedback.feedback)}
                  </blockquote>
                  <footer className="mt-6">
                    <hr className="pearl-gold-line mb-4" />
                    <p className="font-semibold text-[#063B35]">
                      {feedback.name}
                    </p>
                  </footer>
                </article>
              ))}
            </div>
          ) : (
            <div className="pearl-surface mt-10 rounded-3xl p-8">
              <h3 className="text-3xl text-[#183f41]">
                Patient feedback will appear here soon.
              </h3>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                {feedbackPreviewError ??
                  "We are grateful for every family that trusts the clinic. Once reviewed feedback is approved, a few kind notes will be shared here for new patients to read."}
              </p>
            </div>
          )}
        </div>
      </section>

      <section id="booking" className="bg-[#FFFCF7] px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div className="pearl-reveal lg:sticky lg:top-28">
            <p className="pearl-kicker mb-3">
              Book a visit
            </p>
            <h2 className="pearl-section-title text-[#183f41]">
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
                    className="pearl-surface-soft flex items-center gap-4 rounded-2xl p-4"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#063B35] text-sm font-bold text-white">
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
            className="pearl-surface pearl-reveal grid gap-5 rounded-[2rem] p-6 sm:grid-cols-2 md:p-8"
          >
            <label className="block text-sm font-semibold text-[#1F2A27]">
              Full Name
              <input
                suppressHydrationWarning
                required
                name="fullName"
                value={bookingForm.fullName}
                onChange={handleBookingChange}
                className="pearl-input mt-2"
                placeholder="Jane Smith"
                type="text"
              />
            </label>

            <label className="block text-sm font-semibold text-[#1F2A27]">
              Email
              <input
                suppressHydrationWarning
                required
                name="email"
                value={bookingForm.email}
                onChange={handleBookingChange}
                className="pearl-input mt-2"
                placeholder="jane@example.com"
                type="email"
              />
            </label>

            <label className="block text-sm font-semibold text-[#1F2A27]">
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
                className={`pearl-input mt-2 ${
                  phoneValidationMessage
                    ? "border-red-300 hover:border-red-400 focus:border-red-400 focus:ring-4 focus:ring-red-100"
                    : ""
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

            <label className="block text-sm font-semibold text-[#1F2A27]">
              Select Treatment
              <div className="relative mt-2">
                <select
                  suppressHydrationWarning
                  required
                  name="treatment"
                  value={bookingForm.treatment}
                  onChange={handleBookingChange}
                  className={`pearl-input pearl-select ${
                    bookingForm.treatment ? "text-[#1F2A27]" : "text-[#6B746F]"
                  }`}
                >
                  <option value="" disabled>
                    Choose a treatment
                  </option>
                  {services.map((service) => (
                    <option
                      key={service.title}
                      value={service.title}
                      className="text-[#1F2A27]"
                    >
                      {service.title}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#063B35]" aria-hidden="true">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </span>
              </div>
            </label>

            <label className="block text-sm font-semibold text-[#1F2A27]">
              Preferred Date
              <input
                suppressHydrationWarning
                required
                name="preferredDate"
                value={bookingForm.preferredDate}
                onChange={handleBookingChange}
                className="pearl-input mt-2"
                type="date"
              />
            </label>

            <label className="block text-sm font-semibold text-[#1F2A27]">
              Preferred Time ({clinicInformation.timeZoneLabel})
              <input
                suppressHydrationWarning
                required
                name="preferredTime"
                value={bookingForm.preferredTime}
                onChange={handleBookingChange}
                className="pearl-input mt-2"
                type="time"
              />
            </label>

            <label className="block text-sm font-semibold text-[#1F2A27] sm:col-span-2">
              Notes
              <textarea
                suppressHydrationWarning
                name="notes"
                value={bookingForm.notes}
                onChange={handleBookingChange}
                className="pearl-input mt-2 min-h-32 resize-y"
                placeholder="Tell us if you are nervous, in discomfort, or have a preferred time."
              />
            </label>

            <button
              suppressHydrationWarning
              type="submit"
              disabled={isSubmittingBooking}
              className="pearl-cta-primary text-base disabled:cursor-wait disabled:opacity-70 sm:col-span-2"
            >
              {isSubmittingBooking
                ? "Sending Request"
                : "Send Appointment Request"}
            </button>
          </form>
        </div>
      </section>

      <section className="px-6 py-20 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="pearl-lift pearl-reveal rounded-[2rem] bg-[#063B35] p-7 text-white shadow-[0_24px_70px_rgba(6,59,53,0.10)] md:p-8">
            <p className="pearl-eyebrow text-[#C6A15B]">
              Clinic hours ({clinicInformation.timeZoneLabel})
            </p>
            <h2 className="pearl-serif mt-3 text-4xl text-white">When you can visit</h2>
            <div className="mt-7 space-y-4">
              {clinicHours.map((row) => (
                <div
                  key={`${row.day}-${row.hours}`}
                  className="flex items-center justify-between gap-4 border-b border-white/10 pb-4 text-sm"
                >
                  <span className="text-[#E8D6A3]">{row.day}</span>
                  <span className="font-semibold text-white">{row.hours}</span>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm leading-6 text-[#E8D6A3]/80">
              If you are in discomfort or worried about a tooth, call us and
              we will guide you on arranging a visit.
            </p>
          </div>

          <div>
            <p className="pearl-kicker mb-3">
              Questions patients often ask
            </p>
            <h2 className="pearl-section-title text-[#183f41]">
              It is all right to feel unsure.
            </h2>
            <div className="mt-7 grid gap-3">
              {frequentlyAskedQuestions.map((item) => (
                <details
                  key={item.question}
                  className="group pearl-surface-soft rounded-2xl px-5 py-4 open:border-[#dcc495] open:shadow-md"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-blue-950">
                    {item.question}
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f5efe4] text-[#23575a] transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 border-t border-[rgba(198,161,91,0.20)] pt-4 text-sm leading-7 text-[#6B746F]">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="bg-[#FFFCF7] px-6 py-20 lg:px-8 lg:py-28">
        <div className="pearl-reveal mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] border border-[rgba(198,161,91,0.32)] bg-gradient-to-r from-[#063B35] to-[#0E4A43] text-white shadow-[0_24px_70px_rgba(6,59,53,0.10)] lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-8 md:p-12">
            <p className="mb-3 text-sm font-semibold uppercase text-[#C6A15B]">
              Visit or speak with us
            </p>
            <h2 className="text-4xl text-white sm:text-5xl">
              We are here when your family needs dental care.
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-8 text-[#E8D6A3]/80">
              Call or send a WhatsApp message to ask about an appointment. You
              will be speaking with a local clinic in Patiala, not a call
              centre.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={clinicInformation.whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-[#C6A15B] px-6 py-3.5 font-semibold text-[#063B35] transition hover:bg-[#E8D6A3]"
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
            <p className="pearl-serif text-3xl text-[#C6A15B]">
              {clinicInformation.name}
            </p>
            <div className="mt-5 text-sm leading-6 text-[#E8D6A3]/75">
              {clinicInformation.addressLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <p className="mt-3 text-sm text-[#E8D6A3]/75">
              Monday - Saturday visits ({clinicInformation.timeZoneLabel})
            </p>
            <div className="mt-7 space-y-2 text-sm">
              <a
                className="block font-semibold text-white transition hover:text-[#C6A15B]"
                href={clinicInformation.phoneHref}
              >
                {clinicInformation.phoneDisplay}
              </a>
              <a
                className="block text-[#C6A15B] transition hover:text-white"
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
            <a
              className="mt-4 inline-flex text-sm font-semibold text-[#C6A15B] transition hover:text-white"
              href={clinicInformation.mapHref}
              rel="noreferrer"
              target="_blank"
            >
              Open in Google Maps
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
