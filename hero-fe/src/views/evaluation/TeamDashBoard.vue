<!-- 
  File Name   : DepartmentDashBoard2.vue
  Description : 팀 평가 대시보드: 부서 등급 분포 페이지
 
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
            class="tab tab-start active"
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
            class="tab tab-end"
            @click="goScoreTrend"
          >
            팀원별 평가 점수 트렌드
          </button>
        </div>
      </div>

      <!-- 리스트 박스 -->
      <div class="list-box">

        <!-- 필터 영역 -->
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

        <!-- 차트 영역 -->
        <div class="chart-wrapper">
          <canvas ref="chartCanvas"></canvas>
        </div>

      </div>
    </div>
  </div>
</template>

<!--script-->
<script setup lang="ts">
//Import 구문
import { ref, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import Chart from "chart.js/auto";
import apiClient from "@/api/apiClient";
import { useAuthStore } from "@/stores/auth";

//외부 로직
const router = useRouter();
const authStore = useAuthStore();

//Reactive 데이터
const dashboardData = ref<any[]>([]);
const selectedTemplateId = ref<number | null>(null);

//차트 객체
const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

/**
 * 설명: 대시보드 데이터 조회 메소드
 */
const loadDashboard = async () => {
  const departmentId = authStore.user?.departmentId;

  const { data } = await apiClient.get(
    `/evaluation/dashboard/${departmentId}`
  );

  if (!data || data.length === 0) {
    alert("해당 부서에 대한 평가 데이터가 존재하지 않습니다.");
    goBack();
    return;
  }

  dashboardData.value = data;
  selectedTemplateId.value = data[0].evaluationTemplateId;

  await nextTick();
  renderChart();
};

/**
 * 설명: 등급 추출 메소드
 * @param {any} template - 평가 템플릿 데이터
 */
const extractRanks = (template: any) => {
  const set = new Set<string>();

  template.evaluations.forEach((e: any) =>
    e.evaluationItems.forEach((i: any) =>
      i.criterias.forEach((c: any) => {
        if (c.criteriaRank) set.add(c.criteriaRank);
      })
    )
  );

  const order = ["S", "A", "B", "C", "D"];

  return [...set].sort((a, b) => {
    const aIdx = order.indexOf(a);
    const bIdx = order.indexOf(b);

    return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
  });
};

/**
 * 설명: 분포 데이터 계산 메소드
 */
const calculateDistribution = () => {
  const template = dashboardData.value.find(
    t => t.evaluationTemplateId === selectedTemplateId.value
  );

  if (!template) return { labels: [], values: [] };

  const labels = extractRanks(template);
  const map: Record<string, number> = {};
  labels.forEach(l => (map[l] = 0));

  template.evaluations.forEach((e: any) =>
    e.evaluatees.forEach((ev: any) => {
      if (map[ev.evaluationEvaluateeTotalRank] !== undefined) {
        map[ev.evaluationEvaluateeTotalRank]++;
      }
    })
  );

  return {
    labels,
    values: labels.map(l => map[l]),
  };
};

/**
 * 설명: 차트 그리는 메소드
 */
const renderChart = () => {
  if (!chartCanvas.value) return;

  const { labels, values } = calculateDistribution();

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(chartCanvas.value, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: "#1c398e",
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 },
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
    router.push("/evaluation/team/dashboard")
}

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

/**
 * 설명: 이전 페이지로 이동하는 메서드
 */
const goBack = () => router.back();

onMounted(loadDashboard);
</script>

<!--style-->
<style scoped>
/* ===== 공통 페이지 ===== */
.page {
  width: 100%;
  height: 100%;
  background: #f5f6fa;
}

.content-wrapper {
  padding: 36px;
}

/* ===== Tabs ===== */
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

/* ===== List Box ===== */
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

/* ===== Chart ===== */
.chart-wrapper {
  height: 420px;
  background: #f8fafc;
  border-radius: 14px;
  padding: 24px;
  display: flex;
  align-items: center;     
  justify-content: center;

  margin-top: 0;
}

.chart-wrapper canvas {
  width: 100% !important;
  height: 100% !important;
  max-width: 900px;     
  max-height: 360px;
}
</style>