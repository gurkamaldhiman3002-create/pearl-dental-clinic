import { useMemo } from "react";
import {
  calculateAppointmentAnalytics,
  type TreatmentAppointmentCount,
} from "@/app/lib/appointmentAnalytics";
import { clinicInformation } from "@/app/lib/clinicContent";
import type { AppointmentRecord } from "@/app/types/appointments";

type AdminAnalyticsProps = {
  appointments: AppointmentRecord[];
};

type MetricTone = "blue" | "cyan" | "emerald" | "amber" | "rose" | "indigo";

const chartColors = [
  "#1d4ed8",
  "#0891b2",
  "#38bdf8",
  "#34d399",
  "#818cf8",
  "#94a3b8",
];

const toneStyles: Record<MetricTone, string> = {
  amber: "bg-amber-50 text-amber-700",
  blue: "bg-blue-50 text-blue-700",
  cyan: "bg-cyan-50 text-cyan-700",
  emerald: "bg-emerald-50 text-emerald-700",
  indigo: "bg-indigo-50 text-indigo-700",
  rose: "bg-rose-50 text-rose-700",
};

function MetricIcon({ tone }: { tone: MetricTone }) {
  return (
    <span
      className={`flex h-11 w-11 items-center justify-center rounded-lg ${toneStyles[tone]}`}
    >
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M8 3v3M16 3v3M4 10h16M7 5h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z" />
        <path d="M8 14h3M8 17h7" />
      </svg>
    </span>
  );
}

function AnalyticsCard({
  label,
  tone,
  value,
}: {
  label: string;
  tone: MetricTone;
  value: number | string;
}) {
  return (
    <article className="rounded-lg border border-sky-100 bg-white p-5 shadow-lg shadow-blue-950/[0.04]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <MetricIcon tone={tone} />
      </div>
      <p
        className={`mt-4 font-bold text-blue-950 ${
          typeof value === "string" ? "text-xl leading-snug" : "text-3xl"
        }`}
      >
        {value}
      </p>
    </article>
  );
}

function groupTreatmentData(treatments: TreatmentAppointmentCount[]) {
  const visibleTreatments = treatments.slice(0, 5);

  if (treatments.length <= 5) {
    return visibleTreatments;
  }

  return [
    ...visibleTreatments,
    {
      count: treatments
        .slice(5)
        .reduce((total, treatment) => total + treatment.count, 0),
      treatment: "Other treatments",
    },
  ];
}

function createDistributionGradient(treatments: TreatmentAppointmentCount[]) {
  const total = treatments.reduce(
    (count, treatment) => count + treatment.count,
    0,
  );

  if (total === 0) {
    return "#e2e8f0";
  }

  let start = 0;
  const segments = treatments.map((treatment, index) => {
    const end = start + (treatment.count / total) * 100;
    const segment = `${chartColors[index % chartColors.length]} ${start}% ${end}%`;
    start = end;
    return segment;
  });

  return `conic-gradient(${segments.join(", ")})`;
}

export default function AdminAnalytics({ appointments }: AdminAnalyticsProps) {
  const analytics = useMemo(
    () => calculateAppointmentAnalytics(appointments),
    [appointments],
  );
  const treatmentChartData = groupTreatmentData(analytics.treatmentDistribution);
  const totalTreatments = treatmentChartData.reduce(
    (count, treatment) => count + treatment.count,
    0,
  );
  const maximumMonthlyAppointments = Math.max(
    ...analytics.monthlyAppointments.map((month) => month.count),
    1,
  );

  const cards: {
    label: string;
    tone: MetricTone;
    value: number | string;
  }[] = [
    {
      label: "Total Appointments",
      tone: "blue",
      value: analytics.totalAppointments,
    },
    {
      label: "Pending Appointments",
      tone: "amber",
      value: analytics.pendingAppointments,
    },
    {
      label: "Approved Appointments",
      tone: "emerald",
      value: analytics.approvedAppointments,
    },
    {
      label: "Rejected Appointments",
      tone: "rose",
      value: analytics.rejectedAppointments,
    },
    {
      label: `Appointments Today (${clinicInformation.timeZoneLabel})`,
      tone: "cyan",
      value: analytics.appointmentsToday,
    },
    {
      label: "Most Requested Treatment",
      tone: "indigo",
      value: analytics.mostRequestedTreatment,
    },
  ];

  return (
    <section aria-label="Appointment analytics" className="mb-8 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <AnalyticsCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-lg border border-sky-100 bg-white p-5 shadow-lg shadow-blue-950/[0.04] sm:p-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-600">
              Appointment Trends
            </p>
            <h2 className="mt-2 text-xl font-bold text-blue-950">
              Monthly Appointments
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Scheduled or requested visits across the last six months in{" "}
              {clinicInformation.timeZoneLabel}.
            </p>
          </div>

          <div className="mt-8 overflow-x-auto pb-1">
            <div className="grid min-w-[400px] grid-cols-6 gap-3">
              {analytics.monthlyAppointments.map((month) => (
                <div className="text-center" key={month.key}>
                  <p className="mb-2 text-xs font-bold text-blue-950">
                    {month.count}
                  </p>
                  <div className="flex h-36 items-end rounded-lg bg-slate-50 px-2">
                    <div
                      aria-label={`${month.count} appointments in ${month.label}`}
                      className={`w-full rounded-t-md transition ${
                        month.count > 0
                          ? "bg-gradient-to-t from-blue-700 to-cyan-400"
                          : "h-px bg-slate-200"
                      }`}
                      style={
                        month.count > 0
                          ? {
                              height: `${Math.max(
                                (month.count / maximumMonthlyAppointments) * 100,
                                10,
                              )}%`,
                            }
                          : undefined
                      }
                    />
                  </div>
                  <p className="mt-3 text-xs font-semibold text-slate-500">
                    {month.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="rounded-lg border border-sky-100 bg-white p-5 shadow-lg shadow-blue-950/[0.04] sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-600">
            Care Demand
          </p>
          <h2 className="mt-2 text-xl font-bold text-blue-950">
            Treatment Distribution
          </h2>

          <div className="mt-7 flex flex-col items-center gap-7 sm:flex-row sm:items-start">
            <div
              aria-label={`${totalTreatments} appointments with selected treatments`}
              className="relative flex h-40 w-40 shrink-0 items-center justify-center rounded-full"
              style={{ background: createDistributionGradient(treatmentChartData) }}
            >
              <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white shadow-inner">
                <span className="text-2xl font-bold text-blue-950">
                  {totalTreatments}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  requests
                </span>
              </div>
            </div>

            <div className="w-full space-y-3">
              {treatmentChartData.length === 0 ? (
                <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                  Treatment requests will appear here once appointments are submitted.
                </p>
              ) : (
                treatmentChartData.map((treatment, index) => (
                  <div className="flex items-center gap-3" key={treatment.treatment}>
                    <span
                      aria-hidden="true"
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{
                        backgroundColor: chartColors[index % chartColors.length],
                      }}
                    />
                    <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">
                      {treatment.treatment}
                    </p>
                    <p className="text-sm font-bold text-blue-950">
                      {treatment.count}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
