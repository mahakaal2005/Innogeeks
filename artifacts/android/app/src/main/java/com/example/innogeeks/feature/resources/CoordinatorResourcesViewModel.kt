package com.example.innogeeks.feature.resources

import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.innogeeks.core.network.CloudinaryService
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

import com.example.innogeeks.core.datastore.SessionStore
import com.example.innogeeks.feature.resources.data.ResourcesRepository
import com.example.innogeeks.feature.resources.data.ResourceDto
import com.example.innogeeks.core.common.onSuccess
import com.example.innogeeks.core.common.onFailure
import kotlinx.coroutines.flow.first

class CoordinatorResourcesViewModel(
    private val cloudinaryService: CloudinaryService,
    private val resourcesRepository: ResourcesRepository,
    private val sessionStore: SessionStore
) : ViewModel() {

    private val _isUploading = MutableStateFlow(false)
    val isUploading: StateFlow<Boolean> = _isUploading.asStateFlow()

    private val _uploadedResourceUrl = MutableStateFlow<String?>(null)
    val uploadedResourceUrl: StateFlow<String?> = _uploadedResourceUrl.asStateFlow()

    private val _uploadError = MutableStateFlow<String?>(null)
    val uploadError: StateFlow<String?> = _uploadError.asStateFlow()

    private val _resources = MutableStateFlow<List<ResourceDto>>(emptyList())
    val resources: StateFlow<List<ResourceDto>> = _resources.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    init {
        loadResources()
    }

    fun loadResources() {
        viewModelScope.launch {
            _isLoading.value = true
            val domain = sessionStore.sessionFlow.first()?.domain ?: return@launch
            val result = resourcesRepository.getResources(domain)
            result.onSuccess { 
                _resources.value = it
            }
            _isLoading.value = false
        }
    }

    fun postResource(title: String, resourceType: String, category: String, url: String) {
        viewModelScope.launch {
            _isLoading.value = true
            val domain = sessionStore.sessionFlow.first()?.domain ?: return@launch
            val resource = ResourceDto(title = title, resourceType = resourceType, category = category, url = url, domain = domain)
            val result = resourcesRepository.createResource(resource)
            result.onSuccess {
                loadResources() // refresh
            }.onFailure {
                _uploadError.value = "Failed to create resource"
            }
            _isLoading.value = false
        }
    }

    fun uploadResource(uri: Uri) {
        _isUploading.value = true
        _uploadError.value = null
        
        viewModelScope.launch {
            // Reusing the same preset. In a production app, you might use a different preset for raw files (like PDFs)
            cloudinaryService.uploadImage(uri, "innogeeks_events").collect { result ->
                _isUploading.value = false
                result.onSuccess { url ->
                    _uploadedResourceUrl.value = url
                }.onFailure { exception ->
                    _uploadError.value = exception.message
                }
            }
        }
    }
    
    fun clearUploadState() {
        _uploadedResourceUrl.value = null
        _uploadError.value = null
    }
}
