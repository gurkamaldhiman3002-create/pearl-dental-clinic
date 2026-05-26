import "server-only";
import { Resend } from "resend";
import {
  formatLongDate as formatDate,
  formatTime,
} from "@/app/lib/appointmentFormatters";
import { clinicInformation } from "@/app/lib/clinicContent";

type AppointmentEmailDetails = {
  email: string;
  fullName: string;
  notes?: string | null;
  phone?: string | null;
  preferredDate: string | null;
  preferredTime: string | null;
  timingLabel?: "Preferred" | "Scheduled";
  treatment: string | null;
};

type RescheduleSuggestionEmailDetails = AppointmentEmailDetails & {
  message?: string | null;
  suggestedDate: string;
  suggestedTime: string;
};

type AppointmentStatus = "approved" | "rejected";

const fromEmail =
  process.env.RESEND_FROM_EMAIL ??
  "Pearl Dental Clinic <onboarding@resend.dev>";

const clinicSignature = `${clinicInformation.name}
${clinicInformation.addressLines.join("\n")}
${clinicInformation.phoneDisplay}
${clinicInformation.email}
Google Maps: ${clinicInformation.mapHref}`;

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  return new Resend(apiKey);
}

function appointmentSummary(details: AppointmentEmailDetails) {
  const timingLabel = details.timingLabel ?? "Preferred";

  return `Treatment: ${details.treatment ?? "Not provided"}
${timingLabel} date: ${formatDate(details.preferredDate)}
${timingLabel} time (${clinicInformation.timeZoneLabel}): ${formatTime(details.preferredTime)}`;
}

export async function sendNewAppointmentAdminEmail(
  details: AppointmentEmailDetails,
) {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    throw new Error("ADMIN_EMAIL is not configured.");
  }

  const resend = getResendClient();

  return resend.emails.send({
    from: fromEmail,
    to: adminEmail,
    subject: "New Appointment Request - Pearl Dental Clinic",
    text: `A new appointment request has been submitted.

Patient full name: ${details.fullName}
Email: ${details.email}
Phone: ${details.phone ?? "Not provided"}
Treatment: ${details.treatment ?? "Not provided"}
Preferred date: ${formatDate(details.preferredDate)}
Preferred time (${clinicInformation.timeZoneLabel}): ${formatTime(details.preferredTime)}
Notes: ${details.notes?.trim() ? details.notes : "Not provided"}

Please review this request in the admin dashboard.

${clinicSignature}`,
  });
}

export async function sendAppointmentPendingEmail(
  details: AppointmentEmailDetails,
) {
  const resend = getResendClient();

  return resend.emails.send({
    from: fromEmail,
    to: details.email,
    subject: "Pearl Dental Clinic appointment request received",
    text: `Hello ${details.fullName},

Thank you for requesting an appointment with Pearl Dental Clinic. Your request is currently pending review.

${appointmentSummary(details)}

Our team will review your request and follow up soon.

${clinicSignature}`,
  });
}

export async function sendAppointmentStatusEmail(
  details: AppointmentEmailDetails,
  status: AppointmentStatus,
) {
  const resend = getResendClient();
  const isApproved = status === "approved";

  return resend.emails.send({
    from: fromEmail,
    to: details.email,
    subject: isApproved
      ? "Pearl Dental Clinic appointment approved"
      : "Pearl Dental Clinic appointment update",
    text: `Hello ${details.fullName},

Your appointment request has been ${status}.

${appointmentSummary(details)}

${
  isApproved
    ? `We look forward to seeing you at ${clinicInformation.name}.`
    : `Please contact ${clinicInformation.name} if you would like to request another appointment time.`
}

${clinicSignature}`,
  });
}

export async function sendAppointmentRescheduleSuggestionEmail(
  details: RescheduleSuggestionEmailDetails,
) {
  const resend = getResendClient();
  const adminMessage = details.message?.trim()
    ? `\nMessage from our team: ${details.message.trim()}\n`
    : "";

  return resend.emails.send({
    from: fromEmail,
    to: details.email,
    subject: "Suggested new appointment time - Pearl Dental Clinic",
    text: `Hello ${details.fullName},

Your requested appointment time is unavailable. We would be happy to see you at the suggested time below.

Treatment: ${details.treatment ?? "Not provided"}
Requested date: ${formatDate(details.preferredDate)}
Requested time (${clinicInformation.timeZoneLabel}): ${formatTime(details.preferredTime)}
Suggested date: ${formatDate(details.suggestedDate)}
Suggested time (${clinicInformation.timeZoneLabel}): ${formatTime(details.suggestedTime)}
${adminMessage}
Please contact Pearl Dental Clinic to confirm this new time or discuss another option.

${clinicSignature}`,
  });
}
