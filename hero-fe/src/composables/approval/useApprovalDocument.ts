/**
 * <pre>
 * Composable Name : useApprovalDocument.ts
 * Description     : 결재 문서 작성/상신 로직 (실제 필드명 반영)
 *
 * 주요 기능
 *   - 문서 유효성 검사 (각 서식별 실제 필드 반영)
 *   - 임시저장
 *   - 상신
 *
 * History
 *   2025/12/26 - 민철 최초 작성
 *   2025/12/27 - 민철 실제 필드명 반영 및 유효성 검사 강화
 *
 * </pre>
 *
 * @author 민철
 * @version 2.0
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
     * 1. 휴가신청서 (vacation) 검증
     * 필수: vacationType, startDate, endDate
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
     * 2. 초과근무신청서 (overtime) 검증
     * 필수: workDate, startTime, endTime
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
        if (!details.reason) {
            alert('사유를 입력하세요.');
            return false;
        }
        return true;
    };

    /**
     * 3. 근무변경신청서 (changework) 검증
     * 필수: workSystemTemplateName, applyDate, startTime, endTime
     */
    const validateWorkChange = (details: any): boolean => {
        if (!details.workSystemTemplateName) {
            alert('근무제 템플릿을 선택하세요.');
            return false;
        }
        if (!details.applyDate) {
            alert('적용 날짜를 선택하세요.');
            return false;
        }
        if (!details.startTime || !details.endTime) {
            alert('근무 시간을 입력하세요.');
            return false;
        }
        if (!details.reason) {
            alert('변경 사유를 입력하세요.');
            return false;
        }
        return true;
    };

    /**
     * 4. 근태수정신청서 (modifyworkrecord) 검증
     * 필수: workDate, startTime, endTime, reason
     */
    const validateAttendanceFix = (details: any): boolean => {
        if (!details.targetDate) {
            alert('수정 대상 날짜를 선택하세요.');
            return false;
        }
        if (!details.correctedStart || !details.correctedEnd) {
            alert('수정 시간을 입력하세요.');
            return false;
        }
        if (!details.reason || details.reason.trim() === '') {
            alert('수정 사유를 입력하세요.');
            return false;
        }
        return true;
    };

    /**
     * 5. 인사발령신청서 (personnelappointment) 검증
     * 필수: appointmentType, effectiveDate, targetEmpId
     */
    const validateAppointment = (details: any): boolean => {
        if (!details.appointmentType) {
            alert('발령 유형을 선택하세요.');
            return false;
        }
        if (!details.effectiveDate) {
            alert('발령 효력 발생일을 선택하세요.');
            return false;
        }
        if (!details.targetEmpId) {
            alert('대상 사원을 선택하세요.');
            return false;
        }
        return true;
    };

    /**
     * 6. 퇴직신청서 (resign) 검증
     * 필수: terminationDate, terminateReason
     */
    const validateResign = (details: any): boolean => {
        if (!details.hireDate) {
            alert('입사일을 선택하세요.');
            return false;
        }
        if (!details.terminationDate) {
            alert('퇴직일을 선택하세요.');
            return false;
        }
        if (!details.terminateReason) {
            alert('퇴직 사유를 선택하세요.');
            return false;
        }
        return true;
    };

    /**
     * 7. 급여인상신청서 (raisepayroll) 검증
     * 필수: beforeSalary, afterSalary
     */
    const validatePayrollRaise = (details: any): boolean => {
        if (!details.beforeSalary || details.beforeSalary <= 0) {
            alert('현재 급여를 입력하세요.');
            return false;
        }
        if (!details.afterSalary || details.afterSalary <= 0) {
            alert('인상 후 급여를 입력하세요.');
            return false;
        }
        if (details.afterSalary <= details.beforeSalary) {
            alert('인상 후 급여는 현재 급여보다 커야 합니다.');
            return false;
        }
        return true;
    };

    /**
     * 8. 급여조정신청서 (modifypayroll) 검증
     * 필수: adjustmentType, currentAmount, adjustedAmount
     */
    const validatePayrollAdjust = (details: any): boolean => {
        if (!details.adjustmentType) {
            alert('조정 항목을 선택하세요.');
            return false;
        }
        if (!details.adjustmentAmount || details.adjustmentAmount <= 0) {
            alert('조정 후 금액을 입력하세요.');
            return false;
        }
        if (!details.reason) {
            alert('조정 사유를 입력하세요.');
            return false;
        }
        return true;
    };

    /**
     * 서식별 유효성 검사 라우터
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
            
            case 'personnelappointment':
                return validateAppointment(details);
            
            case 'promotionplan':
                // 승진신청서 (추후 구현)
                return true;
            
            case 'resign':
                return validateResign(details);
            
            case 'raisepayroll':
                return validatePayrollRaise(details);
            
            case 'modifypayroll':
                return validatePayrollAdjust(details);
            
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