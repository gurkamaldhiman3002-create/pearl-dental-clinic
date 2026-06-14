import type {
  AdminPatientFeedback,
  ApprovedPatientFeedback,
  PatientFeedbackSubmission,
} from "@/app/types/feedback";

type FeedbackApiResult<TFeedback> = {
  error?: string;
  feedback?: TFeedback[];
};

async function readFeedbackResponse<TFeedback>(
  response: Response,
  fallbackError: string,
) {
  const result = (await response.json()) as FeedbackApiResult<TFeedback>;

  if (!response.ok) {
    throw new Error(result.error ?? fallbackError);
  }

  return result;
}

export async function submitPatientFeedback(
  feedback: PatientFeedbackSubmission,
) {
  await readFeedbackResponse<never>(
    await fetch("/api/feedback", {
      body: JSON.stringify(feedback),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    }),
    "We could not save your feedback. Please try again.",
  );
}

export async function fetchApprovedFeedback() {
  const result = await readFeedbackResponse<ApprovedPatientFeedback>(
    await fetch("/api/feedback", {
      headers: {
        Accept: "application/json",
      },
    }),
    "We could not load patient feedback right now.",
  );

  return result.feedback ?? [];
}

function authorizedHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

export async function fetchAdminFeedback(accessToken: string) {
  const result = await readFeedbackResponse<AdminPatientFeedback>(
    await fetch("/api/feedback/admin", {
      headers: authorizedHeaders(accessToken),
    }),
    "Unable to load patient feedback.",
  );

  return result.feedback ?? [];
}

export async function updateFeedbackApproval(
  feedbackId: string | number,
  isApproved: boolean,
  accessToken: string,
) {
  await readFeedbackResponse<never>(
    await fetch("/api/feedback/admin", {
      body: JSON.stringify({ feedbackId, isApproved }),
      headers: authorizedHeaders(accessToken),
      method: "PATCH",
    }),
    "Unable to update feedback visibility.",
  );
}
