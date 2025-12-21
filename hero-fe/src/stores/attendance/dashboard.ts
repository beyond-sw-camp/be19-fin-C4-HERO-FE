/**
 * TypeScript Name   : attendanceDashboardStore.ts
 * Description : 근태 점수 대시보드 관련 Pinia 스토어
 *               - 직원별 근태 점수 목록 / 페이지네이션 / 기간(및 부서) 필터 상태 관리
 *
 * History
 * 2025/12/17 - 이지윤 최초 작성
 *
 * @author 이지윤
 * @version 1.0
 */

import { defineStore } from 'pinia'
import apiClient from '@/api/apiClient'

/**
 * 백엔드 AttendanceDashboardDTO 와 1:1 대응되는 DTO
 */
export interface AttendanceDashboardDTO {
  employeeId: number
  employeeNumber: string
  employeeName: string
  departmentId: number
  departmentName: string
  tardyCount: number
  absenceCount: number
  score: number
}

/**
 * 공통 PageResponse DTO
 * - attendanceStore.ts 의 PageResponse 와 동일 구조
 */
export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

/**
 * 근태 대시보드 스토어 내부 상태 타입
 */
interface AttendanceDashboardState {
  /** 직원별 근태 점수 리스트 */
  dashboardList: AttendanceDashboardDTO[]

  /** 현재 페이지(프론트 기준) */
  currentPage: number

  /** 페이지당 개수 */
  pageSize: number

  /** 전체 페이지 수 */
  totalPages: number

  /** 전체 데이터 개수 */
  totalCount: number

  /** 로딩 여부 */
  loading: boolean

  /** 부서 필터 (null이면 전체 부서) */
  departmentId: number | null

  /** 기간(시작) - YYYY-MM-DD */
  startDate: string

  /** 기간(종료) - YYYY-MM-DD */
  endDate: string
}

/**
 * 근태 점수 대시보드 Pinia 스토어
 * - 직원별 근태 점수 목록 및 페이징/필터 상태 관리
 */
export const useAttendanceDashboardStore = defineStore(
  'attendanceDashboardStore',
  {
    state: (): AttendanceDashboardState => ({
      dashboardList: [],
      currentPage: 1,
      pageSize: 10,
      totalPages: 0,
      totalCount: 0,
      loading: false,
      departmentId: null,
      startDate: '',
      endDate: '',
    }),

    actions: {
      /**
       * 부서 ID 필터를 설정합니다.
       * - 현재는 UI에 부서 선택이 없으면 사용하지 않아도 됩니다.
       *
       * @param {number | null} deptId - 부서 ID (null이면 전체 부서)
       */
      setDepartment(deptId: number | null): void {
        this.departmentId = deptId
      },

      /**
       * 근태 대시보드 조회 기간 필터(시작일/종료일)를 설정합니다.
       *
       * @param {string} start - 조회 시작일 (YYYY-MM-DD), 빈 문자열이면 필터 미적용
       * @param {string} end   - 조회 종료일 (YYYY-MM-DD), 빈 문자열이면 필터 미적용
       */
      setFilterDates(start: string, end: string): void {
        this.startDate = start
        this.endDate = end
      },

      /**
       * 근태 점수 대시보드 목록을 조회합니다.
       * - 페이지 번호를 기준으로 서버에 요청
       * - 부서/기간 필터(departmentId, startDate, endDate)가 설정되어 있으면 함께 전달
       *
       * @param {number} page - 조회할 페이지 번호 (기본값: 1, 프론트 기준)
       */
      async fetchDashboard(page = 1): Promise<void> {
        this.loading = true
        this.currentPage = page

        try {
          const params: Record<string, unknown> = {
            page,
            size: this.pageSize,
          }

          // 값이 있을 때만 파라미터로 전달 (백엔드 @RequestParam(required = false) 와 대응)
          if (this.departmentId != null) {
            params.departmentId = this.departmentId
          }
          if (this.startDate) {
            params.startDate = this.startDate
          }
          if (this.endDate) {
            params.endDate = this.endDate
          }

          const response = await apiClient.get<
            PageResponse<AttendanceDashboardDTO>
          >('/attendance/dashboard', {
            params,
          })

          const data = response.data

          this.dashboardList = data.content

          // 백엔드 PageResponse.page 가 0-based 인 경우 → +1
          // 1-based 로 내려오면 아래 한 줄을 `this.currentPage = data.page;` 로 바꿔주세요.
          this.currentPage = data.page + 1

          this.totalCount = data.totalElements
          this.totalPages = data.totalPages
        } catch (error) {
          console.error('근태 점수 대시보드 조회 실패:', error)
        } finally {
          this.loading = false
        }
      },
    },
  },
)
