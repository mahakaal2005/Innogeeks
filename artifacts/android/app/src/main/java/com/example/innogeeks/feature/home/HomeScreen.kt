package com.example.innogeeks.feature.home

import androidx.compose.ui.tooling.preview.Preview
import com.example.innogeeks.ui.theme.InnogeeksTheme
import com.example.innogeeks.core.datastore.Session
import androidx.compose.foundation.clickable
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
    HomeScreenContent(
        session = state.session,
        onSignOut = vm::signOut,
        onNavigateToAttendance = onNavigateToAttendance
    )
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
            FeatureCard("My Application", "Track your recruitment status")
            Spacer(Modifier.height(12.dp))
            FeatureCard("Attendance", "View your attendance summary", onClick = onNavigateToAttendance)
            Spacer(Modifier.height(12.dp))
            FeatureCard("Resources", "Browse domain learning resources")
            Spacer(Modifier.height(12.dp))
            FeatureCard("Events", "See upcoming club events")

            if (role == "coordinator" || role == "core_team") {
                Spacer(Modifier.height(12.dp))
                FeatureCard("Coordinator Tools", "Sessions, approvals & resources")
            }
            if (role == "core_team") {
                Spacer(Modifier.height(12.dp))
                FeatureCard("Admin", "Roles, recruitment window & all data")
            }

            Spacer(Modifier.height(28.dp))
            PrimaryButton("Sign Out", onClick = onSignOut)
            Spacer(Modifier.height(20.dp))
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
