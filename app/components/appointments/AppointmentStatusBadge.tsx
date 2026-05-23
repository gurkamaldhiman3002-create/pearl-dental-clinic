import { formatStatus, statusStyles } from "@/app/lib/appointmentFormatters";

export default function AppointmentStatusBadge({
  status,
}: {
  status: string | null;
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold capitalize ${
        statusStyles[status ?? ""] ??
        "border-slate-200 bg-slate-50 text-slate-700"
      }`}
    >
      {formatStatus(status)}
    </span>
  );
}
