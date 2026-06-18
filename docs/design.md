---
version: alpha
name: "Dark Geek Playground"
description: "Primary visual anchor uses #a5b4fc with hero wordmark (innogeeks), h1/h2 headings, section titles. Typography baseline relies on cabin-sketch-regular for giant hero brand wordmark (innogeeks)."
colors:
  heading-lavender: "#a5b4fc"
  cyan-accent: "#17a2b8"
  background-primary: "#23232e"
  background-secondary: "#141418"
  pure-black: "#000000"
  dark-text: "#212529"
  text-primary: "#b6b6b6"
  text-secondary: "#ececec"
  white: "#ffffff"
  border-subtle: "#e5e7eb"
typography:
  hero-wordmark:
    fontFamily: "cabin-sketch-regular"
    fontSize: "160px"
    fontWeight: "400"
    lineHeight: "192px"
  display-heading:
    fontFamily: "cabin-sketch-regular"
    fontSize: "60px"
    fontWeight: "400"
    lineHeight: "60px"
  section-heading-bold:
    fontFamily: "cabin-sketch-regular"
    fontSize: "46px"
    fontWeight: "800"
    lineHeight: "40px"
  section-heading:
    fontFamily: "cabin-sketch-regular"
    fontSize: "36px"
    fontWeight: "800"
    lineHeight: "40px"
  card-heading:
    fontFamily: "cabin-sketch-regular"
    fontSize: "32px"
    fontWeight: "700"
    lineHeight: "32px"
  subheading:
    fontFamily: "cabin-sketch-regular"
    fontSize: "30px"
    fontWeight: "400"
    lineHeight: "45px"
  sketch-label:
    fontFamily: "cabin-sketch-regular"
    fontSize: "24px"
    fontWeight: "400"
    lineHeight: "28.8px"
  body-sketch:
    fontFamily: "cabin-sketch-regular"
    fontSize: "16px"
    fontWeight: "400"
    lineHeight: "24px"
  body-maiandra-semibold:
    fontFamily: "maiandra"
    fontSize: "20px"
    fontWeight: "600"
    lineHeight: "28px"
  body-maiandra-bold:
    fontFamily: "maiandra"
    fontSize: "16px"
    fontWeight: "700"
    lineHeight: "24px"
  body-maiandra:
    fontFamily: "maiandra"
    fontSize: "16px"
    fontWeight: "400"
    lineHeight: "24px"
  system-body:
    fontFamily: "-apple-system"
    fontSize: "16px"
    fontWeight: "400"
    lineHeight: "24px"
rounded:
  sm: "3px"
  md-sm: "4.8px"
  md: "6px"
  lg: "10px"
  xl: "12px"
  2xl: "16px"
  3xl: "20px"
  pill: "9999px"
spacing:
  xs: "5px"
  sm: "8px"
  md-sm: "10px"
  md: "16px"
  lg-sm: "20px"
  lg: "22px"
  xl: "24px"
  2xl: "32px"
  3xl: "40px"
  4xl: "48px"
  5xl: "50px"
  6xl: "64px"
  7xl: "80px"
  8xl: "100px"
  9xl: "120px"
  10xl: "160px"
---

## Overview

Primary visual anchor uses #a5b4fc with hero wordmark (innogeeks), h1/h2 headings, section titles. Typography baseline relies on cabin-sketch-regular for giant hero brand wordmark (innogeeks).

This system uses a 8px base grid with scale values 5, 8, 10, 16, 20, 22, 24, 32, 40, 48, 50, 64, 80, 100, 120, 160.

**Signature traits:**
- Core token rhythm: Token evidence indicates consistent color, spacing, and radius rhythm across visible UI.

## Colors

The palette uses 10 validated color tokens across 1 theme profile. Semantic roles stay attached to observed usage so generation agents can choose accents without inventing new color meaning.

**Semantic naming:**
- **surface-background** maps to `background-primary`: Role "background" is grounded by usage context "Main navbar and sidebar background surface".
- **content-primary** maps to `heading-lavender`: Role "primary" is grounded by usage context "Hero wordmark (INNOGEEKS), h1/h2 headings, section titles".
- **action-accent** maps to `cyan-accent`: Role "accent" is grounded by usage context "Primary CTA button background (Join Us Now), footer buttons, gradient from-color".
- **action-text** maps to `text-primary`: Role "text" is grounded by usage context "Navigation links, secondary body text".

### Primary Brand
- **Heading Lavender** (#a5b4fc): Hero wordmark (INNOGEEKS), h1/h2 headings, section titles. Role: primary.
- **Cyan Accent** (#17a2b8): Primary CTA button background (Join Us Now), footer buttons, gradient from-color. Role: accent.

### Text Scale
- **Dark Text** (#212529): Navbar text color, nav items in light contexts. Role: text.
- **Text Primary** (#b6b6b6): Navigation links, secondary body text. Role: text.
- **Text Secondary** (#ececec): Lighter secondary text, subheadings. Role: text.
- **White** (#ffffff): Button labels, footer text, icon fills. Role: text.

### Interactive
- **Border Subtle** (#e5e7eb): Default border color across components (Bootstrap/Tailwind default). Role: border.

### Surface & Shadows
- **Background Primary** (#23232e): Main navbar and sidebar background surface. Role: background.
- **Background Secondary** (#141418): Deeper page background, hero section fill. Role: background.
- **Pure Black** (#000000): Hero canvas background, deepest surface layer. Role: background.

## Typography

Typography uses cabin-sketch-regular, maiandra, -apple-system across extracted hierarchy roles. Keep hierarchy mapped to these token rows before adding decorative type styles.

Mixes cabin-sketch-regular and maiandra and -apple-system for visual contrast. Weight range spans regular, bold, semi-bold. Sizes range from 16px to 160px.

### Font Roles
- **Headline Font**: cabin-sketch-regular
- **Body Font**: cabin-sketch-regular

### Type Scale Evidence
| Role | Font | Size | Weight | Line Height | Letter Spacing | Stack / Features | Notes |
|------|------|------|--------|-------------|----------------|------------------|-------|
| Giant hero brand wordmark (INNOGEEKS) | cabin-sketch-regular | 160px | 400 | 192px | normal | cabin-sketch-regular, sans-serif | Extracted token |
| Large section display headings | cabin-sketch-regular | 60px | 400 | 60px | normal | cabin-sketch-regular, sans-serif | Extracted token |
| Bold section headings | cabin-sketch-regular | 46px | 800 | 40px | normal | cabin-sketch-regular, sans-serif | Extracted token |
| Sub-section headings | cabin-sketch-regular | 36px | 800 | 40px | normal | cabin-sketch-regular, sans-serif | Extracted token |
| Card and component headings | cabin-sketch-regular | 32px | 700 | 32px | normal | cabin-sketch-regular, sans-serif | Extracted token |
| Subheadings and callout text | cabin-sketch-regular | 30px | 400 | 45px | normal | cabin-sketch-regular, sans-serif | Extracted token |
| Navigation labels, medium headings | cabin-sketch-regular | 24px | 400 | 28.8px | normal | cabin-sketch-regular, sans-serif | Extracted token |
| Body text in sketch style | cabin-sketch-regular | 16px | 400 | 24px | normal | cabin-sketch-regular, sans-serif | Extracted token |
| Card titles, feature headings | maiandra | 20px | 600 | 28px | normal | maiandra | Extracted token |
| Emphasized body text, labels | maiandra | 16px | 700 | 24px | normal | maiandra | Extracted token |
| General body copy, descriptions | maiandra | 16px | 400 | 24px | normal | maiandra | Extracted token |
| Default system fallback body text | -apple-system | 16px | 400 | 24px | normal | -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji | Extracted token |

## Layout

Responsive system uses 4 breakpoint tier(s): mobile, tablet, desktop, wide.

### Responsive Strategy
- **mobile (576-1199.98px)**: Constrain layout for small viewports and prioritize vertical stacking.
- **tablet (>= 640px)**: Increase spacing and column structure for medium-width viewports.
- **desktop (>= 1024px)**: Expand layout density and horizontal composition for wide viewports.
- **wide (>= 1536px)**: Stretch composition with generous gutters and wider layout spans.

### Spacing System
| Token | Value | Px | Notes |
|------|-------|----|-------|
| xs | 5px | 5 | Extracted spacing token |
| sm | 8px | 8 | Extracted spacing token |
| md-sm | 10px | 10 | Extracted spacing token |
| md | 16px | 16 | Extracted spacing token |
| lg-sm | 20px | 20 | Extracted spacing token |
| lg | 22px | 22 | Extracted spacing token |
| xl | 24px | 24 | Extracted spacing token |
| 2xl | 32px | 32 | Extracted spacing token |
| 3xl | 40px | 40 | Extracted spacing token |
| 4xl | 48px | 48 | Extracted spacing token |
| 5xl | 50px | 50 | Extracted spacing token |
| 6xl | 64px | 64 | Extracted spacing token |
| 7xl | 80px | 80 | Extracted spacing token |
| 8xl | 100px | 100 | Extracted spacing token |
| 9xl | 120px | 120 | Extracted spacing token |
| 10xl | 160px | 160 | Extracted spacing token |

## Elevation & Depth

Keep depth flat unless validated shadow or interaction evidence appears in the extraction payload. Do not invent shadows beyond this evidence boundary.

### Shadow Evidence
| Shadow Token | Layers | Details |
|--------------|--------|---------|
| card-soft | 1 | 0px 4px 30px 0px rgba(0, 0, 0, 0.1) |
| card-medium | 1 | 0px 16px 48px 0px rgba(0, 0, 0, 0.176) |
| side-soft | 1 | -4px 2px 10px 0px rgba(0, 0, 0, 0.2) |
| button-depth | 1 | 0px 8px 28px -9px rgba(0, 0, 0, 0.45) |

### Interaction Signals
| Theme | Signal | Evidence |
|-------|--------|----------|
| Light | backdrop-filter | blur(5px) |
| Light | outline-color | rgb(255, 255, 255) ; rgb(0, 0, 0) ; rgb(33, 37, 41) |
| Light | outline-width | 3px |
| Light | outline-offset | 0px |
| Light | transform | matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 75, 1) ; matrix(1, 0, 0, 1, 0, -100) ; matrix(1, 0, 0, 1, 0, 0.709085) |

## Shapes

Shape language maps directly to rounded tokens. Keep component corners consistent with the role mapping below before introducing bespoke geometry.

### Radius Roles
| Token | Value | Px | Role Mapping |
|------|-------|----|--------------|
| sm | 3px | 3 | Subtle corner |
| md-sm | 4.8px | 4.8 | Subtle corner |
| md | 6px | 6 | Subtle corner |
| lg | 10px | 10 | Control corner |
| xl | 12px | 12 | Control corner |
| 2xl | 16px | 16 | Card corner |
| 3xl | 20px | 20 | Card corner |
| pill | 9999px | 9999 | Large surface corner |

### Geometry Evidence
| Radius Token | Shape | Units |
|--------------|-------|-------|
| sm | 3px | px |
| md-sm | 4.8px | px |
| md | 6px | px |
| lg | 10px | px |
| xl | 12px | px |
| 2xl | 16px | px |
| 3xl | 20px | px |
| pill | 9999px | px |

## Components

(none detected)

## Do's and Don'ts

Guardrails protect Core token rhythm without adding unsupported visual claims.

| Do | Don't |
|----|---------|
| Do maintain consistent spacing using the base grid | Don't make unsupported claims about absent visual features |
| Do maintain WCAG AA contrast ratios (4.5:1 for normal text) | Don't mix rounded and sharp corners in the same view |
| Do use the primary color only for the single most important action per screen |  |
| Do verify evidence before writing new design-system guidance |  |

## Responsive Evidence

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | <= 575.98px | (max-width: 575.98px) |
| Mobile | <= 600px | only screen and (max-width: 600px) |
| Breakpoint 3 | <= 767.98px | (max-width: 767.98px) |
| Breakpoint 4 | <= 991.98px | (max-width: 991.98px) |
| Breakpoint 5 | <= 1199.98px | (max-width: 1199.98px) |
| Mobile | >= 576px | (min-width: 576px) |
| Mobile | >= 600px | only screen and (min-width: 600px) |
| Mobile | >= 640px | (min-width: 640px) |
| Tablet | >= 768px | (min-width: 768px) |
| Tablet | >= 992px | (min-width: 992px) |
| Desktop | >= 1024px | (min-width: 1024px) |
| Desktop | >= 1200px | (min-width: 1200px) |
| Desktop | >= 1280px | (min-width: 1280px) |
| Desktop | >= 1536px | (min-width: 1536px) |
| Breakpoint 15 | Unknown | (prefers-reduced-motion: reduce) |

## Agent Prompt Guide

### Example Component Prompts
- Create button component using validated primary color role and spacing tokens.
- Create card component with mapped radius role and evidence-backed elevation.
- Create form input component using inferred typography hierarchy and border roles.

### Iteration Guide
1. Start with extracted palette and typography roles only.
2. Map spacing and radius directly from token tables before visual polish.
3. Apply component patterns one section at a time and compare against source intent.
4. Keep elevation claims tied to explicit evidence in output.
5. Iterate with smallest diffs and re-check section hierarchy after each change.
