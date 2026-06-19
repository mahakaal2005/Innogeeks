package com.example.innogeeks.feature.home

import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Person
import com.example.innogeeks.ui.theme.InnogeeksTheme
import com.example.innogeeks.core.datastore.Session
import androidx.compose.foundation.clickable
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.rounded.AccountCircle
import androidx.compose.material.icons.rounded.CalendarMonth
import androidx.compose.material.icons.rounded.Category
import androidx.compose.material.icons.rounded.Home
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.foundation.layout.Arrangement
import dev.chrisbanes.haze.HazeState
import dev.chrisbanes.haze.haze
import dev.chrisbanes.haze.hazeChild
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.innogeeks.ui.components.GlassCard
import com.example.innogeeks.ui.components.GradientBackground
import com.example.innogeeks.ui.components.Pill
import com.example.innogeeks.ui.components.PrimaryButton
import androidx.compose.material3.MaterialTheme
import com.example.innogeeks.ui.theme.domainColor

@Composable
fun HomeScreen(vm: HomeViewModel, onNavigateToAttendance: () -> Unit = {}) {
    val state by vm.state.collectAsStateWithLifecycle()
    var selectedTab by remember { mutableIntStateOf(0) }
    val hazeState = remember { HazeState() }

    val role = state.session?.role ?: "public"
    val currentNavItems = if (role == "coordinator" || role == "core_team") coordinatorNavItems else memberNavItems

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .haze(
                    state = hazeState,
                    backgroundColor = MaterialTheme.colorScheme.background
                )
        ) {
            Box(modifier = Modifier.weight(1f).fillMaxWidth()) {
                when (selectedTab) {
                    0 -> HomeScreenContent(
                            session = state.session,
                            onSignOut = vm::signOut,
                            onNavigateToAttendance = onNavigateToAttendance
                         )
                    1 -> {
                        if (role == "coordinator" || role == "core_team") {
                            com.example.innogeeks.feature.attendance.CoordinatorAttendanceScreen()
                        } else {
                            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text(currentNavItems[1].label + " Coming Soon", color = MaterialTheme.colorScheme.onBackground) }
                        }
                    }
                    2 -> {
                        if (role == "coordinator" || role == "core_team") {
                            com.example.innogeeks.feature.resources.CoordinatorResourcesScreen()
                        } else {
                            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text(currentNavItems[2].label + " Coming Soon", color = MaterialTheme.colorScheme.onBackground) }
                        }
                    }
                    3 -> {
                        if (role == "coordinator" || role == "core_team") {
                            com.example.innogeeks.feature.events.CoordinatorEventsScreen()
                        } else {
                            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text(currentNavItems[3].label + " Coming Soon", color = MaterialTheme.colorScheme.onBackground) }
                        }
                    }
                    4 -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text(currentNavItems[4].label + " Coming Soon", color = MaterialTheme.colorScheme.onBackground) }
                }
            }
        }

        Box(modifier = Modifier.align(Alignment.BottomCenter)) {
            HomeBottomNav(
                selected = selectedTab,
                navItems = currentNavItems,
                onSelect = { selectedTab = it },
                hazeState = hazeState
            )
        }
    }
}

private data class NavItem(val label: String, val icon: ImageVector)
private val memberNavItems = listOf(
    NavItem("Home", Icons.Rounded.Home),
    NavItem("Domains", Icons.Rounded.Category),
    NavItem("Events", Icons.Rounded.CalendarMonth),
    NavItem("Profile", Icons.Rounded.AccountCircle),
)

private val coordinatorNavItems = listOf(
    NavItem("Home", Icons.Rounded.Home),
    NavItem("Attendance", Icons.Default.DateRange),
    NavItem("Resources", Icons.Default.Settings),
    NavItem("Events", Icons.Rounded.CalendarMonth),
    NavItem("Profile", Icons.Rounded.AccountCircle),
)

@Composable
private fun HomeBottomNav(
    selected: Int,
    navItems: List<NavItem>,
    onSelect: (Int) -> Unit,
    hazeState: HazeState
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .windowInsetsPadding(WindowInsets.navigationBars)
            .padding(horizontal = 24.dp, vertical = 24.dp)
            .hazeChild(state = hazeState, shape = CircleShape)
            .border(1.dp, MaterialTheme.colorScheme.onBackground.copy(alpha = 0.1f), CircleShape)
            .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f), CircleShape)
            .padding(vertical = 12.dp),
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
                androidx.compose.material3.Icon(
                    item.icon,
                    contentDescription = item.label,
                    tint = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onBackground.copy(alpha = iconAlpha),
                    modifier = Modifier.size(22.dp)
                )
                Spacer(Modifier.height(2.dp))
                Text(
                    item.label,
                    style = MaterialTheme.typography.labelSmall.copy(
                        color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onBackground.copy(alpha = iconAlpha),
                        fontSize = 10.sp,
                    )
                )
            }
        }
    }
}

@Composable
fun HomeScreenContent(session: Session?, onSignOut: () -> Unit, onNavigateToAttendance: () -> Unit = {}) {
    val role = session?.role ?: "public"
    val domain = session?.domain

    GradientBackground {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp)
                .verticalScroll(rememberScrollState()),
        ) {
            Spacer(Modifier.height(28.dp))
            Text("Welcome back,", color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodyMedium)
            Text(
                session?.name ?: "Member",
                color = MaterialTheme.colorScheme.onBackground,
                style = MaterialTheme.typography.headlineLarge,
            )
            Spacer(Modifier.height(10.dp))
            Row {
                Pill(role.replace('_', ' ').uppercase(), domainColor(domain))
                if (domain != null) {
                    Spacer(Modifier.width(8.dp))
                    Pill(domain.uppercase(), domainColor(domain))
                }
            }

            Spacer(Modifier.height(24.dp))

            if (role == "coordinator" || role == "core_team") {
                CoordinatorDashboard(onNavigateToAttendance = onNavigateToAttendance)
            } else {
                MemberDashboard(onNavigateToAttendance = onNavigateToAttendance)
            }

            Spacer(Modifier.height(28.dp))
            PrimaryButton("Sign Out", onClick = onSignOut)
            Spacer(Modifier.height(140.dp))
        }
    }
}

@Composable
private fun MemberDashboard(onNavigateToAttendance: () -> Unit) {
    Column {
        FeatureCard("My Application", "Track your recruitment status")
        Spacer(Modifier.height(12.dp))
        FeatureCard("Attendance", "View your attendance summary", onClick = onNavigateToAttendance)
        Spacer(Modifier.height(12.dp))
        FeatureCard("Resources", "Browse domain learning resources")
        Spacer(Modifier.height(12.dp))
        FeatureCard("Events", "See upcoming club events")
    }
}

@Composable
private fun CoordinatorDashboard(onNavigateToAttendance: () -> Unit) {
    Column {
        // --- SECTION A: Session Progress ---
        Text("Domain Progress", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.onSurface)
        Spacer(Modifier.height(12.dp))
        GlassCard(Modifier.fillMaxWidth().clickable { onNavigateToAttendance() }) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                // Circular Progress
                Box(contentAlignment = Alignment.Center, modifier = Modifier.size(64.dp)) {
                    androidx.compose.material3.CircularProgressIndicator(
                        progress = { 0.8f },
                        color = com.example.innogeeks.ui.theme.ElectricCyan,
                        trackColor = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.1f),
                        strokeWidth = 6.dp,
                        modifier = Modifier.fillMaxSize()
                    )
                    Text("8/10", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.onSurface)
                }
                Spacer(Modifier.width(20.dp))
                Column {
                    Text("Sessions Completed", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.onSurface)
                    Text("2 more planned this semester", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Spacer(Modifier.height(8.dp))
                    Text("42 Active Members", style = MaterialTheme.typography.labelSmall, color = com.example.innogeeks.ui.theme.ElectricCyan)
                }
            }
        }

        Spacer(Modifier.height(28.dp))

        // --- SECTION B: Active Events ---
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.Bottom) {
            Text("Upcoming Events", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.onSurface)
            Text("View All", style = MaterialTheme.typography.labelSmall, color = com.example.innogeeks.ui.theme.ElectricCyan)
        }
        Spacer(Modifier.height(12.dp))
        
        // A single large featured event card for now
        GlassCard(Modifier.fillMaxWidth()) {
            Column {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(120.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.2f)),
                    contentAlignment = Alignment.Center
                ) {
                    Text("Event Banner", color = MaterialTheme.colorScheme.primary)
                }
                Spacer(Modifier.height(12.dp))
                Text("Hackathon 2026", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.onSurface)
                Spacer(Modifier.height(4.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    androidx.compose.material3.Icon(
                        Icons.Rounded.CalendarMonth,
                        contentDescription = null,
                        modifier = Modifier.size(14.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(Modifier.width(6.dp))
                    Text("Tomorrow, 10:00 AM • Main Auditorium", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }

        Spacer(Modifier.height(28.dp))

        // --- SECTION C: Recent Resources ---
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.Bottom) {
            Text("Recent Resources", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.onSurface)
            Text("View All", style = MaterialTheme.typography.labelSmall, color = com.example.innogeeks.ui.theme.ElectricCyan)
        }
        Spacer(Modifier.height(12.dp))
        
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            // Resource 1
            GlassCard(Modifier.fillMaxWidth()) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier.size(40.dp).background(MaterialTheme.colorScheme.primary.copy(alpha = 0.1f), RoundedCornerShape(8.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("📄", fontSize = 20.sp)
                    }
                    Spacer(Modifier.width(16.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Kotlin Coroutines Cheatsheet", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.onSurface)
                        Text("Added 2 hours ago", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
            // Resource 2
            GlassCard(Modifier.fillMaxWidth()) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier.size(40.dp).background(MaterialTheme.colorScheme.primary.copy(alpha = 0.1f), RoundedCornerShape(8.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("🔗", fontSize = 20.sp)
                    }
                    Spacer(Modifier.width(16.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Compose Navigation Setup", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.onSurface)
                        Text("Added yesterday", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun HomeScreenMemberPreview() {
    InnogeeksTheme(darkTheme = true) {
        HomeScreenContent(
            session = Session(
                accessToken = "token",
                refreshToken = "refresh",
                userId = "1",
                email = "user@example.com",
                name = "John Doe",
                role = "member",
                domain = "Android",
                year = 2
            ),
            onSignOut = {}
        )
    }
}

@Preview(showBackground = true)
@Composable
private fun HomeScreenCoreTeamPreview() {
    InnogeeksTheme(darkTheme = true) {
        HomeScreenContent(
            session = Session(
                accessToken = "token",
                refreshToken = "refresh",
                userId = "1",
                email = "core@example.com",
                name = "Jane Smith",
                role = "core_team",
                domain = "Web Dev",
                year = 3
            ),
            onSignOut = {}
        )
    }
}

@Composable
private fun FeatureCard(title: String, subtitle: String, onClick: () -> Unit = {}) {
    GlassCard(Modifier.fillMaxWidth().clickable { onClick() }) {
        Text(title, color = MaterialTheme.colorScheme.onSurface, style = MaterialTheme.typography.headlineSmall)
        Spacer(Modifier.height(4.dp))
        Text(subtitle, color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodySmall)
    }
}
