import { formatStatus, statusStyles } from "@/app/lib/appointmentFormatters";

export default function AppointmentStatusBadge({
  status,
}: {
  status: string | null;
}) {
  return (
    <span
      className={`pearl-badge ${
        statusStyles[status ?? ""] ??
        "border-[rgba(198,161,91,0.28)] bg-[#F7F1E8] text-[#6B746F]"
      }`}
    >
      {formatStatus(status)}
    </span>
  );
}
