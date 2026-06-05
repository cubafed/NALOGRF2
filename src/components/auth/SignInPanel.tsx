"use client";

import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseBrowserConfig } from "@/lib/supabase/config";
import { SupabaseUnavailableNotice } from "@/components/persistence/SupabaseUnavailableNotice";

export function SignInPanel() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const config = getSupabaseBrowserConfig();

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
        <p className="muted" style={{ marginBottom: 0 }}>
          Вход нужен только для будущего облачного сохранения. `/upload`, `/problems`
          и `/report` остаются доступными без аккаунта.
        </p>
        {message && <p className="muted">{message}</p>}
      </div>
    </section>
  );
}
