import {
  getIndianPhoneValidationMessage,
  normalizeIndianPhone,
} from "@/app/lib/indianPhone";
import { getAuthenticatedSupabaseClient } from "@/app/services/server/authentication";

type ScheduleUpdateRequest = {
  appointmentId?: string | number;
  scheduledEnd?: string;
  scheduledStart?: string;
};

type CustomAppointmentRequest = {
  email?: string;
  fullName?: string;
  notes?: string;
  phone?: string;
  preferredDate?: string;
  preferredTime?: string;
  scheduledEnd?: string;
  scheduledStart?: string;
  treatment?: string;
};

function parseScheduleRange(scheduledStart?: string, scheduledEnd?: string) {
  if (!scheduledStart || !scheduledEnd) {
    return { error: "Scheduled start and end times are required." };
  }

  const start = new Date(scheduledStart);
  const end = new Date(scheduledEnd);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { error: "Scheduled start and end times must be valid dates." };
  }

  if (end <= start) {
    return { error: "Scheduled end time must be after the start time." };
  }

  return {
    scheduledEnd: end.toISOString(),
    scheduledStart: start.toISOString(),
  };
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as ScheduleUpdateRequest;
  const authentication = await getAuthenticatedSupabaseClient(request);

  if (!authentication.supabase) {
    return Response.json({ error: authentication.error }, { status: 401 });
  }

  if (!body.appointmentId) {
    return Response.json(
      { error: "Appointment id is required." },
      { status: 400 },
    );
  }

  const schedule = parseScheduleRange(body.scheduledStart, body.scheduledEnd);

  if (schedule.error) {
    return Response.json({ error: schedule.error }, { status: 400 });
  }

  const { error } = await authentication.supabase
    .from("appointments")
    .update({
      scheduled_end: schedule.scheduledEnd,
      scheduled_start: schedule.scheduledStart,
    })
    .eq("id", body.appointmentId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}

export async function POST(request: Request) {
  const body = (await request.json()) as CustomAppointmentRequest;
  const authentication = await getAuthenticatedSupabaseClient(request);

  if (!authentication.supabase) {
    return Response.json({ error: authentication.error }, { status: 401 });
  }

  if (
    !body.fullName ||
    !body.phone ||
    !body.email ||
    !body.treatment ||
    !body.preferredDate ||
    !body.preferredTime
  ) {
    return Response.json(
      { error: "Complete all required appointment fields." },
      { status: 400 },
    );
  }

  const normalizedPhone = normalizeIndianPhone(body.phone);

  if (!normalizedPhone) {
    return Response.json(
      {
        error:
          getIndianPhoneValidationMessage(body.phone) ??
          "Please provide a valid Indian mobile number.",
      },
      { status: 400 },
    );
  }

  const schedule = parseScheduleRange(body.scheduledStart, body.scheduledEnd);

  if (schedule.error) {
    return Response.json({ error: schedule.error }, { status: 400 });
  }

  const { error } = await authentication.supabase.from("appointments").insert({
    email: body.email,
    full_name: body.fullName,
    notes: body.notes ?? "",
    patient_id: null,
    phone: normalizedPhone,
    preferred_date: body.preferredDate,
    preferred_time: body.preferredTime,
    scheduled_end: schedule.scheduledEnd,
    scheduled_start: schedule.scheduledStart,
    status: "approved",
    treatment: body.treatment,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
