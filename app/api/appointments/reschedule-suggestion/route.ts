import { getErrorMessage } from "@/app/lib/errors";
import { sendAppointmentRescheduleSuggestionEmail } from "@/app/services/email";
import { getAuthenticatedSupabaseClient } from "@/app/services/server/authentication";

type RescheduleSuggestionRequest = {
  appointmentId?: string | number;
  message?: string;
  suggestedDate?: string;
  suggestedTime?: string;
};

type AppointmentRow = {
  email: string | null;
  full_name: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  treatment: string | null;
};

function isValidSuggestedTime(date?: string, time?: string) {
  if (!date || !time) {
    return false;
  }

  const value = new Date(`${date}T${time}`);

  return !Number.isNaN(value.getTime());
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as RescheduleSuggestionRequest;
  const authentication = await getAuthenticatedSupabaseClient(request);

  if (
    !body.appointmentId ||
    !isValidSuggestedTime(body.suggestedDate, body.suggestedTime)
  ) {
    return Response.json(
      { error: "Appointment, suggested date, and suggested time are required." },
      { status: 400 },
    );
  }

  if (!authentication.supabase) {
    return Response.json(
      { error: authentication.error },
      { status: 401 },
    );
  }

  const { data: appointment, error: appointmentError } =
    await authentication.supabase
    .from("appointments")
    .select("email, full_name, preferred_date, preferred_time, treatment")
    .eq("id", body.appointmentId)
    .eq("status", "pending")
    .single<AppointmentRow>();

  if (appointmentError || !appointment) {
    return Response.json(
      { error: "Only pending appointments can receive a new time suggestion." },
      { status: 409 },
    );
  }

  if (!appointment.email) {
    return Response.json(
      { error: "This appointment does not include a patient email address." },
      { status: 400 },
    );
  }

  try {
    await sendAppointmentRescheduleSuggestionEmail({
      email: appointment.email,
      fullName: appointment.full_name ?? "Patient",
      message: body.message ?? "",
      preferredDate: appointment.preferred_date,
      preferredTime: appointment.preferred_time,
      suggestedDate: body.suggestedDate!,
      suggestedTime: body.suggestedTime!,
      treatment: appointment.treatment,
    });
  } catch (error) {
    return Response.json(
      {
        error: `Unable to send patient email: ${getErrorMessage(
          error,
          "Unknown email error.",
        )}`,
      },
      { status: 502 },
    );
  }

  const { data: updatedAppointment, error: updateError } =
    await authentication.supabase
    .from("appointments")
    .update({
      admin_note: body.message?.trim() ?? "",
      status: "reschedule_suggested",
    })
    .eq("id", body.appointmentId)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (updateError) {
    return Response.json({ error: updateError.message }, { status: 500 });
  }

  if (!updatedAppointment) {
    return Response.json(
      { error: "The appointment changed before the suggestion was saved." },
      { status: 409 },
    );
  }

  return Response.json({ ok: true });
}
