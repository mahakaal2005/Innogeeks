package com.example.innogeeks.feature.attendance.data

import com.example.innogeeks.core.common.DataError
import com.example.innogeeks.core.common.Result
import com.example.innogeeks.feature.attendance.data.dto.*
import java.util.UUID

interface AttendanceRepository {
    suspend fun getSessions(domain: String): Result<List<AttendanceSession>, DataError.Network>
    suspend fun getRoster(sessionId: String): Result<List<DomainMember>, DataError.Network>
    suspend fun createSession(req: CreateSessionRequest): Result<AttendanceSession, DataError.Network>
    suspend fun updateAttendance(sessionId: String, req: BulkAttendanceRequest): Result<Unit, DataError.Network>
}

class FakeAttendanceRepository : AttendanceRepository {
    private val sessions = mutableListOf<AttendanceSession>()
    private val rosters = mutableMapOf<String, MutableList<DomainMember>>()

    override suspend fun getSessions(domain: String): Result<List<AttendanceSession>, DataError.Network> {
        return Result.Success(sessions.toList())
    }
    override suspend fun getRoster(sessionId: String): Result<List<DomainMember>, DataError.Network> {
        return Result.Success(rosters[sessionId]?.toList() ?: emptyList())
    }
    override suspend fun createSession(req: CreateSessionRequest): Result<AttendanceSession, DataError.Network> {
        val newId = UUID.randomUUID().toString()
        val newSession = AttendanceSession(newId, req.title, "2026-06-20")
        sessions.add(newSession)
        rosters[newId] = mutableListOf(DomainMember("1", "John Doe", "2024001", false))
        return Result.Success(newSession)
    }
    override suspend fun updateAttendance(sessionId: String, req: BulkAttendanceRequest): Result<Unit, DataError.Network> {
        val roster = rosters[sessionId] ?: return Result.Success(Unit)
        for (i in roster.indices) {
            roster[i] = roster[i].copy(isPresent = req.presentUserIds.contains(roster[i].userId))
        }
        return Result.Success(Unit)
    }
}
