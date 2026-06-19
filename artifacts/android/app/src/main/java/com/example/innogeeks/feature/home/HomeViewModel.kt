package com.example.innogeeks.feature.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.innogeeks.core.datastore.Session
import com.example.innogeeks.feature.auth.AuthRepository
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.flow.update

data class HomeState(
    val session: Session? = null,
    val isLoading: Boolean = true
)

sealed interface HomeEvent {
    data object NavigateToGuestHome : HomeEvent
}

class HomeViewModel(private val repo: AuthRepository) : ViewModel() {

    private val _state = MutableStateFlow(HomeState())
    val state: StateFlow<HomeState> = _state.asStateFlow()

    private val _events = Channel<HomeEvent>()
    val events = _events.receiveAsFlow()

    init {
        viewModelScope.launch {
            repo.sessionFlow.collect { session ->
                _state.update { it.copy(session = session, isLoading = false) }
                if (session == null) {
                    _events.send(HomeEvent.NavigateToGuestHome)
                }
            }
        }
    }

    fun signOut() {
        viewModelScope.launch { repo.signOut() }
    }
}
