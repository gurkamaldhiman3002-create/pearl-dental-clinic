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
  "#063B35",
  "#C6A15B",
  "#6B746F",
  "#8FA09A",
  "#E8D6A3",
  "#A9A196",
];

const toneStyles: Record<MetricTone, string> = {
  amber: "bg-[#EFE4D4] text-[#8B6F36]",
  blue: "bg-[#EEF3F0] text-[#063B35]",
  cyan: "bg-[#EEF3F0] text-[#063B35]",
  emerald: "bg-[#e9f1ea] text-[#35664e]",
  indigo: "bg-[#eee9df] text-[#526566]",
  rose: "bg-[#f6e9e5] text-[#925147]",
};

function MetricIcon({ tone }: { tone: MetricTone }) {
  return (
    <span
      className={`flex h-11 w-11 items-center justify-center rounded-xl ${toneStyles[tone]}`}
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
    <article className="pearl-dashboard-card pearl-lift p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <MetricIcon tone={tone} />
      </div>
      <p
        className={`mt-4 text-[#063B35] ${
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
    return "#EFE4D4";
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
        <article className="pearl-dashboard-card p-5 sm:p-7">
          <div>
            <p className="pearl-kicker">
              Appointment Trends
            </p>
            <h2 className="mt-2 text-3xl text-[#063B35]">
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
                  <p className="mb-2 text-xs font-semibold text-[#063B35]">
                    {month.count}
                  </p>
                  <div className="flex h-36 items-end rounded-xl bg-[#F7F1E8] px-2">
                    <div
                      aria-label={`${month.count} appointments in ${month.label}`}
                      className={`w-full rounded-t-md transition ${
                        month.count > 0
                          ? "bg-gradient-to-t from-[#063B35] to-[#E8D6A3]"
                          : "h-px bg-[#ded4c3]"
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

        <article className="pearl-dashboard-card p-5 sm:p-7">
          <p className="pearl-kicker">
            Care Demand
          </p>
          <h2 className="mt-2 text-3xl text-[#063B35]">
            Treatment Distribution
          </h2>

          <div className="mt-7 flex flex-col items-center gap-7 sm:flex-row sm:items-start">
            <div
              aria-label={`${totalTreatments} appointments with selected treatments`}
              className="relative flex h-40 w-40 shrink-0 items-center justify-center rounded-full"
              style={{ background: createDistributionGradient(treatmentChartData) }}
            >
              <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-[#FFFCF7] shadow-inner">
                <span className="text-2xl text-[#063B35]">
                  {totalTreatments}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  requests
                </span>
              </div>
            </div>

            <div className="w-full space-y-3">
              {treatmentChartData.length === 0 ? (
                <p className="rounded-xl bg-[#F7F1E8] p-4 text-sm text-slate-500">
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
                    <p className="text-sm font-semibold text-[#063B35]">
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
