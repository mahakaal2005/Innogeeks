import React from "react";
import { motion } from "framer-motion";
import { Image as ImageIcon, Users, Rocket, Sparkles } from "lucide-react";
import { useGetClubInfo } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  DEFAULT_CLUB_INFO,
  domainIcon,
  socialIcon,
} from "@/lib/club-info-content";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5 },
};

function HeroPhoto({ url }: { url: string | null }) {
  if (url) {
    return (
      <img
        src={url}
        alt="Club Innogeeks"
        className="h-64 w-full rounded-2xl object-cover md:h-80"
        data-testid="img-hero"
      />
    );
  }
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 bg-white/5 text-center text-white/40 md:h-80">
      <ImageIcon className="h-7 w-7" />
      <span className="px-3 text-xs font-medium uppercase tracking-wider">
        Add a hero photo of the club
      </span>
    </div>
  );
}

export default function ClubInfo() {
  const { data } = useGetClubInfo();
  // Fall back to built-in placeholders until content is published.
  const content = data?.content ?? DEFAULT_CLUB_INFO;

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
            {content.hero.badge}
          </span>
          <h1 className="text-4xl font-display font-bold leading-tight text-white sm:text-5xl">
            {content.hero.titleLead}{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {content.hero.titleHighlight}
            </span>
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-white/60">
            {content.hero.description}
          </p>
          <div className="flex flex-wrap gap-6 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-blue-300">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">
                  {content.domains.length}
                </p>
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
        <HeroPhoto url={content.hero.imageUrl} />
      </motion.section>

      {/* About */}
      <motion.section {...fadeUp}>
        <Card className="glass-panel border-white/10 bg-white/5">
          <CardContent className="space-y-4 p-8">
            <h2 className="text-2xl font-display font-semibold text-white">
              {content.about.heading}
            </h2>
            {content.about.paragraphs.map((para, i) => (
              <p key={i} className="leading-relaxed text-white/60">
                {para}
              </p>
            ))}
          </CardContent>
        </Card>
      </motion.section>

      {/* Domains */}
      <motion.section {...fadeUp} className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-display font-bold text-white">
            Our domains
          </h2>
          <p className="mt-2 text-white/50">Pick where your curiosity takes you.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {content.domains.map((d, i) => {
            const Icon = domainIcon(d.key);
            return (
              <motion.div
                key={d.key || i}
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
                    <h3 className="text-lg font-semibold text-white">{d.label}</h3>
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
      {content.gallery.length > 0 && (
        <motion.section {...fadeUp} className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-display font-bold text-white">
              Moments from Innogeeks
            </h2>
            <p className="mt-2 text-white/50">
              Workshops, events, and hackathons.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {content.gallery.map((item, i) => (
              <figure key={i} className="space-y-2">
                <img
                  src={item.url}
                  alt={item.caption || `Gallery photo ${i + 1}`}
                  className="h-44 w-full rounded-2xl object-cover"
                  data-testid={`img-gallery-${i}`}
                />
                {item.caption && (
                  <figcaption className="text-center text-xs text-white/50">
                    {item.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </motion.section>
      )}

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
          {content.socials.map((s, i) => {
            const Icon = socialIcon(s.label);
            return (
              <a
                key={s.label || i}
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
