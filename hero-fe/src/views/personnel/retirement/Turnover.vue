<!--
  <pre>
  (File => TypeScript / Vue) Name   : Turnover.vue
  Description : 이직률 및 퇴직 현황 대시보드 페이지
                - 퇴직 현황 요약 카드 (잔존율, 정착률, 이직률 등)
                - 차트 시각화 (사유별, 근속기간별, 신입 통계)
                - 부서별 이직률 테이블

  History
  2025/12/31 - 최초 작성
  </pre>

  @author Gemini
  @version 1.0
-->

<template>
  <div class="turnover-wrapper">
    <div class="turnover-page">

      <!-- 1. 상단 요약 카드 -->
      <div class="summary-cards">
        <div class="summary-card">
          <div class="summary-title-row">
            <span class="summary-title">잔존율</span>
            <div class="tooltip-wrapper">
              <span class="info-icon">i</span>
              <span class="tooltip-text">최근 3년 전 재직 인원 중 현재까지 근무 중인 비율</span>
            </div>
          </div>
          <div class="summary-value-wrapper">
            <span class="summary-value">{{ summary?.retentionRate ?? 0 }}</span>
            <span class="summary-unit">%</span>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-title-row">
            <span class="summary-title">종합 이직률</span>
            <div class="tooltip-wrapper">
              <span class="info-icon">i</span>
              <span class="tooltip-text">1년 전 재직 인원 대비 최근 1년간 발생한 퇴사자 비율</span>
            </div>
          </div>
          <div class="summary-value-wrapper">
            <span class="summary-value">{{ summary?.totalTurnoverRate ?? 0 }}</span>
            <span class="summary-unit">%</span>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-title-row">
            <span class="summary-title">신입 정착률</span>
            <div class="tooltip-wrapper">
              <span class="info-icon">i</span>
              <span class="tooltip-text">최근 1년 입사자 중 3개월 이상 근무한 사원의 비율</span>
            </div>
          </div>
          <div class="summary-value-wrapper">
            <span class="summary-value">{{ summary?.settlementRate ?? 0 }}</span>
            <span class="summary-unit">%</span>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-title-row">
            <span class="summary-title">신입 이직률 (1년 내)</span>
            <div class="tooltip-wrapper">
              <span class="info-icon">i</span>
              <span class="tooltip-text">최근 1년 내 입사한 신규 입사자 중 퇴사한 인원의 비율</span>
            </div>
          </div>
          <div class="summary-value-wrapper">
            <span class="summary-value">{{ summary?.newHireTurnoverRate ?? 0 }}</span>
            <span class="summary-unit">%</span>
          </div>
        </div>
      </div>

      <!-- 2. 탭 및 컨텐츠 영역 -->
      <div class="panel">
        <!-- 탭 헤더 -->
        <div class="panel-tabs">
          <button
            class="tab tab-left"
            :class="{ 'tab-active': activeTab === 'reason' }"
            @click="activeTab = 'reason'"
          >
            퇴사 사유
          </button>
          <button
            class="tab"
            :class="{ 'tab-active': activeTab === 'tenure' }"
            @click="activeTab = 'tenure'"
          >
            근속 기간
          </button>
          <button
            class="tab"
            :class="{ 'tab-active': activeTab === 'newHire' }"
            @click="activeTab = 'newHire'"
          >
            신입 통계
          </button>
          <button
            class="tab tab-right"
            :class="{ 'tab-active': activeTab === 'department' }"
            @click="activeTab = 'department'"
          >
            부서별 현황
          </button>
        </div>

        <!-- 탭 바디 -->
        <div class="panel-body">
          <!-- Tab 1: 퇴사 사유 -->
          <div v-if="activeTab === 'reason'" class="chart-panel full-height">
            <div class="panel-header">퇴사 사유별 통계</div>
            <div class="chart-container">
              <Doughnut v-if="reasonChartData" :data="reasonChartData" :options="doughnutOptions" />
            </div>
          </div>

          <!-- Tab 2: 근속 기간 -->
          <div v-if="activeTab === 'tenure'" class="chart-panel full-height">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div class="panel-header">근속 기간별 잔존율</div>
              <div class="tooltip-wrapper">
                <span class="info-icon">i</span>
                <span class="tooltip-text">해당 근속 연수에 도달할 수 있었던 입사자 중 실제 재직 중인 인원의 비율</span>
              </div>
            </div>
            <div class="chart-container">
              <BaseLineChart
                v-if="tenureStats.length > 0"
                :labels="tenureLabels"
                :data="tenureData"
                color="#1c398e"
                tooltip-label-prefix="잔존율: "
                tooltip-label-suffix="%"
                y-axis-title="비율 (%)" />
            </div>
          </div>

          <!-- Tab 3: 신입 통계 -->
          <div v-if="activeTab === 'newHire'" class="chart-panel full-height">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div class="panel-header">분기별 신입 사원 정착률 및 이직률</div>
              <div class="tooltip-wrapper">
                <span class="info-icon">i</span>
                <span class="tooltip-text" style="text-align: left;">정착률: 3개월 이상 재직 신입<br>이직률: 1년 내 퇴사 신입</span>
              </div>
            </div>
            <div class="chart-container">
              <Bar v-if="newHireChartData" :data="newHireChartData" :options="newHireOptions" />
            </div>
          </div>

          <!-- Tab 4: 부서별 이직률 테이블 -->
          <div v-if="activeTab === 'department'" class="table-container">
            <div class="panel-header-row">
              <span class="panel-title">부서별 이직률 현황</span>
            </div>
            <div class="panel-table-wrapper">
              <table class="turnover-table">
                <thead>
                  <tr>
                    <th>부서명</th>
                    <th class="text-center">현재 인원</th>
                    <th class="text-center">퇴사 인원</th>
                    <th class="text-center">이직률</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in departmentStats" :key="row.departmentName" :class="{ 'row-striped': index % 2 === 1 }">
                    <td>{{ row.departmentName }}</td>
                    <td class="text-center">{{ row.currentCount }}명</td>
                    <td class="text-center">{{ row.retiredCount }}명</td>
                    <td class="text-center">
                      <span :class="getTurnoverClass(row.turnoverRate)">
                        {{ row.turnoverRate }}%
                      </span>
                    </td>
                  </tr>
                  <tr v-if="departmentStats.length === 0">
                    <td colspan="4" class="empty-row">데이터가 없습니다.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'vue-chartjs';

import { useRetirementStore } from '@/stores/retirement/retirement.store';
import BaseLineChart from '@/components/charts/BaseLineChart.vue';

// Chart.js 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement);

// --- State ---
const store = useRetirementStore();
const { summary, reasonStats, tenureStats, newHireStats, departmentStats } = storeToRefs(store);

// --- Tab State ---
const activeTab = ref('reason'); // 'reason' | 'tenure' | 'newHire' | 'department'

// --- API Call ---
onMounted(() => {
  store.fetchRetirementData();
});

// --- Chart Data Computeds ---

// 1. 사유별 퇴직 통계 (Doughnut)
const reasonChartData = computed(() => {
  if (!reasonStats.value.length) return null;
  const colors = ['#1c398e', '#16a34a', '#eab308', '#ef4444', '#6366f1', '#8b5cf6', '#ec4899', '#f97316'];
  return {
    labels: reasonStats.value.map(item => `${item.reasonName} (${item.count}명)`),
    datasets: [
      {
        backgroundColor: reasonStats.value.map((_, i) => colors[i % colors.length]),
        data: reasonStats.value.map(item => item.count),
        hoverOffset: 4
      }
    ]
  };
});

// 2. 근속 기간별 잔존율 (BaseLineChart용 데이터)
const tenureLabels = computed(() => tenureStats.value.map(item => item.tenureRange));
const tenureData = computed(() => tenureStats.value.map(item => item.retentionRate));

// 3. 신입 정착률/이직률 (Bar - Multi Dataset)
const newHireChartData = computed(() => {
  if (!newHireStats.value.length) return null;
  return {
    labels: newHireStats.value.map(item => item.quarter),
    datasets: [
      {
        label: '정착률 (%)',
        backgroundColor: '#16a34a', // Green
        data: newHireStats.value.map(item => item.settlementRate),
        borderRadius: 4,
      },
      {
        label: '이직률 (%)',
        backgroundColor: '#ef4444', // Red
        data: newHireStats.value.map(item => item.turnoverRate),
        borderRadius: 4,
      }
    ]
  };
});

// --- Chart Options ---
const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        padding: 20,
        font: { family: 'Inter-Regular', size: 12 }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: '#e2e8f0' },
      ticks: { font: { family: 'Inter-Regular', size: 11 } }
    },
    x: {
      grid: { display: false },
      ticks: { font: { family: 'Inter-Regular', size: 11 } }
    }
  }
};

const barOptions = { ...commonOptions };
const newHireOptions = { ...commonOptions };

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: 20
  },
  plugins: {
    legend: {
      position: 'right' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
        font: { family: 'Inter-Regular', size: 14 }
      }
    }
  }
};

// --- Helper ---
const getTurnoverClass = (rate: number) => {
  if (rate >= 20) return 'text-danger';
  if (rate >= 10) return 'text-warning';
  return 'text-success';
};
</script>

<style scoped>
* {
  font-size: 14px;
  font-family: "Inter-Regular", sans-serif;
  box-sizing: border-box;
}

.turnover-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-color: #f8fafc;
}

.turnover-page {
  width: 100%;
  height: 100%;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 1. 상단 요약 카드 */
.summary-cards {
  display: flex;
  gap: 16px;
}

.summary-card {
  flex: 1;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.summary-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.summary-title {
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
}

/* 툴팁 스타일 */
.tooltip-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: help;
}

.info-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #e2e8f0;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  font-family: serif;
  font-style: italic;
}

.tooltip-text {
  visibility: hidden;
  width: 220px;
  background-color: #334155;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 8px 10px;
  position: absolute;
  z-index: 10;
  bottom: 135%;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.2s;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.4;
  pointer-events: none;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.tooltip-text::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #334155 transparent transparent transparent;
}

.tooltip-wrapper:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}

.summary-value-wrapper {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.summary-value {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
}

.summary-unit {
  font-size: 16px;
  font-weight: 500;
  color: #94a3b8;
}

/* 2. 패널 및 탭 스타일 */
.panel {
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.panel-tabs {
  display: flex;
  flex-direction: row;
}

.tab {
  width: 150px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
  border-right: 1px solid #e2e8f0;
  color: #64748b;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-left {
  border-left: 1px solid #e2e8f0;
  border-top-left-radius: 14px;
}

.tab-right {
  border-top-right-radius: 14px;
}

.tab-active {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: #ffffff;
  font-weight: 700;
  border-color: transparent;
}

.panel-body {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-bottom-left-radius: 14px;
  border-bottom-right-radius: 14px;
  padding: 24px;
  flex: 1;
  overflow-y: auto;
}

.chart-panel {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 360px;
}

.full-height {
  height: 100%;
  min-height: 500px;
}

.panel-header {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

.chart-container {
  flex: 1;
  position: relative;
  width: 100%;
  min-height: 280px;
}

/* 3. 테이블 컨테이너 */
.table-container {
  width: 100%;
}

.panel-header-row {
  padding: 0 0 16px 0;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 16px;
}

.panel-title {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

.panel-table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.turnover-table {
  width: 100%;
  border-collapse: collapse;
}

.turnover-table thead tr {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
}

.turnover-table th {
  padding: 14px 24px;
  text-align: left;
  font-weight: 600;
  color: #ffffff;
  font-size: 14px;
}

.turnover-table td {
  padding: 16px 24px;
  color: #475569;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
}

.turnover-table tbody tr:last-child td {
  border-bottom: none;
}

.turnover-table tbody tr.row-striped {
  background-color: #f8fafc;
}

.text-center {
  text-align: center;
}

.empty-row {
  text-align: center;
  padding: 40px;
  color: #94a3b8;
}

/* 이직률 상태 색상 */
.text-danger {
  color: #ef4444;
  font-weight: 600;
}

.text-warning {
  color: #f59e0b;
  font-weight: 600;
}

.text-success {
  color: #16a34a;
  font-weight: 600;
}
</style>