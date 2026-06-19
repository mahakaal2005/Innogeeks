package com.example.innogeeks.feature.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.ChevronRight
import androidx.compose.material.icons.rounded.Email
import androidx.compose.material.icons.rounded.Logout
import androidx.compose.material.icons.rounded.School
import androidx.compose.material.icons.rounded.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.innogeeks.core.datastore.Session
import com.example.innogeeks.ui.components.GlassCard
import com.example.innogeeks.ui.components.GradientBackground
import com.example.innogeeks.ui.components.Pill
import com.example.innogeeks.ui.theme.AccentOrange
import com.example.innogeeks.ui.theme.ElectricCyan
import com.example.innogeeks.ui.theme.InnogeeksTheme
import com.example.innogeeks.ui.theme.domainColor

@Composable
fun ProfileScreen(
    session: Session?,
    onSignOut: () -> Unit
) {
    val name = session?.name ?: "Guest User"
    val initial = name.firstOrNull()?.toString() ?: "?"
    val role = session?.role ?: "guest"
    val domain = session?.domain
    
    GradientBackground {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp)
        ) {
            Spacer(Modifier.height(60.dp))
            
            // Hero Section: Avatar & Name
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Box(
                    modifier = Modifier
                        .size(100.dp)
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.2f)),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = initial,
                        style = MaterialTheme.typography.displayMedium,
                        color = MaterialTheme.colorScheme.primary,
                        fontWeight = FontWeight.Bold
                    )
                }
                
                Spacer(Modifier.height(16.dp))
                
                Text(
                    text = name,
                    style = MaterialTheme.typography.headlineMedium,
                    color = MaterialTheme.colorScheme.onBackground
                )
                
                Spacer(Modifier.height(8.dp))
                
                Row(horizontalArrangement = Arrangement.Center) {
                    Pill(text = role.replace('_', ' ').uppercase(), color = ElectricCyan)
                    if (domain != null) {
                        Spacer(Modifier.width(8.dp))
                        Pill(text = domain.uppercase(), color = domainColor(domain))
                    }
                }
            }

            Spacer(Modifier.height(32.dp))

            // Details Section
            Text("Personal Info", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.onSurface)
            Spacer(Modifier.height(12.dp))
            
            GlassCard(Modifier.fillMaxWidth()) {
                Column {
                    ProfileDetailRow(
                        icon = Icons.Rounded.Email,
                        label = "Email Address",
                        value = session?.email ?: "Not available"
                    )
                    HorizontalDivider(
                        modifier = Modifier.padding(vertical = 12.dp),
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.1f)
                    )
                    ProfileDetailRow(
                        icon = Icons.Rounded.School,
                        label = "Year of Study",
                        value = session?.year?.let { "Year $it" } ?: "Not available"
                    )
                }
            }

            Spacer(Modifier.height(24.dp))

            // Settings & Preferences
            Text("Preferences", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.onSurface)
            Spacer(Modifier.height(12.dp))
            
            GlassCard(Modifier.fillMaxWidth()) {
                Column {
                    val toggleTheme = com.example.innogeeks.ui.theme.LocalToggleTheme.current
                    val isDark = com.example.innogeeks.ui.theme.LocalDarkTheme.current

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(40.dp)
                                    .background(ElectricCyan.copy(alpha = 0.1f), RoundedCornerShape(8.dp)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    if (isDark) "🌙" else "☀️",
                                    fontSize = 18.sp
                                )
                            }
                            Spacer(Modifier.width(16.dp))
                            Text("Dark Mode", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.onSurface)
                        }
                        Switch(
                            checked = isDark,
                            onCheckedChange = { toggleTheme() },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = MaterialTheme.colorScheme.surface,
                                checkedTrackColor = ElectricCyan
                            )
                        )
                    }
                }
            }

            Spacer(Modifier.height(32.dp))

            // Sign Out Button
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(AccentOrange.copy(alpha = 0.15f))
                    .clickable { onSignOut() }
                    .padding(vertical = 16.dp),
                contentAlignment = Alignment.Center
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Rounded.Logout, contentDescription = null, tint = AccentOrange)
                    Spacer(Modifier.width(8.dp))
                    Text("Sign Out", style = MaterialTheme.typography.titleMedium, color = AccentOrange)
                }
            }

            // Extra padding for bottom nav
            Spacer(Modifier.height(160.dp))
        }
    }
}

@Composable
private fun ProfileDetailRow(icon: ImageVector, label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(40.dp)
                .background(MaterialTheme.colorScheme.surfaceVariant, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.size(20.dp))
        }
        Spacer(Modifier.width(16.dp))
        Column {
            Text(label, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text(value, style = MaterialTheme.typography.bodyLarge, color = MaterialTheme.colorScheme.onSurface)
        }
    }
}

@Composable
private fun ProfileSettingRow(icon: ImageVector, label: String, onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .background(ElectricCyan.copy(alpha = 0.1f), RoundedCornerShape(8.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, contentDescription = null, tint = ElectricCyan, modifier = Modifier.size(20.dp))
            }
            Spacer(Modifier.width(16.dp))
            Text(label, style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.onSurface)
        }
        Icon(Icons.Rounded.ChevronRight, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

@Preview(showBackground = true)
@Composable
private fun ProfilePreview() {
    InnogeeksTheme(darkTheme = true) {
        ProfileScreen(
            session = Session(
                accessToken = "token",
                refreshToken = "refresh",
                userId = "1",
                email = "atul@example.com",
                name = "Atul Kumar",
                role = "coordinator",
                domain = "Android",
                year = 3
            ),
            onSignOut = {}
        )
    }
}
