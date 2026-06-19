package com.example.innogeeks.feature.attendance.data.dto

import kotlinx.serialization.Serializable

@Serializable
data class AttendanceSession(
    val id: String,
    val title: String,
    val date: String,
    val presentCount: Int = 0,
    val totalCount: Int = 0
)

@Serializable
data class DomainMember(
    val userId: String,
    val name: String,
    val rollNumber: String,
    val isPresent: Boolean = false
)

@Serializable
data class CreateSessionRequest(
    val domain: String,
    val title: String
)

@Serializable
data class BulkAttendanceRequest(
    val presentUserIds: List<String>
)
