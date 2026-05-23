import { clinicInformation } from "@/app/lib/clinicContent";
import { getErrorMessage } from "@/app/lib/errors";
import { sendAppointmentStatusEmail } from "@/app/services/email";
import { getAuthenticatedSupabaseClient } from "@/app/services/server/authentication";

type StatusRequest = {
  appointmentId?: string | number;
  status?: "approved" | "rejected";
};

type AppointmentRow = {
  email: string | null;
  full_name: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  scheduled_start: string | null;
  treatment: string | null;
};

function getScheduledTiming(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const parts = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    hourCycle: "h23",
    minute: "2-digit",
    month: "2-digit",
    timeZone: clinicInformation.timeZone,
    year: "numeric",
  }).formatToParts(date);
  const valueFor = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    date: `${valueFor("year")}-${valueFor("month")}-${valueFor("day")}`,
    time: `${valueFor("hour")}:${valueFor("minute")}`,
  };
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as StatusRequest;
  const authentication = await getAuthenticatedSupabaseClient(request);

  if (!body.appointmentId || !body.status) {
    return Response.json(
      { error: "Appointment id and status are required." },
      { status: 400 },
    );
  }

  if (!authentication.supabase) {
    return Response.json(
      { error: authentication.error },
      { status: 401 },
    );
  }

  const { data, error } = await authentication.supabase
    .from("appointments")
    .update({ status: body.status })
    .eq("id", body.appointmentId)
    .select(
      "email, full_name, preferred_date, preferred_time, scheduled_start, treatment",
    )
    .single<AppointmentRow>();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  let emailError: string | null = null;

  if (data.email) {
    try {
      const scheduledTiming = getScheduledTiming(data.scheduled_start);

      await sendAppointmentStatusEmail(
        {
          email: data.email,
          fullName: data.full_name ?? "Patient",
          preferredDate: scheduledTiming?.date ?? data.preferred_date,
          preferredTime: scheduledTiming?.time ?? data.preferred_time,
          timingLabel: scheduledTiming ? "Scheduled" : "Preferred",
          treatment: data.treatment,
        },
        body.status,
      );
    } catch (error) {
      emailError = getErrorMessage(error, "Unknown email error.");
    }
  }

  return Response.json({ ok: true, emailError });
}
