<!--
  TypeScript Name   : AttendancePersonal.vue
  Description : 개인 근태 이력 페이지
                - 상단 요약 카드로 이번 달 근태 현황 요약
                - 탭을 통해 개인 근태 / 초과 근무 / 근태 정정 / 근무제 변경 이력 이동
                - 기간 필터 + 페이지네이션을 통한 개인 근태 이력 조회

  History
  2025/12/10 - 이지윤 최초 작성
  2025/12/29 - 행 간격/테이블 정렬 및 근무시간 표시 형식 개선
-->

<template>
  <div class="attendance-wrapper">
    <div class="attendance-page">
      <!-- 상단 요약 카드 5개 -->
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
            지연 출근 수정 이력
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
          <!-- 검색 영역 (기간 필터) -->
          <div class="panel-search">
            <div class="panel-search-inner">
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

                    <td class="duration-cell">
                      {{ formatWorkDuration(row.workDuration) }}
                    </td>

                    <td>{{ row.workSystemName }}</td>

                    <td class="action-cell">
                      <div class="action-button-group">
                        <button
                          type="button"
                          class="link-button"
                          @click="goToLateRequest(row)"
                        >
                          지연 출근 신청
                        </button>

                        <span class="action-divider">/</span>

                        <button
                          type="button"
                          class="link-button"
                        >
                          초과 근무 신청
                        </button>
                      </div>
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
import { onMounted } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAttendanceStore } from '@/stores/attendance/attendanceStore';

const attendanceStore = useAttendanceStore();
const route = useRoute();
const router = useRouter();

const today = new Date().toISOString().slice(0, 10);

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
  earlyCount,
} = storeToRefs(attendanceStore);

const isActiveTab = (name: string): boolean => {
  return route.name === name;
};

const formatTime = (time?: string | null): string => {
  return time ? time.substring(0, 5) : '';
};

const goPage = (page: number): void => {
  const maxPage = totalPages.value || 1;
  if (page < 1 || page > maxPage) return;

  attendanceStore.fetchPersonal(page);
};

const onSearch = (): void => {
  attendanceStore.fetchPersonal(1);
};

const onReset = (): void => {
  attendanceStore.setFilterDates('', '');
  attendanceStore.fetchPersonal(1);
};

const formatWorkDuration = (minutes?: number | null): string => {
  if (minutes == null) return '';

  const hours = minutes / 60;
  if (Number.isInteger(hours)) {
    return `${hours}시간`;
  }
  return `${hours.toFixed(1)}시간`;
};

onMounted(() => {
  attendanceStore.fetchPersonal(1);
  attendanceStore.fetchPersonalSummary();
});

type PersonalRow = {
  attendanceId: number;
};

const goToLateRequest = (row: PersonalRow): void => {
  router.push({
    name: 'ApprovalCreate',
    params: { formName: 'modifyworkrecord' },
    query: {
      templateId: '5',
      attendanceId: String(row.attendanceId),
    },
  });
};
</script>

<style scoped>
* {
  font-size: 14px;
  font-family: 'Inter-Regular', sans-serif;
}

/* 전체 레이아웃 */
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
  border-radius: 14px;
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

/* 패널 내부 */
.panel-body {
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
  align-items: flex-end; /* 인풋/버튼 하단 정렬 */
  gap: 8px;
}

.filter-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.filter-label {
  color: #64748b;
}

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

.filter-separator {
  color: #64748b;
}

/* 테이블 영역 */
.panel-table-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 0 18px;
  gap: 16px;
  border-bottom-left-radius: 14px;
  border-bottom-right-radius: 14px;
}

.panel-table {
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

/* ✅ 기본 테이블 설정: 초과 근무 화면과 동일하게 맞춤 */
.attendance-table {
  width: 100%;
  border-collapse: collapse;
}

/* 헤더 행 */
.attendance-table thead tr {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
}

/* 헤더 셀: 행 높이 조정 */
.attendance-table th {
  padding: 16px;              /* 초과 근무와 동일 */
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
  text-align: left;
}

/* 바디 행/셀 */
.attendance-table tbody tr {
  background: #ffffff;
}

/* ✅ td 패딩/폰트 사이즈를 초과 근무와 동일하게 */
.attendance-table td {
  padding: 16px;
  font-size: 14px;
  color: #62748e;
  border-top: 0.67px solid #e2e8f0;
  line-height: 1.4;
}

.attendance-table tbody tr.row-striped {
  background: #f8fafc;
}

/* 시간 / 근무시간 컬럼 정렬 */
.attendance-table th.col-time,
.attendance-table th.col-personal,
.attendance-table td.time-cell,
.attendance-table td.duration-cell {
  text-align: center;
}

/* 근무시간 컬럼 너비 고정 */
.attendance-table th:nth-child(5),
.attendance-table td:nth-child(5) {
  width: 110px;
}

/* 상태 표시 */
.status-pill {
  display: inline;
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

.status-absent {
  color: #16a34a;
}

.status-early {
  color: rgb(187, 187, 30);
}

/* 링크 버튼 */
.link-button {
  background: none;
  border: none;
  padding: 0;
  color: #0069ff;
  cursor: pointer;
  text-align: left;
}

.action-button-group {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.action-divider {
  color: #94a3b8;
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

/* 검색 버튼 그룹 */
.search-button-group {
  display: flex;
  align-items: center;
  gap: 6px;
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
</style>

