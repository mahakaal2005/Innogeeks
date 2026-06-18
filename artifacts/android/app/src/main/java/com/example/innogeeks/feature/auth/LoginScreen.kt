package com.example.innogeeks.feature.auth

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.ArrowBack
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.innogeeks.ui.components.GlassCard
import com.example.innogeeks.ui.components.GlassTextField
import com.example.innogeeks.ui.components.GradientBackground
import com.example.innogeeks.ui.components.PrimaryButton

@Composable
fun LoginScreen(vm: AuthViewModel, onBack: () -> Unit = {}) {
    val state by vm.state.collectAsStateWithLifecycle()

    GradientBackground {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            // Back row
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Icon(
                    imageVector = Icons.Rounded.ArrowBack,
                    contentDescription = "Back",
                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier
                        .padding(bottom = 4.dp)
                        .clickable { onBack() }
                )
            }
            Spacer(Modifier.height(24.dp))
            Text(
                "Club Innogeeks",
                style = MaterialTheme.typography.headlineLarge,
                color = MaterialTheme.colorScheme.onBackground
            )
            Spacer(Modifier.height(8.dp))
            Text(
                "Sign in to continue",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(Modifier.height(28.dp))

            GlassCard(Modifier.fillMaxWidth()) {
                GlassTextField(
                    value = state.email,
                    onValueChange = vm::onEmailChange,
                    label = "Email",
                )
                Spacer(Modifier.height(14.dp))
                GlassTextField(
                    value = state.password,
                    onValueChange = vm::onPasswordChange,
                    label = "Password",
                    isPassword = true,
                )
                if (state.error != null) {
                    Spacer(Modifier.height(12.dp))
                    Text(
                        state.error!!,
                        color = MaterialTheme.colorScheme.error,
                        style = MaterialTheme.typography.bodySmall
                    )
                }
                Spacer(Modifier.height(20.dp))
                PrimaryButton(
                    text = if (state.loading) "Signing in…" else "Sign In",
                    onClick = vm::signIn,
                    enabled = !state.loading,
                )
            }
        }
    }
}
