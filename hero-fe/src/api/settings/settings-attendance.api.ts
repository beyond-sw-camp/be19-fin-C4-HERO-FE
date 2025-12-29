/**
 * <pre>
 * TypeScript Name : settings-attendance.api.ts
 * Description     : 근태 설정(Work System Template) 관련 API 호출 + 타입 정의(합본)
 *
 * History
 *  2025/12/29 - (작성) 근태 설정 탭용 API/타입 합본 생성
 * </pre>
 *
 * @module settings-attendance-api
 */

import apiClient from '@/api/apiClient';

/* =========================
   공통 응답 타입 (프로젝트 맞춤)
   ========================= */
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  result?: T;
}

/**
 * 서버가 내려주는 형태가 프로젝트마다 data/result 등이 섞여 있을 수 있어서
 * payroll 쪽에서 쓰던 unwrap 패턴을 그대로 가져옵니다.
 */
const unwrap = <T>(res: any): T => {
  const body = res?.data;
  if (body?.data !== undefined) return body.data as T;
  if (body?.result !== undefined) return body.result as T;
  if (body?.data?.data !== undefined) return body.data.data as T;
  console.error('[unwrap] unexpected response:', body);
  return undefined as unknown as T;
};

/* =========================
   타입(합본)
   ========================= */
export type Hms = string; // "09:00:00" 형태

export interface WorkSystemTemplateResponse {
  workSystemTemplateId: number;
  startTime: Hms;
  endTime: Hms;
  breakMinMinutes: number;
  reason: string;
  workSystemTypeId: number;
}

export interface WorkSystemTemplateUpsertRequest {
  workSystemTemplateId: number | null; // 신규는 null
  startTime: Hms;
  endTime: Hms;
  breakMinMinutes: number;
  reason: string;
  workSystemTypeId: number;
}

/* =========================
   API
   =========================
   ※ 엔드포인트는 백엔드에 맞게 조정 필요
   - 지금은 settings 도메인 하위로 둔 예시
   ========================= */
const BASE_URL = '/settings/attendance/work-system-templates';

export const settingsAttendanceApi = {
  /**
   * 근무제 템플릿 목록 조회
   */
  async listWorkSystemTemplates(): Promise<WorkSystemTemplateResponse[]> {
    const res = await apiClient.get<ApiResponse<WorkSystemTemplateResponse[]>>(BASE_URL);
    return unwrap(res);
  },

  /**
   * 근무제 템플릿 저장(업서트)
   * - 신규: workSystemTemplateId=null
   * - 수정: workSystemTemplateId=기존ID
   */
  async upsertWorkSystemTemplates(body: WorkSystemTemplateUpsertRequest[]): Promise<void> {
    await apiClient.put<ApiResponse<null>>(BASE_URL, body);
  },
};
