import { defineStore } from 'pinia';

import apiClient from '@/api/apiClient';
import { useAuthStore } from '@/stores/auth';

/**
 * 백엔드 DepartmentVacationDTO와 필드명 매칭
 */
export interface DepartmentVacationDTO {
  vacationLogId: number;
  employeeId: number;
  employeeName: string;
  vacationTypeName: string;
  startDate: string;
  endDate: string;
}

interface DepartmentVacationState {
  items: DepartmentVacationDTO[];
  loading: boolean;
  errorMessage: string | null;

  departmentId: number | null;
  myEmployeeId: number | null;
}

/* =========================
   JWT → employeeId 추출 유틸
   ========================= */
type JwtPayload = Record<string, unknown>;

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
    setDepartmentId(departmentId: number | null): void {
      this.departmentId = departmentId;
    },

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
     */
    async fetchCalendar(year: number, month: number): Promise<void> {
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
          error instanceof Error ? error.message : 'Failed to load department vacation calendar.';
        console.error('부서 휴가 캘린더 조회 실패:', error);
      } finally {
        this.loading = false;
      }
    },
  },
});
