import type { Role, Domain } from "./theme";

export type ScreenKey =
  | "login"
  | "home"
  | "application"
  | "apply"
  | "payment"
  | "quiz"
  | "attendance"
  | "resources"
  | "events"
  | "coordinator"
  | "admin";

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
  go: (screen: ScreenKey) => void;
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
