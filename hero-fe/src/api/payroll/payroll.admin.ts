/**
 * TypeScript Name   : payroll.admin.ts
 * Description : 급여(Payroll) 관리자용 API 호출 모듈
 *               - 급여 대시보드
 *               - 월별 급여 배치
 *               - 수당 / 공제 항목 관리(CRUD)
 *               - 급여 조정
 *               - 사원 급여 조회
 *               - 급여 명세서 관리 (명세서 리스트)
 *               - 급여 지급 이력
 *               - 급여 보고서
 *               - 급여 설정
 * History
 * 2025/12/12 - 동근 최초 작성
 * 2025/12/15 - 동근 배치 API 연동 추가
 * </pre>
 *
 * @author 동근
 * @version 1.1
 */
import client from '@/api/apiClient';

import type {
    PayrollBatchDetailResponse,
    PayrollBatchListResponse,
    PayrollEmployeeResultResponse,
    PayrollBatchStatus,
    PayrollBatchTargetEmployee
} from '@/types/payroll/payroll.admin';

const BASE = '/admin/payroll/batches';

export const payrollAdminApi = {
    // GET /api/admin/payroll/batches?month=&status=
    async listBatches(params?: { month?: string; status?: PayrollBatchStatus | '' }) {
        const res = await client.get<PayrollBatchListResponse[]>(BASE, { params });
        return res.data;
    },

    // GET /api/admin/payroll/batches/{batchId}
    async getBatchDetail(batchId: number) {
        const res = await client.get<PayrollBatchDetailResponse>(`${BASE}/${batchId}`);
        return res.data;
    },

    // GET /api/admin/payroll/batches/{batchId}/employees
    async getBatchEmployees(batchId: number) {
        const res = await client.get<PayrollEmployeeResultResponse[]>(`${BASE}/${batchId}/employees`);
        return res.data;
    },

    // POST /api/admin/payroll/batches?month=YYYY-MM
    async createBatch(month: string) {
        const res = await client.post<number>(BASE, null, { params: { month } });
        return res.data; // batchId
    },

    /**
     *  전체 계산
     * - body 없이 호출하면 서버가 targets(재직자) 기준으로 전체 계산
     * POST /api/admin/payroll/batches/{batchId}/calculate
     */
    async calculateBatchAll(batchId: number) {
        await client.post<void>(`${BASE}/${batchId}/calculate`);
    },

    /**
     * 선택 계산
     * - employeeIds만 계산
     * POST /api/admin/payroll/batches/{batchId}/calculate  body: [employeeIds]
     */
    async calculateBatchSelected(batchId: number, employeeIds: number[]) {
        await client.post<void>(`${BASE}/${batchId}/calculate`, employeeIds);
    },

    // POST /api/admin/payroll/batches/{batchId}/confirm
    async confirmBatch(batchId: number) {
        await client.post<void>(`${BASE}/${batchId}/confirm`);
    },

    async listBatchTargets() {
        const res = await client.get<PayrollBatchTargetEmployee[]>(
            '/admin/payroll/batches/targets'
        );
        return res.data;
    },

    // POST /api/admin/payroll/batches/{batchId}/pay
    async payBatch(batchId: number) {
        await client.post<void>(`${BASE}/${batchId}/pay`);
    }
};