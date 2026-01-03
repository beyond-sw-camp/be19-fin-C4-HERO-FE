<!--
  TypeScript Name   : AttendancePersonal.vue
  Description : 개인 근태 이력 페이지
                - 상단 요약 카드로 이번 달 근태 현황 요약
                - 탭을 통해 개인 근태 / 초과 근무 / 근태 정정 / 근무제 변경 이력 이동
                - 기간 필터 + 페이지네이션을 통한 개인 근태 이력 조회

  History
  2025/12/10 - 이지윤 최초 작성
  2025/12/29 - 행 간격/테이블 정렬 및 근무시간 표시 형식 개선
  2025/12/30 - 이지윤 지연 근무 로직 추가 및 디자인 수정
  2025/12/30 - 이지윤 초과 근무 로직 추가
  2026/01/01 - 이지윤 페이지네이션 디자인 수정 및 필터링 부분 수정
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
              <!-- 왼쪽 : 안내 문구 -->
              <div class="search-info">
                이번 달 기준으로 표시됩니다.
              </div>

              <!-- 오른쪽 : 조회기간 + 날짜 + 검색/초기화 버튼 -->
              <div class="filter-group">
                <div class="filter-row">
                  <span class="filter-label">조회기간</span>

                  <input
                    v-model="startDate"
                    type="date"
                    class="filter-input"
                    :min="minDate"
                    :max="today"
                  />

                  <span class="filter-separator">~</span>

                  <input
                    v-model="endDate"
                    type="date"
                    class="filter-input"
                    :min="minDate"
                    :max="today"
                  />
                </div>

                <div class="search-button-group">
                  <button class="btn-search" @click="onSearch">검색</button>
                  <button class="btn-reset" @click="onReset">초기화</button>
                </div>
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
                      v-for="(row, index) in filteredPersonalList"
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
                          @click="goToOvertimeRequest(row)"
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
            <div v-if="totalPages > 0" class="pagination">
              <!-- 이전 화살표 -->
              <button
                type="button"
                class="page-button arrow-button"
                :disabled="currentPage === 1"
                @click="goPage(currentPage - 1)"
              >
                ‹
              </button>

              <!-- 이전 페이지(있을 때만) -->
              <button
                v-if="prevPage !== null"
                type="button"
                class="page-button"
                @click="goPage(prevPage)"
              >
                {{ prevPage }}
              </button>

              <!-- 현재 페이지(disabled + active) -->
              <button type="button" class="page-button page-active" disabled>
                {{ currentPage }}
              </button>

              <!-- 다음 페이지(있을 때만) -->
              <button
                v-if="nextPage !== null"
                type="button"
                class="page-button"
                @click="goPage(nextPage)"
              >
                {{ nextPage }}
              </button>

              <!-- 다음 화살표 -->
              <button
                type="button"
                class="page-button arrow-button"
                :disabled="currentPage >= totalPages"
                @click="goPage(currentPage + 1)"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAttendanceStore } from '@/stores/attendance/attendanceStore';

const attendanceStore = useAttendanceStore();
const route = useRoute();
const router = useRouter();

const today = new Date().toISOString().slice(0, 10);
const minDate = '2025-01-01';

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

/**
 * 화면에 실제로 보여줄 개인 근태 리스트
 *
 * - startDate, endDate 를 사용자가 직접 입력해서 검색한 경우
 *   → 백엔드가 이미 그 기간으로 필터링해서 내려주므로 personalList 그대로 사용
 *
 * - 둘 다 비어 있는 경우(초기 상태 / 초기화 후)
 *   → 프론트에서 "이번 달 1일 ~ 오늘 날짜까지"만 한 번 더 필터링해서 보여줌
 */
const filteredPersonalList = computed(() => {
  const list = personalList.value ?? [];

  // 사용자가 기간을 직접 설정해 검색한 경우에는 추가 필터링 없이 그대로 사용
  if (startDate.value && endDate.value) {
    return list;
  }

  // 이번 달 1일 ~ 오늘 날짜까지 범위 계산
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-based (0 = 1월)

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month, now.getDate());

  const startMs = firstDay.getTime();
  const endMs = lastDay.getTime();

  return list.filter((row) => {
    if (!row.workDate) return false;

    // workDate가 'YYYY-MM-DD' 문자열이라고 가정
    const d =
      typeof row.workDate === 'string'
        ? new Date(row.workDate)
        : (row.workDate as unknown as Date);

    const t = d.getTime();
    return t >= startMs && t <= endMs;
  });
});

const isActiveTab = (name: string): boolean => {
  return route.name === name;
};

const formatTime = (time?: string | null): string => {
  return time ? time.substring(0, 5) : '';
};

const prevPage = computed<number | null>(() => {
  return currentPage.value > 1 ? currentPage.value - 1 : null;
});

const nextPage = computed<number | null>(() => {
  return currentPage.value < totalPages.value ? currentPage.value + 1 : null;
});

const goPage = (page: number): void => {
  const maxPage = totalPages.value || 1;
  if (page < 1 || page > maxPage) return;

  attendanceStore.fetchPersonal(page);
};

const onSearch = (): void => {
  // startDate / endDate 는 v-model 로 store와 이미 묶여 있음
  attendanceStore.fetchPersonal(1);
};

const onReset = (): void => {
  // 기간 필터 초기화
  startDate.value = '';
  endDate.value = '';
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
  workDate: string;
  startTime?: string | null;
  endTime?: string | null;
};

const goToLateRequest = (row: any): void => {
  attendanceStore.setSelectdRow({
    attendanceId: row.attendanceId,
    workDate: row.workDate,
    startTime: row.startTime,
    endTime: row.endTime,
  });

  router.push({
    name: 'ApprovalCreate',
    params: { formName: 'modifyworkrecord' },
    query: {
      templateId: '5',
      attendanceId: String(row.attendanceId),
    },
  });
};

const goToOvertimeRequest = (row: any): void => {
  attendanceStore.setSelectdRow({
    attendanceId: row.attendanceId,
    workDate: row.workDate,
    startTime: row.startTime,
    endTime: row.endTime,
  });

  router.push({
    name: 'ApprovalCreate',
    params: { formName: 'overtime' },
    query: {
      templateId: '7',
      workDate: row.workDate,
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
  padding:14px 18px;
}

.panel-search-inner {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;           
  gap: 8px;
}


.search-info {
  font-size: 18px;
  color: #94a3b8;
  margin: 0;

  position: relative;
  top: -8px;   
}

.filter-group {
  display: flex;
  align-items: flex-end;   
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

/* 현재 페이지는 disabled여도 흐려지지 않게 */
.page-button.page-active:disabled {
  opacity: 1;
}

/* 나머지 disabled만 흐리게 */
.page-button:disabled:not(.page-active) {
  opacity: 0.5;
  cursor: default;
}

.page-active {
  background: #155dfc;
  border-color: #155dfc;
  color: #ffffff;
  font-weight: 700;
}

/* 표준: 현재 버튼 hover 시 #2b6bff */
.page-button.page-active:disabled:hover {
  background: #2b6bff;
  border-color: #2b6bff;
}

/* 화살표 버튼 */
.arrow-button {
  min-width: 34px;
  font-size: 18px;
  line-height: 1;
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

