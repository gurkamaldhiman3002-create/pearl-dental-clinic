"use client";

import type { EventClickArg, EventDropArg, EventInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, {
  type EventResizeDoneArg,
} from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { type ChangeEvent, type FormEvent, useMemo, useState } from "react";
import { treatmentOptions } from "@/app/lib/clinicContent";
import {
  formatIndianPhoneInput,
  getIndianPhoneValidationMessage,
  indianMobileExample,
  indianMobilePattern,
  normalizeIndianPhone,
} from "@/app/lib/indianPhone";
import { recoverFromInvalidRefreshToken } from "@/app/lib/authRecovery";
import { supabase } from "@/app/lib/supabase";
import {
  createAdminAppointment,
  updateAppointmentSchedule,
} from "@/app/services/appointmentApi";
import type { AppointmentRecord } from "@/app/types/appointments";
import Modal from "@/app/components/ui/Modal";

type AppointmentCalendarProps = {
  appointments: AppointmentRecord[];
  onError: (message: string | null) => void;
  onRefresh: () => Promise<void>;
  onSessionExpired: () => void;
};

type EditScheduleForm = {
  scheduledStart: string;
  scheduledEnd: string;
};

type NewAppointmentForm = {
  email: string;
  fullName: string;
  notes: string;
  phone: string;
  scheduledEnd: string;
  scheduledStart: string;
  treatment: string;
};

const initialNewAppointmentForm: NewAppointmentForm = {
  email: "",
  fullName: "",
  notes: "",
  phone: "",
  scheduledEnd: "",
  scheduledStart: "",
  treatment: "",
};

function toLocalInputValue(value: Date | string | null) {
  if (!value) {
    return "";
  }

  const date = typeof value === "string" ? new Date(value) : value;

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const timezoneOffset = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function addMinutes(value: Date, minutes: number) {
  return new Date(value.getTime() + minutes * 60_000);
}

function eventStartForAppointment(appointment: AppointmentRecord) {
  if (appointment.scheduled_start) {
    return new Date(appointment.scheduled_start);
  }

  if (appointment.preferred_date && appointment.preferred_time) {
    return new Date(
      `${appointment.preferred_date}T${appointment.preferred_time}`,
    );
  }

  return null;
}

function eventEndForAppointment(
  appointment: AppointmentRecord,
  start: Date,
) {
  if (appointment.scheduled_end) {
    const scheduledEnd = new Date(appointment.scheduled_end);

    if (!Number.isNaN(scheduledEnd.getTime())) {
      return scheduledEnd;
    }
  }

  return addMinutes(start, 45);
}

function parseScheduleRange(startValue: string, endValue: string) {
  const start = new Date(startValue);
  const end = new Date(endValue);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error("Enter a valid start and end time.");
  }

  if (end <= start) {
    throw new Error("The end time must be after the start time.");
  }

  return { end, start };
}

export default function AppointmentCalendar({
  appointments,
  onError,
  onRefresh,
  onSessionExpired,
}: AppointmentCalendarProps) {
  const [editingAppointment, setEditingAppointment] =
    useState<AppointmentRecord | null>(null);
  const [editForm, setEditForm] = useState<EditScheduleForm>({
    scheduledEnd: "",
    scheduledStart: "",
  });
  const [isCreating, setIsCreating] = useState(false);
  const [newAppointmentForm, setNewAppointmentForm] =
    useState<NewAppointmentForm>(initialNewAppointmentForm);
  const [newAppointmentPhoneError, setNewAppointmentPhoneError] = useState<
    string | null
  >(null);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(
    null,
  );

  const calendarEvents = useMemo<EventInput[]>(() => {
    return appointments.flatMap((appointment) => {
      if (
        appointment.status !== "pending" &&
        appointment.status !== "approved"
      ) {
        return [];
      }

      const start = eventStartForAppointment(appointment);

      if (!start || Number.isNaN(start.getTime())) {
        return [];
      }

      return [
        {
          id: String(appointment.id),
          title: `${appointment.full_name ?? "Patient"} - ${
            appointment.treatment ?? "Appointment"
          }`,
          start,
          end: eventEndForAppointment(appointment, start),
          extendedProps: {
            status: appointment.status,
          },
        },
      ];
    });
  }, [appointments]);

  async function getAccessToken() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error && (await recoverFromInvalidRefreshToken(error))) {
      onSessionExpired();
      throw new Error("Your session has expired. Please sign in again.");
    }

    if (error || !session) {
      throw new Error(error?.message ?? "Admin session required.");
    }

    return session.access_token;
  }

  async function persistAppointmentSchedule(
    appointmentId: string | number,
    start: Date,
    end: Date,
  ) {
    const accessToken = await getAccessToken();

    await updateAppointmentSchedule(
      appointmentId,
      start.toISOString(),
      end.toISOString(),
      accessToken,
    );
  }

  async function handleCalendarMove(
    eventId: string,
    start: Date | null,
    end: Date | null,
    revert: () => void,
  ) {
    if (!start) {
      revert();
      return;
    }

    setIsSaving(true);
    setConfirmationMessage(null);
    onError(null);

    try {
      await persistAppointmentSchedule(
        eventId,
        start,
        end ?? addMinutes(start, 45),
      );
      await onRefresh();
      setConfirmationMessage("Appointment schedule updated.");
    } catch (error) {
      revert();
      onError(
        error instanceof Error ? error.message : "Unable to save the schedule.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  const handleEventClick = (eventInfo: EventClickArg) => {
    const appointment = appointments.find(
      (item) => String(item.id) === eventInfo.event.id,
    );

    if (!appointment || !eventInfo.event.start) {
      return;
    }

    setEditingAppointment(appointment);
    setEditForm({
      scheduledEnd: toLocalInputValue(
        eventInfo.event.end ?? addMinutes(eventInfo.event.start, 45),
      ),
      scheduledStart: toLocalInputValue(eventInfo.event.start),
    });
    setConfirmationMessage(null);
  };

  const handleEditChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setEditForm((currentValue) => ({
      ...currentValue,
      [name as keyof EditScheduleForm]: value,
    }));
  };

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingAppointment) {
      return;
    }

    setIsSaving(true);
    onError(null);

    try {
      const { end, start } = parseScheduleRange(
        editForm.scheduledStart,
        editForm.scheduledEnd,
      );

      await persistAppointmentSchedule(editingAppointment.id, start, end);
      await onRefresh();
      setEditingAppointment(null);
      setConfirmationMessage("Appointment time saved.");
    } catch (error) {
      onError(
        error instanceof Error ? error.message : "Unable to save the schedule.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleNewAppointmentChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    const nextValue = name === "phone" ? formatIndianPhoneInput(value) : value;

    if (name === "phone") {
      event.target.setCustomValidity("");
      setNewAppointmentPhoneError(null);
    }

    setNewAppointmentForm((currentValue) => ({
      ...currentValue,
      [name as keyof NewAppointmentForm]: nextValue,
    }));
  };

  const validateNewAppointmentPhone = (phone: string) => {
    const message = getIndianPhoneValidationMessage(phone);
    setNewAppointmentPhoneError(message);
    return message;
  };

  const handleNewAppointmentSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const normalizedPhone = normalizeIndianPhone(newAppointmentForm.phone);

    if (!normalizedPhone) {
      validateNewAppointmentPhone(newAppointmentForm.phone);
      return;
    }

    setIsSaving(true);
    onError(null);

    try {
      const { end, start } = parseScheduleRange(
        newAppointmentForm.scheduledStart,
        newAppointmentForm.scheduledEnd,
      );

      const accessToken = await getAccessToken();

      await createAdminAppointment({
        email: newAppointmentForm.email,
        fullName: newAppointmentForm.fullName,
        notes: newAppointmentForm.notes,
        phone: normalizedPhone,
        preferredDate: newAppointmentForm.scheduledStart.slice(0, 10),
        preferredTime: newAppointmentForm.scheduledStart.slice(11, 16),
        scheduledEnd: end.toISOString(),
        scheduledStart: start.toISOString(),
        treatment: newAppointmentForm.treatment,
      }, accessToken);
      await onRefresh();
      setNewAppointmentForm(initialNewAppointmentForm);
      setNewAppointmentPhoneError(null);
      setIsCreating(false);
      setConfirmationMessage("Admin appointment created.");
    } catch (error) {
      onError(
        error instanceof Error ? error.message : "Unable to create appointment.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <section className="pearl-dashboard-card p-5 sm:p-7">
        <div className="mb-7 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="pearl-kicker">
              Scheduling
            </p>
            <h2 className="mt-2 text-3xl text-[#183f41]">
              Appointment Calendar
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Drag appointments to reschedule, or select an event to adjust its
              confirmed time.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#287073]" />
              Approved
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-amber-500" />
              Pending
            </span>
          </div>
        </div>

        {confirmationMessage ? (
          <p className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            {confirmationMessage}
          </p>
        ) : null}

        <div className="pearl-calendar">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today createAppointment",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            customButtons={{
              createAppointment: {
                text: "New Appointment",
                hint: "Create a new appointment",
                click: () => {
                  setIsCreating(true);
                  setNewAppointmentPhoneError(null);
                  setConfirmationMessage(null);
                },
              },
            }}
            buttonText={{
              day: "Day",
              month: "Month",
              today: "Today",
              week: "Week",
            }}
            events={calendarEvents}
            editable={!isSaving}
            eventDurationEditable={!isSaving}
            eventStartEditable={!isSaving}
            eventClick={handleEventClick}
            eventDrop={(eventInfo: EventDropArg) => {
              void handleCalendarMove(
                eventInfo.event.id,
                eventInfo.event.start,
                eventInfo.event.end,
                eventInfo.revert,
              );
            }}
            eventResize={(eventInfo: EventResizeDoneArg) => {
              void handleCalendarMove(
                eventInfo.event.id,
                eventInfo.event.start,
                eventInfo.event.end,
                eventInfo.revert,
              );
            }}
            eventClassNames={(eventInfo) => [
              `pearl-calendar-event--${eventInfo.event.extendedProps.status}`,
            ]}
            height="auto"
            nowIndicator
            slotMinTime="07:00:00"
            slotMaxTime="19:00:00"
            allDaySlot={false}
          />
        </div>
      </section>

      {editingAppointment ? (
        <Modal
          title="Edit Appointment Time"
          onClose={() => setEditingAppointment(null)}
        >
          <form onSubmit={handleEditSubmit} className="grid gap-5 p-6 sm:grid-cols-2">
            <div className="rounded-xl bg-[#f5efe4] p-4 sm:col-span-2">
              <p className="font-semibold text-[#183f41]">
                {editingAppointment.full_name ?? "Patient"}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {editingAppointment.treatment ?? "Appointment"} |{" "}
                {editingAppointment.phone ?? "No phone provided"}
              </p>
            </div>
            <label className="text-sm font-semibold text-slate-700">
              Start Date and Time
              <input
                required
                type="datetime-local"
                name="scheduledStart"
                value={editForm.scheduledStart}
                onChange={handleEditChange}
                className="mt-2 w-full rounded-xl border border-[#eadfcf] bg-[#fffdf9] px-4 py-3 outline-none transition focus:border-[#347376] focus:ring-4 focus:ring-[#205356]/15"
              />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              End Date and Time
              <input
                required
                type="datetime-local"
                name="scheduledEnd"
                value={editForm.scheduledEnd}
                onChange={handleEditChange}
                className="mt-2 w-full rounded-xl border border-[#eadfcf] bg-[#fffdf9] px-4 py-3 outline-none transition focus:border-[#347376] focus:ring-4 focus:ring-[#205356]/15"
              />
            </label>
            <div className="flex justify-end gap-3 sm:col-span-2">
              <button
                type="button"
                onClick={() => setEditingAppointment(null)}
                className="rounded-full border border-[#dbc59b] px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-[#f5efe4]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-full bg-[#205356] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#183f41] disabled:opacity-60"
              >
                {isSaving ? "Saving" : "Save Time"}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {isCreating ? (
        <Modal
          title="New Appointment"
          onClose={() => {
            setIsCreating(false);
            setNewAppointmentPhoneError(null);
          }}
        >
          <form
            onSubmit={handleNewAppointmentSubmit}
            className="grid gap-5 p-6 sm:grid-cols-2"
          >
            <label className="text-sm font-semibold text-slate-700">
              Patient Name
              <input
                required
                name="fullName"
                value={newAppointmentForm.fullName}
                onChange={handleNewAppointmentChange}
                className="mt-2 w-full rounded-xl border border-[#eadfcf] bg-[#fffdf9] px-4 py-3 outline-none transition focus:border-[#347376] focus:ring-4 focus:ring-[#205356]/15"
                type="text"
              />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Phone
              <input
                required
                name="phone"
                value={newAppointmentForm.phone}
                onChange={handleNewAppointmentChange}
                onBlur={() =>
                  validateNewAppointmentPhone(newAppointmentForm.phone)
                }
                onInvalid={(event) => {
                  const message =
                    getIndianPhoneValidationMessage(
                      newAppointmentForm.phone,
                    ) ??
                    `Enter an Indian mobile number, for example ${indianMobileExample}.`;
                  event.currentTarget.setCustomValidity(message);
                  setNewAppointmentPhoneError(message);
                }}
                aria-describedby={
                  newAppointmentPhoneError
                    ? "new-appointment-phone-error"
                    : undefined
                }
                aria-invalid={newAppointmentPhoneError ? true : undefined}
                autoComplete="tel"
                className={`mt-2 w-full rounded-xl border bg-[#fffdf9] px-4 py-3 outline-none transition focus:ring-4 ${
                  newAppointmentPhoneError
                    ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                    : "border-[#eadfcf] focus:border-[#347376] focus:ring-[#205356]/15"
                }`}
                inputMode="tel"
                maxLength={15}
                pattern={indianMobilePattern}
                placeholder={indianMobileExample}
                title={`Enter an Indian mobile number in this format: ${indianMobileExample}`}
                type="tel"
              />
              {newAppointmentPhoneError ? (
                <p
                  className="mt-2 text-xs font-medium text-red-700"
                  id="new-appointment-phone-error"
                >
                  {newAppointmentPhoneError}
                </p>
              ) : null}
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Email
              <input
                required
                name="email"
                value={newAppointmentForm.email}
                onChange={handleNewAppointmentChange}
                className="mt-2 w-full rounded-xl border border-[#eadfcf] bg-[#fffdf9] px-4 py-3 outline-none transition focus:border-[#347376] focus:ring-4 focus:ring-[#205356]/15"
                type="email"
              />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Treatment
              <select
                required
                name="treatment"
                value={newAppointmentForm.treatment}
                onChange={handleNewAppointmentChange}
                className="mt-2 w-full rounded-xl border border-[#eadfcf] bg-[#fffdf9] px-4 py-3 outline-none transition focus:border-[#347376] focus:ring-4 focus:ring-[#205356]/15"
              >
                <option value="" disabled>
                  Choose a treatment
                </option>
                {treatmentOptions.map((treatment) => (
                  <option key={treatment} value={treatment}>
                    {treatment}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Start Date and Time
              <input
                required
                name="scheduledStart"
                value={newAppointmentForm.scheduledStart}
                onChange={handleNewAppointmentChange}
                className="mt-2 w-full rounded-xl border border-[#eadfcf] bg-[#fffdf9] px-4 py-3 outline-none transition focus:border-[#347376] focus:ring-4 focus:ring-[#205356]/15"
                type="datetime-local"
              />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              End Date and Time
              <input
                required
                name="scheduledEnd"
                value={newAppointmentForm.scheduledEnd}
                onChange={handleNewAppointmentChange}
                className="mt-2 w-full rounded-xl border border-[#eadfcf] bg-[#fffdf9] px-4 py-3 outline-none transition focus:border-[#347376] focus:ring-4 focus:ring-[#205356]/15"
                type="datetime-local"
              />
            </label>
            <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
              Note
              <textarea
                name="notes"
                value={newAppointmentForm.notes}
                onChange={handleNewAppointmentChange}
                className="mt-2 min-h-28 w-full resize-y rounded-xl border border-[#eadfcf] bg-[#fffdf9] px-4 py-3 outline-none transition focus:border-[#347376] focus:ring-4 focus:ring-[#205356]/15"
              />
            </label>
            <div className="flex justify-end gap-3 sm:col-span-2">
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setNewAppointmentPhoneError(null);
                }}
                className="rounded-full border border-[#dbc59b] px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-[#f5efe4]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-full bg-[#205356] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#183f41] disabled:opacity-60"
              >
                {isSaving ? "Saving" : "Create Appointment"}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </>
  );
}
