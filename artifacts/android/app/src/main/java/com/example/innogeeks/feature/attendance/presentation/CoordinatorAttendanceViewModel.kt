package com.example.innogeeks.feature.attendance.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.innogeeks.core.common.Result
import com.example.innogeeks.core.common.toUiText
import com.example.innogeeks.core.common.UiText
import com.example.innogeeks.core.datastore.SessionStore
import com.example.innogeeks.feature.attendance.data.AttendanceRepository
import com.example.innogeeks.feature.attendance.data.dto.AttendanceSession
import com.example.innogeeks.feature.attendance.data.dto.DomainMember
import kotlinx.collections.immutable.PersistentList
import kotlinx.collections.immutable.persistentListOf
import kotlinx.collections.immutable.toPersistentList
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.util.Calendar

data class AttendanceUiState(
    val isLoading: Boolean = false,
    val sessions: PersistentList<AttendanceSession> = persistentListOf(),
    val activeSessionId: String? = null,
    val activeSessionTitle: String = "",
    val roster: PersistentList<DomainMember> = persistentListOf(),
    val presentUserIds: Set<String> = emptySet(),
    val error: UiText? = null
)

sealed interface AttendanceAction {
    data class LoadSessions(val domain: String) : AttendanceAction
    data class StartNewSession(val domain: String, val title: String) : AttendanceAction
    data class LoadRoster(val sessionId: String, val sessionTitle: String) : AttendanceAction
    data class ToggleAttendance(val userId: String) : AttendanceAction
    data object SaveRoster : AttendanceAction
}

class CoordinatorAttendanceViewModel(
    private val repo: AttendanceRepository,
    private val sessionStore: SessionStore
) : ViewModel() {

    /** Returns the logged-in user's domain, falling back to "android" if unset. */
    private suspend fun userDomain(): String =
        sessionStore.sessionFlow.first()?.domain ?: "android"

    /** Returns today's date as yyyy-MM-dd without needing java.time (API 26+). */
    private fun todayDate(): String {
        val cal = Calendar.getInstance()
        val y = cal.get(Calendar.YEAR)
        val m = cal.get(Calendar.MONTH) + 1  // Calendar.MONTH is 0-based
        val d = cal.get(Calendar.DAY_OF_MONTH)
        return "%04d-%02d-%02d".format(y, m, d)
    }
    private val _state = MutableStateFlow(AttendanceUiState())
    val state = _state.asStateFlow()

    fun onAction(action: AttendanceAction) {
        when(action) {
            is AttendanceAction.LoadSessions -> loadSessions(action.domain)
            is AttendanceAction.StartNewSession -> startNewSession(action.domain, action.title)
            is AttendanceAction.LoadRoster -> loadRoster(action.sessionId, action.sessionTitle)
            is AttendanceAction.ToggleAttendance -> toggleAttendance(action.userId)
            is AttendanceAction.SaveRoster -> saveRoster()
        }
    }

    private fun loadSessions(domainArg: String) {
        viewModelScope.launch {
            val domain = domainArg.ifBlank { userDomain() }
            _state.update { it.copy(isLoading = true, error = null) }
            when (val res = repo.getSessions(domain)) {
                is Result.Success -> _state.update { it.copy(isLoading = false, sessions = res.data.toPersistentList()) }
                is Result.Error -> _state.update { it.copy(isLoading = false, error = res.error.toUiText()) }
            }
        }
    }

    private fun startNewSession(domainArg: String, title: String) {
        viewModelScope.launch {
            val domain = domainArg.ifBlank { userDomain() }
            _state.update { it.copy(isLoading = true, error = null) }
            when (val res = repo.createSession(com.example.innogeeks.feature.attendance.data.dto.CreateSessionRequest(domain, title, todayDate()))) {
                is Result.Success -> {
                    _state.update { it.copy(isLoading = false) }
                    loadRoster(res.data.id, title)
                }
                is Result.Error -> _state.update { it.copy(isLoading = false, error = res.error.toUiText()) }
            }
        }
    }

    private fun loadRoster(sessionId: String, title: String) {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null, activeSessionId = sessionId, activeSessionTitle = title) }
            when (val res = repo.getRoster(sessionId)) {
                is Result.Success -> {
                    val presentIds = res.data.filter { it.isPresent }.map { it.userId }.toSet()
                    _state.update { it.copy(isLoading = false, roster = res.data.toPersistentList(), presentUserIds = presentIds) }
                }
                is Result.Error -> _state.update { it.copy(isLoading = false, error = res.error.toUiText()) }
            }
        }
    }

    private fun toggleAttendance(userId: String) {
        _state.update { current ->
            val newPresent = if (current.presentUserIds.contains(userId)) {
                current.presentUserIds - userId
            } else {
                current.presentUserIds + userId
            }
            current.copy(presentUserIds = newPresent)
        }
    }

    private fun saveRoster() {
        val sessionId = _state.value.activeSessionId ?: return
        val allUserIds = _state.value.roster.map { it.userId }
        val presentUserIds = _state.value.presentUserIds.toList()
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null) }
            val req = com.example.innogeeks.feature.attendance.data.dto.BulkAttendanceRequest(
                allUserIds = allUserIds,
                presentUserIds = presentUserIds
            )
            when (val res = repo.updateAttendance(sessionId, req)) {
                is Result.Success -> {
                    // Reset to session list view
                    _state.update { it.copy(
                        isLoading = false,
                        activeSessionId = null,
                        activeSessionTitle = "",
                        roster = persistentListOf(),
                        presentUserIds = emptySet(),
                        error = null
                    )}
                    // Reload sessions so Past Sessions list shows updated data
                    loadSessions("")
                }
                is Result.Error -> _state.update { it.copy(isLoading = false, error = res.error.toUiText()) }
            }
        }
    }
}
