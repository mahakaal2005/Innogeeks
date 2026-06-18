import type { Role, Domain } from "./theme";

export type ScreenKey =
  | "onboarding"
  | "login_email"
  | "login_password"
  | "forgot_password"
  | "check_email"
  | "guest_home"
  | "home"
  | "attendance"
  | "resources"
  | "events"
  | "coordinator"
  | "coordinator_attendance"
  | "admin"
  | "admin_events"
  | "admin_broadcast"
  | "admin_domain"
  | "admin_member_profile";

export type Round2State = "none" | "scheduled" | "cleared";

export interface Progress {
  applied: boolean;
  paid: boolean;
  round1: boolean;
  round1Score: number | null;
  round2: Round2State;
}

export interface Ctx {
  role: Role;
  domain: Domain;
  name: string;
  windowOpen: boolean;
  progress: Progress;
  params: Record<string, any>;
  go: (screen: ScreenKey, params?: Record<string, any>) => void;
  back: () => void;
  signIn: () => void;
  signOut: () => void;
  setProgress: (patch: Partial<Progress>) => void;
  /** true when rendered as a static gallery thumbnail (no real interaction) */
  preview?: boolean;
}

export const defaultProgress: Progress = {
  applied: true,
  paid: true,
  round1: false,
  round1Score: null,
  round2: "none",
};
