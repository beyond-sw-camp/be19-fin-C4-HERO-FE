<!-- 
  <pre>
  TypeScript Name   : AttendancePersonal.vue
  Description : 개인 근태 이력 페이지
                - 상단 요약 카드로 이번 달 근태 현황 요약
                - 탭을 통해 개인 근태 / 초과 근무 / 근태 정정 / 근무제 변경 이력 이동
                - 기간 필터 + 페이지네이션을 통한 개인 근태 이력 조회

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
        <!-- 상단 탭 (라우터 탭으로 동작) -->
        <div class="panel-tabs">
          <!-- 개인 근태 이력 -->
          <RouterLink
            :to="{ name: 'AttendancePersonal' }"
            class="tab tab-left"
            :class="{ 'tab-active': isActiveTab('AttendancePersonal') }"
          >
            개인 근태 이력
          </RouterLink>
  
          <!-- 초과 근무 이력 -->
          <RouterLink
            :to="{ name: 'AttendanceOvertime' }"
            class="tab"
            :class="{ 'tab-active': isActiveTab('AttendanceOvertime') }"
          >
            초과 근무 이력
          </RouterLink>
  
          <!-- 근태 기록 수정 이력 -->
          <RouterLink
            :to="{ name: 'AttendanceCorrection' }"
            class="tab"
            :class="{ 'tab-active': isActiveTab('AttendanceCorrection') }"
          >
            근태 기록 수정 이력
          </RouterLink>
  
          <!-- 근무제 변경 이력 -->
          <RouterLink
            :to="{ name: 'AttendanceChangeLog' }"
            class="tab tab-right"
            :class="{ 'tab-active': isActiveTab('AttendanceChangeLog') }"
          >
            근무제 변경 이력
          </RouterLink>
        </div>
      <div class="panel-body">
        <!-- 검색 영역 (기간 필터) -->
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
                  <th>상태</th>
                  <th class="col-time">출근시간</th>
                  <th class="col-time">퇴근시간</th>
                  <th class="col-personal">근무시간</th>
                  <th>근무제</th>
                  <th>결재양식 작성</th>
                </tr>
              </thead>
  
              <tbody>
                <tr
                  v-for="(row, index) in personalList"
                  :key="row.attendanceId"
                  :class="{ 'row-striped': index % 2 === 1 }"
                >
                  <td>{{ row.workDate }}</td>
  
                  <td>
                    <span
                      class="status-pill"
                      :class="{
                        'status-normal': row.state === '정상',
                        'status-late': row.state === '지각',
                        'status-absent': row.state === '결근',
                        'status-early': row.state === '조퇴'
                      }"
                    >
                      {{ row.state }}
                    </span>
                  </td>
  
                  <td class="time-cell">
                    {{ formatTime(row.startTime) }}
                  </td>
                  <td class="time-cell">
                    {{ formatTime(row.endTime) }}
                  </td>
  
                  <td class="col-personal">
                    {{ row.workDuration }}분
                  </td>
  
                  <td>{{ row.workSystemName }}</td>
  
                  <td>
                    <button class="link-button">
                      근태 정정 / 초과 근무 신청
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
  
          <!-- 페이지네이션 -->
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
import { onMounted } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAttendanceStore } from '@/stores/attendance/attendanceStore';

// 4. Store & Router
const attendanceStore = useAttendanceStore();
const route = useRoute();

const today = new Date().toISOString().slice(0, 10);

// 5. Reactive State (Pinia → storeToRefs)
const {
  personalList,
  startDate,
  endDate,
  currentPage,
  totalPages,
  workDays,
  todayWorkSystemName,
  lateCount,
  absentCount,
  earlyCount
} = storeToRefs(attendanceStore);

/**
 * 현재 활성화된 탭인지 확인합니다.
 * @param {string} name - 라우트 이름 (예: 'AttendancePersonal')
 * @returns {boolean} 활성 탭 여부
 ****************************************
 * @param → 함수의 인자(Parameter)
 ****************************************
 */
const isActiveTab = (name: string): boolean => {
  return route.name === name;
};

/**
 * 시간 문자열을 'HH:mm' 형식으로 변환합니다.
 * @param {string | null | undefined} time - 서버에서 내려온 시간 문자열 (예: '09:00:00')
 * @returns {string} 표시용 시간 문자열 (예: '09:00'), 값이 없으면 빈 문자열
 */
const formatTime = (time?: string | null): string => {
  return time ? time.substring(0, 5) : '';
};

/**
 * 개인 근태 이력 페이지를 변경합니다.
 * - 1 페이지보다 작거나 총 페이지 수를 초과하는 경우 요청하지 않습니다.
 *
 * @param {number} page - 이동할 페이지 번호
 */
const goPage = (page: number): void => {
  const maxPage = totalPages.value || 1;

  if (page < 1 || page > maxPage) {
    return;
  }

  attendanceStore.fetchPersonal(page);
};

/**
 * 기간 필터를 기준으로 개인 근태 이력을 조회합니다.
 * - 페이지는 항상 1 페이지부터 다시 조회합니다.
 */
const onSearch = (): void => {
  attendanceStore.fetchPersonal(1);
};

/**
 * 기간 필터를 초기화하고 개인 근태 이력을 다시 조회합니다.
 * - 시작일/종료일을 공백으로 초기화
 * - 1 페이지부터 재조회
 */
const onReset = (): void => {
  attendanceStore.setFilterDates('', '');
  attendanceStore.fetchPersonal(1);
};

// 9. Lifecycle
onMounted(() => {
  // 초기 진입 시 1페이지 데이터 조회
  attendanceStore.fetchPersonal(1);

  attendanceStore.fetchPersonalSummary();
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
  /* display: inline-flex; */
  display: flex;
  flex-direction: row;
  /* border-bottom: 1px solid #e2e8f0; */
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
  overflow: hidden;        
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

.filter-input:focus {
  outline: none;
}

/* ~ 구분자 */
.filter-separator {
  color: #64748b;
}


/* 테이블 영역 */
.panel-table-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0px 0 18px;
  gap: 20px;
  border-bottom-left-radius: 14px;
  border-bottom-right-radius: 14px;
}

.panel-table {
  border: 1px solid #e2e8f0;
  /* border-radius: 8px; */
  overflow: hidden;
}

/* 테이블 */
table {
  width: 100%;
  border-collapse: collapse;
}

thead tr {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
}

th {
  padding: 11px 16px;
  text-align: left;
  font-weight: 700;
  color: #ffffff;
}

td {
  padding: 16px;
  color: #62748e;
  border-top: 0.67px solid #e2e8f0;
}

tbody tr {
  background: #ffffff;
}

tbody tr.row-striped {
  background: #f8fafc;
}

/* 상태 pill */
.status-pill {
  display: inline;
  align-items: center;
  justify-content: center;
  min-width: auto;
  height: auto;
  border-radius: 999px;
  padding: 0;
  background: none;
}

.status-normal {
  color: #000000;
}

.status-late {
  color: #ff0000;
}
.status-absent  { 
  color: #16a34a;; 
} 

.status-early{
  color: rgb(187, 187, 30);
}

/* 링크 스타일 버튼 */
.link-button {
  background: none;
  border: none;
  padding: 0;
  color: #0069ff;
  cursor: pointer;
  text-align: left;
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

.attendance-table thead tr {
  background: linear-gradient(180deg, #1C398E 0%, #162456 100%);
}

.attendance-table th {
  color: white;
  font-weight: 700;
  padding: 16px;
  text-align: left;
}

.attendance-table td {
  padding: 16px;
  color: #62748e;
  border-top: 0.67px solid #e2e8f0;
}

.attendance-table tbody tr.row-striped {
  background: #f8fafc;
}

/* 헤더 위치 조정 */
.attendance-table th.col-time,
.attendance-table th.col-personal {
  text-align: center;    /* 가운데 정렬 */
  padding-left: 24px;    /* 살짝 오른쪽으로 밀기 */
}

/* 바디 셀 위치 조정 */
.attendance-table td.time-cell,
.attendance-table td.col-personal {
  text-align: center;    /* 가운데 정렬 */
  padding-left: 24px;    /* 헤더와 같은 만큼 밀기 */
}

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
  font-size: 14px;
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
