package com.example.innogeeks

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory

import com.example.innogeeks.feature.auth.AuthViewModel
import com.example.innogeeks.feature.auth.LoginScreen
import com.example.innogeeks.feature.guest.GuestHomeScreen
import com.example.innogeeks.feature.home.HomeScreen
import com.example.innogeeks.feature.home.HomeViewModel
import com.example.innogeeks.feature.splash.SplashDestination
import com.example.innogeeks.feature.splash.SplashScreen
import com.example.innogeeks.feature.splash.SplashViewModel
import com.example.innogeeks.ui.theme.InnogeeksTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            InnogeeksTheme(darkTheme = true) {
                AppRoot()
            }
        }
    }
}

@Composable
private fun AppRoot() {
    val splashVm: SplashViewModel = org.koin.androidx.compose.koinViewModel()
    val splashDest by splashVm.destination.collectAsStateWithLifecycle()

    var showLogin by remember { mutableStateOf(false) }

    val authRepo: com.example.innogeeks.feature.auth.AuthRepository = org.koin.compose.koinInject()
    val session by authRepo.sessionFlow.collectAsStateWithLifecycle(initialValue = null)

    when {
        splashDest is SplashDestination.Pending -> {
            SplashScreen()
        }
        session != null -> {
            val homeVm: HomeViewModel = org.koin.androidx.compose.koinViewModel()
            HomeScreen(homeVm)
        }
        showLogin -> {
            val authVm: AuthViewModel = org.koin.androidx.compose.koinViewModel()
            LoginScreen(
                vm = authVm,
                onBack = { showLogin = false },
            )
        }
        else -> {
            GuestHomeScreen(
                onLoginTapped = { showLogin = true },
            )
        }
    }
}
