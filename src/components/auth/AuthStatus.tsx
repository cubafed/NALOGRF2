"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseBrowserConfig } from "@/lib/supabase/config";

type AuthState =
  | { status: "unconfigured" }
  | { status: "loading" }
  | { status: "signed_out" }
  | { status: "signed_in"; email: string | null };

export function AuthStatus() {
  const [authState, setAuthState] = useState<AuthState>(() => {
    return getSupabaseBrowserConfig().configured
      ? { status: "loading" }
      : { status: "unconfigured" };
  });

  useEffect(() => {
    const client = createSupabaseBrowserClient();

    if (!client) {
      setAuthState({ status: "unconfigured" });
      return;
    }

    let active = true;

    client.auth.getUser().then((result) => {
      if (!active) {
        return;
      }

      const user = result.data.user;
      setAuthState(
        user
          ? { status: "signed_in", email: user.email ?? null }
          : { status: "signed_out" },
      );
    });

    const subscription = client.auth.onAuthStateChange((_event, session) => {
      if (!active) {
        return;
      }

      setAuthState(
        session?.user
          ? { status: "signed_in", email: session.user.email ?? null }
          : { status: "signed_out" },
      );
    });

    return () => {
      active = false;
      subscription.data.subscription.unsubscribe();
    };
  }, []);

  if (authState.status === "unconfigured") {
    return <StatusBadge status="not_configured" />;
  }

  if (authState.status === "loading") {
    return <StatusBadge status="loading" />;
  }

  if (authState.status === "signed_out") {
    return <StatusBadge status="signed_out" />;
  }

  return <StatusBadge label={authState.email ?? "Аккаунт активен"} status="active" />;
}
