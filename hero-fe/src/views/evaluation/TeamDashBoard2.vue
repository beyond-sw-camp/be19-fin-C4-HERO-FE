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
            class="tab active"
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
            class="tab tab-end"
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
          <label>평가 템플릿</label>
          <select v-model="selectedTemplateId" @change="updateChart">
            <option
              v-for="t in dashboardData"
              :key="t.evaluationTemplateId"
              :value="t.evaluationTemplateId"
            >
              {{ t.evaluationTemplateName }}
            </option>
          </select>
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

/* =====================
   상태
===================== */
const router = useRouter();

const dashboardData = ref<any[]>([]);
const selectedTemplateId = ref<number | null>(null);

const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

/* =====================
   API 호출 (전체 템플릿)
===================== */
const loadDashboard = async () => {
  const { data } = await apiClient.get(
    "/evaluation/dashboard/all"
  );

  if (!data || data.length === 0) {
    alert("평가 데이터가 존재하지 않습니다.");
    return;
  }

  dashboardData.value = data;
  selectedTemplateId.value = data[0].evaluationTemplateId;

  await nextTick();
  renderChart();
};

/* =====================
   평균 점수 계산
===================== */
const calculateAvgScoreByDepartment = () => {
  const template = dashboardData.value.find(
    t => t.evaluationTemplateId === selectedTemplateId.value
  );

  if (!template) return { labels: [], values: [] };

  const labels: string[] = [];
  const values: number[] = [];

  template.evaluations.forEach((evaluation: any) => {
    labels.push(evaluation.evaluationDepartmentName);
    values.push(Number(evaluation.evaluationTotalScore.toFixed(1)));
  });

  return { labels, values };
};

/* =====================
   차트 렌더링
===================== */
const renderChart = () => {
  if (!chartCanvas.value) return;

  const { labels, values } = calculateAvgScoreByDepartment();

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(chartCanvas.value, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "부서 평균 점수",
          data: values,
          backgroundColor: "#1c398e",
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.raw} 점`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 10,
          },
          title: {
            display: true,
            text: "평균 점수",
          },
        },
      },
    },
  });
};

/* =====================
   이벤트
===================== */
const updateChart = async () => {
  await nextTick();
  renderChart();
};

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
/* 공통 */
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