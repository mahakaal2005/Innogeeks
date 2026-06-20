package com.example.innogeeks.core.network

import com.google.gson.annotations.SerializedName

data class SignInRequest(
    val email: String,
    val password: String,
)

data class RefreshRequest(
    @SerializedName("refresh_token") val refreshToken: String
)

data class AuthResponse(
    @SerializedName("access_token") val accessToken: String,
    @SerializedName("refresh_token") val refreshToken: String,
    @SerializedName("expires_in") val expiresIn: Long,
    val user: AuthUser,
)

data class AuthUser(
    val id: String,
    val email: String?,
)

data class ProfileDto(
    val id: String,
    val email: String,
    val name: String,
    val role: String,
    val domain: String?,
    val year: Int?,
)
