# Design System
## Club Innogeeks — Member & Club Management Platform

**Version:** 2.0  
**Date:** June 16, 2026  

---

## Brand & Style

The design system is built for a community of developers, creators, and tech enthusiasts. It bridges the gap between a high-end corporate tech environment and an energetic, collaborative workspace. The brand personality is **forward-thinking, precise, and accessible.**

The chosen design style is **Modern Minimalism with Glassmorphic accents.** This approach utilizes vast amounts of clean white space to ensure clarity, while using deep blue structural elements to provide a sense of authority and stability. High-contrast accents in cyan and lavender are used sparingly to inject energy and highlight innovative features, ensuring the interface feels alive and "high-tech" without being cluttered.

## Colors

### Light Theme Hierarchy

This design system utilizes a **sophisticated dark-on-light** hierarchy. The palette is anchored by a deep navy primary color, which provides the "tech" foundation. 

- **Primary (Deep Navy):** Used for navigation bars, primary headings, and high-impact structural components.
- **Secondary (Electric Cyan):** Used for primary actions, success states, and indicating progress.
- **Tertiary (Soft Indigo):** Used for subtle secondary accents, labels, and decorative tech-patterns.
- **Neutral:** A crisp white background is paired with a very light grey (`surface-gray`) for card backgrounds to maintain a clean, breathable interface.

Color usage should prioritize high contrast ratios to ensure the platform is accessible to all developers and students.

### Dark Theme Hierarchy

This design system utilizes a **sophisticated light-on-dark** hierarchy. The palette is anchored by a deep navy primary color, which provides the "tech" foundation for the dark theme.

- **Primary (Deep Navy):** Used for navigation bars, primary headings, and high-impact structural components.
- **Secondary (Electric Cyan):** Used for primary actions, success states, and indicating progress.
- **Tertiary (Soft Indigo):** Used for subtle secondary accents, labels, and decorative tech-patterns.
- **Neutral:** Surfaces utilize deep shades of navy and charcoal (`surface-gray`) to maintain a clean, breathable interface that reduces eye strain for developers.

Color usage should prioritize high contrast ratios against dark backgrounds to ensure the platform remains accessible to all developers and students.

## Typography

The typography centers exclusively on **Montserrat** to project a modern, geometric, and tech-forward feel. The weights are used purposefully to create a clear information hierarchy:

- **Headlines:** Use Bold (700) or SemiBold (600) weights with slightly tighter letter spacing to create a compact, impactful appearance suitable for technical titles.
- **Body Text:** Uses Regular (400) weight with generous line height to ensure readability during long-form reading of technical documentation or event details.
- **Labels:** Utilize SemiBold (600) with increased letter spacing and uppercase styling for small metadata, ensuring these elements are distinct from body text.

On mobile devices, headlines should scale down slightly while maintaining their bold weight to preserve the "energetic" brand voice within limited horizontal space.

## Layout & Spacing

The design system employs a **fluid 8px soft-grid system**. All margins, paddings, and component heights should be multiples of 8px to maintain mathematical harmony and visual rhythm.

- **Mobile:** A 4-column fluid grid with 20px side margins. Elements should favor vertical stacking to accommodate the mobile-first nature of the club's community.
- **Tablet/Desktop:** A 12-column grid with a max-width of 1200px. Content should center-align with 40px margins.
- **Spacing Philosophy:** Use "Stack" spacing (vertical) to group related information. For example, a card's title and description are separated by `stack-sm`, while the card itself is separated from the next section by `stack-lg`.

## Elevation & Depth

### Light Theme
1.  **Base Layer:** The primary background is white (`#FFFFFF`).
2.  **Surface Layer:** Cards and secondary containers use a subtle off-white (`#F8FAFC`) with a 1px border of the same color or a very light indigo tint.
3.  **Elevation:** Depth is created using very soft, diffused shadows (Blur: 20px, Y: 4, Opacity: 4%) tinted with the primary deep navy. This makes components feel like they are floating slightly above the canvas rather than being heavily "stuck" to it.
4.  **Interactive States:** On hover or tap, elements should slightly increase their elevation or gain a subtle outer glow using the `electric-cyan` color to signify activity.

### Dark Theme
To maintain a minimalist aesthetic in a dark environment, this design system uses **Tonal Layering and Glassmorphic effects.**
1.  **Base Layer:** The primary background uses the deepest navy tones.
2.  **Surface Layer:** Cards and secondary containers use a slightly lighter container tone with a 1px border to define boundaries against the dark background.
3.  **Elevation:** Depth is created using very soft, diffused glows or semi-transparent backdrop blurs rather than traditional dark shadows. This makes components feel like they are floating in a digital space.
4.  **Interactive States:** On hover or tap, elements should slightly increase their brightness or gain a subtle outer glow using the `electric-cyan` color to signify activity.

## Shapes

The shape language is **friendly yet structured.** 

A consistent corner radius of **8px (Level 2: Rounded)** is applied to primary UI elements like buttons, input fields, and cards. This radius is large enough to feel modern and approachable but sharp enough to maintain the professional "tech" look. 

- **Small Components:** Tags and chips should use a higher roundedness (Pill-shaped) to distinguish them from actionable buttons.
- **Decorative Elements:** Use thin, 1px geometric lines and "plus" symbols at grid intersections to evoke a blueprint or "innovation" aesthetic.

## Components

- **Buttons:** Primary buttons are solid `deep-navy` (or high-contrast variant in dark mode) with white Montserrat Bold text. Secondary buttons use a `soft-indigo` background with `deep-navy` text. Action buttons (like "Join Now") use an `electric-cyan` fill for maximum energy.
- **Input Fields:** Clean backgrounds with 1px borders. On focus, the border transitions to `electric-cyan`. Labels sit above the field in Montserrat SemiBold.
- **Cards:** Use elevated surface backgrounds with 16px internal padding. Titles should be `headline-md`. Cards should have a subtle 8px radius.
- **Chips/Badges:** Small, pill-shaped elements with light `tertiary` backgrounds and deep navy text. Used for identifying skills (e.g., "Python", "UX Design").
- **Lists:** Clean rows separated by a 1px divider. Use chevron-right icons in `electric-cyan` to indicate navigability.
- **Innovation Progress Bar:** A custom component using a dark track and an `electric-cyan` to `soft-indigo` gradient fill to show project completion or member level-up.

---

## Technical Tokens (Material Theme Builder Export)

### Light Theme Colors
```yaml
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f4'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#45464d'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f0f1f1'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#006877'
  on-secondary: '#ffffff'
  secondary-container: '#75e7fe'
  on-secondary-container: '#006776'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#001354'
  on-tertiary-container: '#7180c4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#a4eeff'
  secondary-fixed-dim: '#62d6ed'
  on-secondary-fixed: '#001f25'
  on-secondary-fixed-variant: '#004e5a'
  tertiary-fixed: '#dde1ff'
  tertiary-fixed-dim: '#b8c4ff'
  on-tertiary-fixed: '#001354'
  on-tertiary-fixed-variant: '#334282'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
  deep-navy: '#0F172A'
  electric-cyan: '#17A2B8'
  soft-indigo: '#A5B4FC'
  surface-gray: '#F8FAFC'
  text-main: '#1E293B'
```

### Dark Theme Colors
```yaml
colors:
  surface: '#121414'
  surface-dim: '#121414'
  surface-bright: '#37393a'
  surface-container-lowest: '#0c0f0f'
  surface-container-low: '#1a1c1c'
  surface-container: '#1e2020'
  surface-container-high: '#282a2b'
  surface-container-highest: '#333535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#c6c6cd'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#2f3131'
  outline: '#909097'
  outline-variant: '#45464d'
  surface-tint: '#bec6e0'
  primary: '#bec6e0'
  on-primary: '#283044'
  primary-container: '#0f172a'
  on-primary-container: '#798098'
  inverse-primary: '#565e74'
  secondary: '#62d6ed'
  on-secondary: '#00363f'
  secondary-container: '#0c9fb5'
  on-secondary-container: '#002f36'
  tertiary: '#b8c4ff'
  on-tertiary: '#1a2b6a'
  tertiary-container: '#00104b'
  on-tertiary-container: '#6e7dc1'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#a4eeff'
  secondary-fixed-dim: '#62d6ed'
  on-secondary-fixed: '#001f25'
  on-secondary-fixed-variant: '#004e5a'
  tertiary-fixed: '#dde1ff'
  tertiary-fixed-dim: '#b8c4ff'
  on-tertiary-fixed: '#001354'
  on-tertiary-fixed-variant: '#334282'
  background: '#121414'
  on-background: '#e2e2e2'
  surface-variant: '#333535'
```

### Typography Tokens
```yaml
typography:
  headline-xl:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Montserrat
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  body-lg:
    fontFamily: Montserrat
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Montserrat
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Montserrat
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Montserrat
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Montserrat
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 14px
```

### Layout Tokens
```yaml
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-padding-mobile: 20px
  container-padding-desktop: 40px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
```
