// c:\SWCamp_19th\Project_fin\Hero-FE\hero-fe\src\types\retirement\retirement.types.ts

/**
 * API 공통 응답 래퍼
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  code?: string;
}

/**
 * 퇴사 사유 DTO
 */
export interface ExitReasonDTO {
  exitReasonId: number;
  reasonName: string;
  reasonType: string;
  detailDescription: string;
}

/**
 * 퇴직 현황 요약 DTO
 */
export interface RetirementSummaryDTO {
  retentionRate: number;       // 잔존율
  settlementRate: number;      // 정착율
  totalTurnoverRate: number;   // 종합 이직률
  newHireTurnoverRate: number; // 신입 이직률
}

/**
 * 퇴사 사유별 통계 DTO
 */
export interface ExitReasonStatDTO {
  reasonName: string;
  count: number;
}

/**
 * 근속 기간별 잔존율 DTO
 */
export interface TenureRetentionDTO {
  tenureRange: string;
  retentionRate: number;
}

/**
 * 신입 사원 정착률 및 이직률 통계 DTO
 */
export interface NewHireStatDTO {
  quarter: string;
  settlementRate: number;
  turnoverRate: number;
}

/**
 * 부서별 이직률 통계 DTO
 */
export interface DepartmentTurnoverDTO {
  departmentName: string;
  currentCount: number;
  retiredCount: number;
  turnoverRate: number;
}
