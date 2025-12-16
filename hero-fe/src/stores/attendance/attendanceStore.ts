/**
 * (File => TypeScript) Name   : attendanceStore.ts
 * Description : 근태(Attendance) 관련 Pinia 스토어
 *               - 개인 근태 이력 목록/페이지네이션/기간 필터 상태 관리
 *
 * History
 * 2025/12/10 - 이지윤 최초 작성
 *
 * @author 이지윤
 * @version 1.0
 */

import { defineStore } from 'pinia';
import apiClient from '@/api/apiClient';

/**
 * 개인 근태 이력 한 건에 대한 DTO
 */
export interface PersonalDTO {
  attendanceId: number;
  workDate: string;
  state: string;
  startTime: string;
  endTime: string;
  workDuration: number;
  workSystemName: string;
}

/**
 * 개인 근태 이력 페이지 응답 DTO
 */
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
/**
 * Attendance 스토어 내부 상태 타입
 */
interface AttendanceState {
  personalList: PersonalDTO[];
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  loading: boolean;
  startDate: string;
  endDate: string;
}

/**
 * 근태(Attendance) 도메인 Pinia 스토어
 * - 개인 근태 이력 리스트 및 페이징/필터 상태 관리
 */
export const useAttendanceStore = defineStore('attendanceStore', {
  state: (): AttendanceState => ({
    personalList: [],
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
     * 근태 조회 기간 필터(시작일/종료일)를 설정합니다.
     *
     * @param {string} start - 조회 시작일 (YYYY-MM-DD), 빈 문자열이면 필터 미적용
     * @param {string} end - 조회 종료일 (YYYY-MM-DD), 빈 문자열이면 필터 미적용
     ****************************************
     * @param → 함수의 인자(Parameter)
     ****************************************
     */
    setFilterDates(start: string, end: string): void {
      this.startDate = start;
      this.endDate = end;
    },

    /**
     * 개인 근태 이력 목록을 조회합니다.
     * - 페이지 번호를 기준으로 서버에 요청
     * - 기간 필터(startDate, endDate)가 설정되어 있으면 함께 전달
     *
     * @param {number} page - 조회할 페이지 번호 (기본값: 1)
     * @returns {Promise<void>} API 호출 완료 후 상태 업데이트
     */
    async fetchPersonal(page = 1): Promise<void> {
      this.loading = true;
      this.currentPage = page;

      try {
        const response = await apiClient.get<PageResponse<PersonalDTO>>(
          '/attendance/personal',
          {
            params: {
              page,
              size: this.pageSize,
              startDate: this.startDate || undefined,
              endDate: this.endDate || undefined,
            },
          },
        );

        const data = response.data;

      this.personalList = data.content;
      this.currentPage = data.page + 1; 
      this.totalCount = data.totalElements;
      this.totalPages = data.totalPages;
      } catch (error) {
        // TODO: 필요 시 에러 상태(errorMessage 등)를 추가로 두고 화면에 노출
        //       또는 공통 에러 핸들링 유틸과 연동
        console.error('개인 근태 이력 조회 실패:', error);
      } finally {
        this.loading = false;
      }
    },
  },
});
