/**
 * <pre>
 * TypeScript Name   : dashboard.api.ts
 * Description : 대시보드 출퇴근 타각 및 통계 API 호출 모듈
 *               - apiClient(axios instance) 기반으로 공통 호출 함수 제공
 *               - Authorization 헤더는 apiClient 인터셉터에서 자동 첨부됨
 *
 * History
 * 2025/12/26 (혜원) 최초 작성
 * </pre>
 *
 * @author 혜원
 * @version 1.0
 */
import apiClient from '@/api/apiClient'
import type {
  ApiResponse,
  ClockStatusDTO,
  WeeklyStatsDTO,
  MonthlySummaryDTO,
  AttendanceStatsDTO,
  VacationStatsDTO,
  ApprovalStatsDTO,
} from '@/types/dashboard/dashboard.types'

const dashboardApi = {
  /**
   * 출근 처리
   * POST /api/dashboard/clock-in
   */
  async clockIn(): Promise<ApiResponse<void>> {
    const res = await apiClient.post<ApiResponse<void>>('/dashboard/clock-in')
    return res.data
  },

  /**
   * 퇴근 처리
   * POST /api/dashboard/clock-out
   */
  async clockOut(): Promise<ApiResponse<void>> {
    const res = await apiClient.post<ApiResponse<void>>('/dashboard/clock-out')
    return res.data
  },

  /**
   * 오늘 출퇴근 상태 조회
   * GET /api/dashboard/status
   */
  async getTodayStatus(): Promise<ApiResponse<ClockStatusDTO>> {
    const res = await apiClient.get<ApiResponse<ClockStatusDTO>>('/dashboard/status')
    return res.data
  },

  /**
   * 이번 주 근무 통계 조회
   * GET /api/dashboard/weekly-stats
   */
  async getWeeklyStats(): Promise<ApiResponse<WeeklyStatsDTO>> {
    const res = await apiClient.get<ApiResponse<WeeklyStatsDTO>>('/dashboard/weekly-stats')
    return res.data
  },

  /**
   * 이번 달 요약 통계 조회
   * GET /api/dashboard/monthly-summary
   */
  async getMonthlySummary(): Promise<ApiResponse<MonthlySummaryDTO>> {
    const res = await apiClient.get<ApiResponse<MonthlySummaryDTO>>('/dashboard/monthly-summary')
    return res.data
  },

  /**
   * 출근 통계 조회
   * GET /api/dashboard/attendance-stats
   */
  async getAttendanceStats(): Promise<ApiResponse<AttendanceStatsDTO>> {
    const res = await apiClient.get<ApiResponse<AttendanceStatsDTO>>('/dashboard/attendance-stats')
    return res.data
  },

  /**
   * 휴가 현황 조회
   * GET /api/dashboard/vacation-stats
   */
  async getVacationStats(): Promise<ApiResponse<VacationStatsDTO>> {
    const res = await apiClient.get<ApiResponse<VacationStatsDTO>>('/dashboard/vacation-stats')
    return res.data
  },

  /**
   * 결재 현황 조회
   * GET /api/dashboard/approval-stats
   */
  async getApprovalStats(): Promise<ApiResponse<ApprovalStatsDTO>> {
    const res = await apiClient.get<ApiResponse<ApprovalStatsDTO>>('/dashboard/approval-stats')
    return res.data
  },
}

export default dashboardApi