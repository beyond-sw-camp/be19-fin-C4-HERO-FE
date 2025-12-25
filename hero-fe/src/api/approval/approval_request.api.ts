/**
 * <pre>
 * API Name        : approval_request.api.ts
 * Description     : 결재 문서 작성/상신 API 함수
 *
 * 주요 함수
 *   - saveDraft: 결재 문서 임시저장
 *   - submitDocument: 결재 문서 상신
 *
 * History
 *   2025/12/26 - 민철 최초 작성
 * </pre>
 *
 * @author 민철
 * @version 1.0
 */

import apiClient from '@/api/apiClient';
import { 
    ApprovalDocumentRequestDTO, 
    ApprovalDocumentResponseDTO 
} from '@/types/approval/approval_request.types';

/**
 * 결재 문서 임시저장
 * @param {ApprovalDocumentRequestDTO} data - 문서 데이터
 * @param {File[]} files - 첨부파일 목록
 * @returns {Promise<ApprovalDocumentResponseDTO>}
 */
export const saveDraft = async (
    data: ApprovalDocumentRequestDTO, 
    files?: File[]
): Promise<ApprovalDocumentResponseDTO> => {
    const formData = new FormData();
    
    // DTO를 JSON Blob으로 추가
    formData.append('data', new Blob(
        [JSON.stringify(data)], 
        { type: 'application/json' }
    ));
    
    // 첨부파일 추가
    if (files && files.length > 0) {
        files.forEach(file => {
            formData.append('files', file);
        });
    }
    
    const response = await apiClient.post<ApprovalDocumentResponseDTO>(
        '/approval/draft',
        formData,
        {
            headers: { 'Content-Type': 'multipart/form-data' }
        }
    );
    
    return response.data;
};

/**
 * 결재 문서 상신
 * @param {ApprovalDocumentRequestDTO} data - 문서 데이터
 * @param {File[]} files - 첨부파일 목록
 * @returns {Promise<ApprovalDocumentResponseDTO>}
 */
export const submitDocument = async (
    data: ApprovalDocumentRequestDTO, 
    files?: File[]
): Promise<ApprovalDocumentResponseDTO> => {
    const formData = new FormData();
    
    // DTO를 JSON Blob으로 추가
    formData.append('data', new Blob(
        [JSON.stringify(data)], 
        { type: 'application/json' }
    ));
    
    // 첨부파일 추가
    if (files && files.length > 0) {
        files.forEach(file => {
            formData.append('files', file);
        });
    }
    
    const response = await apiClient.post<ApprovalDocumentResponseDTO>(
        '/approval/submit',
        formData,
        {
            headers: { 'Content-Type': 'multipart/form-data' }
        }
    );
    
    return response.data;
};