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

@Composable
fun CoordinatorAttendanceScreen() {
    // For UI demonstration, we toggle between "History" mode and "Active Session" mode
    var isSessionActive by remember { mutableStateOf(false) }

    GradientBackground {
        Column(modifier = Modifier.fillMaxSize()) {
            if (!isSessionActive) {
                AttendanceHistoryView(onStartSession = { isSessionActive = true })
            } else {
                ActiveSessionRosterView(onFinishSession = { isSessionActive = false })
            }
        }
    }
}

@Composable
private fun AttendanceHistoryView(onStartSession: () -> Unit) {
    Column(modifier = Modifier.fillMaxSize().padding(horizontal = 20.dp)) {
        Spacer(Modifier.height(40.dp))
        Text("Attendance", style = MaterialTheme.typography.headlineLarge, color = MaterialTheme.colorScheme.onBackground)
        Text("Manage domain sessions", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
        
        Spacer(Modifier.height(24.dp))
        
        // Huge Start Session Button
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

        LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(3) { index ->
                GlassCard(Modifier.fillMaxWidth()) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("Session ${3 - index}: Compose Basics", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.onSurface)
                            Spacer(Modifier.height(4.dp))
                            Text("Oct ${15 - index * 7}, 2026", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        Column(horizontalAlignment = Alignment.End) {
                            Text("34/40", style = MaterialTheme.typography.titleMedium, color = ElectricCyan)
                            Text("Present", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ActiveSessionRosterView(onFinishSession: () -> Unit) {
    // Mock domain roster
    val roster = remember { List(20) { "Member ${it + 1}" } }
    val presentMembers = remember { mutableStateMapOf<Int, Boolean>() }

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
                    Text("Intro to Navigation", style = MaterialTheme.typography.titleLarge, color = MaterialTheme.colorScheme.onSurface)
                }
                Box(
                    modifier = Modifier
                        .clip(CircleShape)
                        .background(ElectricCyan.copy(alpha = 0.2f))
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text("${presentMembers.size}/${roster.size}", style = MaterialTheme.typography.titleMedium, color = ElectricCyan)
                }
            }
        }

        // Roster List
        LazyColumn(
            modifier = Modifier.weight(1f).padding(horizontal = 20.dp),
            contentPadding = PaddingValues(vertical = 16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(roster.size) { index ->
                val name = roster[index]
                val isPresent = presentMembers[index] == true

                GlassCard(
                    modifier = Modifier.fillMaxWidth().clickable {
                        if (isPresent) presentMembers.remove(index) else presentMembers[index] = true
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
                                Text(name.first().toString(), style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.primary)
                            }
                            Spacer(Modifier.width(16.dp))
                            Text(name, style = MaterialTheme.typography.bodyLarge, color = MaterialTheme.colorScheme.onSurface)
                        }

                        // Big Thumb-friendly Toggle
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
            
            // Bottom padding so it doesn't get hidden behind bottom nav
            item { Spacer(Modifier.height(140.dp)) }
        }
    }
    
    // Floating Finish Button at bottom
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.BottomCenter) {
        Box(
            modifier = Modifier
                .padding(bottom = 120.dp)
                .fillMaxWidth(0.8f)
                .clip(RoundedCornerShape(50))
                .background(ElectricCyan)
                .clickable { onFinishSession() }
                .padding(vertical = 16.dp),
            contentAlignment = Alignment.Center
        ) {
            Text("Finish & Save Attendance", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.onPrimary)
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun AttendancePreview() {
    InnogeeksTheme(darkTheme = true) {
        CoordinatorAttendanceScreen()
    }
}
