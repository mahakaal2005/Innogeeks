import type { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../lib/supabase";

export interface AuthUser {
  id: string;
  email: string;
  role?: string;
  domain?: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      rawBody?: Buffer;
    }
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid Authorization header" });
    return;
  }
  const token = authHeader.slice(7);
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
  req.user = { id: user.id, email: user.email! };
  next();
}

async function fetchProfile(
  userId: string,
): Promise<{ role: string; domain: string | null } | null> {
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("role, domain")
    .eq("id", userId)
    .maybeSingle();
  return data ?? null;
}

export function requireRole(allowedRoles: string[]) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    await requireAuth(req, res, async () => {
      const profile = await fetchProfile(req.user!.id);
      if (!profile || !allowedRoles.includes(profile.role)) {
        res.status(403).json({
          error: `Requires one of: [${allowedRoles.join(", ")}]`,
        });
        return;
      }
      req.user!.role = profile.role;
      req.user!.domain = profile.domain;
      next();
    });
  };
}

export const requireCoreTeam = requireRole(["core_team"]);
export const requireCoordinator = requireRole(["coordinator", "core_team"]);
