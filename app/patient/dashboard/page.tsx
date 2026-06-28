"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppointmentStatusBadge from "@/app/components/appointments/AppointmentStatusBadge";
import {
  formatDate,
  formatScheduledClockTime as formatScheduledTime,
  formatScheduledDate,
  formatTime,
  formatValue,
} from "@/app/lib/appointmentFormatters";
import { recoverFromInvalidRefreshToken } from "@/app/lib/authRecovery";
import { clinicInformation } from "@/app/lib/clinicContent";
import { supabase } from "@/app/lib/supabase";
import type { PatientAppointment } from "@/app/types/appointments";

export default function PatientDashboardPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [patientName, setPatientName] = useState("Patient");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchAppointments = useCallback(
    async (patientId: string, { showLoading = true } = {}) => {
      if (showLoading) {
        setIsLoading(true);
      }

      setErrorMessage(null);

      const { data, error } = await supabase
        .from("appointments")
        .select(
          "id, treatment, preferred_date, preferred_time, scheduled_start, status",
        )
        .eq("patient_id", patientId)
        .order("preferred_date", { ascending: false })
        .order("preferred_time", { ascending: false });

      if (error) {
        setErrorMessage(error.message);
        setAppointments([]);
      } else {
        setAppointments((data ?? []) as PatientAppointment[]);
      }

      setIsLoading(false);
    },
    [],
  );

  useEffect(() => {
    let isActive = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isActive) {
        return;
      }

      if (!session) {
        router.replace("/patient/login");
        return;
      }

      const name = session.user.user_metadata?.name;

      if (typeof name === "string" && name.trim()) {
        setPatientName(name);
      }

      if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
        void fetchAppointments(session.user.id, {
          showLoading: event === "INITIAL_SESSION",
        });
      }
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, [fetchAppointments, router]);

  const handleLogout = async () => {
    setErrorMessage(null);

    const { error } = await supabase.auth.signOut();

    if (error) {
      if (await recoverFromInvalidRefreshToken(error)) {
        router.replace("/patient/login");
        return;
      }

      setErrorMessage(error.message);
      return;
    }

    router.replace("/patient/login");
  };

  return (
    <main className="pearl-editorial pearl-portal min-h-screen text-[#24302F]">
      <section className="pearl-dashboard-hero relative overflow-hidden border-b border-[rgba(201,168,106,0.22)] px-6 py-12 lg:px-8 lg:py-14">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="pearl-kicker mb-2">
              Pearl Dental Clinic
            </p>
            <h1 className="pearl-section-title text-[#173D3F]">
              Your Visits
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Welcome, {patientName}. Your appointment requests, confirmed
              visits, and clinic updates are kept together here.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/#booking"
              className="pearl-cta-secondary text-sm"
            >
              Book Appointment
            </Link>
            <Link href="/feedback" className="pearl-cta-secondary text-sm">
              Leave Feedback
            </Link>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="pearl-cta-primary text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </section>

      <section className="px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {errorMessage ? (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800 shadow-sm shadow-red-900/5">
              {errorMessage}
            </div>
          ) : null}

          {isLoading ? (
            <div className="pearl-dashboard-card p-8 text-slate-600">
              Loading appointment history...
            </div>
          ) : appointments.length === 0 ? (
            <div className="pearl-dashboard-card p-8">
              <h2 className="text-3xl text-[#183f41]">
                No appointments yet
              </h2>
              <p className="mt-3 max-w-2xl text-slate-600">
                Book an appointment while signed in and it will appear here.
              </p>
              <Link href="/#booking" className="pearl-cta-primary mt-6 text-sm">
                Book Appointment
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {appointments.map((appointment) => (
                <article
                  key={appointment.id}
                  className="pearl-dashboard-card pearl-lift p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase text-[#86632f]">
                        Treatment
                      </p>
                      <h2 className="mt-2 text-2xl text-[#183f41]">
                        {formatValue(appointment.treatment)}
                      </h2>
                    </div>
                    <AppointmentStatusBadge status={appointment.status} />
                  </div>

                  <dl className="mt-6 grid gap-4 text-sm text-slate-600">
                    <div>
                      <dt className="font-semibold text-slate-800">
                        {appointment.scheduled_start
                          ? "Scheduled Date"
                          : "Requested Date"}
                      </dt>
                      <dd>
                        {appointment.scheduled_start
                          ? formatScheduledDate(appointment.scheduled_start)
                          : formatDate(appointment.preferred_date)}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-800">
                        {appointment.scheduled_start
                          ? "Scheduled Time"
                          : "Requested Time"}{" "}
                        ({clinicInformation.timeZoneLabel})
                      </dt>
                      <dd>
                        {appointment.scheduled_start
                          ? formatScheduledTime(appointment.scheduled_start)
                          : formatTime(appointment.preferred_time)}
                      </dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
