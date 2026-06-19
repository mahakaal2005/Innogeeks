package com.example.innogeeks

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.innogeeks.navigation.GuestHomeRoute
import com.example.innogeeks.navigation.HomeRoute
import com.example.innogeeks.navigation.AttendanceRoute
import com.example.innogeeks.navigation.LoginRoute
import com.example.innogeeks.navigation.SplashRoute
import com.example.innogeeks.ui.theme.InnogeeksTheme
import com.example.innogeeks.ui.theme.LocalDarkTheme
import com.example.innogeeks.ui.theme.LocalToggleTheme
import com.example.innogeeks.feature.guest.GuestHomeScreen
import com.example.innogeeks.feature.splash.SplashRoot
import com.example.innogeeks.feature.auth.LoginScreen
import com.example.innogeeks.feature.home.HomeScreen
import org.koin.androidx.compose.koinViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            AppRoot()
        }
    }
}

@Composable
private fun AppRoot() {
    val systemDark = isSystemInDarkTheme()
    // In-app toggle starts at the system default
    var isDark by remember { mutableStateOf(systemDark) }

    CompositionLocalProvider(
        LocalDarkTheme provides isDark,
        LocalToggleTheme provides { isDark = !isDark },
    ) {
        InnogeeksTheme(darkTheme = isDark) {
            val navController = rememberNavController()

            NavHost(navController = navController, startDestination = SplashRoute) {
                composable<SplashRoute> {
                    SplashRoot(
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
                    LoginScreen(
                        vm = koinViewModel(),
                        onBack = { navController.popBackStack() },
                        onNavigateToHome = {
                            navController.navigate(HomeRoute) {
                                popUpTo(GuestHomeRoute) { inclusive = true }
                            }
                        }
                    )
                }

                composable<HomeRoute> {
                    HomeScreen(
                        vm = koinViewModel(),
                        onNavigateToAttendance = { navController.navigate(AttendanceRoute) }
                    )
                }
                
                composable<AttendanceRoute> {
                    com.example.innogeeks.feature.attendance.presentation.CoordinatorAttendanceScreen(
                        vm = koinViewModel()
                    )
                }
            }
        }
    }
}
