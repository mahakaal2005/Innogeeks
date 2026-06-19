package com.example.innogeeks.feature.splash

import androidx.compose.ui.tooling.preview.Preview
import com.example.innogeeks.ui.theme.InnogeeksTheme
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.innogeeks.R
import com.example.innogeeks.ui.theme.DeepNavy
import com.example.innogeeks.ui.theme.ElectricCyan
import kotlinx.coroutines.delay
import kotlin.time.Duration.Companion.milliseconds

/**
 * Animated splash screen.
 *
 * Animation timeline:
 *  0 ms  → logo starts scale-in (0.4 → 1.0) over 700 ms
 *  500 ms → "INNOGEEKS" fades in over 500 ms
 *  900 ms → tagline fades in over 400 ms
 *  1600 ms → bottom tagline "KIET Group of Institutions" fades in
 *  2400 ms → SplashViewModel emits destination, caller navigates away
 */
@Composable
fun SplashRoot(
    onNavigateToGuestHome: () -> Unit,
    onNavigateToHome: () -> Unit,
    vm: SplashViewModel = org.koin.androidx.compose.koinViewModel()
) {
    LaunchedEffect(Unit) {
        vm.events.collect { event ->
            when (event) {
                is SplashEvent.NavigateToGuestHome -> onNavigateToGuestHome()
                is SplashEvent.NavigateToHome -> onNavigateToHome()
            }
        }
    }
    SplashScreen()
}

@Composable
fun SplashScreen() {
    // Drive animation phases with a simple integer phase state
    var phase by remember { mutableIntStateOf(0) }

    LaunchedEffect(Unit) {
        delay(80.milliseconds);  phase = 1   // logo scale-in start
        delay(500.milliseconds); phase = 2   // wordmark fade-in
        delay(400.milliseconds); phase = 3   // tagline fade-in
        delay(700.milliseconds); phase = 4   // bottom line fade-in
    }

    // Logo: scale from 0.35 → 1.0
    val logoScale by animateFloatAsState(
        targetValue = if (phase >= 1) 1f else 0.35f,
        animationSpec = tween(durationMillis = 700, easing = FastOutSlowInEasing),
        label = "logoScale"
    )
    val logoAlpha by animateFloatAsState(
        targetValue = if (phase >= 1) 1f else 0f,
        animationSpec = tween(durationMillis = 600, easing = LinearEasing),
        label = "logoAlpha"
    )

    // Wordmark
    val wordmarkAlpha by animateFloatAsState(
        targetValue = if (phase >= 2) 1f else 0f,
        animationSpec = tween(durationMillis = 500, easing = LinearEasing),
        label = "wordmarkAlpha"
    )

    // Tagline
    val taglineAlpha by animateFloatAsState(
        targetValue = if (phase >= 3) 1f else 0f,
        animationSpec = tween(durationMillis = 500, easing = LinearEasing),
        label = "taglineAlpha"
    )

    // Bottom line
    val bottomAlpha by animateFloatAsState(
        targetValue = if (phase >= 4) 1f else 0f,
        animationSpec = tween(durationMillis = 400, easing = LinearEasing),
        label = "bottomAlpha"
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(
                        DeepNavy,
                        Color(0xFF0A1628),
                        Color(0xFF121414),
                    )
                )
            ),
        contentAlignment = Alignment.Center,
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {

            // ── Logo ──────────────────────────────────────────────────────
            Image(
                painter = painterResource(R.drawable.ic_innogeeks_logo),
                contentDescription = "Innogeeks Logo",
                modifier = Modifier
                    .size(108.dp)
                    .scale(logoScale)
                    .alpha(logoAlpha)
            )

            Spacer(Modifier.height(28.dp))

            // ── Club name ─────────────────────────────────────────────────
            Text(
                text = "INNOGEEKS",
                modifier = Modifier.alpha(wordmarkAlpha),
                style = MaterialTheme.typography.headlineLarge.copy(
                    fontSize = 34.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 6.sp,
                    color = Color.White
                ),
                textAlign = TextAlign.Center,
            )

            Spacer(Modifier.height(10.dp))

            // ── Tagline ───────────────────────────────────────────────────
            Text(
                text = "We Teach · We Learn · We Conquer",
                modifier = Modifier.alpha(taglineAlpha),
                style = MaterialTheme.typography.bodyMedium.copy(
                    color = ElectricCyan,
                    letterSpacing = 1.sp,
                ),
                textAlign = TextAlign.Center,
            )

            Spacer(Modifier.height(6.dp))

            // ── Institute ─────────────────────────────────────────────────
            Text(
                text = "KIET Group of Institutions",
                modifier = Modifier.alpha(bottomAlpha),
                style = MaterialTheme.typography.labelSmall.copy(
                    color = Color.White.copy(alpha = 0.45f),
                    letterSpacing = 0.5.sp,
                ),
                textAlign = TextAlign.Center,
            )
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun SplashScreenPreview() {
    InnogeeksTheme(darkTheme = true) {
        SplashScreen()
    }
}
