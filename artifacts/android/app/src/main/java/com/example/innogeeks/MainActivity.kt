package com.example.innogeeks

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.innogeeks.core.di.AppContainer
import com.example.innogeeks.feature.auth.AuthRepository
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
    val factory = remember(container) { viewModelFactory(container.authRepository) }
    val session by container.authRepository.sessionFlow.collectAsStateWithLifecycle(initialValue = null)

    if (session == null) {
        val authVm: AuthViewModel = viewModel(factory = factory)
        LoginScreen(authVm)
    } else {
        val homeVm: HomeViewModel = viewModel(factory = factory)
        HomeScreen(homeVm)
    }
}

private fun viewModelFactory(repo: AuthRepository) = object : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T = when {
        modelClass.isAssignableFrom(AuthViewModel::class.java) -> AuthViewModel(repo) as T
        modelClass.isAssignableFrom(HomeViewModel::class.java) -> HomeViewModel(repo) as T
        else -> throw IllegalArgumentException("Unknown ViewModel: ${modelClass.name}")
    }
}
