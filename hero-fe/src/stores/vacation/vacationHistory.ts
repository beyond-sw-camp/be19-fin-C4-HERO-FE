import { defineStore } from 'pinia'
import apiClient from '@/api/apiClient'

/**
 * 휴가 이력 한 건에 대한 DTO
 * - 백엔드 VacationHistoryDTO와 필드 이름을 맞춰둡니다.
 */
export interface VacationHistoryDTO {
  startDate: string        // 휴가 시작일 (yyyy-MM-dd)
  endDate: string          // 휴가 종료일 (yyyy-MM-dd)
  vacationTypeName: string // 휴가 종류명 (연차 / 반차 / 병가 등)
  reason: string           // 사유
  approvalStatus: string           // 승인 상태 (APPROVED / REJECTED ...)
}

/**
 * 공통 페이지 응답 DTO
 * - 백엔드 PageResponse<T>와 매칭 (overtime 스토어와 동일 구조)
 */
export interface PageResponse<T> {
  items: T[]
  page: number
  size: number
  totalCount: number
  totalPages: number
}

/**
 * VacationHistory 스토어 상태 타입
 */
interface VacationHistoryState {
  vacationList: VacationHistoryDTO[]

  // 페이징 정보
  currentPage: number
  pageSize: number
  totalPages: number
  totalCount: number

  // 필터
  startDate: string
  endDate: string
  // 임시로 employeeId도 쿼리로 넘길 수 있게 보관 (나중에 로그인 연동 시 제거 가능)
  employeeId: number | null

  // 로딩 상태
  loading: boolean
}

/**
 * 휴가 이력(VacationHistory) 도메인 Pinia 스토어
 * - 리스트 + 페이지네이션 + 기간 필터 관리
 */
export const useVacationHistoryStore = defineStore('vacationHistory', {
  state: (): VacationHistoryState => ({
    vacationList: [],

    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
    totalCount: 0,

    startDate: '',
    endDate: '',
    employeeId: null,

    loading: false,
  }),

  actions: {
    /**
     * 기간 필터 설정
     */
    setFilterDates(start: string, end: string) {
      this.startDate = start
      this.endDate = end
    },

    /**
     * (임시) employeeId 수동 세팅
     * - 로그인 연동 후에는 제거하거나 내부에서만 사용하면 됨
     */
    setEmployeeId(employeeId: number | null) {
      this.employeeId = employeeId
    },

    /**
     * 페이지 크기 변경 (필요 시 사용)
     */
    setPageSize(size: number) {
      this.pageSize = size
    },

    /**
     * 휴가 이력 조회
     * - page: 1 기반 페이지 번호
     */
    async fetchVacationHistory(page = 1): Promise<void> {
      this.loading = true

      try {
        const params: Record<string, unknown> = {
          page,
          size: this.pageSize,
        }

        // 기간 필터가 있으면 쿼리 스트링에 포함
        if (this.startDate) {
          params.startDate = this.startDate
        }
        if (this.endDate) {
          params.endDate = this.endDate
        }

        // 개발 단계에서는 employeeId도 쿼리로 넘김
        if (this.employeeId != null) {
          params.employeeId = this.employeeId
        }

        // apiClient는 baseURL이 '/api'라고 가정 → 컨트롤러의 @RequestMapping("/api/vacation")과 매칭
        const response = await apiClient.get<PageResponse<VacationHistoryDTO>>(
          '/vacation/history',
          { params },
        )

        const data = response.data

        this.vacationList = data.items
        this.currentPage = data.page
        this.pageSize = data.size
        this.totalCount = data.totalCount
        this.totalPages = data.totalPages
      } finally {
        this.loading = false
      }
    },

    /**
     * 필터 초기화 + 1페이지 재조회
     */
    async resetFilters(): Promise<void> {
      this.startDate = ''
      this.endDate = ''
      await this.fetchVacationHistory(1)
    },
  },
})
