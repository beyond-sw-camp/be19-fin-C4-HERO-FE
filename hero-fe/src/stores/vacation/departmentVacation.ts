/**
 * TypeScript Name   : departmentVacation.ts
 * Description : 부서 휴가 캘린더 도메인 Pinia 스토어
 *               - 부서별 휴가 일정 조회
 *               - 현재 로그인한 직원(myEmployeeId) 정보 보관
 *               - 캘린더에서 사용할 휴가 이벤트 리스트 관리
 *
 * History
 * 2025/12/16(이지윤)  최초 작성
 *
 * @author 이지윤
 * @version 1.0
 */

import { defineStore } from 'pinia';

import apiClient from '@/api/apiClient';

/**
 * 백엔드 DepartmentVacationDTO와 필드명 매칭
 *
 * - vacationLogId     : 휴가 로그 PK
 * - employeeId        : 사원 ID
 * - employeeName      : 사원명
 * - vacationTypeName  : 휴가 유형명 (연차 / 반차 / 병가 등)
 * - startDate         : 시작일 (YYYY-MM-DD)
 * - endDate           : 종료일 (YYYY-MM-DD)
 */
export interface DepartmentVacationDTO {
  vacationLogId: number;
  employeeId: number;
  employeeName: string;
  vacationTypeName: string;
  startDate: string;
  endDate: string;
}

/**
 * 부서 휴가 캘린더 스토어 상태 타입
 *
 * - items         : 조회된 부서 휴가 일정 목록
 * - loading       : 조회 중 여부
 * - departmentId  : 현재 선택된 부서 ID (null이면 전체 / 기본 부서 기준)
 * - myEmployeeId  : 현재 사용자(본인)의 사원 ID
 */
interface DepartmentVacationState {
  items: DepartmentVacationDTO[];
  loading: boolean;

  departmentId: number | null;
  myEmployeeId: number | null;
}

/**
 * 부서 휴가 캘린더 Pinia 스토어
 * - 부서별 휴가 일정 조회 및 상태 관리
 * - 현재 로그인한 직원 ID 보관 (본인/팀원 구분용)
 */
export const useDepartmentVacationStore = defineStore('departmentVacation', {
  state: (): DepartmentVacationState => ({
    items: [],
    loading: false,
    departmentId: null,
    myEmployeeId: null,
  }),

  actions: {
    /**
     * 현재 선택된 부서 ID를 설정합니다.
     *
     * @param {number | null} departmentId - 부서 ID, null이면 필터 미적용
     ****************************************
     * @param → 함수의 인자(Parameter)
     ****************************************
     */
    setDepartmentId(departmentId: number | null): void {
      this.departmentId = departmentId;
    },

    /**
     * 현재 로그인한 사용자의 사원 ID를 설정합니다.
     * - 캘린더에서 본인 휴가 여부(isSelf) 판단 시 사용 예정
     *
     * @param {number | null} employeeId - 본인 사원 ID
     */
    setMyEmployeeId(employeeId: number | null): void {
      this.myEmployeeId = employeeId;
    },

    /**
     * 부서 휴가 캘린더 데이터를 조회합니다.
     *
     * @param {number} year  - 조회 연도 (예: 2025)
     * @param {number} month - 조회 월 (1~12 기준으로 백엔드와 합의)
     * @returns {Promise<void>} API 호출 완료 후 상태를 갱신
     */
    async fetchCalendar(year: number, month: number): Promise<void> {
      this.loading = true;

      try {
        const params: Record<string, unknown> = { year, month };

        if (this.departmentId != null) {
          params.departmentId = this.departmentId;
        }

        const response = await apiClient.get<DepartmentVacationDTO[]>(
          '/vacation/department/calendar',
          { params },
        );

        this.items = response.data;
      } catch (error) {
        // TODO: 필요 시 별도 에러 상태 필드(errorMessage 등)를 두고 UI에 노출
        console.error('부서 휴가 캘린더 조회 실패:', error);
      } finally {
        this.loading = false;
      }
    },
  },
});
