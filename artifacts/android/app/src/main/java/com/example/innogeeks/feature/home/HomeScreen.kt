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
                    1 -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("Domains/Projects Coming Soon", color = MaterialTheme.colorScheme.onBackground) }
                    2 -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("Events Coming Soon", color = MaterialTheme.colorScheme.onBackground) }
                    3 -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("Profile Coming Soon", color = MaterialTheme.colorScheme.onBackground) }
                }
            }
        }

        Box(modifier = Modifier.align(Alignment.BottomCenter)) {
            HomeBottomNav(
                selected = selectedTab,
                onSelect = { selectedTab = it },
                hazeState = hazeState
            )
        }
    }
}

private data class NavItem(val label: String, val icon: ImageVector)
private val navItems = listOf(
    NavItem("Home", Icons.Rounded.Home),
    NavItem("Domains", Icons.Rounded.Category),
    NavItem("Events", Icons.Rounded.CalendarMonth),
    NavItem("Profile", Icons.Rounded.AccountCircle),
)

@Composable
private fun HomeBottomNav(
    selected: Int,
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
        Text("Coordinator Overview", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.onSurface)
        Spacer(Modifier.height(12.dp))
        Row(horizontalArrangement = androidx.compose.foundation.layout.Arrangement.spacedBy(12.dp)) {
            GlassCard(Modifier.weight(1f).clickable { onNavigateToAttendance() }) {
                Column {
                    androidx.compose.material3.Icon(
                        Icons.Default.DateRange,
                        contentDescription = null,
                        tint = com.example.innogeeks.ui.theme.ElectricCyan
                    )
                    Spacer(Modifier.height(8.dp))
                    Text("Attendance", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.onSurface)
                    Text("Log & View", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
            GlassCard(Modifier.weight(1f)) {
                Column {
                    androidx.compose.material3.Icon(
                        Icons.Default.Settings,
                        contentDescription = null,
                        tint = com.example.innogeeks.ui.theme.ElectricCyan
                    )
                    Spacer(Modifier.height(8.dp))
                    Text("Resources", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.onSurface)
                    Text("Manage content", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }
        Spacer(Modifier.height(12.dp))
        Row(horizontalArrangement = androidx.compose.foundation.layout.Arrangement.spacedBy(12.dp)) {
            GlassCard(Modifier.weight(1f)) {
                Column {
                    androidx.compose.material3.Icon(
                        Icons.Default.Star,
                        contentDescription = null,
                        tint = com.example.innogeeks.ui.theme.ElectricCyan
                    )
                    Spacer(Modifier.height(8.dp))
                    Text("Events", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.onSurface)
                    Text("Plan upcoming", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
            GlassCard(Modifier.weight(1f)) {
                Column {
                    androidx.compose.material3.Icon(
                        Icons.Default.Person,
                        contentDescription = null,
                        tint = com.example.innogeeks.ui.theme.ElectricCyan
                    )
                    Spacer(Modifier.height(8.dp))
                    Text("Members", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.onSurface)
                    Text("Review apps", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }

        Spacer(Modifier.height(24.dp))
        Text("Domain Analytics", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.onSurface)
        Spacer(Modifier.height(12.dp))
        GlassCard(Modifier.fillMaxWidth()) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = androidx.compose.foundation.layout.Arrangement.SpaceBetween) {
                Column {
                    Text("Total Members", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text("42", style = MaterialTheme.typography.headlineMedium, color = com.example.innogeeks.ui.theme.ElectricCyan)
                }
                Column(horizontalAlignment = androidx.compose.ui.Alignment.End) {
                    Text("Sessions Held", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text("8", style = MaterialTheme.typography.headlineMedium, color = com.example.innogeeks.ui.theme.ElectricCyan)
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
