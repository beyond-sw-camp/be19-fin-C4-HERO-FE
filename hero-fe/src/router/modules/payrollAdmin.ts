/**
 * <pre>
 * TypeScript Name   : payrollAdmin.ts
 * Description : 급여(Payroll) 도메인의 라우트 설정 파일
 * 
 *
 * History
 * 2025/12/09 - 동근 최초 작성
 * 2025/12/26 - 동근 급여 관리 사이드바 항목 반영
 * </pre>
 *
 * @module payrollAdmin-routes
 * @author 동근
 * @version 1.1
 */
import type { RouteRecordRaw } from "vue-router";

/**
 * 급여 도메인 라우트 설정 (관리자용)
 * @module payroll-admin
 * @see /views/payroll/admin/Index.vue  급여 대시보드(관리자)
 * @see /views/payroll/admin/batch/Batch.vue  월별 급여 배치
 * @see /views/payroll/admin/Adjust.vue  급여 조정
 * @see /views/payroll/admin/Search.vue  급여 조회
 * @see /views/payroll/admin/items/Items.vue  급여 항목 관리
 * @see /views/payroll/admin/Report.vue  급여 보고서
 */
const payrollAdminRoutes: RouteRecordRaw[] = [
    {
        path: "/payroll/admin",
        name: "PayrollAdmin",
        component: () => import("@/views/payroll/admin/Index.vue"),
        meta: { title: "급여 대시보드" },
    },
    {
        path: "/payroll/admin/batch",
        name: "PayrollAdminBatch",
        component: () => import("@/views/payroll/admin/batch/BatchPage.vue"),
        meta: { title: "월별 급여 배치" },
    },
    {
        path: "/payroll/admin/adjust",
        name: "PayrollAdminAdjust",
        component: () => import("@/views/payroll/admin/Adjust.vue"),
        meta: { title: "급여 조정" },
    },
    {
        path: "/payroll/admin/search",
        name: "PayrollAdminSearch",
        component: () => import("@/views/payroll/admin/Search.vue"),
        meta: { title: "급여 조회(검색)" },
    },
    {
        path: "/payroll/admin/items",
        name: "PayrollAdminItems",
        component: () => import("@/views/payroll/admin/items/Items.vue"),
        meta: { title: "급여 항목 관리" },
    },
    {
        path: "/payroll/admin/report",
        name: "PayrollAdminReport",
        component: () => import("@/views/payroll/admin/Report.vue"),
        meta: { title: "급여 보고서" },
    },
];

export default payrollAdminRoutes;
