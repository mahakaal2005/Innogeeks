package com.example.innogeeks.core.network

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Query

/** Supabase GoTrue (Auth) endpoints. */
interface SupabaseAuthApi {
    @POST("auth/v1/token")
    suspend fun signInWithPassword(
        @Query("grant_type") grantType: String = "password",
        @Body body: SignInRequest,
    ): AuthResponse
}

/** Supabase PostgREST (data) endpoints. RLS is enforced via the user's bearer token. */
interface SupabaseRestApi {
    @GET("rest/v1/profiles")
    suspend fun getProfile(
        @Query("id") idFilter: String, // expects "eq.<uuid>"
        @Query("select") select: String = "*",
    ): List<ProfileDto>
}
