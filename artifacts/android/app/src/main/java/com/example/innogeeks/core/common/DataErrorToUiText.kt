package com.example.innogeeks.core.common

fun DataError.toUiText(): UiText {
    return when (this) {
        DataError.Network.NO_INTERNET -> UiText.DynamicString("No internet connection.")
        DataError.Network.UNAUTHORIZED -> UiText.DynamicString("Invalid email or password.")
        DataError.Network.CONFLICT -> UiText.DynamicString("Account already exists.")
        DataError.Network.SERVER_ERROR -> UiText.DynamicString("Server error. Please try again later.")
        else -> UiText.DynamicString("An unexpected error occurred.")
    }
}
