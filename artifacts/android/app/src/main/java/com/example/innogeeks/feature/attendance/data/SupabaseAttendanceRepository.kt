package com.example.innogeeks.feature.attendance.data

import com.example.innogeeks.core.common.DataError
import com.example.innogeeks.core.common.Result
import com.example.innogeeks.core.network.SupabaseRestApi
import com.example.innogeeks.feature.attendance.data.dto.AttendanceSession
import com.example.innogeeks.feature.attendance.data.dto.BulkAttendanceRequest
import com.example.innogeeks.feature.attendance.data.dto.CreateSessionRequest
import com.example.innogeeks.feature.attendance.data.dto.DomainMember
import java.time.LocalDate
import java.time.format.DateTimeFormatter

class SupabaseAttendanceRepository(
    private val restApi: SupabaseRestApi
) : AttendanceRepository {

    override suspend fun getSessions(domain: String): Result<List<AttendanceSession>, DataError.Network> {
        return try {
            val sessions = restApi.getAttendanceSessions(domainFilter = "eq.$domain")
            Result.Success(sessions)
        } catch (e: Exception) {
            e.printStackTrace()
            Result.Error(DataError.Network.UNKNOWN)
        }
    }

    override suspend fun getRoster(sessionId: String): Result<List<DomainMember>, DataError.Network> {
        return try {
            val sessionList = restApi.getAttendanceSessionById("eq.$sessionId")
            if (sessionList.isEmpty()) return Result.Error(DataError.Network.UNKNOWN)
            val session = sessionList.first()

            val members = restApi.getMembersByDomain("eq.${session.domain}")
            val records = restApi.getAttendanceRecords("eq.$sessionId")

            val presentUserIds = records.filter { it["is_present"] == true }.map { it["user_id"].toString() }.toSet()

            val roster = members.map { member ->
                member.copy(isPresent = presentUserIds.contains(member.userId))
            }
            Result.Success(roster)
        } catch (e: Exception) {
            e.printStackTrace()
            Result.Error(DataError.Network.UNKNOWN)
        }
    }

    override suspend fun createSession(req: CreateSessionRequest): Result<AttendanceSession, DataError.Network> {
        return try {
            val today = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE)
            val body = mapOf(
                "domain" to req.domain,
                "title" to req.title,
                "session_date" to today
            )
            val response = restApi.createAttendanceSession(body = body)
            if (response.isNotEmpty()) {
                Result.Success(response.first())
            } else {
                Result.Error(DataError.Network.UNKNOWN)
            }
        } catch (e: Exception) {
            e.printStackTrace()
            Result.Error(DataError.Network.UNKNOWN)
        }
    }

    override suspend fun updateAttendance(sessionId: String, req: BulkAttendanceRequest): Result<Unit, DataError.Network> {
        return try {
            val records = req.presentUserIds.map { userId ->
                mapOf(
                    "session_id" to sessionId,
                    "user_id" to userId,
                    "is_present" to true
                )
            }
            if (records.isNotEmpty()) {
                restApi.bulkInsertAttendance(records = records)
            }
            Result.Success(Unit)
        } catch (e: Exception) {
            e.printStackTrace()
            Result.Error(DataError.Network.UNKNOWN)
        }
    }
}
