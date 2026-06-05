import { afterEach, describe, expect, it } from "vitest";
import {
  getSupabaseBrowserConfig,
  isSupabaseConfigured,
} from "@/lib/supabase/config";

const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function resetSupabaseEnv() {
  if (originalUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  } else {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
  }

  if (originalKey === undefined) {
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  } else {
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = originalKey;
  }
}

afterEach(() => {
  resetSupabaseEnv();
});

describe("Supabase config", () => {
  it("returns false when env vars are missing", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    expect(isSupabaseConfigured()).toBe(false);
  });

  it("returns true when required env vars are present", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "publishable-key";

    expect(isSupabaseConfigured()).toBe(true);
  });

  it("does not throw with missing env vars", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    expect(() => getSupabaseBrowserConfig()).not.toThrow();
    expect(getSupabaseBrowserConfig()).toEqual({
      configured: false,
      url: null,
      publishableKey: null,
    });
  });
});
