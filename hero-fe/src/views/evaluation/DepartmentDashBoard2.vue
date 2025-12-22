<template>
  <div class="page">
    <div class="content-wrapper">

      <!-- Tabs -->
      <div class="tabs">
        <div class="inbox-tabs">
          <button 
            class="tab tab-start"
            @click="goAvgScore"
          >
            부서별 평균 점수
          </button>
          <button
            class="tab active"
            @click="goDeviation"
          >
            직급별 점수 편차
          </button>
          <button 
            class="tab"
            @click="goComparison"
          >
            부서별 전분기 비교
          </button>
          <button 
            class="tab"
            @click="goViolation"
          >
            평가 가이드 라인 위반
          </button>
          <button 
            class="tab tab-end"
            @click="goRecommendation"
          >
            승진 대상자 추천
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="list-box">

        <div class="filter-row">
          <label>평가 템플릿</label>
          <select v-model="selectedTemplateId" @change="renderDepartmentChart">
            <option
              v-for="t in dashboardData"
              :key="t.evaluationTemplateId"
              :value="t.evaluationTemplateId"
            >
              {{ t.evaluationTemplateName }}
            </option>
          </select>
        </div>

        <!-- 부서별 평균 점수 -->
        <div v-if="activeTab === 'deptAvg'">
          <div class="chart-wrapper">
            <canvas ref="chartCanvas"></canvas>
          </div>
        </div>

        <!-- 나머지 탭 -->
        <div v-if="activeTab !== 'deptAvg'" class="placeholder">
          구현 예정
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import Chart from "chart.js/auto";
import apiClient from "@/api/apiClient";

const router = useRouter();

const activeTab = ref("deptAvg");

/* ===== Chart ===== */
const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

/* ===== Data ===== */
const dashboardData = ref<any[]>([]);

/* 선택된 평가 템플릿 ID (UI 없음, 내부 상태) */
const selectedTemplateId = ref<number | null>(null);

const goAvgScore = () => {
    router.push('/evaluation/department/dashboard')
}

const goDeviation = () => {
    router.push('/evaluation/department/dashboard2')
}

const goComparison = () => {
    router.push('/evaluation/department/dashboard3')
}

const goViolation = () => {
    router.push('/evaluation/department/dashboard4')
}

const goRecommendation = () => {
    router.push('/evaluation/department/dashboard5')
}

/* ===== API ===== */
const loadDashboard = async () => {
  const { data } = await apiClient.get("/evaluation/dashboard/all");
  dashboardData.value = data;

  // 기본: 첫 번째 평가 템플릿 기준
  selectedTemplateId.value = data[0]?.evaluationTemplateId ?? null;

  renderDepartmentChart();
};

/* ===== 계산 로직 (템플릿별) ===== */
const calculateGradeStats = (data: any[]) => {
  if (!selectedTemplateId.value) {
    return { labels: [], avgs: [], stds: [], counts: [] };
  }

  const template = data.find(
    t => t.evaluationTemplateId === selectedTemplateId.value
  );
  if (!template) {
    return { labels: [], avgs: [], stds: [], counts: [] };
  }

  const gradeMap: Record<string, number[]> = {};

  template.evaluations.forEach((evaluation: any) => {
    evaluation.evaluatees.forEach((e: any) => {
      const grade = e.evaluationEvaluateeGrade;
      if (!gradeMap[grade]) gradeMap[grade] = [];
      gradeMap[grade].push(e.evaluationEvaluateeTotalScore);
    });
  });

  const labels: string[] = [];
  const avgs: number[] = [];
  const stds: number[] = [];
  const counts: number[] = [];

  Object.entries(gradeMap).forEach(([grade, scores]) => {
    const avg =
      scores.reduce((a, b) => a + b, 0) / scores.length;

    const variance =
      scores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) /
      scores.length;

    labels.push(grade);
    avgs.push(Number(avg.toFixed(1)));
    stds.push(Number(Math.sqrt(variance).toFixed(1)));
    counts.push(scores.length); // ✅ 사원 수
  });

  return { labels, avgs, stds, counts };
};

/* ===== Chart Render ===== */
const renderDepartmentChart = () => {
  if (!chartCanvas.value) return;

  const { labels, avgs, stds, counts } =
    calculateGradeStats(dashboardData.value);

  // ✅ x축 라벨 가공
  const displayLabels = labels.map(
    (grade, idx) => `${grade} (${counts[idx]}명)`
  );

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(chartCanvas.value, {
    type: "bar",
    data: {
      labels: displayLabels, // ✅ 여기만 변경
      datasets: [
        {
          label: "직급별 평균 점수",
          data: avgs,
          backgroundColor: "#1c398e",
          borderRadius: 6,
          barPercentage: 0.6,
          categoryPercentage: 0.6,
        },
        {
          label: "직급별 점수 표준 편차",
          data: stds,
          backgroundColor: "#f59e0b",
          borderRadius: 6,
          barPercentage: 0.6,
          categoryPercentage: 0.6,
        },
      ],
    },
    options: {
      responsive: true,
      animation: false,
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          callbacks: {
            label: ctx =>
              `${ctx.dataset.label}: ${ctx.raw}점`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: "점수",
          },
        },
      },
    },
  });
};

/* ===== Watch ===== */
watch(activeTab, tab => {
  if (tab === "deptAvg") {
    setTimeout(renderDepartmentChart, 0);
  }
});

/* ===== Init ===== */
onMounted(loadDashboard);
</script>

<style scoped>
.page {
  background: #f5f6fa;
  height: 100%;
}

.content-wrapper {
  padding: 36px;
}

/* Tabs */
.tabs {
  display: flex;
}

.inbox-tabs {
  display: inline-flex;
  flex-direction: row;
}

.tab {
  padding: 10px 18px;
  display: flex;
  align-items: center;
  justify-content: center;

  border-top: 1px solid #e2e8f0;
  border-left: 1px solid #e2e8f0;
  border-right: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;

  background-color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.tab.active {
  color: #ffffff;
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
}

.tab-start {
  border-top-left-radius: 14px;
}

.tab-end {
  border-top-right-radius: 14px;
}

/* ===== Filter ===== */
.filter-row {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

select {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #cad5e2;
}

/* Content Box */
.list-box {
  background: #fff;
  border: 2px solid #e2e8f0;
  border-radius: 0 14px 14px 14px;
  padding: 24px;
}

.chart-wrapper {
  height: 420px;
  background: #f8fafc;
  border-radius: 14px;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-wrapper canvas {
  max-width: 900px;
  max-height: 360px;
}

.placeholder {
  height: 360px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
}
</style>