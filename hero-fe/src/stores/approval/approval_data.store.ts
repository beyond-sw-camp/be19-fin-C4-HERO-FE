
import { defineStore } from 'pinia';
import {
    getVacationType,
    getWorkSystemType,
    getResignType,
    getPayroll,
} from '@/api/approval/approval_data.api';
import type {
    VacationTypeResponseDTO,
    WorkSystemTypeResponseDTO,
    ResignTypeResponseDTO,
    BeforePayrollResponseDTO,

} from '@/types/approval/approval_data.types';

export const useApprovalDataStore = defineStore('approvalData', {
    state: () => ({
        vacationTypes: [] as VacationTypeResponseDTO[],
        workSystemTypes: [] as WorkSystemTypeResponseDTO[],
        resignTypes: [] as ResignTypeResponseDTO[],
        payroll: {} as BeforePayrollResponseDTO,
    
    }),

    actions: {
        async fetchVacationTypes() {
            try {
                const data = await getVacationType();
                this.vacationTypes = data;
            } catch (error) {
                console.error('휴가 타입 조회 실패:', error);
            }
        },

        async fetchWorkSystemTypes() {
            try {
                const data = await getWorkSystemType();
                this.workSystemTypes = data;
                } catch (error) {
                console.error('근무제 템플릿 조회 실패:', error);
                }
        },

        async fetchResignTypes() {
            try {
                const data = await getResignType();
                this.resignTypes = data;
            } catch (error) {
                console.error('퇴직 사유 조회 실패:', error);
            }
        },

        async fetchPayroll() {
            try {
                const data = await getPayroll();
                this.payroll = data;
            } catch (error) {
                console.error('기존 기본급 조회 실패:', error);
            }
        }

    },

});