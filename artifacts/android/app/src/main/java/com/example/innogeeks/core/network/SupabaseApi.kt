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

    @GET("rest/v1/attendance_sessions")
    suspend fun getAttendanceSessions(
        @Query("domain") domainFilter: String, // "eq.<domain>"
        @Query("select") select: String = "*",
        @Query("order") order: String = "session_date.desc"
    ): List<com.example.innogeeks.feature.attendance.data.dto.AttendanceSession>

    @POST("rest/v1/attendance_sessions")
    suspend fun createAttendanceSession(
        @retrofit2.http.Header("Prefer") prefer: String = "return=representation",
        @Body body: Map<String, String> // domain, title, session_date
    ): List<com.example.innogeeks.feature.attendance.data.dto.AttendanceSession>

    @GET("rest/v1/attendance_sessions")
    suspend fun getAttendanceSessionById(
        @Query("id") idFilter: String, // "eq.<uuid>"
        @Query("select") select: String = "*"
    ): List<com.example.innogeeks.feature.attendance.data.dto.AttendanceSession>

    @GET("rest/v1/profiles")
    suspend fun getMembersByDomain(
        @Query("domain") domainFilter: String, // "eq.<domain>"
        @Query("role") roleFilter: String = "eq.member",
        @Query("select") select: String = "id,name,year" // using year instead of roll_number as per schema
    ): List<com.example.innogeeks.feature.attendance.data.dto.DomainMember>

    @POST("rest/v1/attendance_records")
    suspend fun bulkInsertAttendance(
        @Body records: List<Map<String, Any>> // session_id, user_id, is_present
    )

    @GET("rest/v1/attendance_records")
    suspend fun getAttendanceRecords(
        @Query("session_id") sessionIdFilter: String, // "eq.<uuid>"
        @Query("select") select: String = "user_id,is_present"
    ): List<Map<String, Any>>
}
