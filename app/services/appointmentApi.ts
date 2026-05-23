import type { AppointmentSubmission } from "@/app/types/appointments";

type ApiResult = {
  error?: string;
};

type AdminAppointmentSubmission = {
  email: string;
  fullName: string;
  notes: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  scheduledEnd: string;
  scheduledStart: string;
  treatment: string;
};

async function requestJson(
  url: string,
  options: RequestInit,
  fallbackError: string,
) {
  const response = await fetch(url, options);
  const result = (await response.json()) as ApiResult;

  if (!response.ok) {
    throw new Error(result.error ?? fallbackError);
  }
}

function authorizedHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

export async function submitAppointmentRequest(
  appointment: AppointmentSubmission,
  accessToken?: string,
) {
  return requestJson(
    "/api/appointments",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify(appointment),
    },
    "We could not submit your appointment request. Please try again.",
  );
}

export async function updateAppointmentStatus(
  appointmentId: string | number,
  status: "approved" | "rejected",
  accessToken: string,
) {
  return requestJson(
    "/api/appointments/status",
    {
      method: "PATCH",
      headers: authorizedHeaders(accessToken),
      body: JSON.stringify({ appointmentId, status }),
    },
    "Unable to update appointment status.",
  );
}

export async function suggestAppointmentTime(
  appointmentId: string | number,
  suggestion: {
    message: string;
    suggestedDate: string;
    suggestedTime: string;
  },
  accessToken: string,
) {
  return requestJson(
    "/api/appointments/reschedule-suggestion",
    {
      method: "PATCH",
      headers: authorizedHeaders(accessToken),
      body: JSON.stringify({ appointmentId, ...suggestion }),
    },
    "Unable to send the suggested appointment time.",
  );
}

export async function updateAppointmentSchedule(
  appointmentId: string | number,
  scheduledStart: string,
  scheduledEnd: string,
  accessToken: string,
) {
  return requestJson(
    "/api/appointments/schedule",
    {
      method: "PATCH",
      headers: authorizedHeaders(accessToken),
      body: JSON.stringify({ appointmentId, scheduledEnd, scheduledStart }),
    },
    "Unable to update the calendar.",
  );
}

export async function createAdminAppointment(
  appointment: AdminAppointmentSubmission,
  accessToken: string,
) {
  return requestJson(
    "/api/appointments/schedule",
    {
      method: "POST",
      headers: authorizedHeaders(accessToken),
      body: JSON.stringify(appointment),
    },
    "Unable to create appointment.",
  );
}
