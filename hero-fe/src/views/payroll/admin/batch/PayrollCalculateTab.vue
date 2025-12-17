<!--
 * <pre>
 * Vue Name        : PayrollCalculateTab.vue
 * Description     : 관리자 - 월별 급여 배치 계산 탭 컴포넌트
 *
 * 제약 / MVP 범위
 *  - 개별 사원 재계산 기능은 비활성(MVP 이후 확장 예정)
 *  - 페이지네이션은 UI만 제공하며 실제 페이징 로직은 추후 구현 예정입니다.
 *
 * 컴포넌트 연계
 *  - PayrollAdminStore : 선택된 배치, 사원 급여 결과, 계산 실행 상태 관리
 *  - BatchPage.vue : 탭 전환 및 상위 플로우 제어
 *
 * History
 *   2025/12/15 - 동근 최초 작성
 * </pre>
 *
 * @module payroll-admin-batch-calculate-tab
 * @author 동근
 * @version 1.0
 -->
<template>
  <section class="panel">
    <header class="panel-head">
      <div class="left">
        <select class="select" disabled>
          <option v-if="store.batchDetail">
            {{ store.batchDetail.salaryMonth }}
          </option>
          <option v-else>배치를 먼저 선택하세요</option>
        </select>

        <button
          class="btn-primary"
          type="button"
          :disabled="!canCalculateSelected"
          title="선택된 사원만 계산"
          @click="runSelectedCalculate"
        >
          ▶ 선택 사원 계산
        </button>

        <button
          class="btn-secondary"
          type="button"
          :disabled="!canCalculateAll"
          :title="calculateDisabledReason"
          @click="runAllCalculate"
        >
          ▶ 전체 계산
        </button>

        <span v-if="isConfirmed" class="lock-hint">
          확정된 배치는 재계산할 수 없습니다.
        </span>
      </div>

      <button class="btn-secondary" type="button" disabled title="추후">
        시뮬레이션
      </button>
    </header>

    <div class="table-wrap">
      <table>
        <thead>
          <tr class="thead">
            <th>
              <input
                type="checkbox"
                :disabled="isConfirmed || store.employees.length === 0"
                :checked="isAllChecked"
                @change="toggleAll"
              />
            </th>
            <th>사원명</th>
            <th>부서</th>
            <th>기본급</th>
            <th>수당</th>
            <th>공제</th>
            <th>실수령액</th>
            <th>상태</th>
            <th>작업</th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="!store.selectedBatchId" class="empty">
            <td colspan="9">배치를 먼저 선택해주세요. (배치 탭에서 선택)</td>
          </tr>

          <tr v-else-if="store.loading" class="empty">
            <td colspan="9">로딩 중…</td>
          </tr>

          <tr v-else-if="store.employees.length === 0" class="empty">
            <td colspan="9">대상 사원이 없습니다.</td>
          </tr>

          <tr
            v-else
            v-for="e in store.employees"
            :key="e.payrollId"
          >
            <td>
              <input
                type="checkbox"
                :value="e.employeeId"
                v-model="selectedIds"
                :disabled="isConfirmed || e.status === 'CONFIRMED'"
              />
            </td>

            <td>{{ e.employeeName }}</td>
            <td>{{ e.departmentName ?? '-' }}</td>
            <td>{{ formatMoney(e.baseSalary) }}</td>
            <td>{{ formatMoney(e.allowanceTotal) }}</td>
            <td>{{ formatMoney(e.deductionTotal) }}</td>
            <td>{{ formatMoney(e.totalPay) }}</td>

            <td>
              <span :class="['badge', badgeClass(e.status)]">
                {{ statusLabel(e.status) }}
              </span>
            </td>

            <td>
              <button
                v-if="e.status === 'FAILED'"
                class="mini-btn danger"
                type="button"
                @click="openError(e)"
              >
                오류 보기
              </button>

              <button
                v-else
                class="mini-btn"
                disabled
                title="추후(개별 재계산)"
              >
                재계산
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="store.errorMessage" class="error">{{ store.errorMessage }}</p>

    <PayrollErrorModal
      v-model="errorOpen"
      title="계산/검증 실패"
      :employee-name="errorTarget?.employeeName"
      :department-name="errorTarget?.departmentName ?? null"
      :salary-month="errorTarget?.salaryMonth"
      :message="errorTarget?.errorMessage ?? null"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { usePayrollAdminStore } from '@/stores/payroll/payrollAdminStore';
import type { PayrollEmployeeResultResponse, PayrollStatus } from '@/types/payroll/payroll.admin';
import PayrollErrorModal from './PayrollErrorModal.vue';

const store = usePayrollAdminStore();
const selectedIds = ref<number[]>([]);
const errorOpen = ref(false);
const errorTarget = ref<PayrollEmployeeResultResponse | null>(null);

const isConfirmed = computed(() => store.batchDetail?.status === 'CONFIRMED');

const isAllChecked = computed(() =>
  store.employees.length > 0 &&
  selectedIds.value.length === selectableEmployeeIds.value.length
);

const selectableEmployeeIds = computed(() =>
  store.employees
    .filter(e => e.status !== 'CONFIRMED')
    .map(e => e.employeeId)
);

const toggleAll = () => {
  if (isAllChecked.value) {
    selectedIds.value = [];
  } else {
    selectedIds.value = [...selectableEmployeeIds.value];
  }
};

const canCalculateSelected = computed(() => {
  if (isConfirmed.value) return false;
  if (store.loading) return false;
  return selectedIds.value.length > 0;
});

const canCalculateAll = computed(() => {
  if (!store.selectedBatchId) return false;
  if (store.loading) return false;
  if (isConfirmed.value) return false;
  return true;
});

const calculateDisabledReason = computed(() => {
  if (!store.selectedBatchId) return '배치를 먼저 선택하세요';
  if (store.loading) return '처리 중입니다';
  if (isConfirmed.value) return '확정된 배치는 재계산할 수 없습니다';
  return '';
});

const runSelectedCalculate = async () => {
  if (!canCalculateSelected.value) return;
  await store.calculateSelectedBatch(selectedIds.value);
  selectedIds.value = [];
};

const runAllCalculate = async () => {
  if (!canCalculateAll.value) return;
  await store.calculateSelectedBatch();
};

const openError = (e: PayrollEmployeeResultResponse) => {
  errorTarget.value = e;
  errorOpen.value = true;
};

const formatMoney = (n: number) => `${n.toLocaleString()}원`;

const statusLabel = (s: PayrollStatus) => {
  switch (s) {
    case 'READY': return '대기';
    case 'CALCULATED': return '계산완료';
    case 'FAILED': return '실패';
    case 'CONFIRMED': return '확정';
    default: return s;
  }
};

const badgeClass = (s: PayrollStatus) => {
  switch (s) {
    case 'CALCULATED': return 'ok';
    case 'FAILED': return 'danger';
    case 'CONFIRMED': return 'confirm';
    default: return 'wait';
  }
};
</script>

<style scoped>
.panel {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 16px;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.lock-hint {
  font-size: 12px;
  color: #991b1b;
  background: #fef2f2;
  border: 1px solid #fecaca;
  padding: 6px 10px;
  border-radius: 999px;
}

.select {
  border-radius: 999px;
  padding: 7px 12px;
  border: 1px solid #d1d5db;
  font-size: 13px;
  background: #fff;
}

.table-wrap {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.thead {
  background: #162456;
  color: #ffffff;
}

th, td {
  padding: 12px 14px;
  text-align: left;
}

.empty td {
  color: #6b7280;
  background: #f8fafc;
}

.btn-primary,
.btn-secondary {
  border-radius: 999px;
  font-size: 13px;
  padding: 8px 14px;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(135deg, #06336f, #123c9c);
  color: white;
}

.btn-secondary {
  background-color: #eef2ff;
  color: #374151;
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pager {
  margin-top: 14px;
  display: flex;
  justify-content: center;
  gap: 6px;
}

.pager-btn {
  border: 1px solid #e5e7eb;
  background: #fff;
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
}

.pager-btn.active {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
}

.pager-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.badge {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
  border: 1px solid #e5e7eb;
  background: #f8fafc;
  color: #334155;
}

.badge.ok {
  background: #ecfeff;
  border-color: #a5f3fc;
  color: #155e75;
}

.badge.danger {
  background: #fef2f2;
  border-color: #fecaca;
  color: #991b1b;
}

.badge.confirm {
  background: #eef2ff;
  border-color: #c7d2fe;
  color: #1e3a8a;
}

.badge.wait {
  background: #f8fafc;
  border-color: #e5e7eb;
  color: #475569;
}

.mini-btn {
  border-radius: 999px;
  font-size: 12px;
  padding: 6px 10px;
  border: 1px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
}

.mini-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.mini-btn.danger {
  border-color: #fecaca;
  background: #fef2f2;
  color: #991b1b;
  font-weight: 800;
}

.error {
  margin-top: 10px;
  color: #dc2626;
  font-size: 13px;
}
</style>
