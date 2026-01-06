<!-- 
  File Name   : TeamDashBoard2.vue
  Description : 팀 평가 대시보드: 부서별 점수 비교 페이지
 
  History
  2025/12/19 - 승민 최초 작성
 
  @author 승민
-->

<!--template-->
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

        <!-- 🔄 로딩 중 -->
        <div v-if="isLoading" class="loading">
          <div class="spinner"></div>
          <p>데이터를 불러오는 중입니다.</p>
        </div>

        <!-- 📊 실제 차트 -->
        <div v-else>
          <!-- 필터 -->
          <div class="filter-row">
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
  </div>
</template>

<!--script-->
<script setup lang="ts">
//Import 구문
import { ref, onMounted, nextTick, watch } from "vue";
import { useRouter } from "vue-router";
import Chart from "chart.js/auto";
import apiClient from "@/api/apiClient";

//외부 로직
const router = useRouter();

//Reactive 데이터
const dashboardData = ref<any[]>([]);
const selectedTemplateId = ref<number | null>(null);
const isLoading = ref(false);

//차트 객체
const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

/**
 * 설명: 대시보드 데이터 조회 메소드
 */
const loadDashboard = async () => {
  try {
    isLoading.value = true; // 🔥 로딩 시작

    const { data } = await apiClient.get("/evaluation/dashboard/all");

    if (!data || data.length === 0) {
      alert("평가 데이터가 존재하지 않습니다.");
      return;
    }

    dashboardData.value = data;
    selectedTemplateId.value = data[0].evaluationTemplateId;

    await nextTick();
    renderChart();

  } catch (e) {
    console.error("대시보드 조회 실패", e);
  } finally {
    isLoading.value = false; // 🔥 로딩 종료
  }
};

/**
 * 설명: 평균 점수 비교 데이터 계산 메소드
 */
const calculateAvgScoreByDepartment = () => {
  const template = dashboardData.value.find(
    t => t.evaluationTemplateId === selectedTemplateId.value
  );

  if (!template) return { labels: [], values: [] };

  const deptMap: Record<string, { sum: number; count: number }> = {};

  template.evaluations.forEach((evaluation: any) => {
    const score = evaluation.evaluationTotalScore;
    const dept = evaluation.evaluationDepartmentName;

    if (score == null) return;

    if (!deptMap[dept]) {
      deptMap[dept] = { sum: 0, count: 0 };
    }

    deptMap[dept].sum += score;
    deptMap[dept].count += 1;
  });

  const labels = Object.keys(deptMap);
  const values = labels.map(dept =>
    Number((deptMap[dept].sum / deptMap[dept].count).toFixed(1))
  );

  return { labels, values };
};

/**
 * 설명: 차트 그리는 메소드
 */
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

/**
 * 설명: 차트 최신화 메서드
 */
const updateChart = async () => {
  await nextTick();
  renderChart();
};

/**
 * 설명: 부서 등급 분포 페이지로 이동하는 메서드
 */
const goRank = () => {
  router.push("/evaluation/team/dashboard");
};

/**
 * 설명: 부서별 점수 비교 페이지로 이동하는 메서드
 */
const goAvgScore = () => {
  router.push("/evaluation/team/dashboard2");
};

/**
 * 설명: 팀원별 역량 상세 분석 페이지로 이동하는 메서드
 */
const goMemberSkill = () => {
  router.push("/evaluation/team/dashboard3");
};

/**
 * 설명: 팀원별 평가 점수 트렌드 페이지로 이동하는 메서드
 */
const goScoreTrend = () => {
  router.push("/evaluation/team/dashboard4");
};

watch([isLoading, selectedTemplateId], async () => {
  if (isLoading.value) return;
  if (!dashboardData.value.length) return;

  await nextTick();
  renderChart();
});

onMounted(loadDashboard);
</script>

<!--style-->
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

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #64748b;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top-color: #1c398e;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>