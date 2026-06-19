package com.example.innogeeks.feature.attendance.data

import com.example.innogeeks.core.common.DataError
import com.example.innogeeks.core.common.Result
import com.example.innogeeks.feature.attendance.data.dto.*

interface AttendanceRepository {
    suspend fun getSessions(domain: String): Result<List<AttendanceSession>, DataError.Network>
    suspend fun getRoster(sessionId: String): Result<List<DomainMember>, DataError.Network>
    suspend fun createSession(req: CreateSessionRequest): Result<AttendanceSession, DataError.Network>
    suspend fun updateAttendance(sessionId: String, req: BulkAttendanceRequest): Result<Unit, DataError.Network>
}

class FakeAttendanceRepository : AttendanceRepository {
    private val sessions = mutableListOf<AttendanceSession>()
    override suspend fun getSessions(domain: String): Result<List<AttendanceSession>, DataError.Network> {
        return Result.Success(sessions)
    }
    override suspend fun getRoster(sessionId: String): Result<List<DomainMember>, DataError.Network> {
        return Result.Success(listOf(DomainMember("1", "John Doe", "2024001", false)))
    }
    override suspend fun createSession(req: CreateSessionRequest): Result<AttendanceSession, DataError.Network> {
        val newSession = AttendanceSession("id1", req.title, "2026-06-20")
        sessions.add(newSession)
        return Result.Success(newSession)
    }
    override suspend fun updateAttendance(sessionId: String, req: BulkAttendanceRequest): Result<Unit, DataError.Network> {
        return Result.Success(Unit)
    }
}
