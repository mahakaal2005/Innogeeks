package com.example.innogeeks.feature.splash

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlin.time.Duration.Companion.milliseconds

sealed interface SplashDestination {
    object Pending : SplashDestination
    object GuestHome : SplashDestination
}

class SplashViewModel : ViewModel() {

    private val _destination = MutableStateFlow<SplashDestination>(SplashDestination.Pending)
    val destination: StateFlow<SplashDestination> = _destination.asStateFlow()

    init {
        viewModelScope.launch {
            // Let the splash animation complete (logo + wordmark + tagline = ~2.4s)
            delay(2_400L.milliseconds)
            _destination.value = SplashDestination.GuestHome
        }
    }
}
