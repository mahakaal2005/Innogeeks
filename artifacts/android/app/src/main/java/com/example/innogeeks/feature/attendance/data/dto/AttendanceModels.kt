package com.example.innogeeks.feature.attendance.data.dto

import kotlinx.serialization.Serializable

@Serializable
data class AttendanceSession(
    val id: String,
    val title: String,
    val domain: String = "",
    @kotlinx.serialization.SerialName("session_date") val date: String,
    val presentCount: Int = 0,
    val totalCount: Int = 0
)

@Serializable
data class DomainMember(
    @kotlinx.serialization.SerialName("id") val userId: String,
    val name: String,
    val year: Int? = null,
    val isPresent: Boolean = false
) {
    val rollNumber: String get() = year?.let { "Year $it" } ?: "N/A"
}

@Serializable
data class CreateSessionRequest(
    val domain: String,
    val title: String
)

@Serializable
data class BulkAttendanceRequest(
    val presentUserIds: List<String>
)
