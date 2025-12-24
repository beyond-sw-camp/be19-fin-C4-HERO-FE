<!--
 * <pre>
 * Vue Name        : History.vue
 * Description     : 사원의 내 급여 이력 화면
 *
 * 기능
 *  - 최근 12개월 급여 요약 지표
 *  - 월별 실수령액 추이 라인 차트
 *  - 급여 내역(기본급/수당/공제/실수령액) 테이블 조회
 *
 * History
 *   2025/12/09 - 동근 최초 작성
 * </pre>
 *
 * @module payroll-history
 * @author 동근
 * @version 1.0
-->
<template>
  <div class="pay-history-page">
    <!-- 요약 카드 -->
    <section v-if="history" class="history-cards">
      <div class="summary-card">
        <span class="summary-label">평균 실수령액</span>
        <p class="summary-value">{{ formatMoney(history.avgNetPay) }}</p>
      </div>
      <div class="summary-card">
        <span class="summary-label">최고 실수령액</span>
        <p class="summary-value">{{ formatMoney(history.maxNetPay) }}</p>
      </div>
      <div class="summary-card">
        <span class="summary-label">최저 실수령액</span>
        <p class="summary-value">{{ formatMoney(history.minNetPay) }}</p>
      </div>
      <div class="summary-card">
        <span class="summary-label">전월 대비 변화율</span>
        <p
          class="summary-value"
          :class="history.monthOverMonthRate >= 0 ? 'rate-up' : 'rate-down'"
        >
          <span v-if="history.monthOverMonthRate >= 0">▲</span>
          <span v-else>▼</span>
          {{ history.monthOverMonthRate }}%
        </p>
      </div>

      <!-- 올해 누적 실수령액 -->
      <div class="summary-card">
        <span class="summary-label">올해 누적 실수령액</span>
        <p class="summary-value">{{ formatMoney(history.ytdNetPay) }}</p>
      </div>
    </section>

    <!-- 차트 -->
    <section v-if="history" class="history-chart">
      <h2 class="panel-title">급여 추이</h2>
      <BaseLineChart
        :labels="chartLabels"
        :data="chartData"
        tooltip-label-prefix="실수령액: "
        :currency="true"
      />
    </section>

    <!-- 테이블 표 -->
    <section v-if="history" class="history-table">
      <h2 class="panel-title">급여 이력</h2>

      <table>
        <thead>
          <tr class="table-header">
            <th>급여월</th>
            <th>기본급</th>
            <th>수당</th>
            <th>공제</th>
            <th>실수령액</th>
          </tr>
        </thead>
        <tbody class="table-body">
          <tr v-for="row in history.rows" :key="row.salaryMonth">
            <td class="table-cell">{{ row.salaryMonth }}</td>
            <td>{{ formatMoney(row.baseSalary) }}</td>
            <td class="plus">+{{ formatMoney(row.allowanceTotal) }}</td>
            <td class="minus">-{{ formatMoney(row.deductionTotal) }}</td>
            <td>{{ formatMoney(row.netPay) }}</td>
          </tr>
        </tbody>
      </table>

      <p class="history-note">
        <br />
        · 급여 이력은 최근 12개월까지 조회 가능합니다. <br />
        · 상세 내역은 각 월의 급여명세서에서 확인하실 수 있습니다.
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { usePayrollStore } from '@/stores/payroll/payrollMeStore';
import BaseLineChart from '@/components/charts/BaseLineChart.vue';

// store : loadHistory() -> API 호출
const store = usePayrollStore();
const history = computed(() => store.history);

// 컴포넌트 mount 시 급여 이력 데이터 초기 로딩
onMounted(async () => {
  await store.loadHistory();
});

// 차트용 라벨
const chartLabels = computed(() =>
  history.value ? history.value.chart.map((c) => c.salaryMonth) : []
);

// 차트용 실수령액 데이터
const chartData = computed(() =>
  history.value ? history.value.chart.map((c) => c.netPay) : []
);

// 금액 포맷 (₩표기 + 3자리 끊어서)
const formatMoney = (value: number) => `₩${value.toLocaleString()}`;
</script>

<style scoped>
.pay-history-page {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.history-cards {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 16px;
}

.summary-card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 12px 12px;
  border: 1px solid #e5e7eb;
}

.summary-label {
  font-size: 13px;
  color: #6b7280;
  margin-left: 22px;
}

.summary-value {
  margin-top: 6px;
  margin-bottom: 6px;
  font-size: 18px;
  font-weight: 700;
  margin-left: 12px;
}

.history-chart {
  background-color: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  padding-bottom: 72px;
  height: 260px;
  margin-bottom: 24px;
}

.history-table {
  background-color: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  padding-bottom: 10px;
}

.history-table table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  font-size: 13px;
}

.history-table th {
  text-align: left;
  padding: 12px 20px;
}

.history-table td {
  text-align: left;
  padding: 12px 20px;
}

.history-table td:last-child {
  text-align: right;
}

.history-table th:first-child,
.history-table td:first-child,
.history-table th:last-child,
.history-table td:last-child {
  text-align: left;
}

.plus {
  color: #16a34a;
}

.minus {
  color: #b91c1c;
}

.history-note {
  padding-left: 18px;
  margin-top: 12px;
  font-size: 12px;
  color: #6b7280;
}

.history-table th:nth-child(5) {
  text-align: right !important;
}

.rate-up {
  color: #16a34a;
}

.rate-down {
  color: #dc2626;
}

.table-header {
  background: linear-gradient(180deg, #1C398E 0%, #162456 100%);
  color: white;
}

.table-body tr:nth-child(2n) {
  background-color: #e2e8f0;
}

.table-cell {
  color: #155dfc;
}

.table-body tr td:last-child {
  text-align: right;
}

.panel-title {
  padding-left: 28px;
}
</style>
