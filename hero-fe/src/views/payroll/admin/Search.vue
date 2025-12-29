<!-- 
 * <pre>
 * Vue Name : Search.vue
 * Description     : 사원 급여 조회(관리자)
 *
 * History
 *   2025/12/09 - 동근 최초 작성
 *   2025/12/28 - 동근 급여 조회 기능 추가
 * </pre>
 *
 * @module payroll-search
 * @author 동근
 * @version 1.0
-->
<template>
  <div class="pay-search-page">
    <section class="panel">
      <div class="filter-grid">
        <div class="field">
          <label class="field-label">급여월<span class="req">*</span></label>
          <input
            v-model="salaryMonth"
            class="field-input"
            placeholder="YYYY-MM (예: 2025-12)"
            @keyup.enter="onSearch"
          />
        </div>

        <div class="field">
            <label class="field-label">부서명</label>
              <input
            v-model="departmentKeyword"
            class="field-input"
            placeholder="부서명 검색"
            @keyup.enter="onSearch"
          />
        </div>

        <div class="field">
          <label class="field-label">사원명/사번</label>
          <input
            v-model="keyword"
            class="field-input"
            placeholder="사원명 또는 사번"
            @keyup.enter="onSearch"
          />
        </div>
      </div>

      <div class="field">
      <div class="filter-actions">
        <div class="left-meta">
                   <span class="total">
            총 {{ displayTotal }}건
          </span>
          <span v-if="errorMessage" class="error">{{ errorMessage }}</span>
        </div>


        <div class="right-actions">
          <button class="btn-primary" type="button" @click="onSearch" :disabled="loading">
            조회
          </button>
        </div>
      </div>
      </div>
    </section>

    <section class="panel">
      <table class="table">
        <thead>
          <tr class="table-header">
            <th>사번</th>
            <th>사원명</th>
            <th>부서</th>
            <th>직책</th>
            <th class="right">기본급</th>
            <th class="right">수당</th>
            <th class="right">공제</th>
            <th class="right">실수령액</th>
            <th>작업</th>
          </tr>
        </thead>

        <tbody class="table-body">
         <tr v-for="row in filteredRows" :key="row.payrollId">
            <td class="table-cell link" @click="openDetail(row.payrollId)">
              {{ row.employeeNumber }}
            </td>
            <td>{{ row.employeeName }}</td>
            <td>{{ row.departmentName }}</td>
            <td>{{ row.jobTitleName }}</td>
            <td class="right">{{ money(row.baseSalary) }}</td>
            <td class="right plus">+{{ money(row.allowanceTotal) }}</td>
            <td class="right minus">-{{ money(row.deductionTotal) }}</td>
            <td class="right">{{ money(row.netPay) }}</td>
            <td>
              <button class="btn-link" type="button" @click="openDetail(row.payrollId)">
                상세
              </button>
            </td>
          </tr>

         <tr v-if="!loading && filteredRows.length === 0">
            <td colspan="9" class="empty">조회 결과가 없습니다.</td>
          </tr>
        </tbody>
      </table>
      <div class="pager">
        <button
          class="pbtn"
          type="button"
          :disabled="loading || page <= 1"
          @click="goPage(page - 1)"
        >
          이전
        </button>

        <button
          v-for="p in pageNumbers"
          :key="p"
          class="pnum"
          type="button"
          :class="{ active: p === page }"
          :disabled="loading"
          @click="goPage(p)"
        >
          {{ p }}
        </button>

        <button
          class="pbtn"
          type="button"
          :disabled="loading || page >= (totalPages || 1)"
          @click="goPage(page + 1)"
        >
          다음
        </button>
      </div>
    </section>
    <Teleport to="body">
      <div v-if="detailOpen" class="modal-backdrop" @click.self="closeDetail">
        <div class="modal">
          <header class="modal-header">
            <h2>급여 상세</h2>
            <button class="modal-close" type="button" @click="closeDetail">✕</button>
          </header>

          <section class="modal-body" v-if="detail">
            <div class="detail-summary">
              <div class="detail-top">
                <div>
                  <p class="detail-name">
                    {{ detail.employeeName }}
                    <span class="detail-eno">({{ detail.employeeNumber }})</span>
                  </p>
                  <p class="detail-sub">
                    {{ detail.departmentName }} · {{ detail.jobTitleName }}
                  </p>
                </div>

                <div class="detail-meta">
                  <p>급여월: {{ detail.salaryMonth }}</p>
                  <p>상태: {{ detail.payrollStatus }}</p>
                </div>
              </div>

              <div class="detail-totals">
                <div class="total-card">
                  <span class="total-label">기본급</span>
                  <p class="total-value">{{ money(detail.baseSalary) }}</p>
                </div>
                <div class="total-card">
                  <span class="total-label">수당</span>
                  <p class="total-value plus">{{ money(detail.allowanceTotal) }}</p>
                </div>
                <div class="total-card">
                  <span class="total-label">공제</span>
                  <p class="total-value minus">{{ money(detail.deductionTotal) }}</p>
                </div>
                <div class="total-card">
                  <span class="total-label">실수령액</span>
                  <p class="total-value">{{ money(detail.netPay) }}</p>
                </div>
              </div>
            </div>

            <div class="detail-table">
              <table class="table">
                <thead>
                  <tr class="table-header">
                    <th>구분</th>
                    <th>항목</th>
                    <th class="right">금액</th>
                  </tr>
                </thead>
                <tbody class="table-body">
                  <tr v-for="it in detail.items" :key="it.payrollItemId">
                    <td>{{ itemTypeLabel(it.itemType) }}</td>
                    <td>{{ it.itemName }}</td>
                    <td class="right">{{ money(it.amount) }}</td>
                  </tr>
                  <tr v-if="detail.items.length === 0">
                    <td colspan="3" class="empty">항목이 없습니다.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <footer class="modal-footer">
            <button class="btn-secondary" type="button" @click="closeDetail">닫기</button>
          </footer>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { usePayrollPaymentStore } from '@/stores/payroll/payrollPaymentStore';

const store = usePayrollPaymentStore();
const {
  loading,
  errorMessage,

  salaryMonth,
  keyword,

  page,
  totalElements,
  totalPages,

  rows,

  detailOpen,
  detail,
} = storeToRefs(store);

const { search, goPage, openDetail, closeDetail } = store;

const departmentKeyword = ref<string>('');

const filteredRows = computed(() => {
  const kw = departmentKeyword.value.trim().toLowerCase();
  if (!kw) return rows.value;
  return rows.value.filter((r) => (r.departmentName ?? '').toLowerCase().includes(kw));
});

// pagination numbers (1..totalPages)
const pageNumbers = computed(() => {
  const tp = totalPages.value || 1;
  const pages: number[] = [];
  for (let i = 1; i <= tp; i++) pages.push(i);
  return pages;
});

const displayTotal = computed(() => {
  return departmentKeyword.value.trim()
    ? filteredRows.value.length
    : totalElements.value;
});
const money = (v: number) => `₩${(v ?? 0).toLocaleString()}`;

const itemTypeLabel = (t?: string) => {
  switch ((t ?? '').toUpperCase()) {
    case 'ALLOWANCE':
      return '수당';
    case 'DEDUCTION':
      return '공제';
    default:
      return t ?? '-';
  }
};

async function onSearch() {
  page.value = 1;
  await search();
}
</script>

<style scoped>
.pay-search-page {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.panel {
  background-color: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  padding: 16px 0px;
}

.field{
  padding: 0 20px;
}
.filter-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.field-label {
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
  display: block;
  margin-bottom: 6px;
}

.req {
  margin-left: 4px;
  color: #b91c1c;
}

.field-input {
  width: 100%;
  height: 38px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  padding: 0 12px;
  font-size: 13px;
  background: #fff;
}

.filter-actions {
  margin-top: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.left-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.total {
  font-size: 13px;
  color: #155dfc;
}

.error {
  font-size: 12px;
  color: #b91c1c;
}

.right-actions {
  display: flex;
  gap: 8px;
}
.btn-primary,
.btn-secondary {
  border-radius: 999px;
  font-size: 13px;
  padding: 8px 16px;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: white;
}

.btn-secondary {
  background-color: #eef2ff;
  color: #374151;
}

.btn-link {
  padding: 0;
  border: none;
  background: none;
  color: #2563eb;
  font-size: 13px;
  cursor: pointer;
  text-decoration: underline;
}

.btn-lite:disabled,
.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 6px;
  font-size: 13px;
}

.table-header {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: white;
}

.table th,
.table td {
  text-align: left;
  padding: 12px 16px;
}

.table-body tr:nth-child(2n) {
  background-color: #e2e8f0;
}

.table-cell {
  color: #155dfc;
}

.link {
  cursor: pointer;
}

.right {
  text-align: right;
}

.plus {
  color: #16a34a;
}

.minus {
  color: #b91c1c;
}

.empty {
  text-align: center;
  padding: 22px 0;
  color: #6b7280;
}

.pager {
  padding: 12px;
  display: flex;
  justify-content: center;
  gap: 6px;
}

.pbtn,
.pnum {
  height: 30px;
  min-width: 32px;
  padding: 0 10px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #334155;
  cursor: pointer;
  font-size: 12px;
  font-weight: 800;
}

.pnum.active {
  background: #2855ff;
  color: #fff;
  border-color: #2855ff;
}

.pbtn:disabled,
.pnum:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 40;
}

.modal {
  background-color: #ffffff;
  border-radius: 16px;
  width: 760px;
  max-width: calc(100vw - 40px);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  padding: 14px 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
}

.modal-body {
  padding: 16px 20px;
  overflow-y: auto;
}

.modal-footer {
  padding: 12px 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.detail-summary {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 14px;
}

.detail-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.detail-name {
  font-size: 15px;
  font-weight: 700;
  margin: 0;
}

.detail-eno {
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  margin-left: 6px;
}

.detail-sub {
  margin: 4px 0 0;
  font-size: 13px;
  color: #6b7280;
}

.detail-meta {
  font-size: 12px;
  color: #6b7280;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-totals {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.total-card {
  background-color: #f9fafb;
  border-radius: 12px;
  padding: 10px 12px;
}

.total-label {
  font-size: 12px;
  color: #6b7280;
}

.total-value {
  margin: 6px 0 0;
  font-weight: 700;
  font-size: 14px;
}

@media (max-width: 1100px) {
  .filter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .detail-totals {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>