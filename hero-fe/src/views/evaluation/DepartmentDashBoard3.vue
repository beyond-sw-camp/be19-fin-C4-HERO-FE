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
            class="tab"
            @click="goDeviation"
          >
            직급별 점수 편차
          </button>
          <button 
            class="tab active"
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

        <!-- 평가 템플릿 선택 -->
        <div class="filter-row">
          <label>평가 템플릿</label>
          <select v-model="selectedTemplateId">
            <option
              v-for="t in dashboardData"
              :key="t.evaluationTemplateId"
              :value="t.evaluationTemplateId"
            >
              {{ t.evaluationTemplateName }}
            </option>
          </select>
        </div>

        <!-- Chart -->
        <div class="chart-wrapper">
          <canvas ref="chartCanvas"></canvas>
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

/* ===== Chart ===== */
const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

/* ===== Data ===== */
const dashboardData = ref<any[]>([]);
const selectedTemplateId = ref<number | null>(null);

/* ===== Navigation ===== */
const goAvgScore = () => router.push("/evaluation/department/dashboard");
const goDeviation = () => router.push("/evaluation/department/dashboard2");
const goComparison = () => router.push("/evaluation/department/dashboard3");
const goViolation = () => router.push("/evaluation/department/dashboard4");
const goRecommendation = () => router.push("/evaluation/department/dashboard5");

/* ===== API ===== */
const loadDashboard = async () => {
  const { data } = await apiClient.get("/evaluation/dashboard/all");
  dashboardData.value = data;

  // 기본 선택: 가장 최신 템플릿
  selectedTemplateId.value =
    data[data.length - 1]?.evaluationTemplateId ?? null;

  renderDepartmentChart();
};

/* ===== 계산 로직 (부서별 전분기 비교) ===== */
const calculateDepartmentComparison = (
  data: any[]
): {
  labels: string[];
  prevScores: (number | null)[];
  currScores: (number | null)[];
  prevName: string;
  currName: string;
} => {
  if (!selectedTemplateId.value) {
    return {
      labels: [],
      prevScores: [],
      currScores: [],
      prevName: "",
      currName: "",
    };
  }

  const templates = [...data].sort(
    (a, b) => a.evaluationTemplateId - b.evaluationTemplateId
  );

  const currIndex = templates.findIndex(
    t => t.evaluationTemplateId === selectedTemplateId.value
  );

  if (currIndex <= 0) {
    return {
      labels: [],
      prevScores: [],
      currScores: [],
      prevName: "",
      currName: "",
    };
  }

  const prev = templates[currIndex - 1];
  const curr = templates[currIndex];

  const deptSet = new Set<string>();
  const scoreMap: Record<string, { prev: number | null; curr: number | null }> =
    {};

  const collect = (template: any, key: "prev" | "curr") => {
    template.evaluations.forEach((evaluation: any) => {
      const dept = evaluation.evaluationDepartmentName;
      deptSet.add(dept);

      const scores: number[] = evaluation.evaluatees.map(
        (e: any) => e.evaluationEvaluateeTotalScore
      );

      const avg =
        scores.reduce((a, b) => a + b, 0) / scores.length;

      if (!scoreMap[dept]) {
        scoreMap[dept] = { prev: null, curr: null };
      }

      scoreMap[dept][key] = Number(avg.toFixed(1));
    });
  };

  collect(prev, "prev");
  collect(curr, "curr");

  const labels = Array.from(deptSet);

  return {
    labels,
    prevScores: labels.map(d => scoreMap[d]?.prev ?? null),
    currScores: labels.map(d => scoreMap[d]?.curr ?? null),
    prevName: prev.evaluationTemplateName,
    currName: curr.evaluationTemplateName,
  };
};

/* ===== Chart Render ===== */
const renderDepartmentChart = () => {
  if (!chartCanvas.value) return;

  const {
    labels,
    prevScores,
    currScores,
    prevName,
    currName,
  } = calculateDepartmentComparison(dashboardData.value);

  if (!labels.length) return;

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(chartCanvas.value, {
    type: "line",
    data: {
      labels, 
      datasets: [
        {
          label: prevName,
          data: prevScores,
          borderColor: "#94a3b8",
          backgroundColor: "#94a3b8",
          tension: 0.3,
          pointRadius: 5,
          pointHoverRadius: 7,
          fill: false,
        },
        {
          label: currName,
          data: currScores,
          borderColor: "#1c398e",
          backgroundColor: "#1c398e",
          tension: 0.3,
          pointRadius: 5,
          pointHoverRadius: 7,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      animation: false,
      plugins: {
        legend: { position: "top" },
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
            text: "부서 평균 점수",
          },
        },
      },
    },
  });
};

/* ===== Watch ===== */
watch(selectedTemplateId, () => {
  renderDepartmentChart();
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

  border: 1px solid #e2e8f0;
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

/* Filter */
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
</style>