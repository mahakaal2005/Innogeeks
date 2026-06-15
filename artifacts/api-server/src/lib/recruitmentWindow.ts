import { supabaseAdmin } from "./supabase";

export type OpenRecruitmentWindow = {
  academicYear: string;
};

// Returns the currently-open recruitment window (most recently updated), or
// null if none is open. The core team opens/closes this from the admin app;
// it is the single source of truth for "is recruitment currently active".
export async function getOpenRecruitmentWindow(): Promise<{
  window: OpenRecruitmentWindow | null;
  error: unknown;
}> {
  const { data, error } = await supabaseAdmin
    .from("recruitment_windows")
    .select("academic_year")
    .eq("is_open", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return { window: null, error };
  return {
    window: data ? { academicYear: data.academic_year as string } : null,
    error: null,
  };
}

// Whether an open recruitment window exists for the given academic year. Used
// to gate quiz access server-side so a direct link cannot bypass the window.
export async function isRecruitmentWindowOpen(
  academicYear: string,
): Promise<{ open: boolean; error: unknown }> {
  const { data, error } = await supabaseAdmin
    .from("recruitment_windows")
    .select("id")
    .eq("is_open", true)
    .eq("academic_year", academicYear)
    .maybeSingle();

  if (error) return { open: false, error };
  return { open: Boolean(data), error: null };
}
