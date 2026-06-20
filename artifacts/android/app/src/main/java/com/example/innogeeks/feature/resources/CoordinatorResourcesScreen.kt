package com.example.innogeeks.feature.resources

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.innogeeks.ui.components.GlassCard
import com.example.innogeeks.ui.components.GradientBackground
import com.example.innogeeks.ui.theme.ElectricCyan
import com.example.innogeeks.ui.theme.InnogeeksTheme
import org.koin.androidx.compose.koinViewModel

@Composable
fun CoordinatorResourcesScreen(
    viewModel: CoordinatorResourcesViewModel = koinViewModel()
) {
    val categories = listOf("All", "Roadmaps", "Code Snippets", "Recordings", "Design Assets")
    var selectedCategory by remember { mutableStateOf("All") }
    var showAddDialog by remember { mutableStateOf(false) }

    val isUploading by viewModel.isUploading.collectAsState()
    val uploadedUrl by viewModel.uploadedResourceUrl.collectAsState()
    val resourcesList by viewModel.resources.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    var newTitle by remember { mutableStateOf("") }
    var uploadCategory by remember { mutableStateOf(categories[1]) }
    var isAddingLink by remember { mutableStateOf(false) }
    var manualLinkUrl by remember { mutableStateOf("") }

    val filePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri ->
        if (uri != null) {
            viewModel.uploadResource(uri)
        }
    }

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

            if (isLoading && resourcesList.isEmpty()) {
                Box(Modifier.fillMaxWidth().weight(1f), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = ElectricCyan)
                }
            } else {
                val filteredList = if (selectedCategory == "All") resourcesList else resourcesList.filter { it.category == selectedCategory }
                
                // Resources Feed
                LazyColumn(
                    modifier = Modifier.weight(1f).padding(horizontal = 20.dp),
                    contentPadding = PaddingValues(bottom = 160.dp), // Extra padding for bottom nav
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    items(filteredList) { resource ->
                        ResourceCard(
                            title = resource.title,
                            type = resource.resourceType,
                            tag = resource.category,
                            time = resource.createdAt.take(10), // Simplistic date formatting
                            imageUrl = if (resource.resourceType == "Image") resource.url else null
                        )
                    }
                }
            }
        }
        
        // FAB
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.BottomEnd) {
            Box(
                modifier = Modifier
                    .padding(bottom = 160.dp, end = 20.dp)
                    .size(64.dp)
                    .clip(CircleShape)
                    .background(ElectricCyan)
                    .clickable { showAddDialog = true },
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Rounded.Add, contentDescription = "Add Resource", tint = MaterialTheme.colorScheme.onPrimary, modifier = Modifier.size(32.dp))
            }
        }

        // Add Resource Dialog
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

                        OutlinedTextField(
                            value = newTitle,
                            onValueChange = { newTitle = it },
                            label = { Text("Resource Title") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true
                        )
                        Spacer(Modifier.height(16.dp))

                        Text("Category", style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Spacer(Modifier.height(8.dp))
                        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            items(categories.drop(1)) { cat ->
                                val isCatSelected = cat == uploadCategory
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(50))
                                        .background(if (isCatSelected) ElectricCyan else MaterialTheme.colorScheme.surface)
                                        .clickable { uploadCategory = cat }
                                        .padding(horizontal = 12.dp, vertical = 6.dp)
                                ) {
                                    Text(
                                        cat, 
                                        style = MaterialTheme.typography.bodySmall, 
                                        color = if (isCatSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface
                                    )
                                }
                            }
                        }
                        Spacer(Modifier.height(16.dp))

                        if (isAddingLink) {
                            OutlinedTextField(
                                value = manualLinkUrl,
                                onValueChange = { manualLinkUrl = it },
                                label = { Text("Resource Link (URL)") },
                                modifier = Modifier.fillMaxWidth(),
                                singleLine = true
                            )
                            Spacer(Modifier.height(8.dp))
                            Text(
                                "Cancel link", 
                                color = ElectricCyan, 
                                modifier = Modifier.clickable { isAddingLink = false; manualLinkUrl = "" }.padding(4.dp)
                            )
                        } else {
                            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(ElectricCyan.copy(alpha = 0.2f))
                                        .clickable {
                                            if (!isUploading) {
                                                filePickerLauncher.launch("*/*")
                                            }
                                        }
                                        .padding(16.dp), 
                                    contentAlignment = Alignment.Center
                                ) {
                                    if (isUploading) {
                                        CircularProgressIndicator(color = ElectricCyan, modifier = Modifier.size(24.dp))
                                    } else if (uploadedUrl != null) {
                                        Text("Uploaded!", color = ElectricCyan)
                                    } else {
                                        Text("Upload File", color = ElectricCyan)
                                    }
                                }
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(MaterialTheme.colorScheme.surface)
                                        .clickable { isAddingLink = true }
                                        .padding(16.dp), 
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text("Add Link", color = MaterialTheme.colorScheme.onSurface)
                                }
                            }
                        }
                        
                        Spacer(Modifier.height(24.dp))
                        Button(
                            onClick = {
                                val finalUrl = if (isAddingLink) manualLinkUrl else uploadedUrl
                                if (finalUrl != null && finalUrl.isNotBlank()) {
                                    val rType = if (finalUrl.contains(".pdf")) "pdf" else "link"
                                    viewModel.postResource(newTitle, rType, uploadCategory, finalUrl)
                                    showAddDialog = false
                                    newTitle = ""
                                    isAddingLink = false
                                    manualLinkUrl = ""
                                    viewModel.clearUploadState()
                                }
                            },
                            modifier = Modifier.fillMaxWidth(),
                            enabled = newTitle.isNotBlank() && (if (isAddingLink) manualLinkUrl.isNotBlank() else uploadedUrl != null),
                            colors = ButtonDefaults.buttonColors(containerColor = ElectricCyan, contentColor = MaterialTheme.colorScheme.onPrimary)
                        ) {
                            Text("Save Resource")
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ResourceCard(title: String, type: String, tag: String, time: String, imageUrl: String?) {
    val icon = when (type) {
        "pdf" -> Icons.Rounded.Description
        else -> Icons.Rounded.Image
    }
    val iconColor = when (type) {
        "pdf" -> com.example.innogeeks.ui.theme.AccentOrange
        else -> com.example.innogeeks.ui.theme.AccentPink
    }

    GlassCard(Modifier.fillMaxWidth().clickable { }) {
        Column {
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
            
            if (imageUrl != null && type != "pdf") {
                Spacer(Modifier.height(16.dp))
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(160.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(MaterialTheme.colorScheme.surface),
                    contentAlignment = Alignment.Center
                ) {
                    AsyncImage(
                        model = imageUrl,
                        contentDescription = "Resource Preview",
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )
                }
            }
        }
    }
}
