package com.example.innogeeks.feature.attendance

import androidx.compose.animation.AnimatedContent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material.icons.rounded.Check
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.innogeeks.ui.components.GlassCard
import com.example.innogeeks.ui.components.GradientBackground
import com.example.innogeeks.ui.theme.ElectricCyan
import com.example.innogeeks.ui.theme.InnogeeksTheme
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.windowInsetsPadding

import org.koin.androidx.compose.koinViewModel
import com.example.innogeeks.feature.attendance.presentation.CoordinatorAttendanceViewModel
import com.example.innogeeks.feature.attendance.presentation.AttendanceUiState
import com.example.innogeeks.feature.attendance.presentation.AttendanceAction
import com.example.innogeeks.feature.attendance.data.dto.AttendanceSession

@Composable
fun CoordinatorAttendanceScreen(
    viewModel: CoordinatorAttendanceViewModel = koinViewModel()
) {
    val state by viewModel.state.collectAsState()
    CoordinatorAttendanceScreenContent(
        state = state,
        onAction = viewModel::onAction
    )
}

@Composable
fun CoordinatorAttendanceScreenContent(
    state: AttendanceUiState = AttendanceUiState(),
    onAction: (AttendanceAction) -> Unit = {}
) {
    // We get domain from the user's login. For now, hardcoded to "android" if we don't have it passed in.
    val domain = ""  // ViewModel reads domain from user session

    // Load sessions when first opened
    LaunchedEffect(Unit) {
        onAction(AttendanceAction.LoadSessions(""))
    }

    GradientBackground {
        Column(modifier = Modifier.fillMaxSize()) {
            if (state.activeSessionId == null) {
                AttendanceHistoryView(
                    state = state,
                    onStartSession = { onAction(AttendanceAction.StartNewSession(domain, "Weekly Meeting")) },
                    onSessionClick = { session -> onAction(AttendanceAction.LoadRoster(session.id, session.title)) }
                )
            } else {
                ActiveSessionRosterView(
                    state = state,
                    onFinishSession = { onAction(AttendanceAction.SaveRoster) },
                    onToggleMember = { userId -> onAction(AttendanceAction.ToggleAttendance(userId)) }
                )
            }
        }
    }
}

@Composable
private fun AttendanceHistoryView(
    state: AttendanceUiState,
    onStartSession: () -> Unit,
    onSessionClick: (AttendanceSession) -> Unit
) {
    // Measure the system nav bar so we can add the right bottom padding
    val navBarInsets = WindowInsets.navigationBars
    val density = androidx.compose.ui.platform.LocalDensity.current
    val navBarBottomDp = with(density) { navBarInsets.getBottom(density).toDp() }
    // Floating pill nav is ~24dp margin + 12dp vertical padding + ~48dp icon row + navBar
    val bottomClearance = navBarBottomDp + 100.dp

    Column(modifier = Modifier.fillMaxSize().padding(horizontal = 20.dp)) {
        Spacer(Modifier.height(40.dp))
        Text("Attendance", style = MaterialTheme.typography.headlineLarge, color = MaterialTheme.colorScheme.onBackground)
        Text("Manage domain sessions", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
        
        if (state.error != null) {
            Spacer(Modifier.height(16.dp))
            Text("Error: ${state.error.asString()}", color = MaterialTheme.colorScheme.error)
        }

        Spacer(Modifier.height(24.dp))
        
        // Start Session Button
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .background(ElectricCyan.copy(alpha = 0.15f))
                .clickable { onStartSession() }
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .background(ElectricCyan, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Rounded.Add, contentDescription = null, tint = MaterialTheme.colorScheme.onPrimary)
                }
                Spacer(Modifier.height(12.dp))
                Text("Start New Session", style = MaterialTheme.typography.titleMedium, color = ElectricCyan)
            }
        }

        Spacer(Modifier.height(32.dp))
        Text("Past Sessions", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.onSurface)
        Spacer(Modifier.height(12.dp))

        if (state.isLoading && state.sessions.isEmpty()) {
            CircularProgressIndicator(modifier = Modifier.align(Alignment.CenterHorizontally), color = ElectricCyan)
        } else if (state.sessions.isEmpty()) {
            Text("No past sessions found.", color = MaterialTheme.colorScheme.onSurfaceVariant)
        } else {
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                // Last item clears the floating bottom nav completely
                contentPadding = PaddingValues(bottom = bottomClearance)
            ) {
                items(state.sessions.size) { index ->
                    val session = state.sessions[index]
                    GlassCard(Modifier.fillMaxWidth().clickable { onSessionClick(session) }) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(session.title, style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.onSurface)
                                Spacer(Modifier.height(4.dp))
                                Text(session.date, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                            Column(horizontalAlignment = Alignment.End) {
                                Text("${session.presentCount}/${session.totalCount}", style = MaterialTheme.typography.titleMedium, color = ElectricCyan)
                                Text("Present", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ActiveSessionRosterView(
    state: AttendanceUiState,
    onFinishSession: () -> Unit,
    onToggleMember: (String) -> Unit
) {
    // Pill nav breakdown: system navBar + 24dp outer margin + 12dp inner padding + ~48dp icons = ~84dp above navBar
    // Save button needs to sit above that, so use navigationBarsPadding() + 100dp fixed offset
    val density = androidx.compose.ui.platform.LocalDensity.current
    val navBarDp = with(density) { WindowInsets.navigationBars.getBottom(density).toDp() }
    // Button bottom = navBar + 100dp (clears the floating pill nav)
    val saveButtonBottom = navBarDp + 100.dp
    // Roster bottom padding = clear the button (56dp) + gap (16dp) + button's own bottom offset
    val rosterBottomPadding = saveButtonBottom + 72.dp

    Box(modifier = Modifier.fillMaxSize()) {
        Column(modifier = Modifier.fillMaxSize()) {
        // Sticky Header
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(MaterialTheme.colorScheme.surface)
                .padding(top = 40.dp, bottom = 16.dp, start = 20.dp, end = 20.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Session in Progress", style = MaterialTheme.typography.labelSmall, color = ElectricCyan)
                    Text(state.activeSessionTitle, style = MaterialTheme.typography.titleLarge, color = MaterialTheme.colorScheme.onSurface)
                }
                Box(
                    modifier = Modifier
                        .clip(CircleShape)
                        .background(ElectricCyan.copy(alpha = 0.2f))
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text("${state.presentUserIds.size}/${state.roster.size}", style = MaterialTheme.typography.titleMedium, color = ElectricCyan)
                }
            }
        }

        if (state.isLoading) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = ElectricCyan)
            }
            return
        }

        // Roster List — bottom padding clears the Save button + pill nav completely
        LazyColumn(
            modifier = Modifier.weight(1f).padding(horizontal = 20.dp),
            contentPadding = PaddingValues(top = 16.dp, bottom = rosterBottomPadding),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(state.roster.size) { index ->
                val member = state.roster[index]
                val isPresent = state.presentUserIds.contains(member.userId)

                GlassCard(
                    modifier = Modifier.fillMaxWidth().clickable {
                        onToggleMember(member.userId)
                    }
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(40.dp)
                                    .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.1f), CircleShape),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(member.name.firstOrNull()?.toString() ?: "?", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.primary)
                            }
                            Spacer(Modifier.width(16.dp))
                            Column {
                                Text(member.name, style = MaterialTheme.typography.bodyLarge, color = MaterialTheme.colorScheme.onSurface)
                                Text(member.rollNumber, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                        }

                        // Toggle
                        Box(
                            modifier = Modifier
                                .size(48.dp)
                                .clip(CircleShape)
                                .background(if (isPresent) ElectricCyan else MaterialTheme.colorScheme.surfaceVariant),
                            contentAlignment = Alignment.Center
                        ) {
                            if (isPresent) {
                                Icon(Icons.Rounded.Check, contentDescription = "Present", tint = MaterialTheme.colorScheme.onPrimary)
                            } else {
                                Icon(Icons.Rounded.Close, contentDescription = "Absent", tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.3f))
                            }
                        }
                    }
                }
            }
        }
        } // close inner Column

        // Floating Save button — sits ABOVE the pill nav, not behind it
        Box(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = saveButtonBottom)
                .padding(horizontal = 32.dp)
                .fillMaxWidth()
                .clip(RoundedCornerShape(50))
                .background(ElectricCyan)
                .clickable { onFinishSession() }
                .padding(vertical = 16.dp),
            contentAlignment = Alignment.Center
        ) {
            Text("Finish & Save Attendance", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.onPrimary)
        }
    } // close outer Box
}

@Preview(showBackground = true)
@Composable
private fun AttendancePreview() {
    InnogeeksTheme(darkTheme = true) {
        CoordinatorAttendanceScreenContent()
    }
}
