import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabaseBrowserConfig } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/types";

export async function createSupabaseServerClient(): Promise<SupabaseClient<Database> | null> {
  const config = getSupabaseBrowserConfig();

  if (!config.configured || !config.url || !config.publishableKey) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot always write cookies; auth middleware can handle this later.
        }
      },
    },
  });
}
