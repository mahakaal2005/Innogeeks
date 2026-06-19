package com.example.innogeeks.ui.components

import android.annotation.SuppressLint
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Home
import androidx.compose.material.icons.rounded.Person
import androidx.compose.material.icons.rounded.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.LocalContentColor
import androidx.compose.material3.LocalTextStyle
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.RoundRect
import androidx.compose.ui.geometry.toRect
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.PathMeasure
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import dev.chrisbanes.haze.hazeChild

// ── Tab definitions ─────────────────────────────────────────────────────────

open class NavTab(
    val title: String,
    val icon: ImageVector,
    val color: Color,
) {
    data object Home : NavTab("Home", Icons.Rounded.Home, Color(0xFF60A5FA))
    data object Profile : NavTab("Profile", Icons.Rounded.Person, Color(0xFFA78BFA))
    data object Settings : NavTab("Settings", Icons.Rounded.Settings, Color(0xFF34D399))
}

val defaultNavTabs: List<NavTab> = listOf(NavTab.Home, NavTab.Profile, NavTab.Settings)

// ── Floating Nav Bar ──────────────────────────────────────────────────────────

/**
 * A floating, pill-shaped glassmorphic bottom navigation bar that visually blurs
 * the content underneath it. Inspired by sinasamaki.com/glassmorphic-bottom-navigation.
 *
 * Must be placed inside a [GradientBackground] so [LocalHazeState] is available.
 */
@Composable
fun FloatingNavBar(
    tabs: List<NavTab> = defaultNavTabs,
    selectedTabIndex: Int = 0,
    onTabSelected: (Int) -> Unit = {},
    @SuppressLint("ModifierParameter") modifier: Modifier = Modifier,
) {
    val isDark = isSystemInDarkTheme()

    // Dark tabs: vibrant light colours; light tabs: same vibrant but slightly deeper so they pop
    val glowAlpha       = if (isDark) 0.55f else 0.40f
    val frostTop        = if (isDark) Color.White.copy(alpha = 0.18f) else Color.White.copy(alpha = 0.70f)
    val frostBot        = if (isDark) Color.White.copy(alpha = 0.07f) else Color.White.copy(alpha = 0.45f)
    val borderTop       = if (isDark) Color.White.copy(alpha = 0.70f) else Color.White.copy(alpha = 0.95f)
    val borderBot       = if (isDark) Color.White.copy(alpha = 0.15f) else Color(0xFF3B5BDB).copy(alpha = 0.15f)
    val inactiveContent = if (isDark) Color.White.copy(alpha = 0.5f)  else Color(0xFF44464F).copy(alpha = 0.6f)

    // Animated values for glow position and color
    val animatedSelectedTabIndex by animateFloatAsState(
        targetValue = selectedTabIndex.toFloat(),
        label = "animatedSelectedTabIndex",
        animationSpec = spring(
            stiffness = Spring.StiffnessLow,
            dampingRatio = Spring.DampingRatioLowBouncy,
        ),
    )
    val animatedColor by animateColorAsState(
        targetValue = tabs[selectedTabIndex].color,
        label = "animatedColor",
        animationSpec = spring(stiffness = Spring.StiffnessLow),
    )

    Box(
        modifier = modifier
            .padding(horizontal = 32.dp)
            .fillMaxWidth()
            .height(64.dp)
            // ── Haze removed for compatibility ────────────────────────────────────
            // ── Frosted glass tint (visible on all API levels) ────────────────
            .background(
                brush = Brush.verticalGradient(colors = listOf(frostTop, frostBot)),
                shape = CircleShape,
            )
            // ── Light-reflection border ───────────────────────────────────────
            .border(
                width = 1.dp,
                brush = Brush.verticalGradient(colors = listOf(borderTop, borderBot)),
                shape = CircleShape,
            )
            .clip(CircleShape),
    ) {
        // ── Animated glow blob behind active tab ─────────────────────────────
        Canvas(
            modifier = Modifier
                .fillMaxSize()
                .clip(CircleShape)
                .blur(50.dp),
        ) {
            val tabWidth = size.width / tabs.size
            drawCircle(
                color = animatedColor.copy(alpha = glowAlpha),
                radius = size.height / 2,
                center = Offset(
                    x = tabWidth * animatedSelectedTabIndex + tabWidth / 2,
                    y = size.height / 2,
                ),
            )
        }

        // ── Bottom gleam (beam effect) ────────────────────────────────────────
        Canvas(
            modifier = Modifier
                .fillMaxSize()
                .clip(CircleShape),
        ) {
            val path = Path().apply {
                addRoundRect(RoundRect(size.toRect(), CornerRadius(size.height)))
            }
            val length = PathMeasure().apply { setPath(path, false) }.length
            val tabWidth = size.width / tabs.size

            drawPath(
                path = path,
                brush = Brush.horizontalGradient(
                    colors = listOf(
                        animatedColor.copy(alpha = 0f),
                        animatedColor.copy(alpha = 1f),
                        animatedColor.copy(alpha = 1f),
                        animatedColor.copy(alpha = 0f),
                    ),
                    startX = tabWidth * animatedSelectedTabIndex,
                    endX = tabWidth * (animatedSelectedTabIndex + 1),
                ),
                style = Stroke(
                    width = 6f,
                    cap = StrokeCap.Round,
                    pathEffect = PathEffect.dashPathEffect(
                        intervals = floatArrayOf(length / 2, length),
                    ),
                ),
            )
        }

        // ── Tab items ─────────────────────────────────────────────────────────
        CompositionLocalProvider(
            LocalTextStyle provides LocalTextStyle.current.copy(
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium,
            ),
            LocalContentColor provides Color.White,
        ) {
            Row(modifier = Modifier.fillMaxSize()) {
                tabs.forEachIndexed { index, tab ->
                    val isSelected = selectedTabIndex == index
                    val alpha by animateFloatAsState(
                        targetValue = if (isSelected) 1f else 0.38f,
                        label = "alpha",
                    )
                    val scale by animateFloatAsState(
                        targetValue = if (isSelected) 1f else 0.92f,
                        visibilityThreshold = 0.000001f,
                        animationSpec = spring(
                            stiffness = Spring.StiffnessLow,
                            dampingRatio = Spring.DampingRatioMediumBouncy,
                        ),
                        label = "scale",
                    )

                    Column(
                        modifier = Modifier
                            .scale(scale)
                            .alpha(alpha)
                            .fillMaxHeight()
                            .weight(1f)
                            .pointerInput(Unit) {
                                detectTapGestures { onTabSelected(index) }
                            },
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center,
                    ) {
                        Icon(
                            imageVector = tab.icon,
                            contentDescription = tab.title,
                            tint = if (isSelected) tab.color else inactiveContent,
                        )
                        Text(
                            text = tab.title,
                            color = if (isSelected) tab.color else inactiveContent,
                        )
                    }
                }
            }
        }
    }
}
