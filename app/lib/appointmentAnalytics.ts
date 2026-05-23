import { clinicInformation } from "@/app/lib/clinicContent";
import type { AppointmentRecord } from "@/app/types/appointments";

export type MonthlyAppointmentCount = {
  count: number;
  key: string;
  label: string;
};

export type TreatmentAppointmentCount = {
  count: number;
  treatment: string;
};

export type AppointmentAnalytics = {
  approvedAppointments: number;
  appointmentsToday: number;
  monthlyAppointments: MonthlyAppointmentCount[];
  mostRequestedTreatment: string;
  pendingAppointments: number;
  rejectedAppointments: number;
  totalAppointments: number;
  treatmentDistribution: TreatmentAppointmentCount[];
};

function toDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "2-digit",
    timeZone: clinicInformation.timeZone,
    year: "numeric",
  }).formatToParts(date);
  const valueFor = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${valueFor("year")}-${valueFor("month")}-${valueFor("day")}`;
}

function toMonthKey(date: Date) {
  return toDateKey(date).slice(0, 7);
}

function addClinicOffset(value: string) {
  return new Date(`${value}T00:00:00+05:30`);
}

function getAppointmentDate(appointment: AppointmentRecord) {
  if (appointment.scheduled_start) {
    const scheduledDate = new Date(appointment.scheduled_start);

    if (!Number.isNaN(scheduledDate.getTime())) {
      return scheduledDate;
    }
  }

  if (appointment.preferred_date) {
    const preferredDate = addClinicOffset(appointment.preferred_date);

    if (!Number.isNaN(preferredDate.getTime())) {
      return preferredDate;
    }
  }

  return null;
}

function getRecentMonths(referenceDate: Date) {
  const [year, month] = toMonthKey(referenceDate)
    .split("-")
    .map(Number);

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(Date.UTC(
      year,
      month - 1 - 5 + index,
      1,
    ));
    const keyMonth = String(date.getUTCMonth() + 1).padStart(2, "0");

    return {
      count: 0,
      key: `${date.getUTCFullYear()}-${keyMonth}`,
      label: date.toLocaleDateString("en-IN", {
        month: "short",
        timeZone: "UTC",
      }),
    };
  });
}

export function calculateAppointmentAnalytics(
  appointments: AppointmentRecord[],
  referenceDate = new Date(),
): AppointmentAnalytics {
  const monthlyAppointments = getRecentMonths(referenceDate);
  const monthlyCounts = new Map(
    monthlyAppointments.map((month) => [month.key, month]),
  );
  const treatmentCounts = new Map<string, number>();
  const todayKey = toDateKey(referenceDate);
  let appointmentsToday = 0;

  for (const appointment of appointments) {
    const appointmentDate = getAppointmentDate(appointment);

    if (appointmentDate) {
      if (toDateKey(appointmentDate) === todayKey) {
        appointmentsToday += 1;
      }

      const month = monthlyCounts.get(toMonthKey(appointmentDate));

      if (month) {
        month.count += 1;
      }
    }

    const treatment = appointment.treatment?.trim();

    if (treatment) {
      treatmentCounts.set(treatment, (treatmentCounts.get(treatment) ?? 0) + 1);
    }
  }

  const treatmentDistribution = [...treatmentCounts.entries()]
    .map(([treatment, count]) => ({ count, treatment }))
    .sort(
      (first, second) =>
        second.count - first.count ||
        first.treatment.localeCompare(second.treatment),
    );

  return {
    approvedAppointments: appointments.filter(
      (appointment) => appointment.status === "approved",
    ).length,
    appointmentsToday,
    monthlyAppointments,
    mostRequestedTreatment:
      treatmentDistribution[0]?.treatment ?? "No requests yet",
    pendingAppointments: appointments.filter(
      (appointment) => appointment.status === "pending",
    ).length,
    rejectedAppointments: appointments.filter(
      (appointment) => appointment.status === "rejected",
    ).length,
    totalAppointments: appointments.length,
    treatmentDistribution,
  };
}
