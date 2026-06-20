package com.example.innogeeks.feature.attendance.data.dto

import com.google.gson.annotations.SerializedName

data class AttendanceSession(
    val id: String,
    val title: String,
    val domain: String = "",
    @SerializedName("session_date") val date: String,
    @SerializedName("present_count") val presentCount: Int = 0,
    @SerializedName("total_count") val totalCount: Int = 0
)

data class DomainMember(
    @SerializedName("id") val userId: String,
    val name: String,
    val year: Int? = null,
    var isPresent: Boolean = false
) {
    val rollNumber: String get() = year?.let { "Year $it" } ?: "N/A"
}

data class CreateSessionRequest(
    val domain: String,
    val title: String,
    val sessionDate: String  // yyyy-MM-dd, set by ViewModel using Calendar
)

data class BulkAttendanceRequest(
    val allUserIds: List<String>,
    val presentUserIds: List<String>
)

data class AttendanceRecord(
    @com.google.gson.annotations.SerializedName("session_id") val sessionId: String,
    @com.google.gson.annotations.SerializedName("user_id") val userId: String,
    @com.google.gson.annotations.SerializedName("is_present") val isPresent: Boolean
)
