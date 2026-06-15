package com.example.innogeeks

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import com.example.innogeeks.core.di.AppContainer
import com.example.innogeeks.feature.auth.AuthViewModel
import com.example.innogeeks.feature.auth.LoginScreen
import com.example.innogeeks.feature.home.HomeScreen
import com.example.innogeeks.feature.home.HomeViewModel
import com.example.innogeeks.ui.theme.InnogeeksTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        val container = (application as InnogeeksApp).container
        setContent {
            InnogeeksTheme {
                AppRoot(container)
            }
        }
    }
}

@Composable
private fun AppRoot(container: AppContainer) {
    // Modern lifecycle 2.9+ factory DSL — no manual ViewModelProvider.Factory override.
    val factory = remember(container) {
        viewModelFactory {
            initializer { AuthViewModel(container.authRepository) }
            initializer { HomeViewModel(container.authRepository) }
        }
    }
    val session by container.authRepository.sessionFlow.collectAsStateWithLifecycle(initialValue = null)

    if (session == null) {
        val authVm: AuthViewModel = viewModel(factory = factory)
        LoginScreen(authVm)
    } else {
        val homeVm: HomeViewModel = viewModel(factory = factory)
        HomeScreen(homeVm)
    }
}
