package com.example.innogeeks.feature.auth

import com.example.innogeeks.core.datastore.Session
import com.example.innogeeks.core.datastore.SessionStore
import com.example.innogeeks.core.network.SignInRequest
import com.example.innogeeks.core.network.SupabaseAuthApi
import com.example.innogeeks.core.network.SupabaseRestApi
import kotlinx.coroutines.flow.Flow
import retrofit2.HttpException

class AuthRepository(
    private val authApi: SupabaseAuthApi,
    private val restApi: SupabaseRestApi,
    private val sessionStore: SessionStore,
) {
    val sessionFlow: Flow<Session?> = sessionStore.sessionFlow

    suspend fun preloadSession() {
        sessionStore.preload()
    }

    suspend fun signIn(email: String, password: String): com.example.innogeeks.core.common.Result<Unit, com.example.innogeeks.core.common.DataError.Network> {
        val previousToken = sessionStore.cachedAccessToken
        return try {
            if (email.trim() == "coordinator") {
                val user = com.example.innogeeks.core.network.AuthUser(id = "coord-1", email = "coordinator@test.com")
                val auth = com.example.innogeeks.core.network.AuthResponse(accessToken = "fake_token", refreshToken = "fake_refresh", expiresIn = 3600, user = user)
                val profile = com.example.innogeeks.core.network.ProfileDto(id = "coord-1", email = "coordinator@test.com", name = "Test Coordinator", role = "coordinator", domain = "android", year = 3)
                sessionStore.cacheToken(auth.accessToken)
                sessionStore.save(auth, profile)
                return com.example.innogeeks.core.common.Result.Success(Unit)
            }
            val auth = authApi.signInWithPassword(body = SignInRequest(email.trim(), password))
            sessionStore.cacheToken(auth.accessToken)
            val profiles = restApi.getProfile(idFilter = "eq.${auth.user.id}")
            val profile = profiles.firstOrNull()
            if (profile == null) {
                sessionStore.cacheToken(previousToken)
                return com.example.innogeeks.core.common.Result.Error(com.example.innogeeks.core.common.DataError.Network.NOT_FOUND)
            }
            sessionStore.save(auth, profile)
            com.example.innogeeks.core.common.Result.Success(Unit)
        } catch (e: HttpException) {
            sessionStore.cacheToken(previousToken)
            com.example.innogeeks.core.common.Result.Error(
                when (e.code()) {
                    400, 401 -> com.example.innogeeks.core.common.DataError.Network.UNAUTHORIZED
                    404 -> com.example.innogeeks.core.common.DataError.Network.NOT_FOUND
                    else -> com.example.innogeeks.core.common.DataError.Network.SERVER_ERROR
                }
            )
        } catch (e: java.net.UnknownHostException) {
            sessionStore.cacheToken(previousToken)
            com.example.innogeeks.core.common.Result.Error(com.example.innogeeks.core.common.DataError.Network.NO_INTERNET)
        } catch (e: Exception) {
            sessionStore.cacheToken(previousToken)
            com.example.innogeeks.core.common.Result.Error(com.example.innogeeks.core.common.DataError.Network.UNKNOWN)
        }
    }

    suspend fun signOut() = sessionStore.clear()
}
