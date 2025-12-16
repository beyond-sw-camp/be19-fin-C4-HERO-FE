// src/stores/attendance/changeLog.ts

/**
 * (File => TypeScript) Name   : changeLog.ts
 * Description : 근무제 변경 이력(ChangeLog) 관련 Pinia 스토어
 *               - 변경 이력 목록 / 페이지네이션 / 기간 필터 상태 관리
 *
 * History
 * 2025/12/11 - 이지윤 최초 작성
 */

import { defineStore } from 'pinia'
import apiClient from '@/api/apiClient'

/**
 * 근무제 변경 이력 한 건에 대한 DTO
 * (백엔드 ChangeLogDTO와 필드명을 camelCase 기준으로 맞춤)
 */
export interface ChangeLogDTO {
  workSystemChangeLogId: number  // 변경 이력 PK
  date: string                   // 날짜
  changeReason: string           // 변경 사유
  startTime: string              // 출근 시간
  endTime: string                // 퇴근 시간
  workSystemName: string         // 근무제 이름(템플릿 이름)
}

/**
 * 공통 페이지 응답 DTO (PageResponseDTO<T> 대응)
 */
export interface PageResponse<T> {
  content: T[]
  page: number          // 0-based
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}


/**
 * ChangeLog 스토어 내부 상태 타입
 */
interface ChangeLogState {
  changeLogList: ChangeLogDTO[]
  currentPage: number
  pageSize: number
  totalPages: number
  totalCount: number
  loading: boolean
  startDate: string   // yyyy-MM-dd
  endDate: string     // yyyy-MM-dd
}

/**
 * 근무제 변경 이력(ChangeLog) 도메인 Pinia 스토어
 */
export const useChangeLogStore = defineStore('changeLogStore', {
  state: (): ChangeLogState => ({
    changeLogList: [],
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
     * 필터/페이지 초기화
     */
    resetFilters(): void {
      this.startDate = ''
      this.endDate = ''
      this.currentPage = 1
    },

    /**
     * 근무제 변경 이력 목록(페이지)을 조회합니다.
     * - page / size / startDate / endDate를 쿼리 파라미터로 서버에 전달
     *
     * @param page 조회할 페이지 번호 (기본값: 1)
     */
    async fetchChangeLogs(page = 1): Promise<void> {
      this.loading = true
      this.currentPage = page

      try {
        const response = await apiClient.get<PageResponse<ChangeLogDTO>>(
          '/attendance/changeLog',
          {
            params: {
              page,
              size: this.pageSize,
              startDate: this.startDate || undefined,
              endDate: this.endDate || undefined,
            },
          },
        )

        const data = response.data

        this.changeLogList = data.content
        this.currentPage = data.page + 1
        this.pageSize = data.size
        this.totalCount = data.totalElements
        this.totalPages = data.totalPages
      } catch (error) {
        console.error('근무제 변경 이력 조회 실패:', error)
      } finally {
        this.loading = false
      }
    },
  },
})
