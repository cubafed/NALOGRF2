"use client";

import { FormEvent, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseBrowserConfig } from "@/lib/supabase/config";
import { SupabaseUnavailableNotice } from "@/components/persistence/SupabaseUnavailableNotice";

type SignInState =
  | { status: "loading" }
  | { status: "signed_out" }
  | { status: "signed_in"; email: string | null };

export function SignInPanel() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signInState, setSignInState] = useState<SignInState>({ status: "loading" });
  const config = getSupabaseBrowserConfig();

  useEffect(() => {
    const client = createSupabaseBrowserClient();

    if (!client) {
      setSignInState({ status: "signed_out" });
      return;
    }

    let active = true;

    client.auth.getUser().then((result) => {
      if (!active) {
        return;
      }

      const user = result.data.user;
      setSignInState(
        user
          ? { status: "signed_in", email: user.email ?? null }
          : { status: "signed_out" },
      );
    });

    const subscription = client.auth.onAuthStateChange((_event, session) => {
      if (!active) {
        return;
      }

      setSignInState(
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

  if (!config.configured) {
    return <SupabaseUnavailableNotice />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const client = createSupabaseBrowserClient();

    if (!client) {
      setMessage("Supabase не настроен.");
      setIsSubmitting(false);
      return;
    }

    const result = await client.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/account`,
      },
    });

    setIsSubmitting(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    setMessage("Проверьте email для входа по magic link.");
  };

  const handleSignOut = async () => {
    setIsSubmitting(true);
    setMessage(null);

    const client = createSupabaseBrowserClient();

    if (!client) {
      setMessage("Supabase не настроен.");
      setIsSubmitting(false);
      return;
    }

    const result = await client.auth.signOut();
    setIsSubmitting(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    setSignInState({ status: "signed_out" });
    setMessage("Вы вышли из аккаунта.");
  };

  return (
    <section className="panel">
      <div className="panel-inner">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Auth foundation</p>
            <h2 style={{ margin: 0 }}>Вход по email</h2>
          </div>
          <span className="badge">Optional</span>
        </div>

        {signInState.status === "loading" && (
          <p className="muted">Проверка текущего входа...</p>
        )}

        {signInState.status === "signed_in" && (
          <div className="auth-form">
            <p className="muted" style={{ margin: 0 }}>
              Вы вошли как <strong>{signInState.email ?? "пользователь без email"}</strong>.
            </p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleSignOut}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Выход..." : "Выйти"}
            </button>
          </div>
        )}

        {signInState.status === "signed_out" && (
          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              <span>Email</span>
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="user@example.com"
              />
            </label>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Отправка..." : "Получить magic link"}
            </button>
          </form>
        )}

        <p className="muted" style={{ marginBottom: 0 }}>
          Вход нужен только для будущего облачного сохранения. `/upload`, `/problems`
          и `/report` остаются доступными без аккаунта.
        </p>
        {message && <p className="muted">{message}</p>}
      </div>
    </section>
  );
}
