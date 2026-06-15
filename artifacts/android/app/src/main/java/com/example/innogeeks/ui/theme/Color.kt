package com.example.innogeeks.ui.theme

import androidx.compose.ui.graphics.Color

// Background gradient
val BgBase = Color(0xFF0A0A1A)
val BgMid = Color(0xFF0F0F2E)
val BgEnd = Color(0xFF1A0A2E)

// Glass surfaces
val GlassFill = Color(0x12FFFFFF)       // ~7% white
val GlassFillStrong = Color(0x1AFFFFFF) // ~10% white
val GlassBorder = Color(0x26FFFFFF)     // ~15% white

// Text
val TextPrimary = Color(0xF2FFFFFF)
val TextSecondary = Color(0xA6FFFFFF)
val TextMuted = Color(0x66FFFFFF)

// Domain accents
val AccentGreen = Color(0xFF4ADE80)   // android
val AccentBlue = Color(0xFF60A5FA)    // web
val AccentPurple = Color(0xFFA78BFA)  // ml
val AccentOrange = Color(0xFFFB923C)  // iot
val AccentPink = Color(0xFFF472B6)    // arvr

// Status
val AccentAmber = Color(0xFFFBBF24)
val AccentRed = Color(0xFFF87171)

fun domainColor(domain: String?): Color = when (domain) {
    "android" -> AccentGreen
    "web" -> AccentBlue
    "ml" -> AccentPurple
    "iot" -> AccentOrange
    "arvr" -> AccentPink
    else -> AccentBlue
}
