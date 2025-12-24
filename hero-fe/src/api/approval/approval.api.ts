/**
 * <pre>
 * TypeScript Name: approval.api.ts
 * Description 
 * :결재(Approval) 도메인과 관련된 서버 API 호출을 담당하는 모듈
 * - 비즈니스 로직이나 상태 관리는 포함하지 않음
 * - API 통신 로직만 정의
 *
 * 주요 타입:
 * - DocumentsResponseDTO: 문서에 대한 기본 정보를 포함한 응답 DTO
 * - DocumentDetailResponseDTO: 결재 문서번호로 조회한 상세페이지조회를 위한 응답 DTO
 *
 * History
 * 2025/12/17 (민철) 최초 작성
 * </pre>
 *
 * @author 민철
 * @version 1.0
 */

import apiClient from '@/api/apiClient';
import type { DocumentsResponseDTO } from '@/types/approval/inbox.types';
import type { PageResponse } from '@/types/common/pagination.types';

/**
 * 서식 관련 api
 * - 서식 목록 조회
 * - 상신/임시저장
 * - 결재선 지정
 * - 참조자 지정
 */
export const approvalTemplateApi = {

}

/**
 * 문서 관련 api
 * - 문서함 목록 조회
 * - 문서 상세 페이지 조회
 * - 결재(승인, 반려)
 * - 임시저장 문서 수정
 * - 상신 문서 회수
 * - 
 */
export const approvalDocumentApi = {
    getList: (params: {
        page: number;
        size: number;
        condition?: string;
        sortBy?: string;
        fromDate?: string;
        toDate?: string;
    }) => {
        return apiClient.get<PageResponse<DocumentsResponseDTO>>(
            '/approval/documents/my-list',
            { params }
        );
    }
};