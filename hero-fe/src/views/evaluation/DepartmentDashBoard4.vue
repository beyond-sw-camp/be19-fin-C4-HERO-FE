<template>
  <div class="page">
    <div class="content-wrapper">

      <!-- Tabs -->
      <div class="tabs">
        <div class="inbox-tabs">
          <button class="tab" @click="goAvgScore">부서별 평균 점수</button>
          <button class="tab" @click="goDeviation">직급별 점수 편차</button>
          <button class="tab" @click="goComparison">부서별 전분기 비교</button>
          <button class="tab active" @click="goViolation">평가 가이드 위반</button>
        </div>
      </div>

      <div class="list-box">

        <!-- 🔽 평가 템플릿 선택 -->
        <div class="filter-box">
          <label>평가 템플릿</label>
          <select v-model="selectedTemplateId" @change="analyzeViolation">
            <option
              v-for="t in templates"
              :key="t.evaluationTemplateId"
              :value="t.evaluationTemplateId"
            >
              {{ t.evaluationTemplateName }}
            </option>
          </select>
        </div>

        <!-- 🔄 분석 중 -->
        <div v-if="analyzing" class="analysis-loading">
          AI가 평가 가이드 위반 여부를 분석 중입니다...
        </div>

        <!-- 🚨 위반 결과 -->
        <div v-else class="promotion-wrapper">

          <div
            v-for="(v, idx) in violations"
            :key="idx"
            class="promotion-card violation"
          >
            <div class="card-top">
              <div class="left">
                <div class="rank-badge warning">⚠</div>
                <div>
                  <div class="name">{{ v.managerName }}</div>
                  <div class="sub">
                    {{ v.departmentName }} • {{ v.templateName }}
                  </div>
                </div>
              </div>
            </div>

            <div class="divider"></div>

            <div class="section">
              <div class="section-title">평가 가이드 위반 사항</div>
              <ul class="violation-list">
                <li v-for="(msg, i) in v.violations" :key="i">
                  {{ msg }}
                </li>
              </ul>
            </div>
          </div>

          <div v-if="violations.length === 0" class="empty-box">
            🎉 해당 평가 템플릿에서 가이드 위반이 발견되지 않았습니다.
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import apiClient from "@/api/apiClient";

const router = useRouter();

const analyzing = ref(false);
const dashboardData = ref<any[]>([]);
const templates = ref<any[]>([]);
const violations = ref<any[]>([]);
const selectedTemplateId = ref<number | null>(null);

/* 페이지 이동 */
const goAvgScore = () => router.push("/evaluation/department/dashboard");
const goDeviation = () => router.push("/evaluation/department/dashboard2");
const goComparison = () => router.push("/evaluation/department/dashboard3");
const goViolation = () => router.push("/evaluation/department/dashboard4");

/* 초기 데이터 로드 */
const loadDashboard = async () => {
  const { data } = await apiClient.get("/evaluation/dashboard/all");
  dashboardData.value = data;

  templates.value = data;
  selectedTemplateId.value = data[0]?.evaluationTemplateId ?? null;

  if (selectedTemplateId.value) {
    analyzeViolation();
  }
};

/* 평가 가이드 위반 분석 */
const analyzeViolation = async () => {
  const template = dashboardData.value.find(
    t => t.evaluationTemplateId === selectedTemplateId.value
  );
  if (!template) return;

  const guideContent =
    template.evaluations?.[0]?.evaluationGuide?.evaluationGuideContent ?? null;

  console.log("guideContent:", guideContent);

  if (!guideContent) {
    alert("해당 평가 템플릿에 평가 가이드가 없습니다.");
    violations.value = [];
    return;
  }

  try {
    analyzing.value = true;
    violations.value = [];

    const res = await axios.post(
      "http://127.0.0.1:8000/api/analyze/violation",
      {
        guide: guideContent,
        template: template
      }
    );

    violations.value = res.data;
  } catch (e) {
    console.error(e);
    alert("평가 가이드 위반 분석 실패");
  } finally {
    analyzing.value = false;
  }
};

onMounted(loadDashboard);
</script>

<style scoped>
.page {
  background: #f5f6fa;
  min-height: 100vh;
}

.content-wrapper {
  padding: 36px;
}

.list-box {
  background: #ffffff;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  padding: 32px;
}

/* 필터 */
.filter-box {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 20px;
}

.filter-box select {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
}

/* 카드 */
.promotion-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 18px;
}

.promotion-card.violation {
  border: 1px solid #fecaca;
  background: #fff5f5;
  border-radius: 14px;
  padding: 18px;
}

.rank-badge.warning {
  background: #dc2626;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.violation-list li {
  font-size: 13px;
  color: #7f1d1d;
  line-height: 1.6;
}

.empty-box {
  text-align: center;
  padding: 60px;
  font-weight: 700;
  color: #16a34a;
}
</style>