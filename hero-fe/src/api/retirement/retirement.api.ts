// c:\SWCamp_19th\Project_fin\Hero-FE\hero-fe\src\api\retirement\retirement.api.ts

import apiClient from '@/api/apiClient';
import type {
  ApiResponse,
  ExitReasonDTO,
  RetirementSummaryDTO,
  ExitReasonStatDTO,
  TenureRetentionDTO,
  NewHireStatDTO,
  DepartmentTurnoverDTO,
} from '@/types/retirement/retirement.types';

// 백엔드 컨트롤러의 @RequestMapping("/api/retirement")에 맞춤
// apiClient의 baseURL 설정에 따라 '/retirement' 또는 '/api/retirement'가 될 수 있으나,
// 기존 EvaluationList 등을 참고하여 '/retirement'로 설정합니다. (apiClient가 /api를 붙인다고 가정)
const BASE_URL = '/retirement';

/**
 * 퇴사 사유 목록 조회
 */
export const getExitReasons = async () => {
  const response = await apiClient.get<ApiResponse<ExitReasonDTO[]>>(`${BASE_URL}/reasons`);
  return response.data;
};

/**
 * 퇴직 현황 요약 조회
 */
export const getRetirementSummary = async () => {
  const response = await apiClient.get<ApiResponse<RetirementSummaryDTO>>(`${BASE_URL}/summary`);
  return response.data;
};

/**
 * 사유별 퇴직 통계 조회
 */
export const getExitReasonStats = async () => {
  const response = await apiClient.get<ApiResponse<ExitReasonStatDTO[]>>(`${BASE_URL}/stats/reason`);
  return response.data;
};

/**
 * 근속 기간별 잔존율 조회
 */
export const getTenureRetentionStats = async () => {
  const response = await apiClient.get<ApiResponse<TenureRetentionDTO[]>>(`${BASE_URL}/stats/tenure`);
  return response.data;
};

/**
 * 신입 정착률 및 이직률 조회
 */
export const getNewHireStats = async () => {
  const response = await apiClient.get<ApiResponse<NewHireStatDTO[]>>(`${BASE_URL}/stats/new-hire`);
  return response.data;
};

/**
 * 부서별 이직률 조회
 */
export const getDepartmentTurnoverStats = async () => {
  const response = await apiClient.get<ApiResponse<DepartmentTurnoverDTO[]>>(`${BASE_URL}/stats/department`);
  return response.data;
};
