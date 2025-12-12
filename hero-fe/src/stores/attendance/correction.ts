// src/stores/attendance/correction.ts

/**
 * (File => TypeScript) Name   : correction.ts
 * Description : 근태 기록 수정 이력(Correction) 관련 Pinia 스토어
 *               - 수정 이력 목록 / 페이지네이션 / 기간 필터 상태 관리
 *
 * History
 * 2025/12/11 - 이지윤 최초 작성
 */

import { defineStore } from 'pinia'
import apiClient from '@/api/apiClient'

/**
 * 근태 수정 이력 한 건에 대한 DTO
 * 백엔드 CorrectionDTO(JSON) 필드명에 맞춰서 이름을 맞춰줘야 한다.
 * (아래는 권장 형태: camelCase 기준)
 */
export interface CorrectionDTO {
  correctionId: number          // 정정 요청 PK
  date: string                  // 대상 날짜 (target_date)
  prevStartTime: string         // 수정 전 출근 시간 (att.start_time)
  prevEndTime: string           // 수정 전 퇴근 시간 (att.end_time)
  newStartTime: string          // 수정 후 출근 시간 (cor.corrected_start)
  newEndTime: string            // 수정 후 퇴근 시간 (cor.corrected_end)
  reason: string                // 정정 사유
}

/**
 * 공통 페이지 응답 DTO (PageResponseDTO<T>)
 */
export interface PageResponse<T> {
  items: T[]
  page: number
  size: number
  totalCount: number
  totalPages: number
}

/**
 * Correction 스토어 내부 상태 타입
 */
interface CorrectionState {
  correctionList: CorrectionDTO[]
  currentPage: number
  pageSize: number
  totalPages: number
  totalCount: number
  loading: boolean
  startDate: string   // yyyy-MM-dd
  endDate: string     // yyyy-MM-dd
}

/**
 * 근태 기록 수정 이력(Correction) 도메인 Pinia 스토어
 */
export const useCorrectionStore = defineStore('correctionStore', {
  state: (): CorrectionState => ({
    correctionList: [],
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
     * 조회 기간 필터(시작일/종료일)를 설정합니다.
     */
    setFilterDates(start: string, end: string): void {
      this.startDate = start
      this.endDate = end
    },

    /**
     * 필터/페이지 초기화(필요하면 Correction.vue에서 호출해서 사용)
     */
    resetFilters(): void {
      this.startDate = ''
      this.endDate = ''
      this.currentPage = 1
    },

    /**
     * 근태 수정 이력 목록(페이지)을 조회합니다.
     * - page / size / startDate / endDate를 쿼리 파라미터로 서버에 전달
     */
    async fetchCorrections(page = 1): Promise<void> {
      this.loading = true
      this.currentPage = page

      try {
        const response = await apiClient.get<PageResponse<CorrectionDTO>>(
          '/attendance/correction',
          {
            params: {
              page,
              size: this.pageSize,
              // 빈 문자열이면 아예 파라미터를 안 보내도록 처리
              startDate: this.startDate || undefined,
              endDate: this.endDate || undefined,
            },
          },
        )

        const data = response.data

        this.correctionList = data.items
        this.currentPage = data.page
        this.pageSize = data.size
        this.totalCount = data.totalCount
        this.totalPages = data.totalPages
      } catch (error) {
        console.error('근태 수정 이력 조회 실패:', error)
      } finally {
        this.loading = false
      }
    },
  },
})
