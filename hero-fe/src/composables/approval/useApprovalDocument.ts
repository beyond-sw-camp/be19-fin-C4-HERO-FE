/**
 * <pre>
 * Composable Name : useApprovalDocument.ts
 * Description     : 결재 문서 작성/상신 로직
 *
 * 주요 기능
 *   - 문서 유효성 검사
 *   - 임시저장
 *   - 상신
 *
 * History
 *   2025/12/26 - 민철 최초 작성
 *
 * </pre>
 *
 * @author 민철
 * @version 1.0
 */

import { 
    saveDraft as apiSaveDraft, 
    submitDocument as apiSubmitDocument 
} from '@/api/approval/approval_request.api';
import { 
    ApprovalDocumentRequestDTO,
    ApprovalDocumentResponseDTO 
} from '@/types/approval/approval_request.types';

export function useApprovalDocument() {
    
    /* ========================================== */
    /* 유효성 검사 */
    /* ========================================== */

    /**
     * 공통 필수 항목 검증
     */
    const validateCommon = (data: ApprovalDocumentRequestDTO): boolean => {
        if (!data.title || data.title.trim() === '') {
            alert('제목을 입력하세요.');
            return false;
        }

        if (!data.lines || data.lines.length === 0) {
            alert('결재선을 지정하세요.');
            return false;
        }

        return true;
    };

    /**
     * 휴가 서식 검증
     */
    const validateVacation = (details: any): boolean => {
        if (!details.vacationType) {
            alert('휴가 종류를 선택하세요.');
            return false;
        }
        if (!details.startDate || !details.endDate) {
            alert('휴가 기간을 선택하세요.');
            return false;
        }
        return true;
    };

    /**
     * 초과근무 서식 검증
     */
    const validateOvertime = (details: any): boolean => {
        if (!details.workDate) {
            alert('근무 날짜를 선택하세요.');
            return false;
        }
        if (!details.startTime || !details.endTime) {
            alert('근무 시간을 입력하세요.');
            return false;
        }
        return true;
    };

    /**
     * 근무변경 서식 검증
     */
    const validateWorkChange = (details: any): boolean => {
        if (!details.changeDate) {
            alert('변경 날짜를 선택하세요.');
            return false;
        }
        if (!details.beforeSchedule || !details.afterSchedule) {
            alert('변경 전/후 근무 일정을 입력하세요.');
            return false;
        }
        return true;
    };

    /**
     * 근태수정 서식 검증
     */
    const validateAttendanceFix = (details: any): boolean => {
        if (!details.targetDate) {
            alert('수정 대상 날짜를 선택하세요.');
            return false;
        }
        if (!details.reason) {
            alert('수정 사유를 입력하세요.');
            return false;
        }
        return true;
    };

    /**
     * 서식별 유효성 검사
     */
    const validateByFormType = (formType: string, details: any): boolean => {
        switch (formType) {
            case 'vacation':
                return validateVacation(details);
            case 'overtime':
                return validateOvertime(details);
            case 'changework':
                return validateWorkChange(details);
            case 'modifyworkrecord':
                return validateAttendanceFix(details);
            // 다른 서식은 공통 검증만 수행
            case 'personnelappointment':
            case 'promotionplan':
            case 'resign':
            case 'raisepayroll':
            case 'modifypayroll':
                return true;
            default:
                console.warn('⚠️ 알 수 없는 서식 타입:', formType);
                return true;
        }
    };

    /**
     * 전체 문서 유효성 검사
     */
    const validateDocument = (
        data: ApprovalDocumentRequestDTO,
        formType: string
    ): boolean => {
        // 1. 공통 검증
        if (!validateCommon(data)) {
            return false;
        }

        // 2. 서식별 검증
        try {
            const details = JSON.parse(data.details);
            return validateByFormType(formType, details);
        } catch (error) {
            console.error('❌ details JSON 파싱 실패:', error);
            alert('문서 데이터가 올바르지 않습니다.');
            return false;
        }
    };

    /* ========================================== */
    /* 임시저장 */
    /* ========================================== */

    /**
     * 임시저장
     */
    const saveDraft = async (
        data: ApprovalDocumentRequestDTO,
        files?: File[]
    ): Promise<ApprovalDocumentResponseDTO | null> => {
        try {
            const response = await apiSaveDraft(data, files);
            alert('임시저장되었습니다.');
            return response;
        } catch (error) {
            console.error('❌ 임시저장 실패:', error);
            alert('임시저장에 실패했습니다.');
            throw error;
        }
    };

    /* ========================================== */
    /* 상신 */
    /* ========================================== */

    /**
     * 상신
     */
    const submit = async (
        data: ApprovalDocumentRequestDTO,
        files: File[] | undefined,
        formType: string
    ): Promise<ApprovalDocumentResponseDTO | null> => {
        // 유효성 검사
        if (!validateDocument(data, formType)) {
            return null;
        }

        try {
            const response = await apiSubmitDocument(data, files);
            alert('상신되었습니다.');
            return response;
        } catch (error) {
            console.error('❌ 상신 실패:', error);
            alert('상신에 실패했습니다.');
            throw error;
        }
    };

    /* ========================================== */
    /* Return */
    /* ========================================== */

    return {
        validateDocument,
        saveDraft,
        submit,
    };
}