// src/stores/overtime.ts
import { defineStore } from 'pinia'
import axios from 'axios'

/**
 * 초과 근무 한 건에 대한 DTO
 */
export interface OvertimeDTO {
  overtimeId: number
  date: string
  startTime: string
  endTime: string
  overtimeHours: number
  reason: string
}

/**
 * 공통 페이지 응답 DTO (백엔드 PageResponseDTO<T>와 매칭)
 */
export interface PageResponse<T> {
  items: T[]
  page: number
  size: number
  totalCount: number
  totalPages: number
}

/**
 * Overtime 스토어 상태 타입
 */
interface OvertimeState {
  overtimeList: OvertimeDTO[]
  currentPage: number
  pageSize: number
  totalPages: number
  totalCount: number
  loading: boolean
  startDate: string
  endDate: string
}

/**
 * 초과 근무(Overtime) 도메인 Pinia 스토어
 * - 리스트 + 페이지네이션 + 기간 필터 관리
 */
export const useOvertimeStore = defineStore('overtimeStore', {
  state: (): OvertimeState => ({
    overtimeList: [],
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
    totalCount: 0,
    loading: false,
    startDate: '',
    endDate: '',
  }),

  actions: {
    /**
     * 조회 기간 필터(시작일/종료일) 설정
     */
    setFilterDates(start: string, end: string): void {
      this.startDate = start
      this.endDate = end
    },

    /**
     * 초과 근무 이력 조회 (서버 페이지네이션)
     *  - page: 조회할 페이지 번호 (1부터)
     *  - this.startDate / this.endDate 도 함께 전송
     */
    async fetchOvertime(page = 1): Promise<void> {
      this.loading = true
      this.currentPage = page

      try {
        const res = await axios.get<PageResponse<OvertimeDTO>>(
          '/api/attendance/overtime',
          {
            params: {
              page,
              size: this.pageSize,
              startDate: this.startDate || undefined,
              endDate: this.endDate || undefined,
            },
          },
        )

        const data = res.data

        this.overtimeList = data.items
        this.currentPage = data.page
        this.pageSize = data.size
        this.totalCount = data.totalCount
        this.totalPages = data.totalPages
      } catch (error) {
        console.error('초과 근무 이력 조회 실패:', error)
      } finally {
        this.loading = false
      }
    },
  },
})
