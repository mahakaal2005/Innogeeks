package com.example.innogeeks.feature.events

import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.innogeeks.core.network.CloudinaryService
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

import com.example.innogeeks.core.datastore.SessionStore
import com.example.innogeeks.feature.events.data.EventsRepository
import com.example.innogeeks.feature.events.data.EventDto
import com.example.innogeeks.core.common.onSuccess
import com.example.innogeeks.core.common.onFailure
import kotlinx.coroutines.flow.first

class CoordinatorEventsViewModel(
    private val cloudinaryService: CloudinaryService,
    private val eventsRepository: EventsRepository,
    private val sessionStore: SessionStore
) : ViewModel() {

    private val _isUploading = MutableStateFlow(false)
    val isUploading: StateFlow<Boolean> = _isUploading.asStateFlow()

    private val _uploadedPosterUrl = MutableStateFlow<String?>(null)
    val uploadedPosterUrl: StateFlow<String?> = _uploadedPosterUrl.asStateFlow()

    private val _uploadError = MutableStateFlow<String?>(null)
    val uploadError: StateFlow<String?> = _uploadError.asStateFlow()

    private val _events = MutableStateFlow<List<EventDto>>(emptyList())
    val events: StateFlow<List<EventDto>> = _events.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    init {
        loadEvents()
    }

    fun loadEvents() {
        viewModelScope.launch {
            _isLoading.value = true
            val domain = sessionStore.sessionFlow.first()?.domain ?: return@launch
            val result = eventsRepository.getEvents(domain)
            result.onSuccess { 
                _events.value = it
            }
            _isLoading.value = false
        }
    }

    fun postEvent(title: String, description: String, date: String, posterUrl: String?) {
        viewModelScope.launch {
            _isLoading.value = true
            val domain = sessionStore.sessionFlow.first()?.domain ?: return@launch
            val event = EventDto(title = title, description = description, posterUrl = posterUrl, eventDate = date, domain = domain)
            val result = eventsRepository.createEvent(event)
            result.onSuccess {
                loadEvents() // refresh
            }.onFailure {
                _uploadError.value = "Failed to create event"
            }
            _isLoading.value = false
        }
    }

    fun uploadPoster(uri: Uri) {
        _isUploading.value = true
        _uploadError.value = null
        
        viewModelScope.launch {
            cloudinaryService.uploadImage(uri, "innogeeks_events").collect { result ->
                _isUploading.value = false
                result.onSuccess { url ->
                    _uploadedPosterUrl.value = url
                }.onFailure { exception ->
                    _uploadError.value = exception.message
                }
            }
        }
    }
    
    fun clearUploadState() {
        _uploadedPosterUrl.value = null
        _uploadError.value = null
    }
}
