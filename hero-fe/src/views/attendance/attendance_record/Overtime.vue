<!-- 
  <pre>
  (File => TypeScript / Vue) Name   : Overtime.vue
  Description : 개인 초과 근무 이력 페이지
                - 상단 요약 카드로 이번 달 근무 현황 요약
                - 탭으로 근태 관련 4개 화면 간 이동
                - 기간 필터 + 페이지네이션을 사용한 초과 근무 이력 조회

  History
  2025/12/10 - 이지윤 최초 작성
  </pre>

  @author 이지윤
  @version 1.0
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
        <!-- 상단 탭 -->
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
            근태 기록 수정 이력
          </RouterLink>

          <RouterLink
            :to="{ name: 'AttendanceChangeLog' }"
            class="tab tab-right"
            :class="{ 'tab-active': isActiveTab('AttendanceChangeLog') }"
          >
            근무제 변경 이력
          </RouterLink>
        </div>
      <div class="panel-body">
                <!-- 검색 영역(기간 필터) -->
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
                  <th class="col-time">시작시간</th>
                  <th class="col-time">종료시간</th>
                  <th class="col-overtime">초과 근무 시간</th>
                  <th class="col-reason">사유</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, index) in displayList"
                  :key="row.overtimeId"
                  :class="{ 'row-striped': index % 2 === 1 }"
                >
                  <td>{{ row.date }}</td>
                  <td class="time-cell">
                    {{ formatTime(row.startTime) }}
                  </td>
                  <td class="time-cell">
                    {{ formatTime(row.endTime) }}
                  </td>
                  <td class="overtime-time">
                    {{ formatOvertime(row.overtimeHours) }}
                  </td>
                  <td class="reason-cell">
                    {{ row.reason }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 페이지네이션 -->
          <div class="pagination">
            <button
              class="page-button"
              :disabled="currentPage === 1"
              @click="goPage(currentPage - 1)"
            >
              이전
            </button>

            <button
              v-for="page in totalPages"
              :key="page"
              class="page-button"
              :class="{ 'page-active': page === currentPage }"
              @click="goPage(page)"
            >
              {{ page }}
            </button>

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
import { useOvertimeStore } from '@/stores/attendance/overtime';         // 초과 근무 목록

const route = useRoute();
const attendanceStore = useAttendanceStore();
const overtimeStore = useOvertimeStore();

// 오늘 날짜 (YYYY-MM-DD) – date input max에 사용
const today = new Date().toISOString().slice(0, 10);

/**
 * 현재 활성화된 탭인지 확인합니다.
 *
 * @param {string} name - 라우트 이름 (예: 'AttendanceOvertime')
 * @returns {boolean} 활성 탭 여부
 */
const isActiveTab = (name: string): boolean => {
  return route.name === name;
};

// =======================
// 1) 상단 요약 카드 상태 (AttendanceStore)
// =======================
const {
  workDays,
  todayWorkSystemName,
  lateCount,
  absentCount,
  earlyCount,
} = storeToRefs(attendanceStore);

// =======================
// 2) 초과 근무 목록/필터/페이지네이션 상태 (OvertimeStore)
// =======================
const {
  overtimeList,
  startDate,
  endDate,
  currentPage,
  totalPages,
} = storeToRefs(overtimeStore);

// TODO: 키워드 검색 입력 UI 추가 예정 (사유/날짜 등 검색)
const keyword = ref<string>('');

// 키워드 필터 (현재 페이지 데이터에 대해 추가 필터링)
const displayList = computed(() => {
  const k = keyword.value.trim();
  const base = overtimeList.value;

  if (!k) {
    return base;
  }

  return base.filter((row) => {
    return (
      row.date.includes(k) ||
      row.startTime.includes(k) ||
      row.endTime.includes(k) ||
      String(row.overtimeHours).includes(k) ||
      row.reason.includes(k)
    );
  });
});

/**
 * 페이지를 이동합니다.
 * - 1 페이지보다 작거나, 총 페이지 수를 초과하면 요청하지 않습니다.
 *
 * @param {number} page - 이동할 페이지 번호
 */
const goPage = (page: number): void => {
  const maxPage = totalPages.value || 1;

  if (page < 1 || page > maxPage) {
    return;
  }

  overtimeStore.fetchOvertime(page);
};

/**
 * 검색 버튼 클릭 시 실행되는 핸들러입니다.
 * - startDate / endDate는 v-model로 이미 store와 묶여 있으므로
 *   그대로 1페이지부터 조회만 하면 됩니다.
 */
const onSearch = (): void => {
  overtimeStore.fetchOvertime(1);
};

/**
 * 초기화 버튼 클릭 시 실행되는 핸들러입니다.
 * - 기간 필터/키워드를 초기화하고
 *   1 페이지부터 다시 초과 근무 이력을 조회합니다.
 */
const onReset = (): void => {
  startDate.value = '';
  endDate.value = '';
  keyword.value = '';

  overtimeStore.setFilterDates('', '');
  overtimeStore.fetchOvertime(1);
};

/**
 * 시간 문자열을 'HH:mm' 형식으로 변환합니다.
 *
 * @param {string | null | undefined} time - 서버에서 내려온 시간 문자열 (예: '18:30:00')
 * @returns {string} 표시용 시간 문자열 (예: '18:30'), 값이 없으면 빈 문자열
 */
const formatTime = (time?: string | null): string => {
  return time ? time.substring(0, 5) : '';
};

/**
 * 초과 근무 시간을 표시용 문자열로 변환합니다.
 *
 * @param {number | null | undefined} hours - 초과 근무 시간(숫자)
 * @returns {string} 예: '2시간', 값이 없으면 '-' 반환
 */
const formatOvertime = (hours?: number | null): string => {
  if (hours == null) {
    return '-';
  }

  return `${hours}시간`;
};

// 최초 진입 시: 상단 요약 + 1페이지 데이터 조회
onMounted(() => {
  attendanceStore.fetchPersonalSummary();  // personal.vue에서 사용하던 요약 API
  overtimeStore.fetchOvertime(1);
});
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
}

.attendance-page {
  width: 100%;
  height: 85%;              
  padding: 24px;
  box-sizing: border-box;
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

.search-input {
  width: 360px;
  height: 40px;
  border-radius: 10px;
  border: 2px solid #cad5e2;
  padding: 0 12px;
  color: #1f2933;
}

.search-input::placeholder {
  color: #9ca3af;
}

.btn-search {
  width: 60px;
  height: 40px;
  border-radius: 10px;
  border: 2px solid #cad5e2;
  background: #ffffff;
  color: #62748e;
  cursor: pointer;
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
  border-radius: 8px;
  overflow: hidden;
}

/* 테이블 */
.attendance-table {
  width: 100%;
  border-collapse: collapse;
}

.attendance-table thead tr {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
}

.attendance-table th {
  padding: 16px;
  text-align: left;
  font-weight: 700;
  color: #ffffff;
}

.attendance-table td {
  padding: 16px;
  color: #62748e;
  border-top: 0.67px solid #e2e8f0;
}

.attendance-table tbody tr {
  background: #ffffff;
}

.attendance-table tbody tr.row-striped {
  background: #f8fafc;
}

/* 헤더쪽 정렬 */
.attendance-table th.col-time {
  text-align: center;
  padding-left: 24px;
}

.attendance-table th.col-overtime {
  text-align: center;
  padding-left: 24px;
}

.attendance-table th.col-reason {
  padding-left: 24px;
}

/* 바디쪽 정렬 */
.attendance-table td.time-cell {
  text-align: center;
  padding-left: 24px;
}

.attendance-table td.overtime-time {
  text-align: center;
  padding-left: 24px;
  color: #e7000b; /* 이미 있다면 색상 설정은 기존 코드 그대로 사용 */
}

.attendance-table td.reason-cell {
  padding-left: 24px;
}

/* 초과 근무 시간 강조 색상 */
.attendance-table td.overtime-time {
  color: #e7000b;
}

/* 페이지네이션 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 0 16px 0;
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

/* 날짜 필터 묶음 */
/* "조회기간" 텍스트 */
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

/* 검색 / 초기화 버튼 묶음 */
.search-button-group {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-bottom: 0px;
}

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
</style>
