/**
 * (File => TypeScript) Name   : vacationHistory.ts
 * Description : 휴가 이력(VacationHistory) 도메인 Pinia 스토어
 *               - 개인 휴가 이력 리스트 관리
 *               - 페이지네이션 및 기간(시작/종료일) 필터링
 *               - (개발 단계) employeeId 쿼리 파라미터로 전달
 *
 * History
 * 2025/12/16(이지윤) 최초 작성
 *
 * @author 이지윤
 * @version 1.0
 */

import { defineStore } from 'pinia';

import apiClient from '@/api/apiClient';

/**
 * 휴가 이력 한 건에 대한 DTO
 * - 백엔드 VacationHistoryDTO와 필드 이름을 맞춤
 */
export interface VacationHistoryDTO {
  /** 휴가 시작일 (yyyy-MM-dd) */
  startDate: string;
  /** 휴가 종료일 (yyyy-MM-dd) */
  endDate: string;
  /** 휴가 종류명 (연차 / 반차 / 병가 등) */
  vacationTypeName: string;
  /** 휴가 사유 */
  reason: string;
  /** 승인 상태 (APPROVED / REJECTED / PENDING 등) */
  approvalStatus: string;
}

/**
 * 공통 페이지 응답 DTO
 * - 백엔드 PageResponse<T>와 매칭 (Overtime 스토어와 동일 구조)
 */
export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalCount: number;
  totalPages: number;
}

/**
 * VacationHistory 스토어 상태 타입
 */
interface VacationHistoryState {
  /** 휴가 이력 목록 */
  vacationList: VacationHistoryDTO[];

  /** 페이징 정보 */
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;

  /** 기간 필터 */
  startDate: string;
  endDate: string;

  /**
   * (임시) employeeId
   * - 로그인 연동 전까지 쿼리 파라미터로 넘기기 위해 보관
   * - 추후 토큰 기반으로 대체 가능
   */
  employeeId: number | null;

  /** 로딩 상태 */
  loading: boolean;
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
     * 기간 필터(시작일/종료일)를 설정합니다.
     *
     * @param {string} start - 시작일(yyyy-MM-dd), 빈 문자열이면 필터 미적용
     * @param {string} end - 종료일(yyyy-MM-dd), 빈 문자열이면 필터 미적용
     ****************************************
     * @param → 함수의 인자(Parameter)
     ****************************************
     */
    setFilterDates(start: string, end: string): void {
      this.startDate = start;
      this.endDate = end;
    },

    /**
     * (임시) employeeId를 수동으로 세팅합니다.
     * - 로그인 연동 후에는 토큰 기반으로 처리하거나
     *   내부 전용 상태로 변경할 수 있습니다.
     *
     * @param {number | null} employeeId - 조회 대상 사원의 ID
     */
    setEmployeeId(employeeId: number | null): void {
      this.employeeId = employeeId;
    },

    /**
     * 페이지 크기를 변경합니다. (필요 시 사용)
     *
     * @param {number} size - 페이지당 건수
     */
    setPageSize(size: number): void {
      this.pageSize = size;
    },

    /**
     * 휴가 이력을 조회합니다.
     *
     * - page: 1 기반 페이지 번호
     * - 기간(startDate, endDate) 및 employeeId(개발 단계)를 쿼리로 전달
     *
     * @param {number} [page=1] - 조회할 페이지 번호 (1부터 시작)
     * @returns {Promise<void>} API 호출 완료 후 상태 업데이트
     */
    async fetchVacationHistory(page = 1): Promise<void> {
      this.loading = true;

      try {
        const params: Record<string, unknown> = {
          page,
          size: this.pageSize,
        };

        // 기간 필터가 있으면 쿼리 스트링에 포함
        if (this.startDate) {
          params.startDate = this.startDate;
        }
        if (this.endDate) {
          params.endDate = this.endDate;
        }

        // 개발 단계에서는 employeeId도 쿼리로 넘김
        if (this.employeeId != null) {
          params.employeeId = this.employeeId;
        }

        // apiClient는 baseURL이 '/api'라고 가정
        // → 컨트롤러의 @RequestMapping("/api/vacation")과 매칭
        const response = await apiClient.get<PageResponse<VacationHistoryDTO>>(
          '/vacation/history',
          { params },
        );

        const data = response.data;

        this.vacationList = data.items;
        this.currentPage = data.page;
        this.pageSize = data.size;
        this.totalCount = data.totalCount;
        this.totalPages = data.totalPages;
      } catch (error) {
        // TODO: 필요 시 에러 상태 필드(errorMessage 등)를 두고 UI와 연동
        console.error('휴가 이력 조회 실패:', error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * 기간 필터를 초기화하고 1페이지를 재조회합니다.
     *
     * @returns {Promise<void>} 재조회 완료 시 resolve
     */
    async resetFilters(): Promise<void> {
      this.startDate = '';
      this.endDate = '';
      await this.fetchVacationHistory(1);
    },
  },
});
