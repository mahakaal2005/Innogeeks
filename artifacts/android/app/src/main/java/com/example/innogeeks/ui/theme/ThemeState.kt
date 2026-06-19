package com.example.innogeeks.ui.theme

import androidx.compose.runtime.compositionLocalOf
import androidx.compose.runtime.staticCompositionLocalOf

/** True = dark mode is active (in-app toggle overrides system setting). */
val LocalDarkTheme = compositionLocalOf { false }

/** Call this lambda to flip the dark/light mode toggle. */
val LocalToggleTheme = staticCompositionLocalOf<() -> Unit> { {} }
