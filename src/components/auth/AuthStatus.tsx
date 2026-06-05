"use client";

import { useEffect, useState } from "react";
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

    return () => {
      active = false;
    };
  }, []);

  if (authState.status === "unconfigured") {
    return <span className="badge">Supabase не настроен</span>;
  }

  if (authState.status === "loading") {
    return <span className="badge">Проверка аккаунта...</span>;
  }

  if (authState.status === "signed_out") {
    return <span className="badge">Вход не выполнен</span>;
  }

  return <span className="badge">Аккаунт: {authState.email ?? "без email"}</span>;
}
