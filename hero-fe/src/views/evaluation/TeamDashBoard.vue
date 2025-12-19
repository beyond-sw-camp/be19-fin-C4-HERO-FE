<template>
  <div class="page">
    <div class="content-wrapper">

      <!-- 상단 탭 -->
      <div class="tabs">
        <div class="tab-group">
          <div class="tab-active">
            <div class="tab-active-text">부서 등급 분포</div>
          </div>

          <div class="tab-inactive" @click="goAvgScore">
            <div class="tab-inactive-text">부서별 평균 점수 비교</div>
          </div>

          <div class="tab-inactive" @click="goMemberSkill">
            <div class="tab-inactive-text">팀원별 역량 상세 분석</div>
          </div>

          <div class="tab-inactive" @click="goScoreTrend">
            <div class="tab-inactive-text">팀원별 평가 점수 트렌드</div>
          </div>
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

<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import Chart from "chart.js/auto";
import apiClient from "@/api/apiClient";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

/* =====================
   상태
===================== */
const dashboardData = ref<any[]>([]);
const selectedTemplateId = ref<number | null>(null);

const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

/* =====================
   API 호출
===================== */
const loadDashboard = async () => {
  const departmentId = authStore.user?.departmentId;

  const { data } = await apiClient.get(
    `/evaluation/dashboard/select/${departmentId}`
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

/* =====================
   등급 추출
===================== */
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

/* =====================
   분포 계산
===================== */
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

/* =====================
   차트 렌더
===================== */
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

const updateChart = async () => {
  await nextTick();
  renderChart();
};

const goAvgScore = () => {
  //router.push("/evaluation/dashboard/avg-score");
};

const goMemberSkill = () => {
  //router.push("/evaluation/dashboard/member-skill");
};

const goScoreTrend = () => {
  //router.push("/evaluation/dashboard/score-trend");
};

const goBack = () => router.back();

onMounted(loadDashboard);
</script>

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

.tab-group {
  display: flex;
}

/* 공통 탭 */
.tab-active,
.tab-inactive {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 52px;

  padding: 0 24px;                
  border-radius: 14px 14px 0 0;
  outline: 2px solid #e2e8f0;
  outline-offset: -2px;

  white-space: nowrap;            
}

/* 활성 탭 */
.tab-active {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
}

/* 비활성 탭 */
.tab-inactive {
  background: white;
  cursor: pointer;
}

/* 탭 텍스트 공통 */
.tab-active-text,
.tab-inactive-text {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;            
}

/* 색상 */
.tab-active-text {
  color: white;
}

.tab-inactive-text {
  color: #62748e;
}

/* 색상 */
.tab-active-text {
  color: white;
}

.tab-inactive-text {
  color: #62748e;
}

/* ===== List Box ===== */
.list-box {
  background: white;
  border: 2px solid #e2e8f0;
  border-top: none;
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