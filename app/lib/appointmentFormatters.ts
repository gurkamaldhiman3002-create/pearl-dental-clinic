import { clinicInformation } from "@/app/lib/clinicContent";

const statusLabels: Record<string, string> = {
  approved: "Approved",
  pending: "Pending",
  rejected: "Rejected",
  reschedule_suggested: "New Time Suggested",
};

export const statusStyles: Record<string, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-800",
  rejected: "border-red-200 bg-red-50 text-red-800",
  reschedule_suggested: "border-cyan-200 bg-cyan-50 text-cyan-800",
};

export function formatValue(value: string | null) {
  return value?.trim() ? value : "Not provided";
}

export function formatStatus(value: string | null) {
  if (!value) {
    return "Not provided";
  }

  return statusLabels[value] ?? value.replaceAll("_", " ");
}

export function formatDate(value: string | null) {
  if (!value) {
    return "Not provided";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatLongDate(value: string | null) {
  if (!value) {
    return "Not provided";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatTime(value: string | null) {
  if (!value) {
    return "Not provided";
  }

  const date = new Date(`1970-01-01T${value}`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatScheduledDate(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    timeZone: clinicInformation.timeZone,
    year: "numeric",
  }).format(date);
}

export function formatScheduledTime(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeZone: clinicInformation.timeZone,
    timeStyle: "short",
  }).format(date);
}

export function formatScheduledClockTime(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: clinicInformation.timeZone,
  }).format(date);
}
