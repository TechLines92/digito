import { createClient } from "@supabase/supabase-js";
import type { DayResult } from "./types";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://vjmknwxcqnatqnboqkus.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_J3fEhvh75VhqRFwNhbJjjw_HS14jCLZ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const STATE_ROW_ID = "default";
const TABLE_NAME = "game_state";

type GameStateRow = {
  id: string;
  days: DayResult[];
  updated_at?: string;
};

export async function loadDaysFromCloud() {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("id, days, updated_at")
    .eq("id", STATE_ROW_ID)
    .maybeSingle<GameStateRow>();

  if (error) throw error;
  return data?.days ?? null;
}

export async function saveDaysToCloud(days: DayResult[]) {
  const { error } = await supabase.from(TABLE_NAME).upsert(
    {
      id: STATE_ROW_ID,
      days,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) throw error;
}
