package com.example.innogeeks.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val InnogeeksColorScheme = darkColorScheme(
    primary = AccentBlue,
    onPrimary = Color.White,
    secondary = AccentPurple,
    onSecondary = Color.White,
    tertiary = AccentPink,
    onTertiary = Color.White,
    background = BgBase,
    onBackground = TextPrimary,
    surface = BgMid,
    onSurface = TextPrimary,
    error = AccentRed,
    onError = Color.White,
)

/** Dark-first glassmorphism theme. Dark theme is enforced (brand is dark-first). */
@Composable
fun InnogeeksTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = InnogeeksColorScheme,
        typography = Typography,
        content = content,
    )
}
