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
import com.example.innogeeks.core.di.AppContainer
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
        val container = (application as InnogeeksApp).container
        setContent {
            InnogeeksTheme(darkTheme = true) {
                AppRoot(container)
            }
        }
    }
}

/**
 * App navigation state machine.
 *
 * Flow:
 *   Splash (always) → GuestHome (public)
 *                         └── Profile tab / "Sign In" → LoginScreen
 *                                                          └── on success → MemberHome
 */
@Composable
private fun AppRoot(container: AppContainer) {
    val factory = remember(container) {
        viewModelFactory {
            initializer { SplashViewModel() }
            initializer { AuthViewModel(container.authRepository) }
            initializer { HomeViewModel(container.authRepository) }
        }
    }

    val splashVm: SplashViewModel = viewModel(factory = factory)
    val splashDest by splashVm.destination.collectAsStateWithLifecycle()

    // Whether the user explicitly navigated to LoginScreen from GuestHome
    var showLogin by remember { mutableStateOf(false) }

    // Session observation — if user is logged in, skip Login and show MemberHome
    val session by container.authRepository.sessionFlow.collectAsStateWithLifecycle(initialValue = null)

    when {
        // ── Splash ──────────────────────────────────────────────────────
        splashDest is SplashDestination.Pending -> {
            SplashScreen()
        }

        // ── Member Home (already logged in) ─────────────────────────────
        session != null -> {
            val homeVm: HomeViewModel = viewModel(factory = factory)
            HomeScreen(homeVm)
        }

        // ── Login (user tapped "Sign In") ────────────────────────────────
        showLogin -> {
            val authVm: AuthViewModel = viewModel(factory = factory)
            LoginScreen(
                vm = authVm,
                onBack = { showLogin = false },
            )
        }

        // ── Guest Home (default public landing) ──────────────────────────
        else -> {
            GuestHomeScreen(
                onLoginTapped = { showLogin = true },
            )
        }
    }
}
