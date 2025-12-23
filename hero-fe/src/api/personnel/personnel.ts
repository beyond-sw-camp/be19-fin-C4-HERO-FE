/**
 * <pre>
 * File Name   : personnel.ts
 * Description : 사원 정보와 관련된 API 호출 모듈
 *
 * History
 * 2025/12/12 - 승건 최초 작성
 * </pre>
 *
 * @author 승건
 * @version 1.0
 */

import client from '@/api/apiClient';
import type {
  DepartmentHistoryResponse,
  EmployeeDetailResponse,
  EmployeeListResponse,
  EmployeeRegisterParams,
  EmployeeSearchParams,
  EmployeeSelfUpdateParams,
  MyInfoResponse,
  EmployeeSearchOptionsResponse
} from '@/types/personnel/personnel';

// API 공통 응답 타입 정의
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: any;
}

// 페이징 응답 타입 정의
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
 * 사원 목록 조회 (페이징 및 검색)
 * @param params 검색 조건 (부서명, 직급, 이름 등)
 */
export const fetchEmployees = (params: EmployeeSearchParams) => {
  return client.get<ApiResponse<PageResponse<EmployeeListResponse>>>('/employee/search', {
    params,
  });
};

/**
 * 사원 상세 정보 조회
 * @param employeeId 조회할 사원 ID
 */
export const fetchEmployeeDetail = (employeeId: number) => {
  return client.get<ApiResponse<EmployeeDetailResponse>>(`/employee/${employeeId}`);
};

/**
 * 신규 사원 등록
 * @param data 사원 등록 정보 (SignupRequestDTO)
 */
export const createEmployee = (data: EmployeeRegisterParams) => {
  return client.post<ApiResponse<void>>('/employee/signup', data);
};

/**
 * 내 정보 조회
 */
export const fetchMyInfo = () => {
  return client.get<ApiResponse<MyInfoResponse>>('/employee/me');
};

/**
 * 부서, 직급, 직책 종류 조회
 */
export const fetchEmployeeSearchOptions = () => {
  return client.get<ApiResponse<EmployeeSearchOptionsResponse>>('/employee/search-options');
};

