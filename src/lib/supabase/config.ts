export interface SupabaseBrowserConfig {
  configured: boolean;
  url: string | null;
  publishableKey: string | null;
}

function readPublicEnvValue(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

export function getSupabaseBrowserConfig(): SupabaseBrowserConfig {
  const url = readPublicEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const publishableKey = readPublicEnvValue(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );

  return {
    configured: Boolean(url && publishableKey),
    url,
    publishableKey,
  };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseBrowserConfig().configured;
}
