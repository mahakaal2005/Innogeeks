package com.example.innogeeks.feature.attendance.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.innogeeks.core.common.Result
import com.example.innogeeks.core.common.toUiText
import com.example.innogeeks.core.presentation.ui.UiText
import com.example.innogeeks.feature.attendance.data.AttendanceRepository
import com.example.innogeeks.feature.attendance.data.dto.AttendanceSession
import com.example.innogeeks.feature.attendance.data.dto.DomainMember
import kotlinx.collections.immutable.PersistentList
import kotlinx.collections.immutable.persistentListOf
import kotlinx.collections.immutable.toPersistentList
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class AttendanceUiState(
    val isLoading: Boolean = false,
    val sessions: PersistentList<AttendanceSession> = persistentListOf(),
    val roster: PersistentList<DomainMember> = persistentListOf(),
    val presentUserIds: Set<String> = emptySet(),
    val error: UiText? = null
)

sealed interface AttendanceAction {
    data class LoadSessions(val domain: String) : AttendanceAction
}

sealed interface AttendanceEvent {
    data class Error(val error: UiText) : AttendanceEvent
}

class CoordinatorAttendanceViewModel(
    private val repo: AttendanceRepository
) : ViewModel() {
    private val _state = MutableStateFlow(AttendanceUiState())
    val state = _state.asStateFlow()

    fun onAction(action: AttendanceAction) {
        when(action) {
            is AttendanceAction.LoadSessions -> loadSessions(action.domain)
        }
    }

    fun loadSessions(domain: String) {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true) }
            when (val res = repo.getSessions(domain)) {
                is Result.Success -> _state.update { it.copy(isLoading = false, sessions = res.data.toPersistentList()) }
                is Result.Error -> _state.update { it.copy(isLoading = false, error = res.error.toUiText()) }
            }
        }
    }
}
