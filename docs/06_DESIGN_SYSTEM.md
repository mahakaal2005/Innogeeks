# Design System
## Club Innogeeks — Member & Club Management Platform

**Version:** 1.0  
**Date:** June 15, 2026  

---

## 1. Design Philosophy

The Innogeeks platform uses **Glassmorphism** as its core visual language — frosted glass cards, blurred layered backgrounds, soft translucency, and luminous accent colors on dark gradients. The aesthetic reflects the club's identity: modern, tech-forward, and youth-energy.

---

## 2. Color Palette

### Background
- Base: `#0a0a1a` (deep navy black)
- Gradient: `linear-gradient(135deg, #0a0a1a 0%, #0f0f2e 50%, #1a0a2e 100%)`
- Subtle radial glow spots (blue/purple) behind glass cards

### Glass Card
- Background: `rgba(255, 255, 255, 0.05)` to `rgba(255, 255, 255, 0.10)`
- Border: `1px solid rgba(255, 255, 255, 0.15)`
- Backdrop filter: `blur(12px) saturate(180%)`
- Box shadow: `0 8px 32px rgba(0, 0, 0, 0.4)`

### Accent Colors (Domain-coded)
| Domain | Primary Color | Hex |
|---|---|---|
| Android | Green | `#4ade80` |
| Web | Blue | `#60a5fa` |
| ML | Purple | `#a78bfa` |
| IoT | Orange | `#fb923c` |
| AR/VR | Pink/Magenta | `#f472b6` |

### Status Colors
- Success / Present: `#4ade80` (green)
- Warning / Pending: `#fbbf24` (amber)
- Error / Absent / Rejected: `#f87171` (red)
- Info / In Progress: `#60a5fa` (blue)

### Text
- Primary: `rgba(255, 255, 255, 0.95)`
- Secondary: `rgba(255, 255, 255, 0.65)`
- Muted: `rgba(255, 255, 255, 0.40)`

---

## 3. Typography

- **Headings:** `Space Grotesk` (Google Fonts) — modern, geometric, technical feel
- **Body:** `Inter` — clean, readable at small sizes
- **Monospace (code/IDs):** `JetBrains Mono`

### Scale
| Element | Size | Weight |
|---|---|---|
| H1 (page title) | 2.5rem | 700 |
| H2 (section title) | 1.875rem | 600 |
| H3 (card title) | 1.25rem | 600 |
| Body | 1rem | 400 |
| Small/Label | 0.875rem | 500 |
| Tiny/Meta | 0.75rem | 400 |

---

## 4. Component Library

### Glass Card
The primary container. Used for: stats, forms, content panels, profile cards.
```css
.glass-card {
  background: rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}
```

### Glass Nav / Sidebar
```css
.glass-nav {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}
```

### Buttons
- **Primary:** Gradient background (`from-blue-500 to-purple-600`), white text, rounded-lg, subtle glow on hover
- **Secondary:** Glass style (`bg-white/10 border border-white/20`), white text
- **Danger:** `bg-red-500/20 border border-red-500/40` text-red-400
- **Ghost:** No background, just text + hover glass effect

### Status Badges
Pill-shaped with domain/status color at 20% opacity background, matching text.

### Forms
- Input: glass background, `border-white/20`, white placeholder at 40% opacity, focus ring in blue
- Label: uppercase, tracking-wider, small size, muted color

### Tables (Attendance Grid)
- Header row: slightly more opaque glass
- Alternating rows: different glass opacity levels
- P badge: green pill; A badge: red pill

---

## 5. Layout

### Navigation
- **Sidebar** (desktop): glass panel, role-based menu items, domain color accents
- **Bottom tab bar** (mobile): glass blur, icons + labels

### Page Structure
```
[Background gradient + glow blobs]
  └── [Sidebar / Nav]
       └── [Main content area]
            ├── [Page header — title + breadcrumb]
            ├── [Stats row — glass cards]
            └── [Main content — glass card(s)]
```

### Grid
- 12-column grid, 24px gap
- Cards: span 4 (stats), span 6 (lists), span 12 (full width)
- Mobile: all cards span 12

---

## 6. Motion & Animations

- **Page transitions:** Fade + slight upward translate on mount (150ms ease-out)
- **Card hover:** Slight lift + border brighten (`translateY(-2px)`, border opacity +10%)
- **Glass shimmer:** Subtle gradient shimmer animation on primary action cards (5s loop)
- **Status change:** Smooth color transition (300ms)
- **List items:** Staggered entrance (50ms delay per item, max 10 items)
- **Loading:** Skeleton loader matching card shape with pulsing glass opacity

---

## 7. Iconography

- Icon library: **Lucide React** (consistent line weight, clean geometric style)
- Icon size: 20px default, 16px in compact spaces, 24px in navigation
- Icons tinted with matching accent/status color

---

## 8. Responsive Breakpoints

| Name | Min Width | Layout |
|---|---|---|
| Mobile | 320px | Single column, bottom nav |
| Tablet | 768px | Two column, collapsible sidebar |
| Desktop | 1024px | Three column, full sidebar |
| Wide | 1280px | Wider content area, more stats visible |

---

## 9. Domain Color Usage

Each domain has an accent color used consistently:
- Folder labels and icons
- Attendance session domain badges
- Resource section headers
- Member profile domain tags
- Charts and stats breakdowns

This gives users instant visual identification of domain context throughout the app.
