package com.example.innogeeks.core.common

/** Simple result wrapper for one-shot operations. */
sealed interface Resource<out T> {
    data object Loading : Resource<Nothing>
    data class Success<T>(val data: T) : Resource<T>
    data class Error(val message: String) : Resource<Nothing>
}
