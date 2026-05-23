import "server-only";
import { createSupabaseServerClient } from "@/app/lib/supabaseServer";

export function getBearerToken(request: Request) {
  const authorizationHeader = request.headers.get("authorization");

  if (!authorizationHeader?.startsWith("Bearer ")) {
    return undefined;
  }

  return authorizationHeader.slice("Bearer ".length);
}

export async function getAuthenticatedSupabaseClient(request: Request) {
  const accessToken = getBearerToken(request);

  if (!accessToken) {
    return { error: "Admin session required.", supabase: null };
  }

  const supabase = createSupabaseServerClient(accessToken);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    return {
      error: error?.message ?? "Admin session required.",
      supabase: null,
    };
  }

  return { error: null, supabase };
}
