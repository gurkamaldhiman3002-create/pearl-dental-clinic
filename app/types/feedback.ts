export type PatientFeedbackSubmission = {
  feedback: string;
  name: string;
  rating: number;
  treatment: string;
};

export type ApprovedPatientFeedback = PatientFeedbackSubmission & {
  created_at: string | null;
  id: string | number;
};

export type AdminPatientFeedback = ApprovedPatientFeedback & {
  is_approved: boolean;
};
