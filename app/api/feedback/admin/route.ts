import { clinicInformation } from "@/app/lib/clinicContent";
import { getAuthenticatedSupabaseClient } from "@/app/services/server/authentication";

type FeedbackModerationRequest = {
  feedbackId?: unknown;
  isApproved?: unknown;
};

type FeedbackRow = {
  created_at: string | null;
  feedback: string | null;
  id: string | number;
  is_approved: boolean | null;
  name: string | null;
  rating: number | null;
  treatment: string | null;
};

function normalizeFeedbackRow(row: FeedbackRow) {
  return {
    created_at: row.created_at ?? null,
    feedback: row.feedback ?? "",
    id: row.id,
    is_approved: Boolean(row.is_approved),
    name: row.name ?? "Patient",
    rating: row.rating ?? 5,
    treatment: row.treatment ?? "Dental visit",
  };
}

export async function GET(request: Request) {
  const authentication = await getAuthenticatedSupabaseClient(request);

  if (!authentication.supabase) {
    return Response.json(
      { error: authentication.error },
      { status: 401 },
    );
  }

  const { data, error } = await authentication.supabase
    .from("patient_feedback")
    .select("id, name, rating, treatment, feedback, is_approved, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    feedback: ((data ?? []) as FeedbackRow[]).map(normalizeFeedbackRow),
    timeZone: clinicInformation.timeZoneLabel,
  });
}

export async function PATCH(request: Request) {
  const authentication = await getAuthenticatedSupabaseClient(request);

  if (!authentication.supabase) {
    return Response.json(
      { error: authentication.error },
      { status: 401 },
    );
  }

  const body = (await request.json()) as FeedbackModerationRequest;
  const hasValidId =
    typeof body.feedbackId === "string" ||
    typeof body.feedbackId === "number";

  if (!hasValidId || typeof body.isApproved !== "boolean") {
    return Response.json(
      { error: "Feedback id and approval state are required." },
      { status: 400 },
    );
  }

  const { error } = await authentication.supabase
    .from("patient_feedback")
    .update({ is_approved: body.isApproved })
    .eq("id", body.feedbackId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
