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
  Link as LinkIcon,
  type LucideIcon,
} from "lucide-react";
import type { ClubInfoContent } from "@workspace/api-client-react";

// Icons are code-bound (not editable). Domains are matched by `key`, socials by
// `label` — editors change the text/links, the icon stays consistent.
export const DOMAIN_ICONS: Record<string, LucideIcon> = {
  android: Smartphone,
  web: Globe,
  ml: BrainCircuit,
  iot: Cpu,
  arvr: Glasses,
};

export const SOCIAL_ICONS: Record<string, LucideIcon> = {
  Email: Mail,
  Instagram: Instagram,
  LinkedIn: Linkedin,
  GitHub: Github,
};

export function domainIcon(key: string): LucideIcon {
  return DOMAIN_ICONS[key] ?? LinkIcon;
}

export function socialIcon(label: string): LucideIcon {
  return SOCIAL_ICONS[label] ?? LinkIcon;
}

// Built-in placeholder content. Used as a fallback when nothing has been
// published yet, and as the starting point in the admin editor.
export const DEFAULT_CLUB_INFO: ClubInfoContent = {
  hero: {
    badge: "KIET's Student Tech Community",
    titleLead: "Build. Learn.",
    titleHighlight: "Innovate.",
    description:
      "Club Innogeeks is the technical club of KIET — a community of makers, coders, and tinkerers across five domains. We run workshops, build real projects, and host events all year round.",
    imageUrl: null,
  },
  about: {
    heading: "About the club",
    paragraphs: [
      "We're a student-run club at KIET focused on hands-on technology. Members collaborate on projects, mentor juniors, compete in hackathons, and ship things that matter. Whether you're just starting out or already shipping side-projects, there's a place for you here.",
      "This is placeholder text — replace it with the club's real story, mission, and achievements.",
    ],
  },
  domains: [
    {
      key: "android",
      label: "App Development",
      blurb: "Native Android apps built with Kotlin and modern tooling.",
    },
    {
      key: "web",
      label: "Web Development",
      blurb: "Full-stack web experiences, from polished UI to robust APIs.",
    },
    {
      key: "ml",
      label: "Machine Learning",
      blurb: "Data, models, and intelligent systems that learn.",
    },
    {
      key: "iot",
      label: "Internet of Things",
      blurb: "Hardware, sensors, and connected devices that talk.",
    },
    {
      key: "arvr",
      label: "AR / VR",
      blurb: "Immersive augmented and virtual reality worlds.",
    },
  ],
  gallery: [],
  socials: [
    {
      label: "Email",
      value: "innogeeks@kiet.edu",
      href: "mailto:innogeeks@kiet.edu",
    },
    { label: "Instagram", value: "@club.innogeeks", href: "#" },
    { label: "LinkedIn", value: "Club Innogeeks", href: "#" },
    { label: "GitHub", value: "club-innogeeks", href: "#" },
  ],
};
