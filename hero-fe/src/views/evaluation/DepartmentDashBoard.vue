<!-- 
  File Name   : DepartmentDashBoard.vue
  Description : 부서별 역량 대시보드: 부서별 평균 점수 페이지
 
  History
  2025/12/22 - 승민 최초 작성
 
  @author 승민
-->

<!--template-->
<template>
  <div class="page">
    <div class="content-wrapper">

      <!-- Tabs -->
      <div class="tabs">
        <div class="inbox-tabs">
          <button 
            class="tab tab-start active"
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

<!--script-->
<script setup lang="ts">
//Import 구문
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import Chart from "chart.js/auto";
import apiClient from "@/api/apiClient";
import { useAuthStore } from "@/stores/auth";


//외부 로직
const router = useRouter();
const authStore = useAuthStore();

//Reactive 데이터
const activeTab = ref("deptAvg");
const dashboardData = ref<any[]>([]);
const selectedTemplateId = ref<number | null>(null);

//차트 객체
const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

/**
 * 설명: 부서별 평균 점수 페이지로 이동하는 메소드
 */
const goAvgScore = () => {
    router.push('/evaluation/department/dashboard')
}

/**
 * 설명: 직급별 점수 편차 페이지로 이동하는 메소드
 */
const goDeviation = () => {
    router.push('/evaluation/department/dashboard2')
}

/**
 * 설명: 부서별 전분기 페이지로 이동하는 메소드
 */
const goComparison = () => {
    router.push('/evaluation/department/dashboard3')
}

/**
 * 설명: 평가 가이드라인 위반 페이지로 이동하는 메소드
 */
const goViolation = () => {
    router.push('/evaluation/department/dashboard4')
}

/**
 * 설명: 승진 대상자 추천 페이지로 이동하는 메소드
 */
const goRecommendation = () => {
    router.push('/evaluation/department/dashboard5')
}

/**
 * 설명: 이전 페이지로 이동하는 메소드
 */
const goBack = () => router.back();

/**
 * 설명: 대시보드 데이터 조회 메소드
 */
const loadDashboard = async () => {
  const { data } = await apiClient.get("/evaluation/dashboard/all");
  dashboardData.value = data;

  // 기본: 첫 번째 평가 템플릿 기준
  selectedTemplateId.value = data[0]?.evaluationTemplateId ?? null;

  renderDepartmentChart();
};

/**
 * 설명: 선택된 평가 데이터를 그래프에 맞게 가공하는 메소드 
 * @param {any[]} data - 선택된 평가 데이터  
 */
const calculateDepartmentStats = (data: any[]) => {
  if (!selectedTemplateId.value) {
    return { companyAvg: 0, stats: [] };
  }

  // 선택된 평가 템플릿만 사용
  const template = data.find(
    t => t.evaluationTemplateId === selectedTemplateId.value
  );

  if (!template) {
    return { companyAvg: 0, stats: [] };
  }

  const deptMap: Record<string, number[]> = {};

  template.evaluations.forEach((evaluation: any) => {
    const dept = evaluation.evaluationDepartmentName;
    if (!deptMap[dept]) deptMap[dept] = [];

    evaluation.evaluatees.forEach((e: any) => {
      deptMap[dept].push(e.evaluationEvaluateeTotalScore);
    });
  });

  const allScores = Object.values(deptMap).flat();
  const companyAvg =
    allScores.reduce((a, b) => a + b, 0) / allScores.length;

  return {
    companyAvg: Number(companyAvg.toFixed(1)),
    stats: Object.entries(deptMap).map(([dept, scores]) => {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      return {
        dept,
        avg: Number(avg.toFixed(1)),
        ratio: Number(((avg / companyAvg) * 100).toFixed(1)),
      };
    }),
  };
};

/**
 * 설명: 그래프를 그리는 메소드
 */
const renderDepartmentChart = () => {
  if (!chartCanvas.value) return;

  const { companyAvg, stats } =
    calculateDepartmentStats(dashboardData.value);

  const labels = stats.map(s => s.dept);
  const deptAvgs = stats.map(s => s.avg);
  const ratios = stats.map(s => s.ratio);
  const companyAvgLine = labels.map(() => companyAvg);

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(chartCanvas.value, {
    data: {
      labels,
      datasets: [
        {
          type: "bar",
          label: "부서 평균 점수",
          data: deptAvgs,
          backgroundColor: "rgba(28, 57, 142, 0.75)",
          yAxisID: "yScore",
          order: 1,
          categoryPercentage: 0.6,
          barPercentage: 0.6,
        },
        {
          type: "line",
          label: "전사 평균 점수",
          data: companyAvgLine,
          borderColor: "#ef4444",
          borderDash: [6, 4],
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: "#ef4444",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          yAxisID: "yScore",
          order: 2,
        },
        {
          type: "line",
          label: "전사 대비 (%)",
          data: ratios,
          borderColor: "#22c55e",
          backgroundColor: "#22c55e",
          borderWidth: 2,
          pointRadius: 5,
          pointBackgroundColor: "#22c55e",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          tension: 0.3,
          yAxisID: "yRatio",
          order: 3,
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
            label: ctx => {
              if (ctx.dataset.label === "전사 대비 (%)") {
                return `전사 대비 ${ctx.raw}%`;
              }
              return `${ctx.dataset.label}: ${ctx.raw}`;
            },
          },
        },
      },
      scales: {
        yScore: {
          position: "left",
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: "점수",
          },
        },
        yRatio: {
          position: "right",
          beginAtZero: true,
          max: 150,
          grid: {
            drawOnChartArea: false,
          },
          title: {
            display: true,
            text: "전사 대비 (%)",
          },
        },
      },
    },
  });
};

/**
 * 설명: 평가 템플릿 값을 감지하는 훅
 */
watch(activeTab, tab => {
  if (tab === "deptAvg") {
    setTimeout(renderDepartmentChart, 0);
  }
});


onMounted(() => {
    const departmentId = authStore.user?.departmentId;

    if(departmentId != 2){
        alert("인사팀이 아닙니다.");
        goBack();
    }

    loadDashboard();
});
</script>

<!--style-->
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