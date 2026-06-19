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
            com.example.innogeeks.feature.splash.SplashRoot(
                onNavigateToGuestHome = {
                    navController.navigate(GuestHomeRoute) {
                        popUpTo(SplashRoute) { inclusive = true }
                    }
                },
                onNavigateToHome = {
                    navController.navigate(HomeRoute) {
                        popUpTo(SplashRoute) { inclusive = true }
                    }
                }
            )
        }

        composable<GuestHomeRoute> {
            GuestHomeScreen(
                onLoginTapped = { navController.navigate(LoginRoute) }
            )
        }

        composable<LoginRoute> {
            com.example.innogeeks.feature.auth.LoginRoot(
                onNavigateToHome = {
                    navController.navigate(HomeRoute) {
                        popUpTo(LoginRoute) { inclusive = true }
                        popUpTo(GuestHomeRoute) { inclusive = true }
                    }
                },
                onBack = { navController.popBackStack() }
            )
        }

        composable<HomeRoute> {
            com.example.innogeeks.feature.home.HomeRoot(
                onNavigateToGuestHome = {
                    navController.navigate(GuestHomeRoute) {
                        popUpTo(HomeRoute) { inclusive = true }
                    }
                }
            )
        }
    }
}
