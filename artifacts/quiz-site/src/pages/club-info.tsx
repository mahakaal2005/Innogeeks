import React from "react";
import { motion } from "framer-motion";
import {
  Smartphone,
  Globe,
  BrainCircuit,
  Cpu,
  Glasses,
  Mail,
  Instagram,
  Linkedin,
  Github,
  Image as ImageIcon,
  Users,
  Rocket,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const DOMAINS = [
  {
    key: "android",
    label: "App Development",
    icon: Smartphone,
    blurb: "Native Android apps built with Kotlin and modern tooling.",
  },
  {
    key: "web",
    label: "Web Development",
    icon: Globe,
    blurb: "Full-stack web experiences, from polished UI to robust APIs.",
  },
  {
    key: "ml",
    label: "Machine Learning",
    icon: BrainCircuit,
    blurb: "Data, models, and intelligent systems that learn.",
  },
  {
    key: "iot",
    label: "Internet of Things",
    icon: Cpu,
    blurb: "Hardware, sensors, and connected devices that talk.",
  },
  {
    key: "arvr",
    label: "AR / VR",
    icon: Glasses,
    blurb: "Immersive augmented and virtual reality worlds.",
  },
];

const SOCIALS = [
  { label: "Email", value: "innogeeks@kiet.edu", icon: Mail, href: "mailto:innogeeks@kiet.edu" },
  { label: "Instagram", value: "@club.innogeeks", icon: Instagram, href: "#" },
  { label: "LinkedIn", value: "Club Innogeeks", icon: Linkedin, href: "#" },
  { label: "GitHub", value: "club-innogeeks", icon: Github, href: "#" },
];

function PhotoSlot({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 bg-white/5 text-center text-white/40 ${className}`}
    >
      <ImageIcon className="h-7 w-7" />
      <span className="px-3 text-xs font-medium uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5 },
};

export default function ClubInfo() {
  return (
    <div className="w-full space-y-20 py-4">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="grid items-center gap-8 md:grid-cols-2"
      >
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-white/70">
            <Sparkles className="h-3.5 w-3.5" />
            KIET's Student Tech Community
          </span>
          <h1 className="text-4xl font-display font-bold leading-tight text-white sm:text-5xl">
            Build. Learn.{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Innovate.
            </span>
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-white/60">
            Club Innogeeks is the technical club of KIET — a community of makers,
            coders, and tinkerers across five domains. We run workshops, build
            real projects, and host events all year round.
          </p>
          <div className="flex flex-wrap gap-6 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-blue-300">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">5</p>
                <p className="text-xs uppercase tracking-wider text-white/50">
                  Tech Domains
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-purple-300">
                <Rocket className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">Year-round</p>
                <p className="text-xs uppercase tracking-wider text-white/50">
                  Workshops &amp; Events
                </p>
              </div>
            </div>
          </div>
        </div>
        <PhotoSlot label="Add a hero photo of the club" className="h-64 md:h-80" />
      </motion.section>

      {/* About */}
      <motion.section {...fadeUp}>
        <Card className="glass-panel border-white/10 bg-white/5">
          <CardContent className="space-y-4 p-8">
            <h2 className="text-2xl font-display font-semibold text-white">
              About the club
            </h2>
            <p className="leading-relaxed text-white/60">
              We're a student-run club at KIET focused on hands-on technology.
              Members collaborate on projects, mentor juniors, compete in
              hackathons, and ship things that matter. Whether you're just
              starting out or already shipping side-projects, there's a place for
              you here.
            </p>
            <p className="leading-relaxed text-white/60">
              This is placeholder text — replace it with the club's real story,
              mission, and achievements.
            </p>
          </CardContent>
        </Card>
      </motion.section>

      {/* Domains */}
      <motion.section {...fadeUp} className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-display font-bold text-white">
            Our five domains
          </h2>
          <p className="mt-2 text-white/50">
            Pick where your curiosity takes you.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {DOMAINS.map((d, i) => {
            const Icon = d.icon;
            return (
              <motion.div
                key={d.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Card className="glass-panel h-full border-white/10 bg-white/5 transition-colors hover:border-white/20 hover:bg-white/[0.07]">
                  <CardContent className="space-y-3 p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 text-white">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      {d.label}
                    </h3>
                    <p className="text-sm leading-relaxed text-white/55">
                      {d.blurb}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Gallery */}
      <motion.section {...fadeUp} className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-display font-bold text-white">
            Moments from Innogeeks
          </h2>
          <p className="mt-2 text-white/50">
            Add photos from workshops, events, and hackathons.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <PhotoSlot label="Event photo 1" className="h-44" />
          <PhotoSlot label="Event photo 2" className="h-44" />
          <PhotoSlot label="Event photo 3" className="h-44" />
          <PhotoSlot label="Workshop photo" className="h-44" />
          <PhotoSlot label="Team photo" className="h-44" />
          <PhotoSlot label="Project showcase" className="h-44" />
        </div>
      </motion.section>

      {/* Contact */}
      <motion.section {...fadeUp} className="space-y-8 pb-8">
        <div className="text-center">
          <h2 className="text-3xl font-display font-bold text-white">
            Get in touch
          </h2>
          <p className="mt-2 text-white/50">
            Follow along and reach out — we'd love to hear from you.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SOCIALS.map((s) => {
            const Icon = s.icon;
            return (
              <a
                key={s.label}
                href={s.href}
                className="glass-panel flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition-colors hover:border-white/20 hover:bg-white/[0.07]"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/5 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-white/50">
                    {s.label}
                  </p>
                  <p className="truncate text-sm font-medium text-white">
                    {s.value}
                  </p>
                </div>
              </a>
            );
          })}
        </div>
        <p className="text-center text-xs text-white/30">
          The Round 1 recruitment test appears here only on the test date set by
          the core team.
        </p>
      </motion.section>
    </div>
  );
}
