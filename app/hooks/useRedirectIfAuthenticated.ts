"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

export function useRedirectIfAuthenticated(destination: string) {
  const router = useRouter();
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function checkExistingSession() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (!isActive) {
        return;
      }

      if (error) {
        setSessionError(error.message);
        setIsCheckingSession(false);
        return;
      }

      if (session) {
        router.replace(destination);
        return;
      }

      setIsCheckingSession(false);
    }

    void checkExistingSession();

    return () => {
      isActive = false;
    };
  }, [destination, router]);

  return { isCheckingSession, sessionError };
}
