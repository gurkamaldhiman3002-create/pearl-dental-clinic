import { treatmentOptions } from "@/app/lib/clinicContent";
import { createSupabaseServerClient } from "@/app/lib/supabaseServer";

type FeedbackRequest = {
  feedback?: unknown;
  name?: unknown;
  rating?: unknown;
  treatment?: unknown;
};

type FeedbackRow = {
  created_at: string | null;
  feedback: string | null;
  id: string | number;
  name: string | null;
  rating: number | null;
  treatment: string | null;
};

function asTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET() {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("patient_feedback")
    .select("id, name, rating, treatment, feedback, created_at")
    .eq("is_approved", true)
    .order("rating", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const feedback = ((data ?? []) as FeedbackRow[]).map((row) => ({
    created_at: row.created_at ?? null,
    feedback: row.feedback ?? "",
    id: row.id,
    name: row.name ?? "Patient",
    rating: row.rating ?? 5,
    treatment: row.treatment ?? "Dental visit",
  }));

  return Response.json({ feedback });
}

export async function POST(request: Request) {
  let body: FeedbackRequest;

  try {
    body = (await request.json()) as FeedbackRequest;
  } catch {
    return Response.json(
      { error: "Please complete the feedback form." },
      { status: 400 },
    );
  }

  const name = asTrimmedString(body.name);
  const treatment = asTrimmedString(body.treatment);
  const feedback = asTrimmedString(body.feedback);
  const rating = Number(body.rating);

  if (!name || !treatment || !feedback || !Number.isInteger(rating)) {
    return Response.json(
      { error: "Please complete all feedback fields." },
      { status: 400 },
    );
  }

  if (rating < 1 || rating > 5) {
    return Response.json(
      { error: "Please choose a rating from 1 to 5 stars." },
      { status: 400 },
    );
  }

  if (!treatmentOptions.includes(treatment)) {
    return Response.json(
      { error: "Please choose a treatment from the clinic services." },
      { status: 400 },
    );
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("patient_feedback").insert({
    feedback,
    is_approved: false,
    name,
    rating,
    treatment,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
