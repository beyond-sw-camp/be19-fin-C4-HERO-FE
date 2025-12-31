<!-- 
  <pre>
  (File => TypeScript / Vue) Name   : Correction.vue
  Description : 근태 기록 수정 이력 페이지
                - 상단 요약 카드로 이번 달 근무 현황 요약
                - 탭으로 근태 관련 4개 화면 간 이동
                - 기간 필터 + 페이지네이션을 사용한 근태 기록 수정 이력 조회

  History
  2025/12/10 - 이지윤 최초 작성
  </pre>

  @author 이지윤
  @version 1.1
-->

<template>
  <div class="attendance-wrapper">
    <div class="attendance-page">
      <!-- 상단 요약 카드 4개 -->
      <div class="summary-cards">
        <div class="summary-card">
          <div class="summary-title">이번 달 근무일</div>
          <div class="summary-value-wrapper">
            <span class="summary-value">{{ workDays }}</span>
            <span class="summary-unit">일</span>
          </div>
        </div>
  
        <div class="summary-card">
          <div class="summary-title">오늘 근무</div>
          <div class="summary-value-wrapper">
            <span class="summary-value">
              {{ todayWorkSystemName || '근무 정보 없음' }}
            </span>
          </div>
        </div>
  
        <div class="summary-card">
          <div class="summary-title">이번 달 지각</div>
          <div class="summary-value-wrapper">
            <span class="summary-value">{{ lateCount }}</span>
            <span class="summary-unit">회</span>
          </div>
        </div>
  
        <div class="summary-card">
          <div class="summary-title">이번 달 결근</div>
          <div class="summary-value-wrapper">
            <span class="summary-value">{{ absentCount }}</span>
            <span class="summary-unit">회</span>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-title">이번 달 조퇴</div>
          <div class="summary-value-wrapper">
            <span class="summary-value">{{ earlyCount }}</span>
            <span class="summary-unit">회</span>
          </div>
        </div>
      </div>

      <!-- 메인 패널 -->
      <div class="panel">
        <!-- 탭 영역 -->
        <div class="panel-tabs">
          <RouterLink
            :to="{ name: 'AttendancePersonal' }"
            class="tab tab-left"
            :class="{ 'tab-active': isActiveTab('AttendancePersonal') }"
          >
            개인 근태 이력
          </RouterLink>

          <RouterLink
            :to="{ name: 'AttendanceOvertime' }"
            class="tab"
            :class="{ 'tab-active': isActiveTab('AttendanceOvertime') }"
          >
            초과 근무 이력
          </RouterLink>

          <RouterLink
            :to="{ name: 'AttendanceCorrection' }"
            class="tab"
            :class="{ 'tab-active': isActiveTab('AttendanceCorrection') }"
          >
            지연 근무 수정 이력
          </RouterLink>

          <RouterLink
            :to="{ name: 'AttendanceChangeLog' }"
            class="tab tab-right"
            :class="{ 'tab-active': isActiveTab('AttendanceChangeLog') }"
          >
            근무 유형 변경 이력
          </RouterLink>
        </div>

        <div class="panel-body">
                  <!-- 검색 영역 -->
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

              <span class="filter-separator">~</span>

              <input
                v-model="endDate"
                type="date"
                class="filter-input"
                :max="today"
              />
            </div>
            <!-- 오른쪽: 검색 / 초기화 버튼 -->
            <div class="search-button-group">
              <button class="btn-search" @click="onSearch">검색</button>
              <button class="btn-reset" @click="onReset">초기화</button>
            </div>
          </div>
        </div>

        <!-- 테이블 영역 -->
        <div class="panel-table-wrapper">
          <div class="panel-table">
            <table class="attendance-table">
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>수정 전 출근 시간</th>
                  <th>수정 전 퇴근 시간</th>
                  <th>수정 후 출근 시간</th>
                  <th>수정 후 퇴근 시간</th>
                  <th>사유</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, index) in correctionStore.correctionList"
                  :key="row.correctionId"
                  :class="{ 'row-striped': index % 2 === 1 }"
                >
                  <td>{{ row.date }}</td>
                  <td class="time-cell">
                    {{ formatTime(row.prevStartTime) }}
                  </td>
                  <td class="time-cell">
                    {{ formatTime(row.prevEndTime) }}
                  </td>
                  <td class="time-cell changed-time">
                    {{ formatTime(row.newStartTime) }}
                  </td>
                  <td class="time-cell changed-time">
                    {{ formatTime(row.newEndTime) }}
                  </td>
                  <td>{{ row.reason }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 페이지네이션 UI -->
          <div class="pagination">
            <!-- 이전 -->
            <button
              class="page-button"
              :disabled="currentPage === 1"
              @click="goPage(currentPage - 1)"
            >
              이전
            </button>

            <!-- 숫자 버튼 -->
            <button
              v-for="page in totalPages"
              :key="page"
              class="page-button"
              :class="{ 'page-active': page === currentPage }"
              @click="goPage(page)"
            >
              {{ page }}
            </button>

            <!-- 다음 -->
            <button
              class="page-button"
              :disabled="currentPage === totalPages"
              @click="goPage(currentPage + 1)"
            >
              다음
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';

import { useAttendanceStore } from '@/stores/attendance/attendanceStore'; // 상단 요약
import { useCorrectionStore } from '@/stores/attendance/correction';


const route = useRoute();
const attendanceStore = useAttendanceStore();
const correctionStore = useCorrectionStore();

/**
 * 오늘 날짜 (date input 최대값 제한용)
 * 예: '2025-12-18'
 */
const today = new Date().toISOString().slice(0, 10);

/**
 * 현재 활성화된 탭인지 확인합니다.
 *
 * @param {string} name - 라우트 이름 (예: 'AttendanceCorrection')
 * @returns {boolean} 활성 탭 여부
 ****************************************
 * @param → 함수의 인자(Parameter)
 ****************************************
 */
const isActiveTab = (name: string): boolean => {
  return route.name === name;
};

/**
 * store 상태를 반응형으로 꺼냅니다.
 * - attendanceStore: 상단 요약 카드
 * - correctionStore: 수정 이력 리스트 + 필터 + 페이지네이션
 */
const {
  workDays,
  todayWorkSystemName,
  lateCount,
  absentCount,
  earlyCount,
} = storeToRefs(attendanceStore);

const {
  correctionList,
  startDate,
  endDate,
  currentPage,
  totalPages,
} = storeToRefs(correctionStore);


/**
 * 근태 기록 수정 이력 페이지 진입 시 초기화 로직입니다.
 * - 기존에 설정된 필터(startDate, endDate)가 있다면 인풋에 반영
 * - 1 페이지 데이터를 조회합니다.
 */
onMounted(() => {
  startDate.value = correctionStore.startDate || '';
  endDate.value = correctionStore.endDate || '';

  correctionStore.fetchCorrections(1);
});

/**
 * 검색 버튼 클릭 시 실행되는 핸들러입니다.
 * - 기간 필터(startDate, endDate)를 스토어에 반영한 뒤
 *   1 페이지부터 근태 기록 수정 이력을 다시 조회합니다.
 */
const onSearch = (): void => {
  correctionStore.setFilterDates(startDate.value, endDate.value);
  correctionStore.fetchCorrections(1);
};

/**
 * 초기화 버튼 클릭 시 실행되는 핸들러입니다.
 * - 기간 필터를 초기화하고
 *   1 페이지부터 근태 기록 수정 이력을 다시 조회합니다.
 */
const onReset = (): void => {
  startDate.value = '';
  endDate.value = '';

  correctionStore.resetFilters();
  correctionStore.fetchCorrections(1);
};

/**
 * 페이지를 이동합니다.
 * - 1 페이지보다 작거나 총 페이지 수를 초과하는 경우 이동하지 않습니다.
 *
 * @param {number} page - 이동할 페이지 번호
 */
const goPage = (page: number): void => {
  const maxPage = totalPages.value || 1;

  if (page < 1 || page > maxPage) {
    return;
  }

  correctionStore.fetchCorrections(page);
};

/**
 * 시간 문자열을 'HH:mm' 형식으로 변환합니다.
 * - 서버에서 '09:00:00' 같은 형식으로 내려오는 값을
 *   '09:00'으로 잘라서 표시합니다.
 *
 * @param {string | null | undefined} time - 시간 문자열
 * @returns {string} 변환된 시간 문자열, 값이 없으면 빈 문자열
 */
const formatTime = (time?: string | null): string => {
  if (!time) {
    return '';
  }

  return time.length >= 5 ? time.substring(0, 5) : time;
};
</script>



<style scoped>
* {
  font-size: 14px;
  font-family: "Inter-Regular", sans-serif;
}

.attendance-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: auto;
}

.attendance-page {
  width: 100%;
  height: 85%;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 36px;
  overflow-y: auto;
}

/* 상단 요약 카드 */
.summary-cards {
  display: flex;
  align-items: stretch;
  gap: 10px;
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
  font-size: 18px;
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

/* 메인 패널 */
.panel {
  width: 100%;
  /* background: #ffffff; */
  border-radius: 14px;
  /* border: 2px solid #e2e8f0; */
  display: flex;
  flex-direction: column;
}

/* 탭 영역 */
.panel-tabs {
  display: flex;
  flex-direction: row;
}

.tab {
  width: 146px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
  border-right: 1px solid #e2e8f0;
  color: #62748e;
  text-decoration: none;
}

.tab-left {
  border-left: 1px solid #e2e8f0;
  border-top-left-radius: 14px;
}

.tab-right {
  border-top-right-radius: 14px;
}

.tab-active {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: #ffffff;
  font-weight: 700;
}

.panel-body{
  border: 1px solid #e2e8f0;
  background-color: #ffffff;
  border-bottom-left-radius: 14px;
  border-bottom-right-radius: 14px;  
}

/* 검색 영역 */
.panel-search {
  border-left: 1px solid #e2e8f0;
  border-right: 1px solid #e2e8f0;
  padding: 14px 18px;
}

.panel-search-inner {
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  gap: 8px;
}

.search-button-group {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-bottom: 0px;
}

/* 날짜 필터 그룹 */
.filter-label {
  color: #64748b;
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

/* 조회기간 + 날짜 범위 한 줄 정렬 */
.filter-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

/* ~ 구분자 */
.filter-separator {
  color: #64748b;
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
  color: #94a3b8;
}

/* 버튼 */
.btn-search,
.btn-reset {
  min-width: 70px;
  height: 40px;
  border-radius: 10px;
  cursor: pointer;
  padding: 0 12px;
  border-width: 2px;
  border-style: solid;
  transition: background-color 0.15s ease,
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

/* 테이블 영역 */
.panel-table-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0px 0 18px;
  gap: 20px;
}

.panel-table {
  border: 1px solid #e2e8f0;
  /* border-radius: 8px; */
  overflow: hidden;
}

/* 테이블 */
.attendance-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed; 
}
.attendance-table th:nth-child(1),
.attendance-table td:nth-child(1) {
  width: 16%;
}

.attendance-table th:nth-child(2),
.attendance-table td:nth-child(2),
.attendance-table th:nth-child(3),
.attendance-table td:nth-child(3),
.attendance-table th:nth-child(4),
.attendance-table td:nth-child(4),
.attendance-table th:nth-child(5),
.attendance-table td:nth-child(5) {
  width: 17%;
  text-align: center;
  white-space: nowrap; 
}

.attendance-table th:nth-child(6),
.attendance-table td:nth-child(6) {
  width: 16%;
  text-align: left;
  word-break: break-word; 
}

.attendance-table thead tr {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
}

.attendance-table th {
  color: #ffffff;
  font-weight: 700;
  padding: 16px;
  text-align: left;
}

.attendance-table td {
  padding: 16px;
  color: #62748e;
  border-top: 0.67px solid #e2e8f0;
}

/* 시간 칸 전용 */
.attendance-table td.time-cell {
  text-align: center;
  padding-left: 16px;   
  padding-right: 16px;  
  font-variant-numeric: tabular-nums;
}

.attendance-table tbody tr {
  background: #ffffff;
}

.attendance-table tbody tr.row-striped {
  background: #f8fafc;
}

/* 페이지네이션 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 0;
  gap: 10px;
}

.page-button {
  min-width: 32px;
  height: 28px;
  border-radius: 4px;
  border: 0.67px solid #cad5e2;
  color: #62748e;
  background: #ffffff;
  cursor: pointer;
}

.page-active {
  background: #155dfc;
  color: #ffffff;
  border-color: #155dfc;
}

/* 수정 후 시간 강조 */
.attendance-table td.changed-time {
  color: #e7000b;
}



</style>
