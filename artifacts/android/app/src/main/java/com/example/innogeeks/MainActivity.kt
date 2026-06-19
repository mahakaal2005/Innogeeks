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
import com.example.innogeeks.feature.splash.SplashScreen
import com.example.innogeeks.feature.splash.SplashViewModel
import com.example.innogeeks.ui.theme.InnogeeksTheme
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.innogeeks.navigation.GuestHomeRoute
import com.example.innogeeks.navigation.HomeRoute
import com.example.innogeeks.navigation.LoginRoute
import com.example.innogeeks.navigation.SplashRoute
import com.example.innogeeks.feature.splash.SplashEvent
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
    val navController = rememberNavController()

    NavHost(navController = navController, startDestination = SplashRoute) {
        composable<SplashRoute> {
            val splashVm: SplashViewModel = org.koin.androidx.compose.koinViewModel()

            // Actually, we should collect events directly.
            // But we don't have ObserveAsEvents defined yet. Let's just launch it.
            androidx.compose.runtime.LaunchedEffect(Unit) {
                splashVm.events.collect { event ->
                    when (event) {
                        is SplashEvent.NavigateToGuestHome -> {
                            navController.navigate(GuestHomeRoute) {
                                popUpTo(SplashRoute) { inclusive = true }
                            }
                        }
                        is SplashEvent.NavigateToHome -> {
                            navController.navigate(HomeRoute) {
                                popUpTo(SplashRoute) { inclusive = true }
                            }
                        }
                    }
                }
            }

            SplashScreen()
        }

        composable<GuestHomeRoute> {
            GuestHomeScreen(
                onLoginTapped = { navController.navigate(LoginRoute) }
            )
        }

        composable<LoginRoute> {
            val authVm: AuthViewModel = org.koin.androidx.compose.koinViewModel()
            
            androidx.compose.runtime.LaunchedEffect(Unit) {
                authVm.events.collect { event ->
                    when (event) {
                        is com.example.innogeeks.feature.auth.AuthEvent.NavigateToHome -> {
                            navController.navigate(HomeRoute) {
                                popUpTo(LoginRoute) { inclusive = true }
                                popUpTo(GuestHomeRoute) { inclusive = true }
                            }
                        }
                    }
                }
            }

            LoginScreen(
                vm = authVm,
                onBack = { navController.popBackStack() },
            )
        }

        composable<HomeRoute> {
            val homeVm: HomeViewModel = org.koin.androidx.compose.koinViewModel()
            HomeScreen(homeVm)
        }
    }
}
