package com.example.innogeeks.feature.splash

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlin.time.Duration.Companion.milliseconds

import com.example.innogeeks.feature.auth.AuthRepository
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.receiveAsFlow

sealed interface SplashEvent {
    data object NavigateToGuestHome : SplashEvent
    data object NavigateToHome : SplashEvent
}

class SplashViewModel(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _events = Channel<SplashEvent>()
    val events = _events.receiveAsFlow()

    init {
        viewModelScope.launch {
            // Wait for splash animation
            delay(2_400L.milliseconds)
            
            // Preload session token into memory so interceptors use it
            authRepository.preloadSession()
            
            // Check session
            val session = authRepository.sessionFlow.firstOrNull()
            if (session != null) {
                _events.send(SplashEvent.NavigateToHome)
            } else {
                _events.send(SplashEvent.NavigateToGuestHome)
            }
        }
    }
}
