import {
  sendAppointmentPendingEmail,
  sendNewAppointmentAdminEmail,
} from "@/app/services/email";
import { getErrorMessage } from "@/app/lib/errors";
import {
  getIndianPhoneValidationMessage,
  normalizeIndianPhone,
} from "@/app/lib/indianPhone";
import { createSupabaseServerClient } from "@/app/lib/supabaseServer";
import { getBearerToken } from "@/app/services/server/authentication";

type AppointmentRequest = {
  email?: string;
  full_name?: string;
  notes?: string;
  phone?: string;
  preferred_date?: string;
  preferred_time?: string;
  treatment?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as AppointmentRequest;
  const accessToken = getBearerToken(request);
  const supabase = createSupabaseServerClient(accessToken);

  if (
    !body.email ||
    !body.full_name ||
    !body.phone ||
    !body.preferred_date ||
    !body.preferred_time ||
    !body.treatment
  ) {
    return Response.json(
      { error: "Missing required appointment fields." },
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

  let patientId: string | null = null;

  if (accessToken) {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);

    if (error) {
      return Response.json({ error: error.message }, { status: 401 });
    }

    patientId = user?.id ?? null;
  }

  const appointment = {
    email: body.email,
    full_name: body.full_name,
    notes: body.notes ?? "",
    patient_id: patientId,
    phone: normalizedPhone,
    preferred_date: body.preferred_date,
    preferred_time: body.preferred_time,
    status: "pending",
    treatment: body.treatment,
  };

  const { error } = await supabase.from("appointments").insert(appointment);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  let emailError: string | null = null;

  try {
    await sendAppointmentPendingEmail({
      email: body.email,
      fullName: body.full_name,
      preferredDate: body.preferred_date,
      preferredTime: body.preferred_time,
      treatment: body.treatment,
    });
  } catch (error) {
    emailError = getErrorMessage(error, "Unknown email error.");
  }

  try {
    await sendNewAppointmentAdminEmail({
      email: body.email,
      fullName: body.full_name,
      notes: body.notes ?? "",
      phone: normalizedPhone,
      preferredDate: body.preferred_date,
      preferredTime: body.preferred_time,
      treatment: body.treatment,
    });
  } catch (error) {
    emailError = emailError
      ? `${emailError} Admin email: ${getErrorMessage(error, "Unknown email error.")}`
      : getErrorMessage(error, "Unknown email error.");
  }

  return Response.json({ ok: true, emailError });
}
