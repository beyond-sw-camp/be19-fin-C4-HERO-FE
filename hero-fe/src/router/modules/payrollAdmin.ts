/**
 * <pre>
 * TypeScript Name   : payrollAdmin.ts
 * Description : 급여(Payroll) 도메인의 라우트 설정 파일
 * 
 *
 * History
 * 2025/12/09 - 동근 최초 작성 (vue-router 라우트 구성 [내 급여, 내 급여 이력])
 * </pre>
 *
 * @module payrollAdmin-routes
 * @author 동근
 * @version 1.0
 */
import type { RouteRecordRaw } from "vue-router";

/**
 * 급여 도메인 라우트 설정 (관리자용)
 * @module payroll-admin
 * @see /views/payroll/admin/Index.vue  급여 대시보드(관리자)
 * @see /views/payroll/admin/batch/Batch.vue  월별 급여 배치
 * @see /views/payroll/admin/Adjust.vue  급여 조정
 * @see /views/payroll/admin/Search.vue  사원 급여 조회(검색)
 * @see /views/payroll/admin/PaymentHistory.vue  급여 지급 이력
 * @see /views/payroll/admin/items/Items.vue  급여 항목 관리
 * @see /views/payroll/admin/Report.vue  급여 보고서
 * @see /views/payroll/admin/Policy.vue  급여 정책/설정 관리
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
        meta: { title: "사원 급여 조회(검색)" },
    },
    {
        path: "/payroll/admin/payment-history",
        name: "PayrollAdminPaymentHistory",
        component: () => import("@/views/payroll/admin/PaymentHistory.vue"),
        meta: { title: "급여 지급 이력" },
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
    {
        path: "/payroll/admin/policy",
        name: "PayrollAdminPolicy",
        component: () => import("@/views/payroll/admin/Policy.vue"),
        meta: { title: "급여 정책/설정 관리" },
    },
];

export default payrollAdminRoutes;
