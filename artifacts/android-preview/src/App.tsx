import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, Globe, Code, Cpu, Glasses, Radio, ShieldCheck, Users, Calendar, Megaphone, Bell, Search, UserPlus, FolderPlus, Download, Home, Settings, FileText, ChevronRight, Activity, TrendingUp, Rocket, Trophy, GraduationCap, Briefcase, LayoutDashboard, Image as ImageIcon, MessageCircle, Instagram, Linkedin, Mail, CheckCircle2, MapPin, User } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { theme, bgGradient, domainColor, domainLabel, roleLabel, hexA } from "@/proto/theme";
import type { Role, Domain } from "@/proto/theme";
import type { ScreenKey, Ctx, Progress } from "@/proto/types";
import { defaultProgress } from "@/proto/types";

/* ─────────────────────────────────────────────────────────────────
   PRIMITIVE COMPONENTS  (mirror Glass.kt / Color.kt)
───────────────────────────────────────────────────────────────── */

function PhoneShell({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        style={{
          width: 320,
          height: 640,
          borderRadius: 40,
          background: "#111827",
          boxShadow: `0 0 0 6px #1e1b4b, 0 0 0 8px #312e81, 0 40px 80px rgba(0,0,0,0.8)`,
          overflow: "hidden",
          position: "relative",
          flexShrink: 0,
        }}
      >
        {/* Notch / status bar */}
        <div
          style={{
            height: 32,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            fontSize: 10,
            color: theme.textPrimary,
            position: "relative",
            zIndex: 10,
          }}
        >
          <span style={{ fontWeight: 600 }}>9:41</span>
          <div style={{ display: "flex", gap: 4, alignItems: "center", fontSize: 9 }}>
            <span>●●●</span><span>WiFi</span><span>🔋</span>
          </div>
        </div>
        {/* Screen content */}
        <div style={{ position: "absolute", top: 32, bottom: 0, left: 0, right: 0, overflow: "hidden" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{ height: "100%" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <span style={{ color: theme.textSecondary, fontSize: 12, fontWeight: 500, letterSpacing: 0.5 }}>
        {label}
      </span>
    </div>
  );
}

function GradientBg({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ height: "100%", background: bgGradient, overflow: "auto", ...style }}>
      {children}
    </div>
  );
}

function GlassCard({ children, style, delay = 0 }: { children: React.ReactNode; style?: React.CSSProperties, delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      style={{
        background: `linear-gradient(145deg, ${hexA("#ffffff", 0.08)}, ${hexA("#000000", 0.2)})`,
        borderTop: `1px solid ${hexA("#ffffff", 0.15)}`,
        borderLeft: `1px solid ${hexA("#ffffff", 0.08)}`,
        borderRight: `1px solid ${theme.glassBorder}`,
        borderBottom: `1px solid ${theme.glassBorder}`,
        borderRadius: 16,
        padding: 16,
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

function Pill({ text, color }: { text: string; color: string }) {
  return (
    <span style={{
      background: hexA(color, 0.18),
      border: `1px solid ${hexA(color, 0.4)}`,
      borderRadius: 999,
      padding: "3px 10px",
      fontSize: 10,
      fontWeight: 600,
      color,
      letterSpacing: 0.5,
    }}>
      {text}
    </span>
  );
}

function Btn({
  children, onClick, color = theme.accentBlue, outline = false, small = false
}: {
  children: React.ReactNode;
  onClick?: () => void;
  color?: string;
  outline?: boolean;
  small?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      style={{
        width: small ? "auto" : "100%",
        padding: small ? "6px 16px" : "12px 16px",
        borderRadius: 12,
        fontSize: small ? 12 : 14,
        fontWeight: 600,
        cursor: "pointer",
        border: outline ? `1px solid ${color}` : "none",
        background: outline ? hexA(color, 0.12) : `linear-gradient(135deg, ${color}, ${hexA(color, 0.6)})`,
        color: outline ? color : "#fff",
        boxShadow: outline ? "none" : `0 4px 12px ${hexA(color, 0.3)}`,
      }}
    >
      {children}
    </motion.button>
  );
}

function Input({
  label, type = "text", value, onChange
}: {
  label: string; type?: string; value: string; onChange: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <label style={{
        position: "absolute", top: focused || value ? 5 : 12, left: 12,
        fontSize: focused || value ? 10 : 13, color: focused ? theme.accentBlue : theme.textMuted,
        transition: "all 0.15s", pointerEvents: "none", zIndex: 1,
      }}>{label}</label>
      <input
        type={type} value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%", boxSizing: "border-box",
          paddingTop: 18, paddingBottom: 8, paddingLeft: 12, paddingRight: 12,
          background: theme.glassFillStrong,
          border: `1px solid ${focused ? theme.accentBlue : theme.glassBorder}`,
          borderRadius: 10, color: theme.textPrimary, fontSize: 13, outline: "none",
          transition: "border-color 0.15s",
        }}
      />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: theme.textMuted, letterSpacing: 1.2, marginBottom: 8 }}>
      {children}
    </div>
  );
}

function ProgressStep({ label, done }: { label: string; done: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
      <div style={{
        width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
        background: done ? theme.accentGreen : theme.glassFill,
        border: `1.5px solid ${done ? theme.accentGreen : theme.glassBorder}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, color: done ? "#000" : theme.textMuted,
      }}>
        {done ? "✓" : ""}
      </div>
      <span style={{ fontSize: 13, color: done ? theme.textPrimary : theme.textSecondary }}>
        {label}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SCREENS
───────────────────────────────────────────────────────────────── */

function OnboardingScreen({ ctx }: { ctx: Ctx }) {
  return (
    <GradientBg>
      <div style={{ padding: "40px 20px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 24, margin: "0 auto 16px",
            background: `linear-gradient(135deg, ${theme.accentBlue}, ${theme.accentPurple})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 36, boxShadow: `0 8px 24px ${hexA(theme.accentBlue, 0.4)}`,
          }}>⚡</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: theme.textPrimary, letterSpacing: -0.5 }}>
            Innogeeks
          </div>
          <div style={{ fontSize: 14, color: theme.textSecondary, marginTop: 6, maxWidth: 220, lineHeight: 1.4 }}>
            The technical club of KIET Group of Institutions.
          </div>
        </div>

        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
          <Btn onClick={() => ctx.go("login_email")}>Login to your Account</Btn>
          <Btn outline color={theme.textSecondary} onClick={() => { ctx.signOut(); ctx.go("guest_home"); }}>
            Continue as Guest
          </Btn>
        </div>
      </div>
    </GradientBg>
  );
}

function LoginEmailScreen({ ctx }: { ctx: Ctx }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleContinue() {
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Mock logic: 
      if (!email.endsWith("@kiet.edu")) {
        setError("Only KIET emails are allowed.");
        return;
      }
      if (email === "new@kiet.edu") {
        ctx.go("check_email"); // First time
      } else if (email === "applicant@kiet.edu") {
        setError("Only members can log in. Applicants must use the Web Panel.");
      } else {
        ctx.go("login_password"); // Returning member
      }
    }, 600);
  }

  return (
    <GradientBg>
      <div style={{ padding: 16 }}>
        <BackBar label="Sign In" onBack={() => ctx.go("onboarding")} />
        <div style={{ fontSize: 24, fontWeight: 700, color: theme.textPrimary, marginBottom: 8, marginTop: 16 }}>
          Welcome back
        </div>
        <div style={{ fontSize: 14, color: theme.textSecondary, marginBottom: 24 }}>
          Enter your KIET email to continue.
        </div>
        
        <GlassCard style={{ marginBottom: 16 }}>
          <Input label="KIET Email" value={email} onChange={setEmail} />
        </GlassCard>

        {error && <div style={{ color: theme.accentRed, fontSize: 12, marginBottom: 16, textAlign: "center" }}>{error}</div>}

        <Btn onClick={handleContinue}>{loading ? "Checking..." : "Continue →"}</Btn>

        <div style={{ marginTop: 24, fontSize: 12, color: theme.textMuted, textAlign: "center", lineHeight: 1.5 }}>
          Hint for mock: Use <strong>new@kiet.edu</strong> for first time setup, <strong>applicant@kiet.edu</strong> to see restriction, or anything else for normal login.
        </div>
      </div>
    </GradientBg>
  );
}

function CheckEmailScreen({ ctx }: { ctx: Ctx }) {
  return (
    <GradientBg>
      <div style={{ padding: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: theme.textPrimary, textAlign: "center" }}>Check your email</div>
        <div style={{ fontSize: 14, color: theme.textSecondary, textAlign: "center", marginTop: 8, marginBottom: 24, lineHeight: 1.5 }}>
          We've sent a magic link to your email. Click the link to set your password and complete your account setup.
        </div>
        <Btn onClick={() => ctx.go("onboarding")} outline color={theme.textSecondary}>Back to Home</Btn>
      </div>
    </GradientBg>
  );
}

function LoginPasswordScreen({ ctx }: { ctx: Ctx }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSignIn() {
    setLoading(true);
    setTimeout(() => { setLoading(false); ctx.signIn(); }, 800);
  }

  return (
    <GradientBg>
      <div style={{ padding: 16 }}>
        <BackBar label="Enter Password" onBack={() => ctx.go("login_email")} />
        
        <GlassCard style={{ marginBottom: 16, marginTop: 24 }}>
          <Input label="Password" type="password" value={password} onChange={setPassword} />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
            <span 
              onClick={() => ctx.go("forgot_password")}
              style={{ fontSize: 12, color: theme.accentBlue, fontWeight: 600, cursor: "pointer" }}
            >
              Forgot Password?
            </span>
          </div>
        </GlassCard>

        <Btn onClick={handleSignIn}>{loading ? "Signing in..." : "Sign In"}</Btn>
      </div>
    </GradientBg>
  );
}

function ForgotPasswordScreen({ ctx }: { ctx: Ctx }) {
  return (
    <GradientBg>
      <div style={{ padding: 16 }}>
        <BackBar label="Reset Password" onBack={() => ctx.go("login_password")} />
        <div style={{ fontSize: 14, color: theme.textSecondary, marginBottom: 24, marginTop: 16 }}>
          We will send a reset link to your email.
        </div>
        <Btn onClick={() => ctx.go("check_email")}>Send Reset Link</Btn>
      </div>
    </GradientBg>
  );
}

function HomeScreen({ ctx }: { ctx: Ctx }) {
  const dc = domainColor(ctx.domain);
  const items = [
    { icon: "🏛️", title: "Attendance", sub: "View your attendance summary", screen: "attendance" as ScreenKey },
    { icon: "📚", title: "Resources", sub: "Browse domain learning resources", screen: "resources" as ScreenKey },
    { icon: "🎉", title: "Events", sub: "See upcoming club events", screen: "events" as ScreenKey },
  ];
  const coordItems = [
    { icon: "🛠️", title: "Coordinator Tools", sub: "Sessions, approvals & resources", screen: "coordinator" as ScreenKey },
  ];
  const adminItems = [
    { icon: "👑", title: "Admin", sub: "Roles, recruitment window & all data", screen: "admin" as ScreenKey },
  ];

  return (
    <GradientBg>
      <div style={{ padding: "16px 16px 24px" }}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: theme.textSecondary }}>Welcome back,</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: theme.textPrimary, letterSpacing: -0.3 }}>{ctx.name}</div>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <Pill text={roleLabel(ctx.role)} color={dc} />
            <Pill text={domainLabel(ctx.domain).toUpperCase()} color={dc} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.filter(item => !(item.screen === "attendance" && ctx.role === "core_team")).map(item => (
            <GlassCard key={item.title} style={{ cursor: "pointer" }}>
              <div onClick={() => ctx.go(item.screen)} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: theme.textPrimary }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: theme.textSecondary }}>{item.sub}</div>
                </div>
                <span style={{ marginLeft: "auto", color: theme.textMuted }}>›</span>
              </div>
            </GlassCard>
          ))}
          {(ctx.role === "coordinator" || ctx.role === "core_team") && coordItems.map(item => (
            <GlassCard key={item.title} style={{ cursor: "pointer" }}>
              <div onClick={() => ctx.go(item.screen)} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: theme.textPrimary }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: theme.textSecondary }}>{item.sub}</div>
                </div>
                <span style={{ marginLeft: "auto", color: theme.textMuted }}>›</span>
              </div>
            </GlassCard>
          ))}
          {ctx.role === "core_team" && adminItems.map(item => (
            <GlassCard key={item.title} style={{ border: `1px solid ${hexA(theme.accentPurple, 0.4)}` }}>
              <div onClick={() => ctx.go(item.screen)} style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: theme.accentPurple }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: theme.textSecondary }}>{item.sub}</div>
                </div>
                <span style={{ marginLeft: "auto", color: theme.accentPurple }}>›</span>
              </div>
            </GlassCard>
          ))}

          <div style={{ marginTop: 4 }}>
            <Btn onClick={ctx.signOut} outline color={theme.accentRed}>Sign Out</Btn>
          </div>
        </div>
      </div>
    </GradientBg>
  );
}

function GuestHomeScreen({ ctx }: { ctx: Ctx }) {
  // Stats
  const stats = [
    { label: "Members", value: "100+", color: "#00C8FF" },
    { label: "Projects", value: "20+", color: "#4A6CFF" },
    { label: "Events", value: "10+", color: "#8B5CF6" },
    { label: "Domains", value: "4", color: "#EC4899" },
  ];

  // Features
  const features = [
    { title: "Real Projects", desc: "Build portfolio-worthy projects", icon: <Rocket size={20} color="#00C8FF" /> },
    { title: "Hackathons", desc: "Participate in competitions", icon: <Trophy size={20} color="#F59E0B" /> },
    { title: "Mentorship", desc: "Learn directly from seniors", icon: <GraduationCap size={20} color="#10B981" /> },
    { title: "Career Growth", desc: "Improve placements and internships", icon: <Briefcase size={20} color="#6366F1" /> },
  ];

  // Domains
  const domains = [
    { name: "Android", stack: "Kotlin • Compose • Firebase", icon: <Smartphone size={24} color="#00C8FF" />, bg: "rgba(0, 200, 255, 0.1)" },
    { name: "Web", stack: "React • Next.js • Node.js", icon: <Globe size={24} color="#4A6CFF" />, bg: "rgba(74, 108, 255, 0.1)" },
    { name: "AI/ML", stack: "Python • LLMs • Computer Vision", icon: <Cpu size={24} color="#8B5CF6" />, bg: "rgba(139, 92, 246, 0.1)" },
    { name: "IoT", stack: "ESP32 • Arduino • Embedded Systems", icon: <Radio size={24} color="#EC4899" />, bg: "rgba(236, 72, 153, 0.1)" },
  ];

  return (
    <div style={{ height: "100%", background: "#0B1020", color: "#FFFFFF", overflowY: "auto", fontFamily: "'Inter', sans-serif" }}>
      {/* Top Nav */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", position: "sticky", top: 0, background: "rgba(11, 16, 32, 0.8)", backdropFilter: "blur(12px)", zIndex: 10 }}>
        <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.5, color: "#FFFFFF" }}>
          INNO<span style={{ color: "#00C8FF" }}>GEEKS</span>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <Bell size={20} color="#94A3B8" />
          <User size={20} color="#94A3B8" />
        </div>
      </div>

      <div style={{ padding: "0 24px 100px" }}>
        {/* Hero Section */}
        <div style={{ paddingTop: 32, paddingBottom: 48, textAlign: "center", position: "relative" }}>
          <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translate(-50%, -50%)", width: 200, height: 200, background: "#00C8FF", filter: "blur(120px)", opacity: 0.15, pointerEvents: "none" }} />
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div style={{ fontSize: 44, fontWeight: 800, lineHeight: 1.1, letterSpacing: -1.5, marginBottom: 12 }}>
              Build the <span style={{ color: "#00C8FF" }}>Future.</span>
            </div>
            <div style={{ fontSize: 15, color: "#94A3B8", marginBottom: 32, fontWeight: 500 }}>
              Official Technical Club of KIET.
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center", marginBottom: 40 }}>
              {["Build Projects.", "Join Hackathons.", "Learn From Seniors.", "Launch Your Career."].map((txt, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 600, color: "#E2E8F0" }}>
                  <CheckCircle2 size={16} color="#00C8FF" /> {txt}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button style={{ width: "100%", padding: "16px", borderRadius: 12, background: "#00C8FF", color: "#000", fontSize: 15, fontWeight: 700, border: "none", boxShadow: "0 4px 20px rgba(0, 200, 255, 0.3)", cursor: "pointer" }}>
                Join Innogeeks
              </button>
              <button style={{ width: "100%", padding: "16px", borderRadius: 12, background: "transparent", color: "#E2E8F0", fontSize: 15, fontWeight: 600, border: "1px solid rgba(255, 255, 255, 0.1)", cursor: "pointer" }}>
                Explore Domains
              </button>
            </div>
          </motion.div>
        </div>

        {/* Club Stats */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {stats.map((s, i) => (
              <div key={i} style={{ background: "#151B2D", padding: 20, borderRadius: 16, border: "1px solid rgba(255,255,255,0.03)" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.value}</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#94A3B8" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Join */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Why Join Innogeeks</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, background: "#151B2D", padding: "16px 20px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.03)" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#FFFFFF" }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Domains */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Explore Domains</div>
          <div style={{ display: "flex", overflowX: "auto", gap: 12, paddingBottom: 16, margin: "0 -24px", paddingLeft: 24, paddingRight: 24, scrollbarWidth: "none" }}>
            {domains.map((d, i) => (
              <div key={i} style={{ flexShrink: 0, width: 220, background: "#151B2D", padding: 20, borderRadius: 20, border: "1px solid rgba(255,255,255,0.03)" }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: d.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  {d.icon}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{d.name}</div>
                <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 16, lineHeight: 1.4 }}>{d.stack}</div>
                <div style={{ display: "flex", alignItems: "center", fontSize: 12, fontWeight: 600, color: "#00C8FF", cursor: "pointer" }}>
                  Learn more <ChevronRight size={14} style={{ marginLeft: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Achievements */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Recent Achievements</div>
          <div style={{ background: "#151B2D", borderRadius: 16, padding: 20, border: "1px solid rgba(255,255,255,0.03)" }}>
            {[
              { icon: "🏆", title: "Smart India Hackathon", desc: "Winners 2024" },
              { icon: "🚀", title: "Y-Combinator", desc: "2 Alumni Startups" },
              { icon: "💼", title: "Top Internships", desc: "Google, Microsoft, Amazon" },
            ].map((ach, i) => (
              <div key={i} style={{ display: "flex", gap: 16, marginBottom: i !== 2 ? 20 : 0 }}>
                <div style={{ fontSize: 20 }}>{ach.icon}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{ach.title}</div>
                  <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>{ach.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gallery */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Gallery</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div style={{ height: 120, background: "#151B2D", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}><ImageIcon color="#334155" /></div>
            <div style={{ height: 120, background: "#151B2D", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}><ImageIcon color="#334155" /></div>
            <div style={{ gridColumn: "span 2", height: 140, background: "#151B2D", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}><ImageIcon color="#334155" /></div>
          </div>
        </div>

        {/* Contact Section */}
        <div style={{ background: "linear-gradient(135deg, rgba(0, 200, 255, 0.05), rgba(74, 108, 255, 0.05))", borderRadius: 20, padding: 24, textAlign: "center", border: "1px solid rgba(0,200,255,0.1)" }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Need Guidance?</div>
          <div style={{ fontSize: 13, color: "#94A3B8", marginBottom: 20 }}>Reach out to our core team on social media.</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
            {[MessageCircle, Instagram, Linkedin, Mail].map((Icon, i) => (
              <div key={i} style={{ width: 40, height: 40, borderRadius: 20, background: "#151B2D", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "1px solid rgba(255,255,255,0.05)" }}>
                <Icon size={18} color="#FFFFFF" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Bottom Nav */}
      <div style={{ position: "absolute", bottom: 24, left: 24, right: 24, background: "rgba(21, 27, 45, 0.8)", backdropFilter: "blur(16px)", borderRadius: 24, padding: "12px 24px", display: "flex", justifyContent: "space-between", border: "1px solid rgba(255,255,255,0.05)" }}>
        {[
          { icon: <LayoutDashboard size={20} color="#00C8FF" />, label: "Home", active: true },
          { icon: <Globe size={20} color="#94A3B8" />, label: "Domains" },
          { icon: <Calendar size={20} color="#94A3B8" />, label: "Events" },
          { icon: <User size={20} color="#94A3B8" />, label: "Profile" },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer" }}>
            {item.icon}
            <span style={{ fontSize: 10, fontWeight: 600, color: item.active ? "#00C8FF" : "#94A3B8" }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AttendanceScreen({ ctx }: { ctx: Ctx }) {
  const sessions = [
    { name: "Intro to Android", date: "Jun 10", present: true },
    { name: "Jetpack Compose", date: "Jun 13", present: true },
    { name: "Networking in Android", date: "Jun 15", present: false },
    { name: "Firebase Integration", date: "Jun 18", present: true },
    { name: "App Architecture", date: "Jun 20", present: false },
  ];
  const attended = sessions.filter(s => s.present).length;
  const pct = Math.round((attended / sessions.length) * 100);
  const color = pct >= 75 ? theme.accentGreen : pct >= 50 ? theme.accentAmber : theme.accentRed;

  return (
    <GradientBg>
      <div style={{ padding: 16 }}>
        <BackBar label="Attendance" onBack={ctx.back} />
        <GlassCard style={{ marginBottom: 12, textAlign: "center" }}>
          <div style={{ fontSize: 40, fontWeight: 800, color }}>{pct}%</div>
          <div style={{ fontSize: 12, color: theme.textSecondary }}>{attended} / {sessions.length} sessions attended</div>
          <div style={{ height: 6, background: theme.glassFill, borderRadius: 3, margin: "10px 0 0" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3, transition: "width 0.5s" }} />
          </div>
        </GlassCard>
        <SectionTitle>SESSIONS</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sessions.map((s, i) => (
            <GlassCard key={i}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16 }}>{s.present ? "✅" : "❌"}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: theme.textPrimary }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: theme.textSecondary }}>{s.date}</div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </GradientBg>
  );
}

function ResourcesScreen({ ctx }: { ctx: Ctx }) {
  const resources = [
    { title: "Android Dev Roadmap 2025", type: "PDF", size: "2.4 MB", color: theme.accentGreen },
    { title: "Jetpack Compose Crash Course", type: "Video", size: "45 min", color: theme.accentBlue },
    { title: "Kotlin Coroutines Guide", type: "Doc", size: "1.1 MB", color: theme.accentPurple },
    { title: "MVVM Architecture Slides", type: "Slides", size: "3.2 MB", color: theme.accentOrange },
    { title: "Firebase for Android", type: "Link", size: "External", color: theme.accentPink },
  ];
  return (
    <GradientBg>
      <div style={{ padding: 16 }}>
        <BackBar label="Resources" onBack={ctx.back} />
        <div style={{ marginBottom: 12, display: "flex", gap: 6 }}>
          <Pill text={domainLabel(ctx.domain).toUpperCase()} color={domainColor(ctx.domain)} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {resources.map((r, i) => (
            <GlassCard key={i}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: hexA(r.color, 0.2), border: `1px solid ${hexA(r.color, 0.4)}`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                }}>
                  {r.type === "PDF" ? "📄" : r.type === "Video" ? "▶️" : r.type === "Slides" ? "📊" : r.type === "Link" ? "🔗" : "📝"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: theme.textPrimary }}>{r.title}</div>
                  <div style={{ fontSize: 11, color: theme.textSecondary }}>{r.type} · {r.size}</div>
                </div>
                <span style={{ color: r.color, fontSize: 18 }}>↓</span>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </GradientBg>
  );
}

function EventsScreen({ ctx }: { ctx: Ctx }) {
  const events = [
    { title: "Android Dev Summit", date: "Jun 22, 2025", time: "2:00 PM", venue: "CS Seminar Hall", color: theme.accentGreen, badge: "UPCOMING" },
    { title: "Hackathon 2025", date: "Jul 5–6, 2025", time: "9:00 AM", venue: "Main Auditorium", color: theme.accentBlue, badge: "REGISTER" },
    { title: "ML Workshop", date: "Jul 12, 2025", time: "3:00 PM", venue: "Lab 301", color: theme.accentPurple, badge: "UPCOMING" },
    { title: "Open Source Day", date: "Jun 18, 2025", time: "10:00 AM", venue: "Online", color: theme.accentOrange, badge: "PAST" },
  ];
  return (
    <GradientBg>
      <div style={{ padding: 16 }}>
        <BackBar label="Events" onBack={ctx.back} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {events.map((ev, i) => (
            <GlassCard key={i} style={{ borderTop: `2px solid ${ev.color}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: theme.textPrimary }}>{ev.title}</div>
                  <div style={{ fontSize: 11, color: theme.textSecondary, marginTop: 4 }}>📅 {ev.date} · {ev.time}</div>
                  <div style={{ fontSize: 11, color: theme.textSecondary }}>📍 {ev.venue}</div>
                </div>
                <span style={{
                  fontSize: 9, fontWeight: 700, color: ev.color, padding: "3px 8px",
                  border: `1px solid ${hexA(ev.color, 0.4)}`, borderRadius: 999,
                  background: hexA(ev.color, 0.12),
                }}>
                  {ev.badge}
                </span>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </GradientBg>
  );
}

const MOCK_ADMIN_DATA = [
  { id: "u1", name: "John Doe", role: "member", domain: "android", attendance: 85, examScore: 78, notes: "Good core logic. Needs UI polish." },
  { id: "u2", name: "Jane Smith", role: "coordinator", domain: "web", attendance: 98, examScore: 92, notes: "Excellent portfolio and leadership skills." },
  { id: "u3", name: "Alice Johnson", role: "member", domain: "ml", attendance: 70, examScore: 88, notes: "Strong math background." },
  { id: "u4", name: "Bob Brown", role: "member", domain: "iot", attendance: 90, examScore: 81, notes: "Hardware experience is a plus." },
  { id: "u5", name: "Admin Core", role: "core_team", domain: "web", attendance: 100, examScore: 95, notes: "Founding member." },
  { id: "u6", name: "Charlie Davis", role: "member", domain: "android", attendance: 60, examScore: 75, notes: "Learning Compose." },
  { id: "u7", name: "Eve White", role: "coordinator", domain: "arvr", attendance: 92, examScore: 89, notes: "Unity expert." },
];

function AdminScreen({ ctx }: { ctx: Ctx }) {
  const domains: Domain[] = ["android", "web", "ml", "iot", "arvr"];
  
  const stats = domains.map(d => {
    const count = MOCK_ADMIN_DATA.filter(m => m.domain === d).length;
    let icon = Smartphone;
    if (d === "web") icon = Globe;
    if (d === "ml") icon = Cpu;
    if (d === "iot") icon = Radio;
    if (d === "arvr") icon = Glasses;
    return { domain: d, label: domainLabel(d), value: count, color: domainColor(d), icon };
  });

  const totalMembers = MOCK_ADMIN_DATA.length;
  const totalCoordinators = MOCK_ADMIN_DATA.filter(m => m.role !== "member").length;



  return (
    <div style={{ height: "100%", background: "#0B1020", color: "#fff", overflowY: "auto", paddingBottom: 100, scrollbarWidth: "none" }}>
      {/* 1. Header */}
      <div style={{ padding: "24px 20px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "rgba(11, 16, 32, 0.8)", backdropFilter: "blur(12px)", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 20, background: `linear-gradient(135deg, ${theme.accentPurple}, ${theme.accentBlue})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
            AD
          </div>
          <div>
            <div style={{ fontSize: 13, color: "#888", fontWeight: 500 }}>Good Evening,</div>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.2 }}>Admin</div>
          </div>
        </div>
        <motion.button whileTap={{ scale: 0.9 }} onClick={ctx.back} style={{ width: 40, height: 40, borderRadius: 20, background: "#151B2D", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.05)", position: "relative" }}>
          <Bell size={18} color="#fff" />
          <div style={{ position: "absolute", top: 8, right: 8, width: 8, height: 8, background: theme.accentPink, borderRadius: 4 }} />
        </motion.button>
      </div>

      <div style={{ padding: "0 20px" }}>
        {/* 4. Search Section */}
        <div style={{ position: "relative", marginBottom: 24 }}>
          <Search size={16} color="#666" style={{ position: "absolute", left: 16, top: 14 }} />
          <input 
            type="text" 
            placeholder="Search members, domains..." 
            style={{ width: "100%", boxSizing: "border-box", background: "#151B2D", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: "12px 16px 12px 42px", color: "#fff", fontSize: 14, outline: "none" }}
          />
        </div>

        {/* 2. Statistics Section (2x2 Grid) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Members", value: totalMembers },
            { label: "Domains", value: domains.length },
            { label: "Coordinators", value: totalCoordinators },
            { label: "New This Month", value: 14 },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }} style={{ background: "#151B2D", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 20, padding: 16 }}>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 8, fontWeight: 500 }}>{stat.label}</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5 }}>{stat.value}</div>
              </div>
            </motion.div>
          ))}
        </div>


        {/* 5. Domain Overview */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12, letterSpacing: 1, color: "#666" }}>DOMAIN DIRECTORY</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={i} whileTap={{ scale: 0.98 }} onClick={() => ctx.go("admin_domain", { domainFilter: s.domain })} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: `linear-gradient(135deg, ${hexA(s.color, 0.15)}, ${hexA(s.color, 0.05)})`, border: `1px solid ${hexA(s.color, 0.3)}`, borderRadius: 16, padding: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 20, background: hexA(s.color, 0.2), display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{s.label}</div>
                      <div style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>{s.value} Members</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <ChevronRight size={18} color="rgba(255,255,255,0.4)" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* 7. Recent Activity */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12, letterSpacing: 1, color: "#666" }}>RECENT ACTIVITY</div>
          <div style={{ background: "#151B2D", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 24, padding: "20px 20px 16px" }}>
            {[
              { title: "New member joined", desc: "Alex from Web Domain", time: "2h ago", color: theme.accentGreen },
              { title: "Domain updated", desc: "IoT curriculum revised", time: "5h ago", color: theme.accentPurple },
              { title: "Monthly attendance logged", desc: "All domains updated", time: "1d ago", color: theme.accentBlue },
            ].map((act, i) => (
              <div key={i} style={{ display: "flex", gap: 16, marginBottom: i === 2 ? 0 : 24, position: "relative" }}>
                {i !== 2 && <div style={{ position: "absolute", left: 5, top: 24, bottom: -24, width: 2, background: "#222" }} />}
                <div style={{ width: 12, height: 12, borderRadius: 6, background: act.color, marginTop: 4, position: "relative", zIndex: 1, border: "2px solid #151B2D" }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#eee" }}>{act.title}</div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{act.desc} • {act.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 8. Floating Bottom Nav */}
      <div style={{ position: "fixed", bottom: 20, left: 20, right: 20, background: "rgba(21, 27, 45, 0.85)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 28, padding: "10px 20px", display: "flex", justifyContent: "space-between", zIndex: 100, boxShadow: "0 24px 48px rgba(0,0,0,0.6)" }}>
        {[
          { icon: Home, label: "Home", active: true },
          { icon: Users, label: "Members", active: false },
          { icon: FolderPlus, label: "Domains", active: false },
          { icon: Settings, label: "Settings", active: false },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.button key={i} whileTap={{ scale: 0.9 }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: 8, color: item.active ? "#fff" : "#666", cursor: "pointer", background: "none", border: "none" }}>
              <Icon size={20} color={item.active ? theme.accentBlue : "#666"} />
              <span style={{ fontSize: 10, fontWeight: item.active ? 700 : 500, color: item.active ? theme.accentBlue : "#666" }}>{item.label}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  );
}

function AdminDomainScreen({ ctx }: { ctx: Ctx }) {
  const domainFilter = ctx.params?.domainFilter as Domain || "web";
  const domainMembers = MOCK_ADMIN_DATA.filter(m => m.domain === domainFilter);
  const coordinators = domainMembers.filter(m => m.role === "coordinator" || m.role === "core_team");
  const members = domainMembers.filter(m => m.role === "member");
  const dc = domainColor(domainFilter);

  const renderRoster = (list: typeof MOCK_ADMIN_DATA, delayOffset: number) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {list.map((m, i) => {
        const initials = m.name.split(' ').map(n => n[0]).join('');
        return (
          <motion.div key={m.id} whileTap={{ scale: 0.96 }} onClick={() => ctx.go("admin_member_profile", { memberId: m.id })} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#151B2D", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 20, padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 20, background: `linear-gradient(135deg, ${dc}, ${hexA(dc, 0.4)})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 700, boxShadow: `0 4px 12px ${hexA(dc, 0.2)}` }}>
                {initials}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{m.name}</div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{m.attendance}% Attendance</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700, background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: 8, textTransform: "uppercase" }}>{roleLabel(m.role as any)}</div>
              <ChevronRight size={16} color="#444" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <div style={{ height: "100%", background: "#0B1020", color: "#fff", overflowY: "auto", paddingBottom: 40, scrollbarWidth: "none" }}>
      {/* Header */}
      <div style={{ padding: "24px 20px 16px", display: "flex", alignItems: "center", gap: 16, position: "sticky", top: 0, background: "rgba(11, 16, 32, 0.8)", backdropFilter: "blur(12px)", zIndex: 10 }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => ctx.go("admin")} style={{ width: 40, height: 40, borderRadius: 20, background: "#151B2D", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.05)", color: "#fff" }}>
          <ChevronRight size={20} style={{ transform: "rotate(180deg)" }} />
        </motion.button>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.2 }}>{domainLabel(domainFilter)} Roster</div>
          <div style={{ fontSize: 12, color: dc, fontWeight: 600, marginTop: 2 }}>DOMAIN DIRECTORY</div>
        </div>
      </div>

      <div style={{ padding: "0 20px" }}>
        {/* Domain Overview Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28, marginTop: 8 }}>
          <div style={{ background: "#151B2D", border: "1px solid rgba(255,255,255,0.05)", borderTop: `2px solid ${dc}`, borderRadius: 20, padding: 16 }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 8, fontWeight: 500 }}>Total Members</div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1, color: "#fff" }}>{domainMembers.length}</div>
          </div>
          <div style={{ background: "#151B2D", border: "1px solid rgba(255,255,255,0.05)", borderTop: `2px solid ${theme.accentPurple}`, borderRadius: 20, padding: 16 }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 8, fontWeight: 500 }}>Coordinators</div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1, color: "#fff" }}>{coordinators.length}</div>
          </div>
        </div>

        {coordinators.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12, letterSpacing: 1, color: "#666" }}>COORDINATORS</div>
            {renderRoster(coordinators, 0.1)}
          </div>
        )}

        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12, letterSpacing: 1, color: "#666" }}>MEMBERS</div>
          {renderRoster(members, 0.2)}
        </div>
      </div>
    </div>
  );
}

function AdminMemberProfileScreen({ ctx }: { ctx: Ctx }) {
  const memberId = ctx.params?.memberId as string || "u1";
  const member = MOCK_ADMIN_DATA.find(m => m.id === memberId) || MOCK_ADMIN_DATA[0];
  const dc = domainColor(member.domain as Domain);
  const initials = member.name.split(' ').map(n => n[0]).join('');

  return (
    <div style={{ height: "100%", background: "#0B1020", color: "#fff", overflowY: "auto", paddingBottom: 40, scrollbarWidth: "none" }}>
      {/* Header */}
      <div style={{ padding: "24px 20px 16px", display: "flex", alignItems: "center", gap: 16, position: "sticky", top: 0, background: "rgba(11, 16, 32, 0.8)", backdropFilter: "blur(12px)", zIndex: 10 }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => ctx.go("admin_domain", { domainFilter: member.domain })} style={{ width: 40, height: 40, borderRadius: 20, background: "#151B2D", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.05)", color: "#fff" }}>
          <ChevronRight size={20} style={{ transform: "rotate(180deg)" }} />
        </motion.button>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.2 }}>Member Profile</div>
          <div style={{ fontSize: 12, color: dc, fontWeight: 600, marginTop: 2 }}>{domainLabel(member.domain as Domain)} DOMAIN</div>
        </div>
      </div>
        
      <div style={{ padding: "0 20px" }}>
        {/* Profile Header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32, marginTop: 16 }}>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }} style={{ width: 88, height: 88, borderRadius: 44, background: `linear-gradient(135deg, ${dc}, ${hexA(dc, 0.4)})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 32, fontWeight: 800, marginBottom: 16, boxShadow: `0 8px 24px ${hexA(dc, 0.25)}` }}>
            {initials}
          </motion.div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>{member.name}</div>
          <div style={{ fontSize: 14, color: "#888", marginTop: 4, marginBottom: 16 }}>{member.id}@kiet.edu</div>
          <div style={{ fontSize: 11, color: "#aaa", fontWeight: 700, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "6px 12px", borderRadius: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
            {roleLabel(member.role as any)}
          </div>
        </div>

        {/* Recruitment Record */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12, letterSpacing: 1, color: "#666" }}>RECRUITMENT RECORD</div>
          <div style={{ background: "#151B2D", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 20, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
              <div>
                <div style={{ fontSize: 12, color: "#888", fontWeight: 500 }}>Round 1 Exam</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: theme.accentGreen, marginTop: 4, letterSpacing: -0.5 }}>{member.examScore} <span style={{ fontSize: 14, color: "#555" }}>/ 100</span></div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, color: "#888", fontWeight: 500 }}>Status</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginTop: 4, background: hexA(theme.accentGreen, 0.15), padding: "4px 8px", borderRadius: 8 }}>Cleared</div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 8, fontWeight: 500 }}>Round 2 Interview Notes</div>
              <div style={{ fontSize: 14, color: "#ddd", fontStyle: "italic", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.02)", padding: 12, borderRadius: 12, lineHeight: 1.5 }}>"{member.notes}"</div>
            </div>
          </div>
        </div>

        {/* Attendance Record */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12, letterSpacing: 1, color: "#666" }}>ATTENDANCE RECORD</div>
          <div style={{ background: "#151B2D", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 20, padding: 20, display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: 32, border: `4px solid ${member.attendance >= 75 ? theme.accentGreen : theme.accentOrange}`, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.2)" }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{member.attendance}%</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>Overall Attendance</div>
              <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{member.attendance >= 75 ? "Good standing" : "Warning: Below 75% threshold"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminBroadcastScreen({ ctx }: { ctx: Ctx }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  return (
    <GradientBg>
      <div style={{ padding: 16 }}>
        <BackBar label="Broadcast" onBack={() => ctx.go("admin")} />
        <SectionTitle>NEW ANNOUNCEMENT</SectionTitle>
        <GlassCard delay={0.1} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Input label="Notification Title" value={title} onChange={setTitle} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 11, color: theme.textMuted, fontWeight: 600, paddingLeft: 4 }}>MESSAGE BODY</span>
            <textarea
              style={{
                background: hexA("#000000", 0.2), border: `1px solid ${theme.glassBorder}`, borderRadius: 12,
                color: theme.textPrimary, padding: "12px 16px", outline: "none", fontSize: 14, minHeight: 120,
                resize: "none", transition: "border-color 0.2s"
              }}
              placeholder="Type your message here..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              onFocus={(e) => e.target.style.borderColor = theme.accentPurple}
              onBlur={(e) => e.target.style.borderColor = theme.glassBorder}
            />
          </div>
          <Btn onClick={() => { alert("Broadcast sent!"); ctx.go("admin"); }} color={theme.accentPurple}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Megaphone size={18} />
              <span>Send Push Notification</span>
            </div>
          </Btn>
        </GlassCard>
      </div>
    </GradientBg>
  );
}

function AdminEventsScreen({ ctx }: { ctx: Ctx }) {
  const upcomingEvents = [
    { title: "Android Dev Summit", date: "Oct 24", time: "14:00", color: theme.accentGreen },
    { title: "Hackathon 2025", date: "Nov 12", time: "09:00", color: theme.accentBlue },
  ];

  return (
    <GradientBg>
      <div style={{ padding: 16 }}>
        <BackBar label="Events" onBack={() => ctx.go("admin")} />
        <SectionTitle>SCHEDULE</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
          {upcomingEvents.map((ev, i) => (
            <GlassCard key={i} delay={0.1 + (i * 0.1)} style={{ borderLeft: `4px solid ${ev.color}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: theme.textPrimary }}>{ev.title}</div>
                  <div style={{ fontSize: 13, color: theme.textSecondary, marginTop: 4 }}>{ev.date} @ {ev.time}</div>
                </div>
                <Calendar color={ev.color} size={24} opacity={0.5} />
              </div>
            </GlassCard>
          ))}
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <Btn color={theme.accentGreen}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Calendar size={18} />
              <span>Schedule New Event</span>
            </div>
          </Btn>
        </motion.div>
      </div>
    </GradientBg>
  );
}

/* ── Back bar ── */
function BackBar({ label, onBack }: { label: string; onBack: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <button
        onClick={onBack}
        style={{
          background: theme.glassFill, border: `1px solid ${theme.glassBorder}`,
          borderRadius: 8, width: 32, height: 32, cursor: "pointer",
          color: theme.textPrimary, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        ‹
      </button>
      <span style={{ fontSize: 16, fontWeight: 700, color: theme.textPrimary }}>{label}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN APP — role/domain switcher + screen navigator
───────────────────────────────────────────────────────────────── */

const ROLES: Role[] = ["public", "member", "coordinator", "core_team"];
const DOMAINS: Domain[] = ["android", "web", "ml", "iot", "arvr"];

function buildCtx(
  role: Role, domain: Domain, name: string, windowOpen: boolean,
  progress: Progress, params: Record<string, any>,
  setScreen: (s: ScreenKey, p?: Record<string, any>) => void,
  setProgress: (p: Partial<Progress>) => void,
  setRole: (r: Role) => void,
): Ctx {
  return {
    role, domain, name, windowOpen, progress, params,
    go: (s, p = {}) => setScreen(s as any, p),
    back: () => setScreen("home"),
    signIn: () => { setRole("member"); setScreen("home"); },
    signOut: () => setScreen("onboarding" as any),
    setProgress: (patch) => setProgress(patch),
  };
}

function SplashScreen() {
  const words = ["world!", "geeks!", "coders!", "users!"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => (prev < words.length - 1 ? prev + 1 : prev));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ height: "100%", width: "100%", background: "#000000", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: 36, fontWeight: 700, fontFamily: "'Inter', system-ui, sans-serif", display: "flex", gap: 12, alignItems: "center" }}>
        <span style={{ color: "#17a2b8" }}>[</span>
        <span style={{ color: "#ffffff" }}>Hello</span>
        <div style={{ width: 130, position: "relative", height: 40, display: "flex", alignItems: "center" }}>
          <AnimatePresence mode="wait">
            <motion.span
              key={words[index]}
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ color: "#ffffff", position: "absolute", left: 0, whiteSpace: "nowrap" }}
            >
              {words[index]}
            </motion.span>
          </AnimatePresence>
        </div>
        <span style={{ color: "#17a2b8" }}>]</span>
      </div>
    </div>
  );
}

function CoordinatorNav({ active, setScreen }: { active: string, setScreen: any }) {
  const tabs = [
    { id: "coordinator", icon: LayoutDashboard, label: "Manage" },
    { id: "coordinator_events", icon: Calendar, label: "Events" },
    { id: "coordinator_resources", icon: FolderPlus, label: "Resources" },
    { id: "coordinator_profile", icon: User, label: "Profile" },
  ];
  return (
    <div style={{
      position: "absolute", bottom: 20, left: 20, right: 20,
      background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(20px)",
      borderRadius: 24, border: "1px solid rgba(255,255,255,0.1)",
      padding: "12px 24px", display: "flex", justifyContent: "space-between",
      boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
      zIndex: 50
    }}>
      {tabs.map(t => {
        const isActive = active === t.id;
        const color = isActive ? "#6366F1" : theme.textMuted;
        return (
          <div key={t.id} onClick={() => setScreen(t.id)} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer"
          }}>
            <t.icon size={20} color={color} style={{ opacity: isActive ? 1 : 0.7 }} />
            <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, color }}>{t.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function CoordinatorScreen({ ctx }: { ctx: Ctx }) {
  return (
    <GradientBg style={{ paddingBottom: 100, background: "#0B1020" }}>
      {/* Header */}
      <div style={{ padding: "32px 24px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#6366F1", letterSpacing: 1 }}>COORDINATOR</span>
            <div style={{ background: "rgba(99, 102, 241, 0.2)", padding: "2px 8px", borderRadius: 12, fontSize: 10, color: "#818CF8", fontWeight: 700 }}>{domainLabel(ctx.domain)}</div>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#FFF", margin: 0 }}>Dashboard</h1>
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 22, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Bell size={20} color="#FFF" />
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div style={{ padding: "0 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        <GlassCard style={{ padding: "16px", background: "#151B2D", border: "1px solid rgba(255,255,255,0.05)" }}>
          <Users size={18} color="#6366F1" style={{ marginBottom: 8 }} />
          <div style={{ fontSize: 24, fontWeight: 800, color: "#FFF" }}>42</div>
          <div style={{ fontSize: 12, color: theme.textSecondary }}>Active Members</div>
        </GlassCard>
        <GlassCard style={{ padding: "16px", background: "#151B2D", border: "1px solid rgba(255,255,255,0.05)" }}>
          <Activity size={18} color="#10B981" style={{ marginBottom: 8 }} />
          <div style={{ fontSize: 24, fontWeight: 800, color: "#FFF" }}>85%</div>
          <div style={{ fontSize: 12, color: theme.textSecondary }}>Avg Attendance</div>
        </GlassCard>
        <GlassCard style={{ padding: "16px", background: "#151B2D", border: "1px solid rgba(255,255,255,0.05)" }}>
          <FolderPlus size={18} color="#F59E0B" style={{ marginBottom: 8 }} />
          <div style={{ fontSize: 24, fontWeight: 800, color: "#FFF" }}>12</div>
          <div style={{ fontSize: 12, color: theme.textSecondary }}>Resources Shared</div>
        </GlassCard>
      </div>

      {/* Pending Actions */}
      <div style={{ padding: "0 24px", marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#FFF", marginBottom: 12 }}>Pending Actions</h2>
        <motion.div whileTap={{ scale: 0.98 }} onClick={() => ctx.go("coordinator_attendance")} style={{
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.05))",
          border: "1px solid rgba(99, 102, 241, 0.3)",
          borderRadius: 16, padding: "16px", display: "flex", alignItems: "center", gap: 16, cursor: "pointer"
        }}>
          <div style={{ width: 40, height: 40, borderRadius: 20, background: "rgba(99, 102, 241, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckCircle2 size={20} color="#818CF8" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#FFF" }}>Mark Attendance</div>
            <div style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>{domainLabel(ctx.domain)} Session 3 • Today</div>
          </div>
          <ChevronRight size={20} color={theme.textMuted} />
        </motion.div>
      </div>

      {/* Quick Tools */}
      <div style={{ padding: "0 24px" }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#FFF", marginBottom: 12 }}>Quick Tools</h2>
        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 16 }}>
          {[{ i: Calendar, l: "New Session" }, { i: FolderPlus, l: "Upload PDF" }, { i: Users, l: "Members" }].map((t, i) => (
            <div key={i} style={{
              minWidth: 100, background: "#151B2D", border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: 16, padding: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12
            }}>
              <div style={{ width: 44, height: 44, borderRadius: 22, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <t.i size={20} color="#A78BFA" />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#E2E8F0" }}>{t.l}</span>
            </div>
          ))}
        </div>
      </div>

      <CoordinatorNav active="coordinator" setScreen={ctx.go} />
    </GradientBg>
  );
}

function CoordinatorAttendanceScreen({ ctx }: { ctx: Ctx }) {
  const [students, setStudents] = useState([
    { id: 1, name: "Rahul Sharma", roll: "220193152", present: true },
    { id: 2, name: "Aditi Verma", roll: "220193041", present: false },
    { id: 3, name: "Karan Singh", roll: "220193188", present: true },
    { id: 4, name: "Priya Patel", roll: "220193205", present: false },
    { id: 5, name: "Amit Kumar", roll: "220193012", present: true },
  ]);

  const toggle = (id: number) => {
    setStudents(s => s.map(x => x.id === id ? { ...x, present: !x.present } : x));
  };

  return (
    <GradientBg style={{ paddingBottom: 100, background: "#0B1020" }}>
      <div style={{ padding: "32px 24px 24px", display: "flex", alignItems: "center", gap: 16, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div onClick={() => ctx.go("coordinator")} style={{ width: 40, height: 40, borderRadius: 20, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ChevronRight size={20} color="#FFF" style={{ transform: "rotate(180deg)" }} />
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#FFF", margin: 0 }}>Mark Attendance</h1>
          <div style={{ fontSize: 12, color: theme.textSecondary, marginTop: 4 }}>Session 3 • 42 Students</div>
        </div>
      </div>

      <div style={{ padding: "16px 24px" }}>
        {students.map(s => (
          <div key={s.id} onClick={() => toggle(s.id)} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px", marginBottom: 8, borderRadius: 16, cursor: "pointer",
            background: s.present ? "rgba(16, 185, 129, 0.1)" : "#151B2D",
            border: `1px solid ${s.present ? "rgba(16, 185, 129, 0.3)" : "rgba(255,255,255,0.05)"}`,
            transition: "all 0.2s"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 20, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#FFF" }}>
                {s.name.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#FFF" }}>{s.name}</div>
                <div style={{ fontSize: 12, color: theme.textSecondary }}>{s.roll}</div>
              </div>
            </div>
            <div style={{
              width: 50, height: 28, borderRadius: 14, background: s.present ? "#10B981" : "rgba(255,255,255,0.1)",
              position: "relative", transition: "all 0.2s"
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: 12, background: "#FFF",
                position: "absolute", top: 2, left: s.present ? 24 : 2, transition: "all 0.2s",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
              }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "24px", background: "linear-gradient(to top, #0B1020 60%, transparent)", zIndex: 10 }}>
        <Btn onClick={() => ctx.go("coordinator")} color="#6366F1">Save Attendance</Btn>
      </div>
    </GradientBg>
  );
}

export default function App() {
  const [isSplash, setIsSplash] = useState(true);
  const [screen, setScreenState] = useState<ScreenKey | "onboarding">("guest_home" as any);

  useEffect(() => {
    const timer = setTimeout(() => setIsSplash(false), 3800);
    return () => clearTimeout(timer);
  }, []);
  const [params, setParams] = useState<Record<string, any>>({});
  const [role, setRole] = useState<Role>("public");
  const [domain, setDomain] = useState<Domain>("android");
  const [windowOpen, setWindowOpen] = useState(true);
  const [progress, setProgressState] = useState<Progress>(defaultProgress);

  function setScreen(s: ScreenKey | "onboarding", p: Record<string, any> = {}) {
    setParams(p);
    setScreenState(s);
  }

  function setProgress(patch: Partial<Progress>) {
    setProgressState(prev => ({ ...prev, ...patch }));
  }

  const ctx = buildCtx(role, domain, "Atul Kumar", windowOpen, progress, params, setScreen, setProgress, setRole);

  const screenMap: Record<string, React.ReactNode> = {
    // Hidden non-admin screens:
    // onboarding: <OnboardingScreen ctx={ctx} />,
    // login_email: <LoginEmailScreen ctx={ctx} />,
    // login_password: <LoginPasswordScreen ctx={ctx} />,
    // forgot_password: <ForgotPasswordScreen ctx={ctx} />,
    // check_email: <CheckEmailScreen ctx={ctx} />,
    guest_home: <GuestHomeScreen ctx={ctx} />,
    // home: <HomeScreen ctx={ctx} />,
    // attendance: <AttendanceScreen ctx={ctx} />,
    // resources: <ResourcesScreen ctx={ctx} />,
    // events: <EventsScreen ctx={ctx} />,
    coordinator: <CoordinatorScreen ctx={ctx} />,
    coordinator_attendance: <CoordinatorAttendanceScreen ctx={ctx} />,
    
    // Admin screens:
    admin: <AdminScreen ctx={ctx} />,
    admin_domain: <AdminDomainScreen ctx={ctx} />,
    admin_member_profile: <AdminMemberProfileScreen ctx={ctx} />,
    admin_broadcast: <AdminBroadcastScreen ctx={ctx} />,
    admin_events: <AdminEventsScreen ctx={ctx} />,
  };

  const screenLabels: Record<string, string> = {
    // onboarding: "Welcome", login_email: "Email", login_password: "Password",
    // forgot_password: "Reset Pass", check_email: "Check Email", guest_home: "Guest",
    // home: "Home", attendance: "Attendance", resources: "Resources", events: "Events",
    coordinator: "Dashboard (Coord)",
    coordinator_attendance: "Mark Att. (Coord)", 
    admin: "Dashboard",
    admin_domain: "Domain", admin_member_profile: "Profile",
    admin_broadcast: "Broadcast", admin_events: "Events (Admin)",
  };

  const dc = domainColor(domain);

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(160deg, #050510 0%, #0a0a2a 60%, #12062a 100%)`,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        padding: "20px 24px 16px",
        borderBottom: `1px solid rgba(255,255,255,0.06)`,
        background: "rgba(0,0,0,0.3)",
        backdropFilter: "blur(12px)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: theme.textPrimary, letterSpacing: -0.5 }}>
              ⚡ Innogeeks Android Preview
            </div>
            <div style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>
              All screens — interactive prototype
            </div>
          </div>
          {/* Controls */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: 10, color: theme.textMuted, display: "block", marginBottom: 2 }}>ROLE</span>
              <div style={{ display: "flex", gap: 4 }}>
                {ROLES.map(r => (
                  <button key={r} onClick={() => setRole(r)} style={{
                    padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: "pointer",
                    border: `1px solid ${role === r ? dc : theme.glassBorder}`,
                    background: role === r ? hexA(dc, 0.2) : theme.glassFill,
                    color: role === r ? dc : theme.textSecondary,
                  }}>
                    {r.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span style={{ fontSize: 10, color: theme.textMuted, display: "block", marginBottom: 2 }}>DOMAIN</span>
              <div style={{ display: "flex", gap: 4 }}>
                {DOMAINS.map(d => {
                  const c = domainColor(d);
                  return (
                    <button key={d} onClick={() => setDomain(d)} style={{
                      padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: "pointer",
                      border: `1px solid ${domain === d ? c : theme.glassBorder}`,
                      background: domain === d ? hexA(c, 0.2) : theme.glassFill,
                      color: domain === d ? c : theme.textSecondary,
                    }}>
                      {domainLabel(d)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Screen nav pills */}
      <div style={{ padding: "16px 24px 0", display: "flex", gap: 6, flexWrap: "wrap" }}>
        {Object.keys(screenMap).map(s => (
          <button
            key={s}
            onClick={() => setScreen(s as any)}
            style={{
              padding: "6px 14px", borderRadius: 999, fontSize: 11, fontWeight: 600, cursor: "pointer",
              border: `1px solid ${screen === s ? dc : theme.glassBorder}`,
              background: screen === s ? hexA(dc, 0.2) : "rgba(255,255,255,0.04)",
              color: screen === s ? dc : theme.textSecondary,
              transition: "all 0.15s",
            }}
          >
            {screenLabels[s]}
          </button>
        ))}
      </div>

      {/* Phone preview */}
      <div style={{ display: "flex", justifyContent: "center", padding: "32px 24px 48px" }}>
        <PhoneShell label={screenLabels[screen]}>
          <AnimatePresence mode="wait">
            {isSplash ? (
              <motion.div key="splash" exit={{ opacity: 0, scale: 1.1 }} transition={{ duration: 0.4 }} style={{ height: "100%" }}>
                <SplashScreen />
              </motion.div>
            ) : (
              <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} style={{ height: "100%" }}>
                {screenMap[screen]}
              </motion.div>
            )}
          </AnimatePresence>
        </PhoneShell>
      </div>

      {/* Gallery strip */}
      <div style={{ borderTop: `1px solid rgba(255,255,255,0.06)`, padding: "24px", background: "rgba(0,0,0,0.2)" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: theme.textMuted, letterSpacing: 1, marginBottom: 16 }}>
          ALL SCREENS GALLERY
        </div>
        <div style={{ display: "flex", gap: 20, overflowX: "auto", paddingBottom: 8 }}>
          {Object.keys(screenMap).map(s => (
            <div
              key={s}
              onClick={() => setScreen(s as any)}
              style={{
                cursor: "pointer",
                flexShrink: 0,
                opacity: screen === s ? 1 : 0.55,
                transform: screen === s ? "scale(1.04)" : "scale(1)",
                transition: "all 0.2s",
              }}
            >
              <div style={{
                width: 100, height: 200, borderRadius: 16,
                background: bgGradient,
                border: `1.5px solid ${screen === s ? dc : theme.glassBorder}`,
                overflow: "hidden",
                pointerEvents: "none",
                transform: "scale(0.31)",
                transformOrigin: "top left",
                marginBottom: -440,
                marginRight: -220,
              }}>
                {screenMap[s]}
              </div>
              <div style={{ fontSize: 10, color: screen === s ? dc : theme.textSecondary, fontWeight: 600, textAlign: "center", marginTop: 4 }}>
                {screenLabels[s]}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
