"use client";

import {
  type ChangeEvent,
  type FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import AdminAnalytics from "@/app/components/admin/AdminAnalytics";
import AppointmentCalendar from "@/app/components/admin/AppointmentCalendar";
import FeedbackManagement from "@/app/components/admin/FeedbackManagement";
import AppointmentStatusBadge from "@/app/components/appointments/AppointmentStatusBadge";
import Modal from "@/app/components/ui/Modal";
import {
  formatDate,
  formatScheduledTime,
  formatTime,
  formatValue,
} from "@/app/lib/appointmentFormatters";
import { recoverFromInvalidRefreshToken } from "@/app/lib/authRecovery";
import { clinicInformation } from "@/app/lib/clinicContent";
import { getErrorMessage } from "@/app/lib/errors";
import { supabase } from "@/app/lib/supabase";
import {
  suggestAppointmentTime,
  updateAppointmentStatus as requestAppointmentStatusUpdate,
} from "@/app/services/appointmentApi";
import {
  fetchAdminFeedback,
  updateFeedbackApproval,
} from "@/app/services/feedbackApi";
import type { AppointmentRecord as Appointment } from "@/app/types/appointments";
import type { AdminPatientFeedback } from "@/app/types/feedback";

type SuggestionForm = {
  message: string;
  suggestedDate: string;
  suggestedTime: string;
};

const initialSuggestionForm: SuggestionForm = {
  message: "",
  suggestedDate: "",
  suggestedTime: "",
};

export default function AdminPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [feedbackEntries, setFeedbackEntries] = useState<
    AdminPatientFeedback[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [updatingAppointmentId, setUpdatingAppointmentId] = useState<
    Appointment["id"] | null
  >(null);
  const [updatingFeedbackId, setUpdatingFeedbackId] = useState<
    AdminPatientFeedback["id"] | null
  >(null);
  const [suggestingAppointment, setSuggestingAppointment] =
    useState<Appointment | null>(null);
  const [suggestionForm, setSuggestionForm] =
    useState<SuggestionForm>(initialSuggestionForm);
  const [isSubmittingSuggestion, setIsSubmittingSuggestion] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const queryAppointments = useCallback(async () => {
    return supabase
      .from("appointments")
      .select(
        "id, full_name, email, phone, treatment, preferred_date, preferred_time, notes, admin_note, scheduled_start, scheduled_end, status",
      )
      .order("preferred_date", { ascending: true })
      .order("preferred_time", { ascending: true });
  }, []);

  const fetchAppointments = useCallback(
    async ({ showLoading = true }: { showLoading?: boolean } = {}) => {
      if (showLoading) {
        setIsLoading(true);
      }

      setErrorMessage(null);

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        if (await recoverFromInvalidRefreshToken(sessionError)) {
          setAppointments([]);
          setIsLoading(false);
          router.replace("/admin/login");
          return;
        }

        setErrorMessage(sessionError.message);
        setAppointments([]);
        setIsLoading(false);
        return;
      }

      if (!session) {
        router.replace("/admin/login");
        return;
      }

      const { data, error } = await queryAppointments();

      if (error) {
        setErrorMessage(error.message);
        setAppointments([]);
      } else {
        setAppointments((data ?? []) as Appointment[]);
      }

      setIsLoading(false);
    },
    [queryAppointments, router],
  );

  const fetchFeedbackEntries = useCallback(
    async ({ showLoading = true }: { showLoading?: boolean } = {}) => {
      if (showLoading) {
        setIsLoadingFeedback(true);
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        if (await recoverFromInvalidRefreshToken(sessionError)) {
          setFeedbackEntries([]);
          setIsLoadingFeedback(false);
          router.replace("/admin/login");
          return;
        }

        setErrorMessage(sessionError.message);
        setFeedbackEntries([]);
        setIsLoadingFeedback(false);
        return;
      }

      if (!session) {
        setIsLoadingFeedback(false);
        router.replace("/admin/login");
        return;
      }

      try {
        const feedback = await fetchAdminFeedback(session.access_token);
        setFeedbackEntries(feedback);
      } catch (error) {
        setErrorMessage(
          getErrorMessage(error, "Unable to load patient feedback."),
        );
        setFeedbackEntries([]);
      }

      setIsLoadingFeedback(false);
    },
    [router],
  );

  const fetchDashboardData = useCallback(
    async ({ showLoading = true }: { showLoading?: boolean } = {}) => {
      setErrorMessage(null);

      await fetchAppointments({ showLoading });
      await fetchFeedbackEntries({ showLoading });
    },
    [fetchAppointments, fetchFeedbackEntries],
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
        router.replace("/admin/login");
        return;
      }

      if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
        void fetchDashboardData({
          showLoading: event === "INITIAL_SESSION",
        });
      }
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, [fetchDashboardData, router]);

  const handleLogout = async () => {
    setErrorMessage(null);

    const { error } = await supabase.auth.signOut();

    if (error) {
      if (await recoverFromInvalidRefreshToken(error)) {
        router.replace("/admin/login");
        return;
      }

      setErrorMessage(error.message);
      return;
    }

    router.replace("/admin/login");
  };

  const updateAppointmentStatus = async (
    appointmentId: Appointment["id"],
    status: "approved" | "rejected",
  ) => {
    setUpdatingAppointmentId(appointmentId);
    setErrorMessage(null);
    setNoticeMessage(null);

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (
      sessionError &&
      (await recoverFromInvalidRefreshToken(sessionError))
    ) {
      setUpdatingAppointmentId(null);
      router.replace("/admin/login");
      return;
    }

    if (sessionError || !session) {
      setErrorMessage(sessionError?.message ?? "Admin session required.");
      setUpdatingAppointmentId(null);
      return;
    }

    try {
      await requestAppointmentStatusUpdate(
        appointmentId,
        status,
        session.access_token,
      );
      await fetchAppointments();
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Unable to update appointment status."),
      );
      setUpdatingAppointmentId(null);
      return;
    }

    setUpdatingAppointmentId(null);
  };

  const openSuggestionDialog = (appointment: Appointment) => {
    setSuggestingAppointment(appointment);
    setSuggestionForm(initialSuggestionForm);
    setErrorMessage(null);
    setNoticeMessage(null);
  };

  const handleSuggestionChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;

    setSuggestionForm((currentValue) => ({
      ...currentValue,
      [name as keyof SuggestionForm]: value,
    }));
  };

  const handleSuggestionSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!suggestingAppointment) {
      return;
    }

    setIsSubmittingSuggestion(true);
    setErrorMessage(null);
    setNoticeMessage(null);

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (
      sessionError &&
      (await recoverFromInvalidRefreshToken(sessionError))
    ) {
      setIsSubmittingSuggestion(false);
      router.replace("/admin/login");
      return;
    }

    if (sessionError || !session) {
      setErrorMessage(sessionError?.message ?? "Admin session required.");
      setIsSubmittingSuggestion(false);
      return;
    }

    try {
      await suggestAppointmentTime(
        suggestingAppointment.id,
        suggestionForm,
        session.access_token,
      );
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "Unable to send the suggested appointment time.",
        ),
      );
      setIsSubmittingSuggestion(false);
      return;
    }

    await fetchAppointments({ showLoading: false });
    setSuggestingAppointment(null);
    setSuggestionForm(initialSuggestionForm);
    setIsSubmittingSuggestion(false);
    setNoticeMessage("Suggested appointment time emailed to the patient.");
  };

  const handleFeedbackApproval = async (
    feedbackId: AdminPatientFeedback["id"],
    isApproved: boolean,
  ) => {
    setUpdatingFeedbackId(feedbackId);
    setErrorMessage(null);
    setNoticeMessage(null);

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (
      sessionError &&
      (await recoverFromInvalidRefreshToken(sessionError))
    ) {
      setUpdatingFeedbackId(null);
      router.replace("/admin/login");
      return;
    }

    if (sessionError || !session) {
      setErrorMessage(sessionError?.message ?? "Admin session required.");
      setUpdatingFeedbackId(null);
      return;
    }

    try {
      await updateFeedbackApproval(
        feedbackId,
        isApproved,
        session.access_token,
      );
      await fetchFeedbackEntries({ showLoading: false });
      setNoticeMessage(
        isApproved
          ? "Feedback approved for the homepage."
          : "Feedback hidden from the homepage.",
      );
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Unable to update feedback visibility."),
      );
    }

    setUpdatingFeedbackId(null);
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
              Clinic Operations Desk
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              A calm place to review appointment requests, manage the clinic
              diary, and keep patient follow-ups moving.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => void fetchDashboardData()}
              className="pearl-cta-secondary text-sm"
            >
              Refresh List
            </button>
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

          {noticeMessage ? (
            <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 shadow-sm shadow-emerald-900/5">
              {noticeMessage}
            </div>
          ) : null}

          {!isLoading ? <AdminAnalytics appointments={appointments} /> : null}

          {!isLoading ? (
            <AppointmentCalendar
              appointments={appointments}
              onError={setErrorMessage}
              onRefresh={() => fetchAppointments({ showLoading: false })}
              onSessionExpired={() => router.replace("/admin/login")}
            />
          ) : null}

          <FeedbackManagement
            feedbackEntries={feedbackEntries}
            isLoading={isLoadingFeedback}
            onToggleApproval={handleFeedbackApproval}
            updatingFeedbackId={updatingFeedbackId}
          />

          {isLoading ? (
            <div className="pearl-dashboard-card p-8 text-slate-600">
              Loading appointments...
            </div>
          ) : appointments.length === 0 ? (
            <div className="pearl-dashboard-card mt-8 p-8 text-slate-600">
              <h2 className="text-3xl text-[#183f41]">No appointments found</h2>
              <p className="mt-2 text-sm">
                New patient requests and admin-created appointments will appear
                here.
              </p>
            </div>
          ) : (
            <>
              <div className="pearl-dashboard-card mt-8 hidden overflow-hidden lg:block">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-[#183f41] text-white">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Patient</th>
                      <th className="px-5 py-4 font-semibold">Contact</th>
                      <th className="px-5 py-4 font-semibold">Treatment</th>
                      <th className="px-5 py-4 font-semibold">Preferred</th>
                      <th className="px-5 py-4 font-semibold">Notes</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                      <th className="px-5 py-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eee2cf]">
                    {appointments.map((appointment) => (
                      <tr key={appointment.id} className="align-top">
                        <td className="px-5 py-4 font-semibold text-[#063B35]">
                          {formatValue(appointment.full_name)}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          <p>{formatValue(appointment.email)}</p>
                          <p className="mt-1">{formatValue(appointment.phone)}</p>
                        </td>
                        <td className="px-5 py-4 text-slate-700">
                          {formatValue(appointment.treatment)}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          <p className="text-xs font-semibold uppercase text-slate-400">
                            Requested ({clinicInformation.timeZoneLabel})
                          </p>
                          <p className="mt-1">{formatDate(appointment.preferred_date)}</p>
                          <p>
                            {formatTime(appointment.preferred_time)}
                          </p>
                          {appointment.scheduled_start ? (
                            <>
                              <p className="mt-3 text-xs font-semibold uppercase text-[#86632f]">
                                Scheduled ({clinicInformation.timeZoneLabel})
                              </p>
                              <p className="mt-1 font-medium text-blue-900">
                                {formatScheduledTime(appointment.scheduled_start)}
                              </p>
                            </>
                          ) : null}
                        </td>
                        <td className="max-w-xs px-5 py-4 text-slate-600">
                          <p>{formatValue(appointment.notes)}</p>
                          {appointment.admin_note ? (
                            <div className="mt-3 rounded-xl bg-[#f5efe4] p-3 text-xs leading-5 text-[#23575a]">
                              <p className="font-bold uppercase text-[#C6A15B]">
                                Admin message
                              </p>
                              <p className="mt-1">{appointment.admin_note}</p>
                            </div>
                          ) : null}
                        </td>
                        <td className="px-5 py-4">
                          <AppointmentStatusBadge status={appointment.status} />
                        </td>
                        <td className="px-5 py-4">
                          {appointment.status === "pending" ? (
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                disabled={updatingAppointmentId === appointment.id}
                                onClick={() =>
                                  void updateAppointmentStatus(
                                    appointment.id,
                                    "approved",
                                  )
                                }
                                className="rounded-full bg-[#063B35] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0E4A43] disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                disabled={updatingAppointmentId === appointment.id}
                                onClick={() =>
                                  void updateAppointmentStatus(
                                    appointment.id,
                                    "rejected",
                                  )
                                }
                                className="rounded-full border border-[#e6c2bb] bg-[#fffdf9] px-4 py-2 text-xs font-semibold text-[#925147] transition hover:bg-[#fbefec] disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Reject
                              </button>
                              <button
                                type="button"
                                disabled={updatingAppointmentId === appointment.id}
                                onClick={() => openSuggestionDialog(appointment)}
                                className="rounded-full border border-[#dbc59b] bg-[#f5efe4] px-4 py-2 text-xs font-semibold text-[#76582c] transition hover:border-[#c7a464] hover:bg-[#f2e8d7] disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Suggest New Time
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs font-medium text-slate-400">
                              No action
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 grid gap-5 lg:hidden">
                {appointments.map((appointment) => (
                  <article
                    key={appointment.id}
                    className="pearl-dashboard-card pearl-lift p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-bold text-[#063B35]">
                          {formatValue(appointment.full_name)}
                        </h2>
                        <p className="mt-1 text-sm text-slate-600">
                          {formatValue(appointment.treatment)}
                        </p>
                      </div>
                      <AppointmentStatusBadge status={appointment.status} />
                    </div>

                    <dl className="mt-5 grid gap-3 text-sm text-slate-600">
                      <div>
                        <dt className="font-semibold text-slate-800">Email</dt>
                        <dd>{formatValue(appointment.email)}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-800">Phone</dt>
                        <dd>{formatValue(appointment.phone)}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-800">
                          Requested Date
                        </dt>
                        <dd>{formatDate(appointment.preferred_date)}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-800">
                          Requested Time
                        </dt>
                        <dd>
                          {formatTime(appointment.preferred_time)} (
                          {clinicInformation.timeZoneLabel})
                        </dd>
                      </div>
                      {appointment.scheduled_start ? (
                        <div>
                          <dt className="font-semibold text-blue-900">
                            Scheduled Visit
                          </dt>
                          <dd>
                            {formatScheduledTime(appointment.scheduled_start)} (
                            {clinicInformation.timeZoneLabel})
                          </dd>
                        </div>
                      ) : null}
                      <div>
                        <dt className="font-semibold text-slate-800">Notes</dt>
                        <dd>{formatValue(appointment.notes)}</dd>
                      </div>
                      {appointment.admin_note ? (
                        <div className="rounded-xl bg-[#f5efe4] p-3 text-[#23575a]">
                          <dt className="font-semibold">Admin Message</dt>
                          <dd className="mt-1 text-sm">{appointment.admin_note}</dd>
                        </div>
                      ) : null}
                    </dl>

                    {appointment.status === "pending" ? (
                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <button
                          type="button"
                          disabled={updatingAppointmentId === appointment.id}
                          onClick={() =>
                            void updateAppointmentStatus(
                              appointment.id,
                              "approved",
                            )
                          }
                          className="flex-1 rounded-full bg-[#063B35] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0E4A43] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={updatingAppointmentId === appointment.id}
                          onClick={() =>
                            void updateAppointmentStatus(
                              appointment.id,
                              "rejected",
                            )
                          }
                          className="flex-1 rounded-full border border-[#e6c2bb] bg-[#fffdf9] px-4 py-2.5 text-sm font-semibold text-[#925147] transition hover:bg-[#fbefec] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          disabled={updatingAppointmentId === appointment.id}
                          onClick={() => openSuggestionDialog(appointment)}
                          className="rounded-full border border-[#dbc59b] bg-[#f5efe4] px-4 py-2.5 text-sm font-semibold text-[#76582c] transition hover:border-[#c7a464] hover:bg-[#f2e8d7] disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
                        >
                          Suggest New Time
                        </button>
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {suggestingAppointment ? (
        <Modal
          eyebrow="Schedule Update"
          label="Suggest new appointment time"
          maxWidth="xl"
          onClose={() => setSuggestingAppointment(null)}
          title="Suggest New Time"
        >
          <form onSubmit={handleSuggestionSubmit} className="grid gap-5 p-6 sm:grid-cols-2">
              <div className="rounded-xl bg-[#f5efe4] p-4 sm:col-span-2">
                <p className="font-bold text-blue-950">
                  {formatValue(suggestingAppointment.full_name)}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Requested {formatDate(suggestingAppointment.preferred_date)} at{" "}
                  {formatTime(suggestingAppointment.preferred_time)} (
                  {clinicInformation.timeZoneLabel})
                </p>
              </div>
              <label className="text-sm font-semibold text-slate-700">
                Suggested Date
                <input
                  required
                  type="date"
                  name="suggestedDate"
                  value={suggestionForm.suggestedDate}
                  onChange={handleSuggestionChange}
                  className="mt-2 w-full rounded-xl border border-[#eadfcf] bg-[#fffdf9] px-4 py-3 outline-none transition focus:border-[#347376] focus:ring-4 focus:ring-[#205356]/15"
                />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Suggested Time ({clinicInformation.timeZoneLabel})
                <input
                  required
                  type="time"
                  name="suggestedTime"
                  value={suggestionForm.suggestedTime}
                  onChange={handleSuggestionChange}
                  className="mt-2 w-full rounded-xl border border-[#eadfcf] bg-[#fffdf9] px-4 py-3 outline-none transition focus:border-[#347376] focus:ring-4 focus:ring-[#205356]/15"
                />
              </label>
              <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                Message (Optional)
                <textarea
                  name="message"
                  value={suggestionForm.message}
                  onChange={handleSuggestionChange}
                  className="mt-2 min-h-28 w-full resize-y rounded-xl border border-[#eadfcf] bg-[#fffdf9] px-4 py-3 outline-none transition focus:border-[#347376] focus:ring-4 focus:ring-[#205356]/15"
                  placeholder="Add any helpful instructions for the patient."
                />
              </label>
              <div className="flex justify-end gap-3 sm:col-span-2">
                <button
                  type="button"
                  onClick={() => setSuggestingAppointment(null)}
                  className="rounded-full border border-[#dbc59b] px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-[#f5efe4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSuggestion}
                  className="rounded-full bg-[#205356] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#183f41] disabled:cursor-wait disabled:opacity-60"
                >
                  {isSubmittingSuggestion ? "Sending" : "Send Suggestion"}
                </button>
              </div>
          </form>
        </Modal>
      ) : null}
    </main>
  );
}
