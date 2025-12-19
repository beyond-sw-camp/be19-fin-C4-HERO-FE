<!-- 
  File Name   : EvaluationList2.vue
  Description : 생성된 평가 목록 조회 페이지
 
  History
  2025/12/14 - 승민 최초 작성
 
  @author 승민
  @version 1.0
-->

<!--template-->
<template>
  <div class="page">
    <div class="content-wrapper">

      <!-- ================= 상단 탭 ================= -->
      <div class="tabs">
        <div class="tab-group">

          <div class="tab-inactive" @click="goTemplateList">
            <span class="tab-inactive-text">평가 템플릿 목록</span>
          </div>

          <div class="tab-active" @click="goEvaluationList">
            <span class="tab-active-text">생성된 평가</span>
          </div>

        </div>
      </div>

      <!-- ================= 리스트 박스 ================= -->
      <div class="list-box">

        <!-- ================= table-wrapper (여기에 배치) ================= -->
        <div class="table-wrapper">

          <!-- ===== Header ===== -->
          <div class="table-header">
            <div class="th">평가명</div>
            <div class="th">평가자</div>
            <div class="th">부서</div>
            <div class="th">평가 기간</div>
            <div class="th">상태</div>
            <div class="th">생성일</div>
            <div class="th">작업</div>
          </div>

          <!-- ===== Rows ===== -->
          <div
            class="table-row clickable-row"
            v-for="item in evaluations"
            :key="item.evaluationEvaluationId"
            @click="goEvaluationDetail(item.evaluationEvaluationId)"
          >
            <div class="td">{{ item.evaluationName }}</div>
            <div class="td muted">{{ item.evaluationEmployeeName }}</div>
            <div class="td muted">{{ item.evaluationDepartmentName }}</div>

            <div class="td muted">
                {{ formatPeriod(item) }}
            </div>

            <div class="td">
                <span :class="['status', getStatusClass(item.evaluationStatus)]">
                {{ getStatusText(item.evaluationStatus) }}
                </span>
            </div>

            <div class="td muted">
                {{ formatDate(item.evaluationCreatedAt) }}
            </div>

            <div class="td actions">
                <button
                  class="btn info"
                  @click.stop="openProgressModal(item)"
                >
                  진행 현황
                </button>

                <button
                  class="btn danger"
                  :disabled="authEmployeeId !== item.evaluationEmployeeId"
                  @click.stop="deleteEvaluation(item.evaluationEvaluationId)"
                >
                  삭제
                </button>
            </div>
          </div>

        </div>

        <!-- ================= Pagination ================= -->
        <div class="paging">
            <div class="page-btn" @click="goPage(currentPage - 1)">
                이전
            </div>

            <div
                class="page-btn"
                v-for="page in pageNumbers"
                :key="page"
                :class="{ active: page === currentPage }"
                @click="goPage(page)"
            >
                {{ page + 1 }}
            </div>

            <div class="page-btn" @click="goPage(currentPage + 1)">
                다음
            </div>
        </div>

      </div>
    </div>
  </div>

  <EvaluationProgressModal
    v-if="showProgressModal"
    :evaluation="selectedEvaluation"
    @close="closeProgressModal"
  />
</template>

<script setup lang="ts">
//Import 구문
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import apiClient from "@/api/apiClient";
import EvaluationProgressModal from "@/views/evaluation/EvaluationProgressModal.vue";
import { useAuthStore } from '@/stores/auth';

//외부 로직
const router = useRouter();
const authStore = useAuthStore();

// 페이지네이션 타입
interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

//Reactive 데이터
const evaluations = ref<any[]>([]);
const loading = ref(false);

const currentPage = ref(0);
const pageSize = ref(10);
const totalPages = ref(0);

const showProgressModal = ref(false);
const selectedEvaluation = ref<any>(null);

const authEmployeeId = ref();
const authEmployeeName = ref();
const authDepartmentId = ref();
const authDepartmentName = ref();
const authGradeId = ref();
const authGradeName = ref();

authEmployeeId.value = authStore.user?.employeeId
authEmployeeName.value = authStore.user?.employeeName
authDepartmentId.value = authStore.user?.departmentId
authDepartmentName.value = authStore.user?.departmentName
authGradeId.value = authStore.user?.gradeId
authGradeName.value = authStore.user?.gradeName

/**
 * 설명: 생성된 평가 목록 조회 메소드
 */
const fetchEvaluations = async () => {
  try {
    loading.value = true;

    const res = await apiClient.get<PageResponse<any>>(
      "/evaluation/evaluation/selectall",
      {
        params: {
          page: currentPage.value,
          size: pageSize.value
        }
      }
    );

    evaluations.value = res.data.content;
    totalPages.value = res.data.totalPages;

  } catch (e) {
    console.error("평가 목록 조회 실패", e);
  } finally {
    loading.value = false;
  }
};

/**
 * 설명: 페이지 번호로 이동하는 메소드
 * @param {number} page - 페이지 번호 
 */
const goPage = (page: number) => {
  if (page < 0 || page >= totalPages.value) return;
  currentPage.value = page;
  fetchEvaluations();
};

/**
 * 설명: 페이지 번호를 계산하는 메소드
 */
const pageNumbers = computed(() =>
  Array.from({ length: totalPages.value }, (_, i) => i)
);

/**
 * 설명: 날짜 변환 메소드
 * @param {string} date - 문자열 타입 날짜
 */
const formatDate = (date: string) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("ko-KR");
};

/**
 * 설명: 평가 기간 타입 변환 메소드
 * @param {any} item - 평가 기간 데이터 
 */
const formatPeriod = (item: any) => {
  if (!item.evaluationEvaluationPeriodStart || !item.evaluationEvaluationPeriodEnd) {
    return "-";
  }

  const start = new Date(item.evaluationEvaluationPeriodStart).toLocaleDateString("ko-KR");
  const end = new Date(item.evaluationEvaluationPeriodEnd).toLocaleDateString("ko-KR");

  return `${start} ~ ${end}`;
};

/**
 * 설명: 피평가자 상태 변환 메소드
 * @param {number} status - 피평가자 상태 값 
 */
const getStatusText = (status: number) => {
  switch (status) {
    case 0: return "진행중";
    case 1: return "제출 완료";
    case 2: return "평가 완료";
    case 3: return "평가 미완료"
    default: return "-";
  }
};

/**
 * 설명: 평가 상태 변환 메소드
 * @param {number} status - 평가 상태 값
 */
const getStatusClass = (status: number) => {
  switch (status) {
    case 2: return "done";
    default: return "draft";
  }
};

/**
 * 설명: 평가 템플릿 목록으로 이동하는 메소드
 */
const goTemplateList = () => {
  router.push("/evaluation/list");
};

/**
 * 설명: 생성된 평가 목록으로 이동하는 메소드
 */
const goEvaluationList = () => {
  router.push("/evaluation/list2");
};

/**
 * 설명: 평가 세부 페이지로 이동
 * @param {number} evaluationId - 평가 ID
 */
const goEvaluationDetail = (evaluationId: number) => {
  router.push(`/evaluation/evaluation/${evaluationId}`);
};

/**
 * 설명: 모달에 평가 데이터 주입 및 평가 진행상황 모달 열기 메소드
 * @param {any} item - 모달에 들어가는 평가 데이터 
 */
const openProgressModal = (item: any) => {
  selectedEvaluation.value = item;
  showProgressModal.value = true;
};

/**
 * 설명: 평가 진행상황 모달 닫기 메소드
 */
const closeProgressModal = () => {
  showProgressModal.value = false;
  selectedEvaluation.value = null;
};

/**
 * 설명: 평가 삭제 메소드
 * @param {number} evaluationId - 평가 번호 
 */
const deleteEvaluation = async (evaluationId: number) => {

  if (!confirm("정말 이 평가를 삭제하시겠습니까?\n(선택 항목, 피평가자도 함께 삭제됩니다)")) {
    return;
  }

  try {
    await apiClient.delete(`/evaluation/evaluation/delete/${evaluationId}`);

    alert("평가가 삭제되었습니다.");

    // 목록 갱신
    await fetchEvaluations();

  } catch (e) {
    console.error("평가 삭제 실패", e);
    alert("평가 삭제 중 오류가 발생했습니다.");
  }
};

/**
 * 설명: 마운트 시, 평가 목록 조회 메소드
 */
onMounted(() => {
  fetchEvaluations();
});
</script>

<style scoped>
/* ===== Layout ===== */
.page {
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

.tab-active,
.tab-inactive {
  width: 145px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 14px 14px 0 0;
  outline: 2px solid #e2e8f0;
  outline-offset: -2px;
}

.tab-active {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
}

.tab-active-text {
  color: white;
  font-size: 14px;
}

.tab-inactive {
  background: white;
}

.tab-inactive-text {
  color: #62748e;
  font-size: 14px;
}

/* ===== List Box ===== */
.list-box {
  background: white;
  border: 2px solid #e2e8f0;
  border-top: none;
  border-radius: 0 14px 14px 14px;
}

/* ===== Table ===== */
.table-wrapper {
  overflow-x: hidden;
}

/* ✅ 헤더 높이: 두 번째 코드와 동일 */
.table-header,
.table-row {
  display: grid;
  grid-template-columns:
    2fr
    1fr
    1fr
    1.5fr
    1fr
    1fr
    2.5fr;
}

/* ✅ 헤더 높이 & 패딩 동일 */
.table-header {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
}

.th {
  padding: 12px 20px;   /* 🔥 핵심: 헤더 높이 동일 */
  display: flex;
  align-items: center;
  color: white;
  font-size: 14px;
  font-weight: 700;
}

/* ===== Table Body ===== */
.table-row {
  border-top: 1px solid #e2e8f0;
}

.td {
  padding: 20px;
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #0f172b;
}

.muted {
  color: #62748e;
}

/* ===== Status ===== */
.status {
  padding: 2px 12px;
  border-radius: 999px;
  font-size: 14px;
}

.done {
  background: #dcfce7;
  color: #008236;
}

.draft {
  background: #f1f5f9;
  color: #314158;
}

/* ===== Actions ===== */
.actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn {
  height: 28px;
  padding: 0 10px;
  border-radius: 8px;
  font-size: 12px;
  border: none;
  cursor: pointer;
}

.primary {
  background: linear-gradient(180deg, #0d00ff, #080099);
  color: white;
}

.info {
  background: linear-gradient(180deg, #4f46e5, #4338ca);
  color: white;
}

.danger {
  background: linear-gradient(180deg, #ef4444, #dc2626);
  color: white;
}

/* ===== Pagination ===== */
.paging {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 16px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

/* 글씨 색 + 크기 동일 */
.page-btn {
  padding: 5px 12px;
  border-radius: 4px;
  border: 1px solid #cad5e2;
  background: white;
  color: #62748e;     /* 🔥 동일 */
  font-size: 14px;    /* 🔥 동일 */
  cursor: pointer;
}

/* 활성 버튼 동일 */
.page-btn.active {
  background: #155dfc;
  color: white;
  border: none;
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.clickable-row {
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.clickable-row:hover {
  background-color: #f8fafc;
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>