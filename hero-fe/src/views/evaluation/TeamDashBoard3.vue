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
            class="tab active"
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

      <!-- 콘텐츠 -->
      <div class="list-box">

        <!-- 필터 -->
        <div class="filter-row">
          <label>평가 템플릿</label>
          <select v-model="selectedTemplateId" @change="onTemplateChange">
            <option
              v-for="t in dashboardData"
              :key="t.evaluationTemplateId"
              :value="t.evaluationTemplateId"
            >
              {{ t.evaluationTemplateName }}
            </option>
          </select>

          <label>사원</label>
          <select v-model="selectedEvaluateeId" @change="updateAll">
            <option
              v-for="e in evaluatees"
              :key="e.evaluationEvaluateeId"
              :value="e.evaluationEvaluateeId"
            >
              {{ e.evaluationEvaluateeName }}
            </option>
          </select>
        </div>

        <!-- 그래프 + 분석 -->
        <div class="chart-analysis-wrapper">

          <!-- Radar Chart -->
          <div class="chart-wrapper">
            <canvas ref="chartCanvas"></canvas>
          </div>

          <!-- LLM 분석 -->
          <div class="analysis-box" v-if="!analyzing">
            <div class="analysis-section">
              <h4>강점</h4>
              <ul>
                <li v-for="(s, i) in strengths" :key="i">{{ s }}</li>
              </ul>
            </div>

            <div class="analysis-section">
              <h4>개선점</h4>
              <ul>
                <li v-for="(i, idx) in improvements" :key="idx">{{ i }}</li>
              </ul>
            </div>

            <div class="analysis-section">
              <h4>개선 계획</h4>
              <ul>
                <li v-for="(a, idx) in actionPlan" :key="idx">{{ a }}</li>
              </ul>
            </div>
          </div>

        </div>

        <div v-if="analyzing" class="analysis-loading">
          AI가 사원의 강점과 개선점을 분석 중입니다...
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import Chart from "chart.js/auto";
import apiClient from "@/api/apiClient";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

/* ===== 상태 ===== */
const dashboardData = ref<any[]>([]);
const selectedTemplateId = ref<number | null>(null);
const selectedEvaluateeId = ref<number | null>(null);

const evaluatees = ref<any[]>([]);
const selectedEvaluatee = ref<any>(null);

const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

/* LLM 결과 */
const strengths = ref<string[]>([]);
const improvements = ref<string[]>([]);
const actionPlan = ref<string[]>([]);
const analyzing = ref(false);

/* ===== API ===== */
const loadDashboard = async () => {
  const departmentId = authStore.user?.departmentId;

  const { data } = await apiClient.get(`/evaluation/dashboard/${departmentId}`);
  dashboardData.value = data;
  selectedTemplateId.value = data[0].evaluationTemplateId;
  onTemplateChange();
};

const onTemplateChange = () => {
  const template = dashboardData.value.find(
    t => t.evaluationTemplateId === selectedTemplateId.value
  );
  evaluatees.value = template.evaluations[0].evaluatees;
  selectedEvaluateeId.value = evaluatees.value[0].evaluationEvaluateeId;
  updateAll();
};

/* ===== Radar Chart ===== */
const renderChart = () => {
  if (!chartCanvas.value || !selectedEvaluatee.value) return;

  const labels = selectedEvaluatee.value.formItems.map(
    (f: any) => f.formItemName
  );
  const values = selectedEvaluatee.value.formItems.map(
    (f: any) => f.formItemScore
  );

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(chartCanvas.value, {
    type: "radar",
    data: {
      labels,
      datasets: [
        {
          label: "역량 점수",
          data: values,
          backgroundColor: "rgba(28, 57, 142, 0.2)",
          borderColor: "#1c398e",
          pointBackgroundColor: "#1c398e",
          borderWidth: 2,
          pointRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 20,
            backdropColor: "transparent",
          },
          grid: {
            color: "#e2e8f0",
          },
          angleLines: {
            color: "#e2e8f0",
          },
          pointLabels: {
            color: "#334155",
            font: {
              size: 13,
              weight: 500,
            },
          },
        },
      },
      plugins: {
        legend: { display: false },
      },
    },
  });
};

/* ===== LLM 분석 ===== */
const analyzeEvaluatee = async () => {
  analyzing.value = true;

  const payload = {
    template_name: dashboardData.value.find(
      t => t.evaluationTemplateId === selectedTemplateId.value
    ).evaluationTemplateName,
    employee_name: selectedEvaluatee.value.evaluationEvaluateeName,
    employee_department: selectedEvaluatee.value.evaluationEvaluateeDepartmentName,
    employee_grade: selectedEvaluatee.value.evaluationEvaluateeGrade,
    total_score: selectedEvaluatee.value.evaluationEvaluateeTotalScore,
    total_rank: selectedEvaluatee.value.evaluationEvaluateeTotalRank,
    form_items: selectedEvaluatee.value.formItems.map((f: any) => ({
      item_name: f.formItemName,
      score: f.formItemScore,
      weight: f.formItemWeight,
      comment: f.formItemComment,
    })),
  };

  const { data } = await axios.post(
    "http://127.0.0.1:8000/api/analyze/member",
    payload
  );

  strengths.value = data.strengths;
  improvements.value = data.improvements;
  actionPlan.value = data.action_plan;
  analyzing.value = false;
};

const updateAll = async () => {
  selectedEvaluatee.value = evaluatees.value.find(
    e => e.evaluationEvaluateeId === selectedEvaluateeId.value
  );
  await nextTick();
  renderChart();
  await analyzeEvaluatee();
};

/* ===== 이동 ===== */
const goRank = () => router.push("/evaluation/team/dashboard");
const goAvgScore = () => router.push("/evaluation/team/dashboard2");
const goMemberSkill = () => router.push("/evaluation/team/dashboard3");
const goScoreTrend = () => router.push("/evaluation/team/dashboard4");

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

/* Box */
.list-box {
  background: #fff;
  border: 2px solid #e2e8f0;
  border-radius: 0 14px 14px 14px;
  padding: 24px;
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

/* Chart + Analysis Layout */
.chart-analysis-wrapper {
  display: flex;
  gap: 24px;
  align-items: stretch;
}

.chart-wrapper {
  flex: 1.2;
  height: 420px;
  background: #f8fafc;
  border-radius: 14px;
  padding: 24px;
}

.chart-wrapper canvas {
  width: 100% !important;
  height: 100% !important;
}

/* Analysis */
.analysis-section {
  padding: 14px 16px;
  border-radius: 10px;
  background: #f8fafc;
  position: relative;
}

/* 섹션 간 간격 강화 */
.analysis-section + .analysis-section {
  margin-top: 14px;
}

/* 왼쪽 컬러 바 (공통) */
.analysis-section::before {
  content: "";
  position: absolute;
  left: 0;
  top: 10px;
  bottom: 10px;
  width: 4px;
  border-radius: 4px;
}

/* 강점 */
.analysis-section:nth-child(1) {
  background: #f0f7ff;
}
.analysis-section:nth-child(1)::before {
  background: #2563eb;
}

/* 개선점 */
.analysis-section:nth-child(2) {
  background: #fff7ed;
}
.analysis-section:nth-child(2)::before {
  background: #f97316;
}

/* 개선 계획 */
.analysis-section:nth-child(3) {
  background: #f0fdf4;
}
.analysis-section:nth-child(3)::before {
  background: #16a34a;
}

/* 제목 강조 */
.analysis-section h4 {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 8px;
}
</style>