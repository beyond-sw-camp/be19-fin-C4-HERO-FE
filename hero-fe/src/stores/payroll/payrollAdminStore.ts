/**
 * <pre>
 * TypeScript Name : payrollAdminStore.ts
 * Description     : 급여(Payroll) 관리자용 Pinia Store - 배치 관리
 *
 * History
 *   2025/12/09 - 동근 최초 작성 (급여 관련 API 연동 + Pinia 상태 관리 구성)
 *   2025/12/15 - 동근 배치 화면 연동 스토어 추가
 * </pre>
 *
 * @module payroll-store
 * @author 동근
 * @version 1.1
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { payrollAdminApi } from '@/api/payroll/payroll.admin';
import type {
    PayrollBatchDetailResponse,
    PayrollBatchListResponse,
    PayrollEmployeeResultResponse,
    PayrollBatchStatus,
    PayrollBatchTargetEmployee,
} from '@/types/payroll/payroll.admin';

export const usePayrollAdminStore = defineStore('payrollAdminStore', () => {
    const loading = ref(false);
    const errorMessage = ref<string | null>(null);

    const batches = ref<PayrollBatchListResponse[]>([]);
    const selectedBatchId = ref<number | null>(null);

    const batchDetail = ref<PayrollBatchDetailResponse | null>(null);
    const employees = ref<PayrollEmployeeResultResponse[]>([]);
    const targets = ref<PayrollBatchTargetEmployee[]>([]);

    const selectedBatch = computed(() =>
        selectedBatchId.value == null
            ? null
            : batches.value.find(b => b.batchId === selectedBatchId.value) ?? null
    );

    const resetError = () => (errorMessage.value = null);

    /* =========================
     * 조회
     * ========================= */
    async function loadBatches(filter?: { month?: string; status?: PayrollBatchStatus | '' }) {
        loading.value = true;
        resetError();
        try {
            batches.value = await payrollAdminApi.listBatches(filter);
        } catch (e: any) {
            errorMessage.value = e?.response?.data?.message ?? e?.message ?? '배치 목록 조회 실패';
            throw e;
        } finally {
            loading.value = false;
        }
    }

    async function selectBatch(batchId: number) {
        selectedBatchId.value = batchId;
        await Promise.all([
            loadBatchDetail(batchId),
            loadBatchEmployees(batchId),
        ]);
    }

    async function loadBatchDetail(batchId: number) {
        loading.value = true;
        resetError();
        try {
            batchDetail.value = await payrollAdminApi.getBatchDetail(batchId);
        } catch (e: any) {
            errorMessage.value = e?.response?.data?.message ?? e?.message ?? '배치 상세 조회 실패';
            throw e;
        } finally {
            loading.value = false;
        }
    }

    async function loadBatchEmployees(batchId: number) {
        loading.value = true;
        resetError();
        try {
            employees.value = await payrollAdminApi.getBatchEmployees(batchId);
        } catch (e: any) {
            errorMessage.value = e?.response?.data?.message ?? e?.message ?? '배치 사원 결과 조회 실패';
            throw e;
        } finally {
            loading.value = false;
        }
    }

    /* =========================
     * 대상 사원 조회
     * ========================= */
    async function loadTargets() {
        loading.value = true;
        resetError();
        try {
            targets.value = await payrollAdminApi.listBatchTargets();
        } catch (e: any) {
            errorMessage.value =
                e?.response?.data?.message ?? e?.message ?? '대상 사원 조회 실패';
            throw e;
        } finally {
            loading.value = false;
        }
    }

    /* =========================
     * 배치 생성
     * ========================= */
    async function createBatch(month: string) {
        loading.value = true;
        resetError();
        try {
            const batchId = await payrollAdminApi.createBatch(month);
            await loadBatches();
            await selectBatch(batchId);
            return batchId;
        } catch (e: any) {
            errorMessage.value = e?.response?.data?.message ?? e?.message ?? '배치 생성 실패';
            throw e;
        } finally {
            loading.value = false;
        }
    }

    /* =========================
     * 급여 계산
     * ========================= */
    async function calculateSelectedBatch(employeeIds?: number[]) {
        if (!selectedBatchId.value) return;

        loading.value = true;
        resetError();
        try {
            let ids = employeeIds ?? [];

            // 화면에 결과가 있으면 우선 사용
            if (ids.length === 0 && employees.value.length > 0) {
                ids = employees.value.map(e => e.employeeId);
            }

            // 그래도 없으면 → 전체 대상자 조회
            if (ids.length === 0) {
                if (targets.value.length === 0) {
                    await loadTargets();
                }
                ids = targets.value.map(t => t.employeeId);
            }

            if (ids.length === 0) {
                throw new Error('계산 대상 사원이 없습니다.');
            }

            await payrollAdminApi.calculateBatch(selectedBatchId.value, ids);
            await selectBatch(selectedBatchId.value);

        } catch (e: any) {
            errorMessage.value =
                e?.response?.data?.message ?? e?.message ?? '급여 계산 실패';
            throw e;
        } finally {
            loading.value = false;
        }
    }

    async function confirmSelectedBatch() {
        if (!selectedBatchId.value) return;
        loading.value = true;
        resetError();
        try {
            await payrollAdminApi.confirmBatch(selectedBatchId.value);
            await selectBatch(selectedBatchId.value);
            await loadBatches();
        } catch (e: any) {
            errorMessage.value = e?.response?.data?.message ?? e?.message ?? '배치 확정 실패';
            throw e;
        } finally {
            loading.value = false;
        }
    }

    /* =========================
     * 
     * ========================= */
    return {
        loading,
        errorMessage,

        batches,
        selectedBatchId,
        selectedBatch,

        batchDetail,
        employees,
        targets,

        loadBatches,
        selectBatch,
        loadTargets,

        createBatch,
        calculateSelectedBatch,
        confirmSelectedBatch,
    };
});
