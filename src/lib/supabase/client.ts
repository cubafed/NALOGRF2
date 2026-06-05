"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseBrowserConfig } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/types";

export function createSupabaseBrowserClient(): SupabaseClient<Database> | null {
  const config = getSupabaseBrowserConfig();

  if (!config.configured || !config.url || !config.publishableKey) {
    return null;
  }

  return createBrowserClient<Database>(config.url, config.publishableKey);
}
