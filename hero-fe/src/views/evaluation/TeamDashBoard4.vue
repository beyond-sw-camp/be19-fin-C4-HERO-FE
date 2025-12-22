<template>
  <div class="page">
    <div class="content-wrapper">

      <!-- 상단 탭 -->
      <div class="tabs">
        <div class="inbox-tabs">
          <button
            class="tab tab-start"
            @click="goRank"
          >
            부서 등급 분포
          </button>

          <button
            class="tab"
            @click="goAvgScore"
          >
            부서별 점수 비교
          </button>

          <button
            class="tab"
            @click="goMemberSkill"
          >
            팀원별 역량 상세 분석
          </button>

          <button
            class="tab tab-end active"
            @click="goScoreTrend"
          >
            팀원별 평가 점수 트렌드
          </button>
        </div>
      </div>

      <!-- 리스트 박스 -->
      <div class="list-box">

        <!-- 필터 -->
        <div class="filter-row">
          <label
            v-for="t in dashboardData"
            :key="t.evaluationTemplateId"
            class="checkbox"
          >
            <input
              type="checkbox"
              :value="t.evaluationTemplateId"
              v-model="checkedTemplateIds"
              @change="updateChart"
            />
            {{ t.evaluationTemplateName }}
          </label>
        </div>

        <!-- 차트 -->
        <div class="chart-wrapper">
          <canvas ref="chartCanvas"></canvas>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import Chart from "chart.js/auto";
import apiClient from "@/api/apiClient";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const dashboardData = ref<any[]>([]);
const checkedTemplateIds = ref<number[]>([]);

const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

/* =====================
   API 호출
===================== */
const loadDashboard = async () => {
  const departmentId = authStore.user?.departmentId;

  const { data } = await apiClient.get(`/evaluation/dashboard/${departmentId}`);

  dashboardData.value = data;
  checkedTemplateIds.value = data.map(
    (t: any) => t.evaluationTemplateId
  );

  await nextTick();
  renderChart();
};

/* =====================
   데이터 가공
   X축: 사원
   Dataset: 평가 템플릿
===================== */
const buildTrendData = () => {
  const templates = dashboardData.value.filter(t =>
    checkedTemplateIds.value.includes(t.evaluationTemplateId)
  );

  // 사원 목록 수집
  const memberSet = new Set<string>();

  templates.forEach(template => {
    template.evaluations.forEach((evaluation: any) => {
      evaluation.evaluatees.forEach((e: any) => {
        memberSet.add(e.evaluationEvaluateeName);
      });
    });
  });

  const labels = Array.from(memberSet); // X축: 사원

  const colors = [
    "#1c398e",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#6366f1",
  ];

  const datasets = templates.map((template, idx) => {
    const scoreMap: Record<string, number | null> = {};

    labels.forEach(name => (scoreMap[name] = null));

    template.evaluations.forEach((evaluation: any) => {
      evaluation.evaluatees.forEach((e: any) => {
        scoreMap[e.evaluationEvaluateeName] =
          e.evaluationEvaluateeTotalScore;
      });
    });

    return {
      label: template.evaluationTemplateName,
      data: labels.map(name => scoreMap[name]),
      backgroundColor: colors[idx % colors.length],
      borderRadius: 6,
      barPercentage: 0.7,
      categoryPercentage: 0.7,
    };
  });

  return { labels, datasets };
};

/* =====================
   차트 렌더링
===================== */
const renderChart = () => {
  if (!chartCanvas.value) return;

  const { labels, datasets } = buildTrendData();

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(chartCanvas.value, {
    type: "bar",
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" },
        tooltip: {
          callbacks: {
            label: ctx =>
              `${ctx.dataset.label}: ${ctx.raw} 점`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
        },
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 20,
          },
          title: {
            display: true,
            text: "최종 평가 점수",
          },
        },
      },
    },
  });
};

const updateChart = async () => {
  await nextTick();
  renderChart();
};

/* =====================
   탭 이동
===================== */
const goRank = () => {
  router.push("/evaluation/team/dashboard");
};
const goAvgScore = () => {
  router.push("/evaluation/team/dashboard2");
};
const goMemberSkill = () => {
  router.push("/evaluation/team/dashboard3");
};
const goScoreTrend = () => {
  router.push("/evaluation/team/dashboard4");
};

onMounted(loadDashboard);
</script>

<style scoped>
.page {
  width: 100%;
  height: 100%;
  background: #f5f6fa;
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

/* 탭 공통 */
.tab {
  padding: 10px 18px;           /* 좌우 여백 */
  display: flex;
  align-items: center;
  justify-content: center;

  border-top: 1px solid #e2e8f0;
  border-left: 1px solid #e2e8f0;
  border-right: 1px solid #e2e8f0;

  background-color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  white-space: nowrap;          
  width: auto;                  

  border-bottom: 1px solid #e2e8f0;
}

/* 활성 탭 */
.tab.active {
  color: #ffffff;
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
}

/* 탭 라운드 */
.tab-start {
  border-top-left-radius: 14px;
}

.tab-end {
  border-top-right-radius: 14px;
}

/* List Box */
.list-box {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 0 14px 14px 14px;
  padding: 24px 32px 32px;
}

/* Filter */
.filter-row {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

/* Chart */
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
  width: 100% !important;
  height: 100% !important;
  max-width: 900px;
}
</style>