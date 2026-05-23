export type AppointmentStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "reschedule_suggested"
  | string;

export type AppointmentRecord = {
  id: string | number;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  treatment: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  notes: string | null;
  admin_note: string | null;
  scheduled_start: string | null;
  scheduled_end: string | null;
  status: AppointmentStatus | null;
};

export type PatientAppointment = Pick<
  AppointmentRecord,
  | "id"
  | "treatment"
  | "preferred_date"
  | "preferred_time"
  | "scheduled_start"
  | "status"
>;

export type BookingForm = {
  fullName: string;
  email: string;
  phone: string;
  treatment: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
};

export type AppointmentSubmission = {
  full_name: string;
  email: string;
  phone: string;
  treatment: string;
  preferred_date: string;
  preferred_time: string;
  notes: string;
  status: "pending";
};
