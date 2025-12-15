
<!-- 
  File Name   : EvaluationProgressModal.vue
  Description : 평가 진행상황 모달 페이지
 
  History
  2025/12/14 - 승민 최초 작성
 
  @author 승민
  @version 1.0
-->

<!--template-->
<template>
  <div class="modal-overlay">
    <div class="modal">

      <!-- ===== Header ===== -->
      <header class="modal-header">
        <div class="header-left">
          <div class="header-icon"></div>
          <div class="header-text">
            <h2>평가 진행 현황</h2>
            <p class="subtitle">
              {{ evaluationDetail?.evaluationName }} ·
              {{ evaluationDetail?.evaluationDepartmentName }} ·
              {{ formatPeriod(evaluationDetail) }}
            </p>
          </div>
        </div>

        <button class="close-btn" @click="emit('close')">✕</button>
      </header>

      <!-- ===== Summary ===== -->
      <section class="summary">
        <div class="summary-card dark">
          <span class="label">전체 인원</span>
          <strong>{{ summary.total }}</strong>
          <span class="unit">명</span>
        </div>

        <div class="summary-card blue">
          <span class="label">평가 완료</span>
          <strong>{{ summary.done }}</strong>
          <span class="unit">{{ summary.doneRate }}%</span>
        </div>

        <div class="summary-card sky">
          <span class="label">미실시</span>
          <strong>{{ summary.progress }}</strong>
          <span class="unit">{{ summary.progressRate }}%</span>
        </div>
      </section>

      <!-- ===== Employee Table ===== -->
      <section class="employee-table">

        <div class="table-header">
          <div>No.</div>
          <div>이름</div>
          <div>직급</div>
          <div>평가 상태</div>
          <div>작업</div>
        </div>

        <div
          class="table-row"
          v-for="(emp, index) in evaluatees"
          :key="emp.evaluateeEvaluateeId"
        >
          <div>{{ index + 1 }}</div>
          <div class="name">{{ emp.evaluateeEmployeeName }}</div>
          <div class="muted">{{ emp.evaluateeGrade }}</div>

          <!-- 상태 -->
          <div>
            <span :class="['status', statusClass(emp.evaluateeStatus)]">
              {{ statusText(emp.evaluateeStatus) }}
            </span>
          </div>

          <!-- 액션 버튼 -->
          <div class="action">
            <!-- 미실시 -->
            <button
              v-if="emp.evaluateeStatus === 0"
              class="btn-action primary"
              @click="goWrite(emp)"
            >
              평가서 작성
            </button>

            <!-- 제출 완료 -->
            <button
              v-else-if="emp.evaluateeStatus === 1"
              class="btn-action warning"
              @click="goEdit(emp)"
            >
              수정하기
            </button>

            <!-- 평가 완료 -->
            <button
              v-else-if="emp.evaluateeStatus === 2"
              class="btn-action gray"
              @click="goView(emp)"
            >
              평가 확인
            </button>
          </div>
        </div>

      </section>

      <!-- ===== Footer ===== -->
      <footer class="modal-footer">
        <button class="btn-close" @click="emit('close')">닫기</button>
      </footer>

    </div>
  </div>
</template>

<!--script-->
<script setup lang="ts">
//Import 구문
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import apiClient from "@/api/apiClient";

const router = useRouter();

// props 데이터
const props = defineProps<{
  evaluation: any; // 부모에서 선택된 evaluation row
}>();


const emit = defineEmits<{
  (e: "close"): void;
}>();

//Reactive 데이터
const evaluationDetail = ref<any>(null);
const evaluatees = ref<any[]>([]);

/**
 * 설명: 평가 세부 데이터 조회
 */
const fetchEvaluationDetail = async () => {
  if (!props.evaluation?.evaluationEvaluationId) return;

  try {
    const res = await apiClient.get(
      `/evaluation/evaluation/select/${props.evaluation.evaluationEvaluationId}`
    );

    evaluationDetail.value = res.data;
    evaluatees.value = res.data.evaluatees ?? [];
  } catch (e) {
    console.error("평가 상세 조회 실패", e);
  }
};

/**
 * 설명: 평가서 작성
 */
const goWrite = (emp: any) => {
  const evaluationId = evaluationDetail.value?.evaluationEvaluationId;
  if (!evaluationId) return;

  router.push({
    path: `/evaluation/form/create/${evaluationId}`,
    query: {
      employeeId: emp.evaluateeEmployeeId,
      departmentId: emp.evaluateeDepartmentId,
    },
  });
};

/**
 * 설명: 평가서 수정
 */
const goEdit = (emp: any) => {
  console.log("평가서 수정", emp);
  // router.push(`/evaluation/form/edit/${emp.evaluateeEmployeeId}`)
};

/**
 * 설명: 평가서 확인
 */
const goView = (emp: any) => {
  console.log("평가서 확인", emp);
  // router.push(`/evaluation/form/view/${emp.evaluateeEmployeeId}`)
};

/**
 * 설명: 마운트 시, 평가 세부 데이터 조회
 */
onMounted(fetchEvaluationDetail);

/**
 * 설명: 페이지네이션 버튼 계산 메소드
 */
const summary = computed(() => {
  const total = evaluatees.value.length;
  const done = evaluatees.value.filter(e => e.evaluateeStatus === 1).length;
  const progress = evaluatees.value.filter(e => e.evaluateeStatus === 0).length;

  const rate = (v: number) =>
    total === 0 ? 0 : Math.round((v / total) * 100);

  return {
    total,
    done,
    progress,
    doneRate: rate(done),
    progressRate: rate(progress),
  };
});

/**
 * 설명: 피평가자 상태 조회 메소드
 * @param {number} status - 피평가자 상태 값 
 */
const statusText = (status: number) => {
  switch (status) {
    case 0: return "미실시";
    case 1: return "제출 완료";
    case 2: return "평가 완료";
    default: return "-";
  }
};

/**
 * 설명: 평가 상태 메소드
 * @param {number} status - 평가 상태 값 
 */
const statusClass = (status: number) => {
  switch (status) {
    case 0: return "done";
    case 1: return "progress";
    default: return "none";
  }
};

/**
 * 설명: 평가 기간 타입 변환 메소드
 * @param {any} item - 평가 기간 데이터 
 */
const formatPeriod = (item: any) => {
  if (!item?.evaluationEvaluationPeriodStart) return "-";
  const s = new Date(item.evaluationEvaluationPeriodStart).toLocaleDateString("ko-KR");
  const e = new Date(item.evaluationEvaluationPeriodEnd).toLocaleDateString("ko-KR");
  return `${s} ~ ${e}`;
};
</script>

<!--style-->
<style scoped>
/* ===== Overlay ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 43, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

/* ===== Modal ===== */
.modal {
  width: 1200px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

/* ===== Header ===== */
.modal-header {
  height: 114px;
  padding: 24px;
  background: linear-gradient(180deg, #1c398e, #162456);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  gap: 16px;
  align-items: center;
}

.header-icon {
  width: 28px;
  height: 28px;
  border: 2px solid white;
  border-radius: 6px;
}

.header-text h2 {
  color: white;
  font-size: 24px;
  font-weight: 700;
}

.subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 15px;
  margin-top: 6px;
}

.close-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 18px;
  cursor: pointer;
}

/* ===== Summary ===== */
.summary {
  display: flex;
  gap: 16px;
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.summary-card {
  flex: 1;
  padding: 18px;
  border-radius: 12px;
  color: white;
}

.summary-card strong {
  font-size: 28px;
  display: block;
}

.summary-card .label {
  font-size: 13px;
  opacity: 0.9;
}

.summary-card .unit {
  font-size: 12px;
  opacity: 0.8;
}

.dark  { background: linear-gradient(180deg, #1c398e, #162456); }
.blue  { background: linear-gradient(180deg, #2563eb, #1c398e); }
.sky   { background: linear-gradient(180deg, #3b82f6, #2563eb); }
.light { background: linear-gradient(180deg, #60a5fa, #3b82f6); }
.score { background: linear-gradient(180deg, #93c5fd, #60a5fa); }

/* ===== Progress ===== */
.total-progress {
  padding: 24px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.progress-header strong {
  color: #1c398e;
}

.progress-bar {
  height: 16px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  width: 43%;
  background: linear-gradient(180deg, #1c398e, #162456);
}

/* ===== Employee Table ===== */
.employee-table {
  padding: 24px;
  max-height: 300px;
  overflow-y: auto;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns:
    60px
    160px
    160px
    120px
    200px
    160px;
  align-items: center;
}

.table-header {
  height: 46px;
  border-bottom: 1px solid #e2e8f0;
  color: #62748e;
  font-size: 14px;
  font-weight: 600;
}

.table-row {
  height: 72px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
}

.name {
  font-weight: 600;
  color: #0f172b;
}

.muted {
  color: #62748e;
}

/* ===== Status Badge ===== */
.status {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
}

.status.done {
  background: #e0e7ff;
  color: #432dd7;
}

.status.progress {
  background: #dbeafe;
  color: #1447e6;
}

.status.none {
  background: #f1f5f9;
  color: #314158;
}

/* ===== Footer ===== */
.modal-footer {
  padding: 24px;
  background: #f8fafc;
  display: flex;
  justify-content: flex-end;
}

.btn-close {
  padding: 10px 24px;
  border-radius: 10px;
  border: none;
  background: #e2e8f0;
  font-weight: 600;
  cursor: pointer;
}

.action {
  display: flex;
  gap: 8px;
}

.btn-action {
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  border: none;
  cursor: pointer;
}

.btn-action.primary {
  background: linear-gradient(180deg, #1c398e, #162456);
  color: white;
}

.btn-action.warning {
  background: #fff7ed;
  color: #c2410c;
  border: 1px solid #fed7aa;
}

.btn-action.gray {
  background: #f1f5f9;
  color: #475569;
}
</style>