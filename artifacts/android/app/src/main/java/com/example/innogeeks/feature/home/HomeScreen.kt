package com.example.innogeeks.feature.home

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
import com.example.innogeeks.ui.theme.TextPrimary
import com.example.innogeeks.ui.theme.TextSecondary
import com.example.innogeeks.ui.theme.domainColor

@Composable
fun HomeScreen(vm: HomeViewModel) {
    val session by vm.session.collectAsStateWithLifecycle()
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
            Text("Welcome back,", color = TextSecondary, fontSize = 14.sp)
            Text(
                session?.name ?: "Member",
                color = TextPrimary,
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
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
            FeatureCard("Attendance", "View your attendance summary")
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
            PrimaryButton("Sign Out", onClick = vm::signOut)
            Spacer(Modifier.height(20.dp))
        }
    }
}

@Composable
private fun FeatureCard(title: String, subtitle: String) {
    GlassCard(Modifier.fillMaxWidth()) {
        Text(title, color = TextPrimary, fontSize = 18.sp, fontWeight = FontWeight.SemiBold)
        Spacer(Modifier.height(4.dp))
        Text(subtitle, color = TextSecondary, fontSize = 13.sp)
    }
}
