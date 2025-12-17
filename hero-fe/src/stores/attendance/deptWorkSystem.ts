/**
 * (File => TypeScript) Name   : deptWorkSystem.ts
 * Description : 부서 근태 현황(DeptWorkSystem) 도메인 Pinia 스토어
 *               - 부서별 근태 현황 리스트 관리
 *               - 페이지네이션 및 날짜/부서 필터링
 *               - Spring Data Page 응답 구조(SpringPage<T>) 매핑
 *
 * History
 * 2025/12/17(이지윤) 최초 작성
 *
 * @author 이지윤
 * @version 1.0
 */

import { defineStore } from 'pinia';

import apiClient from '@/api/apiClient';

/**
 * 부서 근태 현황 한 행(row)에 대한 DTO
 * - 백엔드 DeptWorkSystemRowDTO와 필드명을 맞춰둡니다.
 *
 * - employeeId     : 사원 ID
 * - departmentId   : 부서 ID
 * - employeeName   : 사원명
 * - state          : 근태 상태 (정상 / 지각 / 결근 등)
 * - jobTitle       : 직책(직급)
 * - workSystemName : 근무제 이름
 * - startTime      : 출근 시간 (HH:mm:ss)
 * - endTime        : 퇴근 시간 (HH:mm:ss)
 */
export interface DeptWorkSystemRowDTO {
  employeeId: number;
  departmentId: number;
  employeeName: string;
  state: string;
  jobTitle: string;
  workSystemName: string;
  startTime: string;
  endTime: string;
}

/**
 * Spring Data Page 응답 형태
 * - 현재 /api/attendance/DeptWorkSystem가 반환하는 JSON 구조에 맞춤
 *
 * - content       : 실제 데이터 리스트
 * - page          : 현재 페이지(백엔드 기준)
 * - size          : 페이지당 건수
 * - totalElements : 전체 데이터 수
 * - totalPages    : 전체 페이지 수
 * - first/last    : 첫 페이지 여부 / 마지막 페이지 여부
 */
export interface SpringPage<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

/**
 * 부서 근태 현황 스토어 상태 타입
 */
interface DeptWorkSystemState {
  /** 테이블에 렌더링할 행 데이터 */
  rows: DeptWorkSystemRowDTO[];

  /** 페이징 정보 */
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;

  /** 필터 값들 */
  departmentId: number | null;
  /** 조회 날짜 (yyyy-MM-dd 형식) */
  workDate: string;

  /** 로딩 상태 */
  loading: boolean;
}

/**
 * 부서 근태 현황(DeptWorkSystem) Pinia 스토어
 * - 리스트 + 페이지네이션 + 날짜/부서 필터 관리
 */
export const useDeptWorkSystemStore = defineStore('deptWorkSystem', {
  state: (): DeptWorkSystemState => ({
    rows: [],

    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
    totalElements: 0,

    departmentId: null,
    workDate: '',

    loading: false,
  }),

  actions: {
    /**
     * 필터 설정 (부서 + 날짜)
     *
     * @param {number | null} departmentId - 부서 ID, null이면 부서 필터 미적용
     * @param {string} workDate            - 근태 조회 날짜(yyyy-MM-dd), 빈 문자열이면 필터 미적용
     ****************************************
     * @param → 함수의 인자(Parameter)
     ****************************************
     */
    setFilters(departmentId: number | null, workDate: string): void {
      this.departmentId = departmentId;
      this.workDate = workDate;
    },

    /**
     * 페이지 크기 변경 (필요 시 사용)
     *
     * @param {number} size - 페이지당 건수
     */
    setPageSize(size: number): void {
      this.pageSize = size;
    },

    /**
     * 부서 근태 현황 조회
     *
     * - page: 1 기반 페이지 번호
     * - departmentId / workDate가 설정되어 있으면 쿼리 파라미터로 함께 전송
     *
     * @param {number} [page=1] - 조회할 페이지 번호 (1부터 시작)
     * @returns {Promise<void>} 조회 완료 후 상태 반영
     */
    async fetchDeptWorkSystem(page = 1): Promise<void> {
      this.loading = true;

      try {
        const params: Record<string, unknown> = {
          page,
          size: this.pageSize,
        };

        // 필터 값이 있으면 쿼리 스트링에 포함
        if (this.departmentId != null) {
          params.departmentId = this.departmentId;
        }
        if (this.workDate) {
          // 예: '2025-12-15' 형식
          params.workDate = this.workDate;
        }

        // 백엔드 URL은 Postman에서 테스트한 것과 동일하게 사용
        const { data } = await apiClient.get<SpringPage<DeptWorkSystemRowDTO>>(
          '/attendance/DeptWorkSystem',
          { params },
        );

        this.rows = data.content;
        this.currentPage = data.page;
        this.pageSize = data.size;
        this.totalPages = data.totalPages;
        this.totalElements = data.totalElements;
      } catch (error) {
        // TODO: 필요 시 별도의 에러 상태 필드 추가 및 UI 노출
        console.error('부서 근태 현황 조회 실패:', error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * 필터 초기화 + 1페이지 재조회
     *
     * @returns {Promise<void>} 초기화 및 재조회 완료 시 resolve
     */
    async resetFilters(): Promise<void> {
      this.departmentId = null;
      this.workDate = '';
      await this.fetchDeptWorkSystem(1);
    },
  },
});
