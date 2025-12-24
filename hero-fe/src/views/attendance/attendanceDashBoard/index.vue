<!-- 
  <pre>
  (File => TypeScript / Vue) Name   : AttendanceDashboard.vue
  Description : 근태 점수 대시보드 화면
                - 기간 필터(시작/종료일) + 검색/초기화
                - 직원별 지각/결근/점수 테이블
                - 상단 요약 카드(전체 직원, 우수/위험 직원 수, 점수 계산식)
                - 서버 페이지네이션 기반 조회

  History
  2025/12/17(이지윤) 최초 작성
  </pre>

  @author 이지윤
  @version 1.0
-->

<template>
  <div class="attendance-dashboard-wrapper">
    <!-- 상단 요약 카드 4개 -->
    <div class="summary-cards">
      <!-- 전체 직원 -->
      <div class="summary-card">
        <div class="summary-title">전체 직원</div>
        <div class="summary-value-wrapper">
          <span class="summary-value">{{ totalEmployees }}</span>
          <span class="summary-unit">명</span>
        </div>
      </div>

      <!-- 우수 직원 -->
      <div class="summary-card">
        <div class="summary-title">우수 직원(95점 이상)</div>
        <div class="summary-value-wrapper">
          <span class="summary-value">{{ excellentEmployees }}</span>
          <span class="summary-unit">명</span>
        </div>
      </div>

      <!-- 위험 직원 -->
      <div class="summary-card">
        <div class="summary-title">위험 직원(85점 이하)</div>
        <div class="summary-value-wrapper">
          <span class="summary-value">{{ riskyEmployees }}</span>
          <span class="summary-unit">명</span>
        </div>
      </div>

      <!-- 점수 계산 식 -->
      <div class="summary-card">
        <div class="summary-title">점수 계산 식</div>
        <div class="summary-formula">
          점수: 100 - (지각 × 1) - (결근 × 2)
        </div>
      </div>
    </div>

    <!-- 하단 패널 (필터 + 테이블 + 페이지네이션) -->
    <div class="dashboard-panel">
      <!-- Personal.vue 과 동일한 구조의 기간 필터 영역 -->
        <div class="panel-search">
          <div class="panel-search-inner">
            <!-- 왼쪽: 조회기간 + 날짜 범위 (전자결재와 동일한 형태) -->
            <div class="filter-row">
              <span class="filter-label">조회기간</span>
              <input
                v-model="startDate"
                type="date"
                class="filter-input"
                :max="today"
              />
<<<<<<< HEAD
              <span class="date-icon">📅</span>
            </div>
          </div>
=======
>>>>>>> cc32dee900475e50a45125cb145da3537f398b09

              <span class="filter-separator">~</span>

              <input
                v-model="endDate"
                type="date"
                class="filter-input"
                :max="today"
              />
<<<<<<< HEAD
              <span class="date-icon">📅</span>
=======
            </div>
            <!-- 오른쪽: 검색 / 초기화 버튼 -->
            <div class="search-button-group">
              <button class="btn-search" @click="onSearch">검색</button>
              <button class="btn-reset" @click="onReset">초기화</button>
>>>>>>> cc32dee900475e50a45125cb145da3537f398b09
            </div>
          </div>
        </div>

      <!-- 테이블 영역 -->
      <div class="dashboard-table-wrapper">
        <table class="dashboard-table">
          <thead>
            <tr>
              <th class="col-rank">사번</th>
              <th class="col-name">이름</th>
              <th class="col-dept">부서</th>
              <th class="col-tardy">지각</th>
              <th class="col-absence">결근</th>
              <th class="col-score">점수</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, index) in pagedEmployees"
              :key="row.employeeId"
              :class="{ 'row-striped': index % 2 === 1 }"
            >
              <!-- 사번 -->
              <td>{{ row.employeeNumber }}</td>

              <!-- 이름 -->
              <td>{{ row.employeeName }}</td>

              <!-- 부서 -->
              <td>{{ row.departmentName }}</td>

              <!-- 지각 -->
              <td :class="{ 'danger-text': row.tardyCount > 0 }">
                {{ row.tardyCount }}회
              </td>

              <!-- 결근 -->
              <td :class="{ 'danger-text': row.absenceCount > 0 }">
                {{ row.absenceCount }}회
              </td>

              <!-- 점수 -->
              <td>{{ row.score }}점</td>
            </tr>

            <!-- 데이터 없음 -->
            <tr v-if="pagedEmployees.length === 0">
              <td
                colspan="6"
                class="empty-row"
              >
                검색 조건에 해당하는 직원이 없습니다.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 페이지네이션 -->
      <div class="pagination">
        <button
          type="button"
          class="page-button"
          :disabled="currentPage === 1"
          @click="goPage(currentPage - 1)"
        >
          이전
        </button>

        <button
          v-for="page in totalPages"
          :key="page"
          type="button"
          class="page-button"
          :class="{ 'page-active': page === currentPage }"
          @click="goPage(page)"
        >
          {{ page }}
        </button>

        <button
          type="button"
          class="page-button"
          :disabled="currentPage === totalPages"
          @click="goPage(currentPage + 1)"
        >
          다음
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';

import {
  useAttendanceDashboardStore,
  type AttendanceDashboardDTO,
} from '@/stores/attendance/dashboard';

const today = new Date().toISOString().slice(0, 10);


/** 근태 대시보드 Pinia 스토어 인스턴스 */
const dashboardStore = useAttendanceDashboardStore();

/**
 * storeToRefs 로 state를 추출하여 템플릿에 바인딩
 */
const {
  dashboardList,   // 현재 페이지 직원 목록
  currentPage,     // 현재 페이지 번호(프론트 기준)
  totalPages,      // 전체 페이지 수
  totalCount,      // 전체 직원 수
  startDate,       // 기간(시작) - YYYY-MM-DD
  endDate,         // 기간(종료) - YYYY-MM-DD
} = storeToRefs(dashboardStore);

/**
 * 상단 카드용 집계 - 전체 직원 수
 * - 전체 데이터 개수는 PageResponse.totalCount/totalElements를 사용
 */
const totalEmployees = computed<number>(() => totalCount.value);

/**
 * 상단 카드용 집계 - 우수 직원 수 (95점 이상)
 * - 현재는 "현재 페이지 기준"으로 계산
 *   (TODO: 필요하면 백엔드에서 전체 집계값을 내려주도록 확장)
 */
const excellentEmployees = computed<number>(() => {
  return dashboardList.value.filter((emp) => emp.score >= 95).length;
});

/**
 * 상단 카드용 집계 - 위험 직원 수 (85점 이하)
 * - 현재는 "현재 페이지 기준"으로 계산
 */
const riskyEmployees = computed<number>(() => {
  return dashboardList.value.filter((emp) => emp.score <= 85).length;
});

/**
 * 현재 페이지에 표시할 직원 목록
 * - 서버 페이징을 사용하므로, PageResponse.content를 그대로 사용
 */
const pagedEmployees = computed<AttendanceDashboardDTO[]>(() => {
  return dashboardList.value;
});

/**
 * 검색 버튼 클릭 핸들러
 * - 기간 필터(startDate, endDate)를 스토어에 반영하고 1페이지부터 재조회
 */
const onSearch = (): void => {
  dashboardStore.setFilterDates(startDate.value, endDate.value);
  dashboardStore.fetchDashboard(1);
};

/**
 * 초기화 버튼 클릭 핸들러
 * - 기간 필터와 페이지를 초기화하고 전체 기준으로 다시 조회
 * - Personal.vue와 동일하게 인풋은 빈 문자열로 두어 placeholder 유지
 */
const onReset = (): void => {
  startDate.value = '';
  endDate.value = '';
  dashboardStore.setFilterDates('', '');
  dashboardStore.fetchDashboard(1);
};

/**
 * 페이지 이동
 * - 서버에 해당 페이지를 다시 요청
 *
 * @param {number} page - 이동할 페이지 번호
 ****************************************
 * @param → 함수의 인자(Parameter)
 ****************************************
 */
const goPage = (page: number): void => {
  if (page < 1 || page > totalPages.value) {
    return;
  }
  dashboardStore.fetchDashboard(page);
};

/**
 * 화면 진입 시 기본 조회
 * - 기간 필터가 비어 있는 상태로 전체 기준 1페이지 조회
 */
onMounted(() => {
  dashboardStore.fetchDashboard(1);
});
</script>

<style scoped>
/* TODO: attendance-dashboard-wrapper / dashboard-panel / dashboard-table 등
   BEM 네이밍 컨벤션에 맞춰 점진적 리팩터링 예정 */
</style>



<style scoped>
.attendance-dashboard-wrapper {
  width: 100%;
  height: 100%;
  padding: 36px;
  display: flex;
  flex-direction: column;
  gap: 30px;
  box-sizing: border-box;
}

/* 상단 요약 카드 */
.summary-cards {
  display: flex;
  align-items: stretch;
  gap: 20px;
}

.summary-card {
  flex: 1;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  padding: 12px 12px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.summary-title {
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.2;
  margin-bottom: 8px;
}

.summary-value-wrapper {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.summary-value {
  font-size: 18px;
  font-weight: 700;
  color: #000000;
}

.summary-unit {
  font-size: 18px;
  font-weight: 500;
  color: #64748b;
}

.summary-formula {
  font-size: 13px;
  color: #1f2933;
}

/* 하단 패널 */
.dashboard-panel {
  width: 100%;
  background: #ffffff;
  border-radius: 14px;
  outline: 2px solid #e2e8f0;
  outline-offset: -2px;
  display: flex;
  flex-direction: column;
}

/* === Personal.vue 와 동일하게 맞춘 기간 필터 영역 === */
.panel-search {
  border-bottom: 1px solid #e2e8f0;
  padding: 14px 18px;
}

.panel-search-inner {
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  gap: 8px;
}

/* 조회기간 + 날짜 범위 한 줄 정렬 */
.filter-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

/* "조회기간" 텍스트 */
.filter-label {
  color: #64748b;
}

/* 날짜 필터 그룹 */
.date-filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.date-label {
  font-size: 13px;
  color: #64748b;
}

/* input + 캘린더 아이콘 */
.date-input-wrapper {
  display: flex;
  align-items: center;
  width: 260px;
  height: 40px;
  border-radius: 10px;
  border: 2px solid #cad5e2;
  background: #ffffff;
  overflow: hidden;
}

.date-input {
  flex: 1;
  border: none;
  height: 100%;
  padding: 0 12px;
  font-size: 14px;
  color: #1f2933;
}

.date-input:focus {
  outline: none;
}

.date-icon {
  width: 40px;
  height: 100%;
  border-left: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #94a3b8;
}

/* 버튼 영역 */
.search-button-group {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-bottom: 2px;
}

.btn-search,
.btn-reset {
  min-width: 70px;
  height: 40px;
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
  padding: 0 12px;
  border-width: 2px;
  border-style: solid;
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    box-shadow 0.1s ease,
    transform 0.05s ease;
}

.btn-search {
  background: #155dfc;
  border-color: #155dfc;
  color: #ffffff;
}

.btn-reset {
  background: #ffffff;
  border-color: #cad5e2;
  color: #62748e;
}

.btn-search:hover {
  background: #2b6bff;
  border-color: #2b6bff;
}

.btn-reset:hover {
  background: #e5edff;
}

.btn-search:active,
.btn-reset:active {
  transform: translateY(1px);
  box-shadow: none;
}

/* 테이블 */
.dashboard-table-wrapper {
  width: 100%;
}

.dashboard-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

/* 헤더 */
.dashboard-table thead tr {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
}

.dashboard-table th {
  padding: 11px 16px;
  text-align: left;
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
}

.col-rank,
.col-name,
.col-dept,
.col-tardy,
.col-absence,
.col-score {
  width: 16.6%;
}

/* 바디 */
.dashboard-table td {
  padding: 16px;
  font-size: 14px;
  color: #838ba5;
  border-top: 0.67px solid #e2e8f0;
}
.dashboard-table tbody tr:last-child td {
  border-bottom: 0.67px solid #e2e8f0;
}

.row-striped {
  background-color: #f8fafc;
}

.danger-text {
  color: #e7000b;
}

.empty-row {
  text-align: center;
  padding: 24px 0;
  color: #9ca3af;
}

/* 페이지네이션 */
.pagination {
  width: 100%;
  padding: 16px 0;
  background: #f8fafc;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.page-button {
  min-width: 34px;
  height: 29px;
  padding: 4px 10px;
  border-radius: 4px;
  border: 0.67px solid #cad5e2;
  background: #ffffff;
  font-size: 14px;
  color: #62748e;
  cursor: pointer;
}

.page-button:disabled {
  opacity: 0.5;
  cursor: default;
}

.page-active {
  background: #155dfc;
  color: #ffffff;
  border-color: #155dfc;
}

/* 날짜 인풋 (전자결재 페이지와 비슷한 스타일) */
.filter-input {
  width: 220px;
  height: 40px;
  border-radius: 10px;
  border: 2px solid #cad5e2;
  background: #ffffff;
  padding: 0 12px;
  color: #1f2933;
}

/* ~ 구분자 */
.filter-separator {
  color: #64748b;
}
</style>
