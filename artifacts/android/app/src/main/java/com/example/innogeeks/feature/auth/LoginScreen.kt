package com.example.innogeeks.feature.auth

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.innogeeks.ui.components.GlassCard
import com.example.innogeeks.ui.components.GlassTextField
import com.example.innogeeks.ui.components.GradientBackground
import com.example.innogeeks.ui.components.PrimaryButton
import com.example.innogeeks.ui.theme.AccentRed
import com.example.innogeeks.ui.theme.TextPrimary
import com.example.innogeeks.ui.theme.TextSecondary

@Composable
fun LoginScreen(vm: AuthViewModel) {
    val state by vm.state.collectAsStateWithLifecycle()

    GradientBackground {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text("Club Innogeeks", color = TextPrimary, fontSize = 30.sp, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(8.dp))
            Text("Sign in to continue", color = TextSecondary, fontSize = 14.sp)
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
                    Text(state.error!!, color = AccentRed, fontSize = 13.sp)
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
