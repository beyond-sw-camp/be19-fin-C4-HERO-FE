<!--
 * <pre>
 * Vue Name        : Index.vue
 * Description     : 사원용 내 급여 메인 화면
 *
 * 기능
 *  - 급여월 선택 및 내 급여 요약 조회
 *  - 지급/공제 내역 상세 표시
 *  - 근로 정보(근무일수/근무시간/초과근무) 표시
 *  - 지급 정보(지급 계좌 + 급여일) 표시
 *  - 급여 명세서 모달 / PDF 다운로드
 *  - 지급 계좌 관리 모달 연동
 *
 * History
 *   2025/12/09 - 동근 최초 작성
 * </pre>
 *
 * @module payroll-main
 * @author 동근
 * @version 1.0
 -->

<template>
  <div class="payroll-page">
    <!-- 헤더영역(급여월 선택 + 명세서 버튼) -->
    <header class="payroll-header">
      <div class="payroll-header__right">
        <select
          v-model="selectedMonth"
          class="month-select"
          @change="onChangeMonth"
        >
          <option v-for="m in monthOptions" :key="m.value" :value="m.value">
            {{ m.label }}
          </option>
        </select>

        <div class="payroll-header__buttons">
          <button class="btn-secondary" @click="openPayslip">
            상세 보기
          </button>
          <button class="btn-primary" @click="downloadPayslipPdf">
            명세서 다운로드
          </button>
        </div>
      </div>
    </header>

    <!-- 급여 데이터 없음 / 에러 상태 -->
    <section
      v-if="!summary && !store.loading"
      class="empty-state"
    >
      <p class="empty-title">해당 월 급여 데이터가 없습니다.</p>
      <p class="empty-desc">
        선택하신 월에는 급여 내역이 존재하지 않습니다.
      </p>
    </section>

    <!-- 지급 / 공제 내역 -->
    <section v-if="summary" class="pay-detail">
      <!-- 지급 내역 -->
      <div class="pay-panel pay-panel--left">
        <h2 class="panel-title">지급 내역</h2>
        <div class="pay-list">
          <div class="pay-row">
            <span class="pay-name">기본급</span>
            <span class="pay-amount">{{ formatMoney(summary.basesalary) }}</span>
          </div>
          <!-- 수당 항목 -->
          <div
            v-for="item in summary.allowances"
            :key="item.name"
            class="pay-row pay-row--allowance"
          >
            <span class="pay-name">{{ item.name }}</span>
            <span class="pay-amount pay-amount--plus">
              +{{ formatMoney(item.amount) }}
            </span>
          </div>
          <!-- 지급 총액 -->
          <div class="pay-row pay-row--total">
            <span class="pay-name">지급 총액</span>
            <span class="pay-amount">{{ formatMoney(summary.grossPay) }}</span>
          </div>
        </div>
      </div>

      <!-- 공제 내역 -->
      <div class="pay-panel pay-panel--right">
        <h2 class="panel-title">공제 내역</h2>
        <div class="pay-list">
          <div
            v-for="item in summary.deductions"
            :key="item.name"
            class="pay-row pay-row--deduction"
          >
            <span class="pay-name">{{ item.name }}</span>
            <span class="pay-amount pay-amount--minus">
              -{{ formatMoney(item.amount) }}
            </span>
          </div>
          <div class="pay-row pay-row--total pay-row--deduction-total">
            <span class="pay-name">공제 총액</span>
            <span class="pay-amount">
              {{ formatMoney(summary.totalDeduction) }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- 근무 정보 -->
    <section v-if="summary" class="work-info">
      <h2 class="panel-title">근로 정보</h2>
      <div class="work-grid">
        <div class="work-card">
          <p class="work-label">근무 일수</p>
          <p class="work-value">{{ summary.workDays }}일</p>
        </div>
        <div class="work-card">
          <p class="work-label">근무 시간</p>
          <p class="work-value">{{ summary.workHours }}시간</p>
        </div>
        <div class="work-card">
          <p class="work-label">초과 근무</p>
          <p class="work-value">{{ summary.overtimeHours }}시간</p>
        </div>
      </div>
      <p
        v-if="
          summary.workDays === 0 &&
          summary.workHours === 0 &&
          summary.overtimeHours === 0
        "
        class="work-empty-note"
      >
        해당 월은 근로 시간이 집계되지 않았습니다.
        (포괄임금제 또는 비근무월일 수 있습니다)
      </p>
    </section>

    <!-- 지급 정보 (계좌 + 급여일) -->
    <section v-if="summary" class="pay-meta">
      <div class="pay-meta-card pay-meta-card--full">
        <h2 class="panel-title">지급 정보</h2>

        <!-- 지급 계좌 -->
        <div class="pay-meta-row">
          <p class="pay-meta-label">지급 계좌</p>
          <div class="pay-meta-value">
            <p>은행명 : {{ summary.bankName }}</p>
            <p>계좌번호 : {{ summary.bankAccountNumber }}</p>
            <p>예금주 : {{ summary.accountHolder }}</p>
          </div>
          <button class="btn-link" @click="openAccountModal">
            계좌 관리하기
          </button>
        </div>

        <!-- 급여일 -->
        <div class="pay-meta-row">
          <p class="pay-meta-label">급여일</p>
          <p class="pay-meta-value">
            {{ summary.payDayLabel }}
          </p>
        </div>
      </div>
    </section>

    <!-- 명세서 모달 -->
    <PayslipModal
      v-model:open="payslipModalOpen"
      :payslip="payslip"
      :month="selectedMonth"
      :auto-download-key="autoDownloadKey"
    />

    <!-- 계좌 관리 모달 -->
    <AccountModal
      v-model:open="accountModalOpen"
      :accounts="bankAccounts"
      :summary="summary"
      :selected-month="selectedMonth"
      @saved="onAccountSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { usePayrollStore } from '@/stores/payroll/payrollMeStore';
import AccountModal from '@/views/payroll/me/BankAccountModal.vue';
import PayslipModal from '@/views/payroll/me/PayslipModal.vue';

// 급여 도메인 Pinia Store (summary, payslip, accounts 등 상태 및 API 호출 제공)
const store = usePayrollStore();

/**
 * payslipModalOpen - 급여 명세서 모달
 * accountModalOpen - 계좌 관리 모달
 */
const payslipModalOpen = ref(false);
const accountModalOpen = ref(false);

// 요약, 명세서, 계좌 데이터
const summary = computed(() => store.summary);
const payslip = computed(() => store.payslip);
const bankAccounts = computed(() => store.accounts);

// 급여월 선택 옵션 (최근 12개월)
const monthOptions = computed(() => {
  const now = new Date();
  const arr: { value: string; label: string }[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const ymVal = `${d.getFullYear()}-${String(
      d.getMonth() + 1
    ).padStart(2, '0')}`;
    arr.push({
      value: ymVal,
      label: `${d.getFullYear()}년 ${d.getMonth() + 1}월`
    });
  }
  return arr;
});

const selectedMonth = ref<string>('');
// 명세서 모달 내부에서 자동 PDF 다운로드 트리거 키
const autoDownloadKey = ref(0);

// 초기 진입 시 내 급여 데이터 로드
onMounted(async () => {
  await store.loadMyPayroll();
  if (store.summary) {
    selectedMonth.value = store.summary.salaryMonth;
  } else {
    selectedMonth.value = monthOptions.value[0].value;
  }
});

// 급여월 변경 시 해당 월의 내 급여 정보 재조회
const onChangeMonth = () => {
  store.loadMyPayroll(selectedMonth.value);
};

const openPayslip = async () => {
  if (!selectedMonth.value) return;
  await store.loadPayslip(selectedMonth.value);
  payslipModalOpen.value = true;
};

// 헤더 명세서 다운로드 클릭 시 명세서 로드 + 모달 열고 자동 다운로드 트리거
const downloadPayslipPdf = async () => {
  if (!selectedMonth.value) {
    if (summary.value) {
      selectedMonth.value = summary.value.salaryMonth;
    } else {
      return;
    }
  }

  if (!payslip.value) {
    await store.loadPayslip(selectedMonth.value);
  }

  payslipModalOpen.value = true;
  autoDownloadKey.value++;
};

//  계좌 모달 열기
const openAccountModal = async () => {
  await store.loadMyBankAccounts();
  accountModalOpen.value = true;
};

// 계좌 저장 후 처리
const onAccountSaved = async () => {
  if (selectedMonth.value) {
    await store.loadMyPayroll(selectedMonth.value);
  } else {
    await store.loadMyPayroll();
  }
};

// 금액 포맷 (₩표기 + 3자리 끊어서)
const formatMoney = (value: number) => `₩${value.toLocaleString()}`;
</script>

<style scoped>
.payroll-page {
  padding:24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.payroll-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.payroll-header__right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.month-select {
  border-radius: 999px;
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  font-size: 13px;
}

.payroll-header__buttons {
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
  background: linear-gradient(135deg, #06336f, #123c9c);
  color: white;
}

.btn-secondary {
  background-color: #eef2ff;
  color: #374151;
}

.pay-detail {
  display: grid;
  grid-template-columns: 1.4fr 1.1fr;
  gap: 16px;
}

.pay-panel {
  background-color: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  padding: 16px 20px;
}

.panel-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
}

.pay-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pay-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.pay-row--allowance .pay-name {
  color: #16a34a;
}

.pay-row--deduction .pay-name {
  color: #b91c1c;
}

.pay-row--total {
  border-top: 1px dashed #e5e7eb;
  margin-top: 6px;
  padding-top: 8px;
  font-weight: 600;
}

.pay-row--deduction-total {
  background-color: #fff7ed;
  border-radius: 8px;
  padding: 8px 10px;
}

.pay-amount--plus {
  color: #16a34a;
}

.pay-amount--minus {
  color: #b91c1c;
}

.work-info {
  background-color: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  padding: 16px 20px;
}

.work-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 10px;
}

.work-card {
  background-color: #f9fafb;
  border-radius: 12px;
  padding: 12px 14px;
}

.work-label {
  font-size: 12px;
  color: #6b7280;
}

.work-value {
  margin-top: 4px;
  font-weight: 600;
}

.work-empty-note {
  margin-top: 12px;
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.4;
}

.pay-meta {
  display: block;
  gap: 16px;
}

.pay-meta-card {
  background-color: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  padding: 16px 20px;
}

.pay-meta-card--full {
  width: 100%;
  padding: 20px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
}

.pay-meta-row {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.pay-meta-row:last-child {
  border-bottom: none;
}

.pay-meta-label {
  font-weight: 600;
  color: #555;
  width: 120px;
}

.pay-meta-value p {
  margin: 0;
  line-height: 1.4;
}

.btn-link {
  margin-left: auto;
  padding: 0;
  border: none;
  background: none;
  color: #2563eb;
  font-size: 13px;
  cursor: pointer;
  text-decoration: underline;
}
</style>
