package com.example.innogeeks.feature.auth

import com.example.innogeeks.core.common.Resource
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

    suspend fun signIn(email: String, password: String): Resource<Unit> {
        return try {
            val auth = authApi.signInWithPassword(body = SignInRequest(email.trim(), password))
            val profiles = restApi.getProfile(idFilter = "eq.${auth.user.id}")
            val profile = profiles.firstOrNull()
                ?: return Resource.Error("No profile found for this account.")
            sessionStore.save(auth, profile)
            Resource.Success(Unit)
        } catch (e: HttpException) {
            Resource.Error(
                when (e.code()) {
                    400, 401 -> "Invalid email or password."
                    else -> "Sign-in failed (${e.code()})."
                }
            )
        } catch (e: Exception) {
            Resource.Error(e.message ?: "Network error. Please check your connection.")
        }
    }

    suspend fun signOut() = sessionStore.clear()
}
