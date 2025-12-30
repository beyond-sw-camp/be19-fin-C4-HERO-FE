/**
 * (File => TypeScript) Name   : departmentVacation.ts
 * Description : 부서 휴가 캘린더 Pinia 스토어
 *               - 부서 휴가 일정 조회 및 상태 관리
 *               - JWT에서 employeeId 추출해 myEmployeeId 보관 (본인/팀원 구분용)
 *
 * History
 * 2025/12/26 - 이지윤 최초 작성
 *
 * @author 이지윤
 * @version 1.0
 */

import { defineStore } from 'pinia';

import apiClient from '@/api/apiClient';
import { useAuthStore } from '@/stores/auth';

/**
 * 백엔드 DepartmentVacationDTO와 필드명 매칭
 *
 * - vacationLogId   : 휴가 로그 ID
 * - employeeId      : 사원 ID
 * - employeeName    : 사원명
 * - vacationTypeName: 휴가 유형명(연차/반차/병가 등)
 * - startDate       : 시작일(yyyy-MM-dd)
 * - endDate         : 종료일(yyyy-MM-dd)
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
 */
interface DepartmentVacationState {
  /** 캘린더에 표시할 휴가 아이템 목록 */
  items: DepartmentVacationDTO[];
  /** 로딩 상태 플래그 */
  loading: boolean;
  /** 에러 메시지 (없으면 null) */
  errorMessage: string | null;

  /** 선택된 부서 ID (정책상 현재는 사용 X, 확장 대비) */
  departmentId: number | null;
  /** 현재 로그인한 직원 ID (JWT에서 추출) */
  myEmployeeId: number | null;
}

/* =========================
   JWT → employeeId 추출 유틸
   ========================= */

/**
 * JWT Payload 타입 (동적 키 허용)
 */
type JwtPayload = Record<string, unknown>;

/**
 * JWT 문자열에서 payload를 디코딩하여 객체로 반환합니다.
 *
 * @param {string} token - 'header.payload.signature' 형태의 JWT 문자열
 * @returns {JwtPayload | null} 디코딩된 payload 객체, 실패 시 null
 ****************************************
 * @param → 함수의 인자(Parameter)
 ****************************************
 */
function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const payloadBase64Url = token.split('.')[1];
    if (!payloadBase64Url) return null;

    const payloadBase64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(payloadBase64)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(''),
    );

    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * JWT payload에서 employeeId 후보 키들을 순회하며 숫자 ID를 추출합니다.
 *
 * 우선순위:
 *  - employeeId
 *  - employee_id
 *  - empId
 *  - id
 *  - sub
 *
 * @param {string} token - JWT 문자열
 * @returns {number | null} 추출된 employeeId, 없으면 null
 */
function extractEmployeeIdFromToken(token: string): number | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  // 프로젝트마다 claim 키가 다를 수 있어 후보를 여러 개 둠
  const candidates = ['employeeId', 'employee_id', 'empId', 'id', 'sub'];

  for (const key of candidates) {
    const v = payload[key];
    const num = typeof v === 'number' ? v : Number(v);
    if (Number.isFinite(num)) return num;
  }

  return null;
}

/**
 * 부서 휴가 캘린더 Pinia 스토어
 * - 부서 휴가 일정 조회 및 상태 관리
 * - 현재 로그인한 직원 ID 보관 (본인/팀원 구분용)
 */
export const useDepartmentVacationStore = defineStore('departmentVacation', {
  state: (): DepartmentVacationState => ({
    items: [],
    loading: false,
    errorMessage: null,
    departmentId: null,
    myEmployeeId: null,
  }),

  actions: {
    /**
     * 부서 ID를 설정합니다.
     *
     * @param {number | null} departmentId - 부서 ID, null이면 필터 미적용
     */
    setDepartmentId(departmentId: number | null): void {
      this.departmentId = departmentId;
    },

    /**
     * 현재 로그인한 직원 ID를 직접 세팅합니다.
     * - 일반적으로는 syncMyEmployeeIdFromToken을 통해 토큰에서 자동 추출
     *
     * @param {number | null} employeeId - 직원 ID, null이면 미설정
     */
    setMyEmployeeId(employeeId: number | null): void {
      this.myEmployeeId = employeeId;
    },

    /**
     * authStore.accessToken(JWT)에서 employeeId를 추출해 myEmployeeId에 반영합니다.
     * - 토큰이 없거나 payload에 값이 없으면 null 처리
     */
    syncMyEmployeeIdFromToken(): void {
      const authStore = useAuthStore();
      const token = authStore.accessToken;

      if (!token) {
        this.myEmployeeId = null;
        return;
      }

      this.myEmployeeId = extractEmployeeIdFromToken(token);
    },

    /**
     * 부서 휴가 캘린더 데이터를 조회합니다.
     *
     * - year : 조회 연도
     * - month: 조회 월(1~12 또는 백엔드 규약에 맞춤)
     *
     * @param {number} year  - 조회 연도
     * @param {number} month - 조회 월
     * @returns {Promise<void>} 조회 완료 후 상태 업데이트
     */
    async fetchDepartmentVacation(year: number, month: number): Promise<void> {
      // 본인 식별값을 토큰에서 자동 동기화 (페이지에서 따로 setMyEmployeeId 호출 불필요)
      if (this.myEmployeeId == null) {
        this.syncMyEmployeeIdFromToken();
      }

      this.loading = true;
      this.errorMessage = null;

      try {
        const params: Record<string, unknown> = { year, month };

        // (현재 정책상 사용 안 함) 필요하면 다시 활성화
        // if (this.departmentId != null) params.departmentId = this.departmentId;

        const response = await apiClient.get<DepartmentVacationDTO[]>(
          '/vacation/department/calendar',
          { params },
        );

        this.items = response.data;
      } catch (error) {
        this.errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to load department vacation calendar.';
        // TODO: 필요 시 에러 상태를 별도 필드로 분리해 UI에서 세분화된 처리 가능
        console.error('부서 휴가 캘린더 조회 실패:', error);
      } finally {
        this.loading = false;
      }
    },
  },
});
