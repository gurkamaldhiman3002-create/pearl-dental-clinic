"use client";

import { supabase, supabaseAuthStorageKey } from "@/app/lib/supabase";

type AuthErrorDetails = {
  code?: unknown;
  message?: unknown;
  name?: unknown;
};

const invalidRefreshTokenPattern =
  /(invalid refresh token|refresh token (?:not found|already used|is invalid)|refresh_token_(?:not_found|already_used))/i;

let recoveryPromise: Promise<void> | null = null;

function authErrorText(error: unknown) {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error || (error && typeof error === "object")) {
    const details = error as AuthErrorDetails;

    return [details.name, details.message, details.code]
      .filter((value): value is string => typeof value === "string")
      .join(" ");
  }

  return "";
}

export function isInvalidRefreshTokenError(error: unknown) {
  return invalidRefreshTokenPattern.test(authErrorText(error));
}

function clearStoredSupabaseSession() {
  if (typeof window === "undefined") {
    return;
  }

  for (const key of [
    supabaseAuthStorageKey,
    `${supabaseAuthStorageKey}-code-verifier`,
    `${supabaseAuthStorageKey}-user`,
  ]) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Browser privacy controls can block storage; sign-out still clears memory.
    }
  }
}

export async function recoverFromInvalidRefreshToken(error: unknown) {
  if (!isInvalidRefreshTokenError(error)) {
    return false;
  }

  if (!recoveryPromise) {
    recoveryPromise = (async () => {
      clearStoredSupabaseSession();

      try {
        await supabase.auth.signOut({ scope: "local" });
      } catch {
        // The broken stored token was already removed above.
      } finally {
        clearStoredSupabaseSession();
      }
    })().finally(() => {
      recoveryPromise = null;
    });
  }

  await recoveryPromise;
  return true;
}
