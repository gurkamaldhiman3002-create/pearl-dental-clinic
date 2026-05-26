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
    <main className="pearl-editorial pearl-portal min-h-screen text-[#303937]">
      <section className="border-b border-[#eadfcf] bg-[#fffdf9]/90 px-6 py-9 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase text-[#86632f]">
              Pearl Dental Clinic
            </p>
            <h1 className="text-4xl text-[#183f41] sm:text-5xl">
              Patient Dashboard
            </h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              Welcome, {patientName}. Review your appointment history and
              current request status.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/#booking"
              className="rounded-full border border-[#dbc59b] bg-[#fffdf9] px-5 py-2.5 text-center text-sm font-semibold text-[#23575a] transition hover:border-[#c7a464] hover:bg-[#f5efe4]"
            >
              Book Appointment
            </Link>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="rounded-full bg-[#205356] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#183f41]"
            >
              Logout
            </button>
          </div>
        </div>
      </section>

      <section className="px-6 py-10 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {errorMessage ? (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800 shadow-sm">
              {errorMessage}
            </div>
          ) : null}

          {isLoading ? (
            <div className="rounded-3xl border border-[#eadfcf] bg-[#fffdf9] p-8 text-slate-600 shadow-lg shadow-[#183f41]/[0.05]">
              Loading appointment history...
            </div>
          ) : appointments.length === 0 ? (
            <div className="rounded-3xl border border-[#eadfcf] bg-[#fffdf9] p-8 shadow-lg shadow-[#183f41]/[0.05]">
              <h2 className="text-3xl text-[#183f41]">
                No appointments yet
              </h2>
              <p className="mt-2 text-slate-600">
                Book an appointment while signed in and it will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {appointments.map((appointment) => (
                <article
                  key={appointment.id}
                  className="rounded-2xl border border-[#eadfcf] bg-[#fffdf9] p-6 shadow-lg shadow-[#183f41]/[0.05] transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#183f41]/[0.08]"
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
