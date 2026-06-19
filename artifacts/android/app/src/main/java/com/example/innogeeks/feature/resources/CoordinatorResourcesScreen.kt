package com.example.innogeeks.feature.resources

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material.icons.rounded.Description
import androidx.compose.material.icons.rounded.Image
import androidx.compose.material.icons.rounded.Link
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.innogeeks.ui.components.GlassCard
import com.example.innogeeks.ui.components.GradientBackground
import com.example.innogeeks.ui.theme.ElectricCyan
import com.example.innogeeks.ui.theme.InnogeeksTheme

@Composable
fun CoordinatorResourcesScreen() {
    val categories = listOf("All", "Roadmaps", "Code Snippets", "Recordings", "Design Assets")
    var selectedCategory by remember { mutableStateOf("All") }
    var showAddDialog by remember { mutableStateOf(false) }

    GradientBackground {
        Column(modifier = Modifier.fillMaxSize()) {
            Spacer(Modifier.height(40.dp))
            
            // Header
            Column(modifier = Modifier.padding(horizontal = 20.dp)) {
                Text("Resources", style = MaterialTheme.typography.headlineLarge, color = MaterialTheme.colorScheme.onBackground)
                Text("Manage domain study material", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            
            Spacer(Modifier.height(24.dp))

            // Categories Row
            LazyRow(
                contentPadding = PaddingValues(horizontal = 20.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(categories.size) { index ->
                    val cat = categories[index]
                    val isSelected = cat == selectedCategory
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(50))
                            .background(if (isSelected) ElectricCyan else MaterialTheme.colorScheme.surface)
                            .clickable { selectedCategory = cat }
                            .padding(horizontal = 16.dp, vertical = 8.dp)
                    ) {
                        Text(
                            cat, 
                            style = MaterialTheme.typography.bodyMedium, 
                            color = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }

            Spacer(Modifier.height(16.dp))

            // Resources Feed
            LazyColumn(
                modifier = Modifier.weight(1f).padding(horizontal = 20.dp),
                contentPadding = PaddingValues(bottom = 160.dp), // Extra padding for bottom nav
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Mock Image Upload from Cloudinary
                item {
                    ResourceCard(
                        title = "Android Compose UI Cheat Sheet",
                        type = "Image",
                        tag = "Code Snippets",
                        time = "2 hours ago"
                    )
                }

                // Mock Link
                item {
                    ResourceCard(
                        title = "Ktor Client Setup Guide",
                        type = "Link",
                        tag = "Roadmaps",
                        time = "Yesterday"
                    )
                }

                // Mock PDF Upload
                item {
                    ResourceCard(
                        title = "MVVM Architecture Overview.pdf",
                        type = "PDF",
                        tag = "Roadmaps",
                        time = "Oct 12, 2026"
                    )
                }
            }
        }
        
        // FAB
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.BottomEnd) {
            Box(
                modifier = Modifier
                    .padding(bottom = 120.dp, end = 20.dp)
                    .size(64.dp)
                    .clip(CircleShape)
                    .background(ElectricCyan)
                    .clickable { showAddDialog = true },
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Rounded.Add, contentDescription = "Add Resource", tint = MaterialTheme.colorScheme.onPrimary, modifier = Modifier.size(32.dp))
            }
        }

        // Add Resource Mock Dialog
        if (showAddDialog) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(MaterialTheme.colorScheme.background.copy(alpha = 0.8f))
                    .clickable { showAddDialog = false },
                contentAlignment = Alignment.Center
            ) {
                GlassCard(Modifier.fillMaxWidth(0.9f).clickable(enabled = false) {}) {
                    Column(Modifier.fillMaxWidth()) {
                        Text("Add New Resource", style = MaterialTheme.typography.titleLarge, color = MaterialTheme.colorScheme.onSurface)
                        Spacer(Modifier.height(16.dp))
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            Box(modifier = Modifier.weight(1f).clip(RoundedCornerShape(8.dp)).background(ElectricCyan.copy(alpha = 0.2f)).padding(16.dp), contentAlignment = Alignment.Center) {
                                Text("Upload File", color = ElectricCyan)
                            }
                            Box(modifier = Modifier.weight(1f).clip(RoundedCornerShape(8.dp)).background(MaterialTheme.colorScheme.surface).padding(16.dp), contentAlignment = Alignment.Center) {
                                Text("Add Link", color = MaterialTheme.colorScheme.onSurface)
                            }
                        }
                        Spacer(Modifier.height(16.dp))
                        Text("This will instantly sync with Cloudinary if a file is uploaded.", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
        }
    }
}

@Composable
private fun ResourceCard(title: String, type: String, tag: String, time: String) {
    val icon = when (type) {
        "Image" -> Icons.Rounded.Image
        "PDF" -> Icons.Rounded.Description
        else -> Icons.Rounded.Link
    }
    val iconColor = when (type) {
        "Image" -> com.example.innogeeks.ui.theme.AccentPink
        "PDF" -> com.example.innogeeks.ui.theme.AccentOrange
        else -> com.example.innogeeks.ui.theme.ElectricCyan
    }

    GlassCard(Modifier.fillMaxWidth().clickable { }) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            // Icon container
            Box(
                modifier = Modifier
                    .size(56.dp)
                    .background(iconColor.copy(alpha = 0.1f), RoundedCornerShape(12.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, contentDescription = null, tint = iconColor, modifier = Modifier.size(28.dp))
            }
            
            Spacer(Modifier.width(16.dp))
            
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    title,
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onSurface,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Spacer(Modifier.height(4.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(modifier = Modifier.background(MaterialTheme.colorScheme.surfaceVariant, RoundedCornerShape(4.dp)).padding(horizontal = 6.dp, vertical = 2.dp)) {
                        Text(tag, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurface)
                    }
                    Spacer(Modifier.width(8.dp))
                    Text("• $time", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }
        
        // Show mock thumbnail if it's an image
        if (type == "Image") {
            Spacer(Modifier.height(16.dp))
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(160.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(MaterialTheme.colorScheme.surface),
                contentAlignment = Alignment.Center
            ) {
                Text("Cloudinary Image Preview", color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun ResourcesPreview() {
    InnogeeksTheme(darkTheme = true) {
        CoordinatorResourcesScreen()
    }
}
