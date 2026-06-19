package com.example.innogeeks.feature.guest

import androidx.compose.ui.tooling.preview.Preview
import com.example.innogeeks.ui.theme.InnogeeksTheme
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.AccountCircle
import androidx.compose.material.icons.rounded.Backpack
import androidx.compose.material.icons.rounded.CalendarMonth
import androidx.compose.material.icons.rounded.Category
import androidx.compose.material.icons.rounded.CheckCircle
import androidx.compose.material.icons.rounded.EmojiEvents
import androidx.compose.material.icons.rounded.Home
import androidx.compose.material.icons.rounded.Notifications
import androidx.compose.material.icons.rounded.People
import androidx.compose.material.icons.rounded.RocketLaunch
import androidx.compose.material.icons.rounded.School
import androidx.compose.material.icons.rounded.Work
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.innogeeks.ui.theme.AccentBlue
import com.example.innogeeks.ui.theme.AccentGreen
import com.example.innogeeks.ui.theme.AccentOrange
import com.example.innogeeks.ui.theme.AccentPink
import com.example.innogeeks.ui.theme.AccentPurple
import com.example.innogeeks.ui.theme.ElectricCyan
import com.example.innogeeks.ui.theme.GlassBorder

// Exact background from preview
private val BgColor = Color(0xFF080B14)
private val CardBg = Color(0xFF0F1420)
private val CyanAccent = Color(0xFF00C8FF)
private val NavBg = Color(0xFF0D1117)

@Composable
fun GuestHomeScreen(onLoginTapped: () -> Unit) {
    var selectedTab by remember { mutableIntStateOf(0) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BgColor)
    ) {
        Column(modifier = Modifier.fillMaxSize()) {

            // ── Top Bar ───────────────────────────────────────────────────
            GuestTopBar(onProfileClick = onLoginTapped)

            // ── Content ───────────────────────────────────────────────────
            Box(modifier = Modifier.weight(1f).fillMaxWidth()) {
                when (selectedTab) {
                    0 -> GuestHomeFeed(onJoinTapped = onLoginTapped)
                    1 -> GuestDomainsTab()
                    2 -> GuestEventsTab()
                    3 -> GuestProfileTab(onLoginTapped)
                }
            }

            // ── Bottom Nav (unchanged) ─────────────────────────────────────
            GuestBottomNav(
                selected = selectedTab,
                onSelect = { selectedTab = it },
            )
        }
    }
}

// ──────────────────────────────────────────────────────────────────────────────
// Top Bar
// ──────────────────────────────────────────────────────────────────────────────
@Composable
private fun GuestTopBar(onProfileClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .windowInsetsPadding(WindowInsets.statusBars)
            .padding(horizontal = 20.dp, vertical = 16.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        // INNO (white) + GEEKS (cyan)
        Text(
            buildAnnotatedString {
                withStyle(SpanStyle(color = Color.White, fontWeight = FontWeight.Bold)) {
                    append("INNO")
                }
                withStyle(SpanStyle(color = CyanAccent, fontWeight = FontWeight.Bold)) {
                    append("GEEKS")
                }
            },
            style = MaterialTheme.typography.headlineSmall.copy(fontSize = 18.sp)
        )

        Row(verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = {}) {
                Icon(
                    Icons.Rounded.Notifications,
                    contentDescription = "Notifications",
                    tint = Color.White.copy(alpha = 0.6f),
                    modifier = Modifier.size(22.dp)
                )
            }
            Spacer(Modifier.width(4.dp))
            IconButton(onClick = onProfileClick) {
                Icon(
                    Icons.Rounded.AccountCircle,
                    contentDescription = "Profile",
                    tint = Color.White.copy(alpha = 0.6f),
                    modifier = Modifier.size(22.dp)
                )
            }
        }
    }
}

// ──────────────────────────────────────────────────────────────────────────────
// Bottom Nav — UNCHANGED design from before
// ──────────────────────────────────────────────────────────────────────────────
private data class NavItem(val label: String, val icon: ImageVector)
private val navItems = listOf(
    NavItem("Home", Icons.Rounded.Home),
    NavItem("Domains", Icons.Rounded.Category),
    NavItem("Events", Icons.Rounded.CalendarMonth),
    NavItem("Profile", Icons.Rounded.AccountCircle),
)

@Composable
private fun GuestBottomNav(
    selected: Int,
    onSelect: (Int) -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .windowInsetsPadding(WindowInsets.navigationBars)
            .padding(horizontal = 16.dp, vertical = 8.dp)
            .clip(RoundedCornerShape(20.dp))
            .background(NavBg.copy(alpha = 0.97f))
            .border(1.dp, GlassBorder, RoundedCornerShape(20.dp))
            .padding(vertical = 10.dp),
        horizontalArrangement = Arrangement.SpaceAround,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        navItems.forEachIndexed { index, item ->
            val isSelected = index == selected
            val iconAlpha by animateFloatAsState(
                targetValue = if (isSelected) 1f else 0.4f,
                animationSpec = tween(200),
                label = "navAlpha$index"
            )
            Column(
                modifier = Modifier
                    .clip(RoundedCornerShape(12.dp))
                    .clickable { onSelect(index) }
                    .padding(horizontal = 16.dp, vertical = 4.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Icon(
                    item.icon,
                    contentDescription = item.label,
                    tint = if (isSelected) CyanAccent else Color.White.copy(alpha = iconAlpha),
                    modifier = Modifier.size(22.dp)
                )
                Spacer(Modifier.height(2.dp))
                Text(
                    item.label,
                    style = MaterialTheme.typography.labelSmall.copy(
                        color = if (isSelected) CyanAccent else Color.White.copy(alpha = iconAlpha),
                        fontSize = 10.sp,
                    )
                )
            }
        }
    }
}

// ──────────────────────────────────────────────────────────────────────────────
// Home Feed Tab — matches preview exactly
// ──────────────────────────────────────────────────────────────────────────────
@Composable
private fun GuestHomeFeed(onJoinTapped: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp),
    ) {
        // ── Hero: text directly on background, no card ──────────────────
        Spacer(Modifier.height(8.dp))

        Text(
            text = "Build the",
            style = MaterialTheme.typography.headlineLarge.copy(
                color = Color.White,
                fontSize = 40.sp,
                fontWeight = FontWeight.Bold,
                lineHeight = 48.sp,
            )
        )
        Text(
            text = "Future.",
            style = MaterialTheme.typography.headlineLarge.copy(
                color = CyanAccent,
                fontSize = 40.sp,
                fontWeight = FontWeight.Bold,
                lineHeight = 48.sp,
            )
        )
        Spacer(Modifier.height(10.dp))
        Text(
            text = "Official Technical Club of KIET.",
            style = MaterialTheme.typography.bodyMedium.copy(
                color = Color.White.copy(alpha = 0.5f)
            )
        )

        Spacer(Modifier.height(20.dp))

        // ── Checklist ──────────────────────────────────────────────────
        val bullets = listOf(
            "Build Projects.",
            "Join Hackathons.",
            "Learn From Seniors.",
            "Launch Your Career.",
        )
        bullets.forEach { item ->
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(vertical = 5.dp)
            ) {
                Icon(
                    Icons.Rounded.CheckCircle,
                    contentDescription = null,
                    tint = CyanAccent,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(Modifier.width(10.dp))
                Text(
                    text = item,
                    style = MaterialTheme.typography.bodyMedium.copy(
                        color = Color.White,
                        fontWeight = FontWeight.Medium,
                    )
                )
            }
        }

        Spacer(Modifier.height(24.dp))

        // ── CTA: solid cyan pill button ─────────────────────────────────
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(50.dp))
                .background(CyanAccent)
                .clickable { onJoinTapped() }
                .padding(vertical = 16.dp),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                "Join Innogeeks",
                style = MaterialTheme.typography.labelLarge.copy(
                    color = Color(0xFF080B14),
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                )
            )
        }

        Spacer(Modifier.height(36.dp))

        // ── Stats 2×2 grid ─────────────────────────────────────────────
        SectionTitle("Club at a Glance")
        Spacer(Modifier.height(14.dp))
        StatsGrid()

        Spacer(Modifier.height(32.dp))

        // ── Why Join ───────────────────────────────────────────────────
        SectionTitle("Why Join Innogeeks")
        Spacer(Modifier.height(14.dp))
        WhyJoinList()

        Spacer(Modifier.height(32.dp))

        // ── Explore Domains ─────────────────────────────────────────────
        SectionTitle("Explore Domains")
        Spacer(Modifier.height(14.dp))
        DomainsHorizontal()

        Spacer(Modifier.height(32.dp))

        // ── Achievements ────────────────────────────────────────────────
        SectionTitle("Recent Achievements")
        Spacer(Modifier.height(14.dp))
        AchievementsSection()

        Spacer(Modifier.height(32.dp))
    }
}

@Composable
private fun SectionTitle(text: String) {
    Text(
        text = text,
        style = MaterialTheme.typography.headlineSmall.copy(
            color = Color.White,
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
        )
    )
}

@Composable
private fun StatsGrid() {
    val stats = listOf(
        Triple("100+", "Members", CyanAccent),
        Triple("20+", "Projects", AccentPurple),
        Triple("10+", "Events", AccentBlue),
        Triple("4", "Domains", AccentPink),
    )
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        stats.chunked(2).forEach { row ->
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                row.forEach { (value, label, color) ->
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(16.dp))
                            .background(CardBg)
                            .padding(vertical = 20.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                text = value,
                                style = MaterialTheme.typography.headlineLarge.copy(
                                    color = color,
                                    fontSize = 32.sp,
                                    fontWeight = FontWeight.Bold,
                                )
                            )
                            Spacer(Modifier.height(4.dp))
                            Text(
                                text = label,
                                style = MaterialTheme.typography.bodySmall.copy(
                                    color = Color.White.copy(alpha = 0.5f)
                                )
                            )
                        }
                    }
                }
                if (row.size == 1) Box(Modifier.weight(1f))
            }
        }
    }
}

@Composable
private fun WhyJoinList() {
    val items = listOf(
        Triple(Icons.Rounded.RocketLaunch, "Real Projects", "Build portfolio-worthy projects"),
        Triple(Icons.Rounded.EmojiEvents, "Hackathons", "Compete & win at national level"),
        Triple(Icons.Rounded.School, "Mentorship", "Learn directly from seniors"),
        Triple(Icons.Rounded.Work, "Career Growth", "Improve placements and internships"),
    )
    val colors = listOf(CyanAccent, AccentOrange, AccentPurple, AccentBlue)

    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        items.forEachIndexed { i, (icon, title, desc) ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(CardBg)
                    .padding(horizontal = 16.dp, vertical = 14.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .background(colors[i].copy(alpha = 0.12f), RoundedCornerShape(10.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(icon, contentDescription = null, tint = colors[i], modifier = Modifier.size(20.dp))
                }
                Spacer(Modifier.width(14.dp))
                Column {
                    Text(
                        title,
                        style = MaterialTheme.typography.bodyMedium.copy(
                            color = Color.White,
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 14.sp,
                        )
                    )
                    Spacer(Modifier.height(2.dp))
                    Text(
                        desc,
                        style = MaterialTheme.typography.bodySmall.copy(
                            color = Color.White.copy(alpha = 0.45f)
                        )
                    )
                }
            }
        }
    }
}

@Composable
private fun DomainsHorizontal() {
    val domains = listOf(
        listOf("Android", "Kotlin · Compose · Firebase", CyanAccent, "📱"),
        listOf("Web Dev", "React · Next.js · Node.js", AccentBlue, "🌐"),
        listOf("AI / ML", "Python · LLMs · Vision", AccentPurple, "🤖"),
        listOf("IoT", "ESP32 · Arduino · Embedded", AccentOrange, "🔌"),
        listOf("AR / VR", "Unity · ARCore · OpenXR", AccentPink, "🥽"),
    )
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .horizontalScroll(rememberScrollState()),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        domains.forEach { (name, stack, color, emoji) ->
            @Suppress("UNCHECKED_CAST")
            val c = color as Color
            Box(
                modifier = Modifier
                    .width(160.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(CardBg)
                    .padding(16.dp)
            ) {
                Column {
                    Text(emoji as String, fontSize = 28.sp)
                    Spacer(Modifier.height(12.dp))
                    Text(
                        name as String,
                        style = MaterialTheme.typography.bodyMedium.copy(
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                        )
                    )
                    Spacer(Modifier.height(4.dp))
                    Text(
                        stack as String,
                        style = MaterialTheme.typography.labelSmall.copy(
                            color = Color.White.copy(alpha = 0.45f),
                            fontSize = 10.sp,
                        )
                    )
                    Spacer(Modifier.height(12.dp))
                    Text(
                        "Learn more  ›",
                        style = MaterialTheme.typography.labelSmall.copy(
                            color = c,
                            fontWeight = FontWeight.SemiBold,
                        )
                    )
                }
            }
        }
    }
}

@Composable
private fun AchievementsSection() {
    val items = listOf(
        Triple("🏆", "Smart India Hackathon", "Winners 2024"),
        Triple("🚀", "Startup Founders", "2 Y-Combinator Alumni"),
        Triple("💼", "Top Internships", "Google · Microsoft · Amazon"),
    )
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        items.forEach { (emoji, title, sub) ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(CardBg)
                    .padding(horizontal = 16.dp, vertical = 14.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(emoji, fontSize = 24.sp)
                Spacer(Modifier.width(14.dp))
                Column {
                    Text(
                        title,
                        style = MaterialTheme.typography.bodyMedium.copy(
                            color = Color.White,
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 13.sp,
                        )
                    )
                    Text(
                        sub,
                        style = MaterialTheme.typography.bodySmall.copy(
                            color = Color.White.copy(alpha = 0.45f)
                        )
                    )
                }
            }
        }
    }
}

// ──────────────────────────────────────────────────────────────────────────────
// Domains Tab (full screen)
// ──────────────────────────────────────────────────────────────────────────────
@Composable
private fun GuestDomainsTab() {
    val domains = listOf(
        listOf("Android", "Kotlin · Compose · Firebase", CyanAccent, "📱"),
        listOf("Web Dev", "React · Next.js · Node.js", AccentBlue, "🌐"),
        listOf("AI / ML", "Python · LLMs · Computer Vision", AccentPurple, "🤖"),
        listOf("IoT", "ESP32 · Arduino · Embedded", AccentOrange, "🔌"),
        listOf("AR / VR", "Unity · ARCore · OpenXR", AccentPink, "🥽"),
    )
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp),
    ) {
        Spacer(Modifier.height(8.dp))
        SectionTitle("Explore Domains")
        Spacer(Modifier.height(4.dp))
        Text(
            "Pick a domain and start your journey",
            style = MaterialTheme.typography.bodySmall.copy(color = Color.White.copy(alpha = 0.45f))
        )
        Spacer(Modifier.height(20.dp))
        domains.forEach { (name, stack, color, emoji) ->
            @Suppress("UNCHECKED_CAST")
            val c = color as Color
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(CardBg)
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Box(
                    modifier = Modifier
                        .size(52.dp)
                        .background(c.copy(alpha = 0.12f), RoundedCornerShape(12.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Text(emoji as String, fontSize = 24.sp)
                }
                Spacer(Modifier.width(16.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        name as String,
                        style = MaterialTheme.typography.bodyMedium.copy(
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp,
                        )
                    )
                    Spacer(Modifier.height(3.dp))
                    Text(
                        stack as String,
                        style = MaterialTheme.typography.labelSmall.copy(color = c.copy(alpha = 0.85f))
                    )
                    Spacer(Modifier.height(6.dp))
                    Text(
                        "Learn more  ›",
                        style = MaterialTheme.typography.labelSmall.copy(
                            color = c,
                            fontWeight = FontWeight.SemiBold,
                        )
                    )
                }
            }
            Spacer(Modifier.height(10.dp))
        }
        Spacer(Modifier.height(24.dp))
    }
}

// ──────────────────────────────────────────────────────────────────────────────
// Events Tab
// ──────────────────────────────────────────────────────────────────────────────
@Composable
private fun GuestEventsTab() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 20.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Spacer(Modifier.height(8.dp))
        SectionTitle("Events")
        Spacer(Modifier.height(4.dp))
        Text(
            "Stay updated with what's happening",
            style = MaterialTheme.typography.bodySmall.copy(color = Color.White.copy(alpha = 0.45f))
        )
        Spacer(Modifier.height(40.dp))
        Text("📅", fontSize = 48.sp)
        Spacer(Modifier.height(16.dp))
        Text(
            "Events coming soon",
            style = MaterialTheme.typography.bodyMedium.copy(
                color = Color.White,
                fontWeight = FontWeight.SemiBold,
                textAlign = TextAlign.Center,
            )
        )
        Spacer(Modifier.height(6.dp))
        Text(
            "Follow us @innogeeks_kiet\nto stay updated",
            style = MaterialTheme.typography.bodySmall.copy(
                color = Color.White.copy(alpha = 0.4f),
                textAlign = TextAlign.Center,
            )
        )
    }
}

// ──────────────────────────────────────────────────────────────────────────────
// Profile Tab (Guest → premium lock screen with member teaser)
// ──────────────────────────────────────────────────────────────────────────────
@Composable
private fun GuestProfileTab(onLoginTapped: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp),
    ) {
        Spacer(Modifier.height(8.dp))
        SectionTitle("Profile")
        Spacer(Modifier.height(4.dp))
        Text(
            "Sign in to access your member dashboard",
            style = MaterialTheme.typography.bodySmall.copy(
                color = Color.White.copy(alpha = 0.45f)
            )
        )

        Spacer(Modifier.height(24.dp))

        // ── Avatar + identity area ─────────────────────────────────────
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(20.dp))
                .background(CardBg)
                .padding(24.dp),
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
                // Dimmed avatar with lock overlay
                Box(contentAlignment = Alignment.Center) {
                    Box(
                        modifier = Modifier
                            .size(72.dp)
                            .background(
                                Brush.radialGradient(
                                    listOf(CyanAccent.copy(alpha = 0.15f), Color.Transparent)
                                ),
                                CircleShape
                            )
                            .border(2.dp, CyanAccent.copy(alpha = 0.25f), CircleShape),
                        contentAlignment = Alignment.Center,
                    ) {
                        Icon(
                            Icons.Rounded.AccountCircle,
                            contentDescription = null,
                            tint = Color.White.copy(alpha = 0.2f),
                            modifier = Modifier.size(72.dp)
                        )
                    }
                    // Lock badge
                    Box(
                        modifier = Modifier
                            .align(Alignment.BottomEnd)
                            .size(22.dp)
                            .background(CyanAccent, CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("🔒", fontSize = 10.sp)
                    }
                }

                Spacer(Modifier.height(14.dp))
                Text(
                    text = "Member Name",
                    style = MaterialTheme.typography.headlineSmall.copy(
                        color = Color.White.copy(alpha = 0.2f),
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                    )
                )
                Spacer(Modifier.height(4.dp))
                // Domain pill placeholder
                Box(
                    modifier = Modifier
                        .background(CyanAccent.copy(alpha = 0.1f), RoundedCornerShape(50))
                        .padding(horizontal = 14.dp, vertical = 4.dp)
                ) {
                    Text(
                        "Domain · Year",
                        style = MaterialTheme.typography.labelSmall.copy(
                            color = Color.White.copy(alpha = 0.2f)
                        )
                    )
                }
            }
        }

        Spacer(Modifier.height(16.dp))

        // ── Locked stats row ──────────────────────────────────────────
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            val lockedStats = listOf(
                Triple("--", "Attendance", CyanAccent),
                Triple("--", "Events", AccentPurple),
                Triple("--", "Tasks", AccentBlue),
            )
            lockedStats.forEach { (val_, label, color) ->
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(14.dp))
                        .background(CardBg)
                        .padding(vertical = 16.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            val_,
                            style = MaterialTheme.typography.headlineMedium.copy(
                                color = color.copy(alpha = 0.25f),
                                fontSize = 22.sp,
                                fontWeight = FontWeight.Bold,
                            )
                        )
                        Spacer(Modifier.height(2.dp))
                        Text(
                            label,
                            style = MaterialTheme.typography.labelSmall.copy(
                                color = Color.White.copy(alpha = 0.3f)
                            )
                        )
                    }
                }
            }
        }

        Spacer(Modifier.height(24.dp))

        // ── What members get ─────────────────────────────────────────
        SectionTitle("What you unlock")
        Spacer(Modifier.height(12.dp))

        val perks = listOf(
            Triple(Icons.Rounded.CheckCircle, "Attendance Tracking", "Auto-marked via session codes"),
            Triple(Icons.Rounded.School, "Domain Resources", "Curated learning paths & materials"),
            Triple(Icons.Rounded.CalendarMonth, "Event Registration", "Register & track club events"),
            Triple(Icons.Rounded.EmojiEvents, "Hackathon Teams", "Find teammates, form squads"),
            Triple(Icons.Rounded.People, "Community Access", "Connect with 100+ Innogeeks"),
        )
        val perkColors = listOf(CyanAccent, AccentPurple, AccentBlue, AccentOrange, AccentPink)

        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            perks.forEachIndexed { i, (icon, title, desc) ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(14.dp))
                        .background(CardBg)
                        .padding(horizontal = 16.dp, vertical = 13.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .background(perkColors[i].copy(alpha = 0.12f), RoundedCornerShape(10.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(icon, contentDescription = null, tint = perkColors[i], modifier = Modifier.size(18.dp))
                    }
                    Spacer(Modifier.width(14.dp))
                    Column {
                        Text(
                            title,
                            style = MaterialTheme.typography.bodyMedium.copy(
                                color = Color.White,
                                fontWeight = FontWeight.SemiBold,
                                fontSize = 13.sp,
                            )
                        )
                        Text(
                            desc,
                            style = MaterialTheme.typography.bodySmall.copy(
                                color = Color.White.copy(alpha = 0.4f),
                                fontSize = 11.sp,
                            )
                        )
                    }
                }
            }
        }

        Spacer(Modifier.height(28.dp))

        // ── CTA ──────────────────────────────────────────────────────
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(50.dp))
                .background(CyanAccent)
                .clickable { onLoginTapped() }
                .padding(vertical = 16.dp),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                "Sign In as Member",
                style = MaterialTheme.typography.labelLarge.copy(
                    color = Color(0xFF080B14),
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                )
            )
        }

        Spacer(Modifier.height(12.dp))

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(50.dp))
                .background(CardBg)
                .padding(vertical = 16.dp),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                "Learn How to Join",
                style = MaterialTheme.typography.labelLarge.copy(
                    color = Color.White.copy(alpha = 0.5f)
                )
            )
        }

        Spacer(Modifier.height(32.dp))
    }
}

@Preview(showBackground = true)
@Composable
private fun GuestHomeScreenPreview() {
    InnogeeksTheme(darkTheme = true) {
        GuestHomeScreen(onLoginTapped = {})
    }
}

@Preview(showBackground = true)
@Composable
private fun GuestDomainsTabPreview() {
    InnogeeksTheme(darkTheme = true) {
        Box(modifier = Modifier.background(BgColor)) {
            GuestDomainsTab()
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun GuestEventsTabPreview() {
    InnogeeksTheme(darkTheme = true) {
        Box(modifier = Modifier.background(BgColor)) {
            GuestEventsTab()
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun GuestProfileTabPreview() {
    InnogeeksTheme(darkTheme = true) {
        Box(modifier = Modifier.background(BgColor)) {
            GuestProfileTab(onLoginTapped = {})
        }
    }
}
