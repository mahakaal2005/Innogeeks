package com.example.innogeeks.ui.theme

import androidx.compose.ui.graphics.Color

// Light Theme Tokens
val md_theme_light_primary = Color(0xFF000000)
val md_theme_light_onPrimary = Color(0xFFFFFFFF)
val md_theme_light_primaryContainer = Color(0xFF131B2E)
val md_theme_light_onPrimaryContainer = Color(0xFF7C839B)
val md_theme_light_secondary = Color(0xFF006877)
val md_theme_light_onSecondary = Color(0xFFFFFFFF)
val md_theme_light_secondaryContainer = Color(0xFF75E7FE)
val md_theme_light_onSecondaryContainer = Color(0xFF006776)
val md_theme_light_tertiary = Color(0xFF000000)
val md_theme_light_onTertiary = Color(0xFFFFFFFF)
val md_theme_light_tertiaryContainer = Color(0xFF001354)
val md_theme_light_onTertiaryContainer = Color(0xFF7180C4)
val md_theme_light_error = Color(0xFFBA1A1A)
val md_theme_light_errorContainer = Color(0xFFFFDAD6)
val md_theme_light_onError = Color(0xFFFFFFFF)
val md_theme_light_onErrorContainer = Color(0xFF93000A)
val md_theme_light_background = Color(0xFFF9F9F9)
val md_theme_light_onBackground = Color(0xFF1A1C1C)
val md_theme_light_surface = Color(0xFFF9F9F9)
val md_theme_light_onSurface = Color(0xFF1A1C1C)
val md_theme_light_surfaceVariant = Color(0xFFE2E2E2)
val md_theme_light_onSurfaceVariant = Color(0xFF45464D)
val md_theme_light_outline = Color(0xFF76777D)
val md_theme_light_inverseOnSurface = Color(0xFFF0F1F1)
val md_theme_light_inverseSurface = Color(0xFF2F3131)
val md_theme_light_inversePrimary = Color(0xFFBEC6E0)
val md_theme_light_surfaceTint = Color(0xFF565E74)
val md_theme_light_outlineVariant = Color(0xFFC6C6CD)
val md_theme_light_scrim = Color(0xFF000000)

// Dark Theme Tokens
val md_theme_dark_primary = Color(0xFFBEC6E0)
val md_theme_dark_onPrimary = Color(0xFF283044)
val md_theme_dark_primaryContainer = Color(0xFF0F172A)
val md_theme_dark_onPrimaryContainer = Color(0xFF798098)
val md_theme_dark_secondary = Color(0xFF62D6ED)
val md_theme_dark_onSecondary = Color(0xFF00363F)
val md_theme_dark_secondaryContainer = Color(0xFF0C9FB5)
val md_theme_dark_onSecondaryContainer = Color(0xFF002F36)
val md_theme_dark_tertiary = Color(0xFFB8C4FF)
val md_theme_dark_onTertiary = Color(0xFF1A2B6A)
val md_theme_dark_tertiaryContainer = Color(0xFF00104B)
val md_theme_dark_onTertiaryContainer = Color(0xFF6E7DC1)
val md_theme_dark_error = Color(0xFFFFB4AB)
val md_theme_dark_errorContainer = Color(0xFF93000A)
val md_theme_dark_onError = Color(0xFF690005)
val md_theme_dark_onErrorContainer = Color(0xFFFFDAD6)
val md_theme_dark_background = Color(0xFF121414)
val md_theme_dark_onBackground = Color(0xFFE2E2E2)
val md_theme_dark_surface = Color(0xFF121414)
val md_theme_dark_onSurface = Color(0xFFE2E2E2)
val md_theme_dark_surfaceVariant = Color(0xFF333535)
val md_theme_dark_onSurfaceVariant = Color(0xFFC6C6CD)
val md_theme_dark_outline = Color(0xFF909097)
val md_theme_dark_inverseOnSurface = Color(0xFF2F3131)
val md_theme_dark_inverseSurface = Color(0xFFE2E2E2)
val md_theme_dark_inversePrimary = Color(0xFF565E74)
val md_theme_dark_surfaceTint = Color(0xFFBEC6E0)
val md_theme_dark_outlineVariant = Color(0xFF45464D)
val md_theme_dark_scrim = Color(0xFF000000)

// Brand Core Accents
val DeepNavy = Color(0xFF0F172A)
val ElectricCyan = Color(0xFF17A2B8)
val SoftIndigo = Color(0xFFA5B4FC)
val SurfaceGray = Color(0xFFF8FAFC)

// Legacy Domain Accents (kept for backwards compatibility with dynamic cards)
val AccentGreen = Color(0xFF4ADE80)
val AccentBlue = Color(0xFF60A5FA)
val AccentPurple = Color(0xFFA78BFA)
val AccentOrange = Color(0xFFFB923C)
val AccentPink = Color(0xFFF472B6)

// Glass surfaces
val GlassFill = Color(0x12FFFFFF)       // ~7% white
val GlassFillStrong = Color(0x1AFFFFFF) // ~10% white
val GlassBorder = Color(0x26FFFFFF)     // ~15% white

fun domainColor(domain: String?): Color = when (domain) {
    "android" -> AccentGreen
    "web" -> AccentBlue
    "ml" -> AccentPurple
    "iot" -> AccentOrange
    "arvr" -> AccentPink
    else -> AccentBlue
}
