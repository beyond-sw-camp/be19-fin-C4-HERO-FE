<!-- 
  <pre>
  TypeScript Name   : VacationHistory.vue
  Description : 개인 휴가 이력 조회 페이지
                - 상단 요약 카드(총 연차 / 사용 연차 / 남은 연차 / 소멸 예정)
                - 기간 필터(시작일 / 종료일) + 검색 / 초기화 버튼
                - 휴가 이력 테이블 + 페이지네이션

  History
  2025/12/16(이지윤) 최초 작성
  2026/01/01 - (지윤) 페이지네이션 디자인 수정
  </pre>

  @author 이지윤
  @version 1.2
-->

<template>
  <div class="vacation-history-wrapper">
    <div class="vacation-history-page">
      <!-- 상단 요약 카드 4개 (현재 스토어에 데이터가 없어 임시 0 처리) -->
      <div class="summary-cards">
        <div class="summary-card">
          <div class="summary-card-header">총 연차</div>
          <div class="summary-card-body">
            <span class="summary-value">{{ totalAnnualLeave }}</span>
            <span class="summary-unit">일</span>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-card-header">사용 연차</div>
          <div class="summary-card-body">
            <span class="summary-value">{{ usedLeave }}</span>
            <span class="summary-unit">일</span>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-card-header">남은 연차</div>
          <div class="summary-card-body">
            <span class="summary-value">{{ remainingLeave }}</span>
            <span class="summary-unit">일</span>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-card-header">소멸 예정</div>
          <div class="summary-card-body">
            <span class="summary-value">{{ expiringLeave }}</span>
            <span class="summary-unit">일</span>
          </div>
        </div>
      </div>

      <!-- 하단 패널 (테이블 + 페이징) -->
      <div class="vacation-panel">
       <!-- 검색 영역 (기간 필터 UI) -->
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
            <table class="attendance-table vacation-table">
              <thead>
                <tr>
                  <th class="col-period">휴가 기간</th>
                  <th class="col-type">휴가 종류</th>
                  <th class="col-reason">휴가 사유</th>
                  <th class="col-status">승인 현황</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="(row, index) in uiRows"
                  :key="row.key"
                  :class="{ 'row-striped': index % 2 === 1 }"
                >
                  <td class="cell-period">
                    {{ row.period }}
                  </td>
                  <td class="cell-type">
                    <span class="vacation-type-pill">
                      {{ row.type }}
                    </span>
                  </td>
                  <td class="cell-reason">
                    {{ row.reason }}
                  </td>
                  <td class="cell-status">
                    {{ row.status }}
                  </td>
                </tr>

                <tr v-if="!loading && uiRows.length === 0">
                  <td colspan="4" class="empty-row">
                    조회된 휴가 이력이 없습니다.
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
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useVacationHistoryStore } from '@/stores/vacation/vacationHistory';
import { useVacationSummaryStore } from '@/stores/vacation/vacationSummary';

const today = new Date().toISOString().slice(0, 10);
const minDate = '2025-01-01';

const vacationStore = useVacationHistoryStore();
const {
  vacationList,
  currentPage,
  totalPages,
  startDate,
  endDate,
  loading,
} = storeToRefs(vacationStore);


/**
 * 상단 요약 카드용 더미 데이터
 * - 현재 vacationHistory.ts에 관련 필드가 없어 0으로 고정
 * - 추후 스토어 필드가 추가되면 storeToRefs로 교체 예정
 */
const vacationSummaryStore = useVacationSummaryStore();
const {
  totalAnnualLeave,
  usedLeave,
  remainingLeave,
  expiringLeave,
} = storeToRefs(vacationSummaryStore)



/**
 * 페이지네이션에서 사용할 안전한 totalPages
 * - totalPages가 0이거나 falsy일 때도 최소 1 페이지는 유지
 *
 * @returns {number} 안전한 전체 페이지 수
 */
const safeTotalPages = computed<number>(() => {
  return Math.max(1, totalPages.value || 0);
});

/**
 * 휴가 기간 포맷
 * - 시작일과 종료일이 같은 경우: 단일 날짜만 표시
 * - 서로 다른 경우: "YYYY-MM-DD ~ YYYY-MM-DD" 형식
 *
 * @param {string} from - 시작일 (YYYY-MM-DD)
 * @param {string} to - 종료일 (YYYY-MM-DD)
 * @returns {string} 포맷된 기간 문자열
 ****************************************
 * @param → 함수의 인자(Parameter)
 ****************************************
 */
const formatPeriod = (from: string, to: string): string => {
  if (!from) {
    return '-';
  }

  if (!to || from === to) {
    return from;
  }

  return `${from} ~ ${to}`;
};

/**
 * 테이블 바인딩용 UI Row 타입
 * - key    : v-for용 고유 키
 * - period : 화면에 표시할 휴가 기간 문자열
 * - type   : 휴가 종류명
 * - reason : 휴가 사유
 * - status : 승인 상태
 */
interface UiRow {
  key: string;
  period: string;
  type: string;
  reason: string;
  status: string;
}

/**
 * 휴가 이력 리스트를 테이블 출력용 형식으로 가공
 *
 * @returns {UiRow[]} 화면에 렌더링될 테이블 행 배열
 */
const uiRows = computed<UiRow[]>(() => {
  return (vacationList.value ?? []).map((v, idx) => ({
    key: `${v.startDate}-${v.endDate}-${v.vacationTypeName}-${idx}`,
    period: formatPeriod(v.startDate, v.endDate),
    type: v.vacationTypeName,
    reason: v.reason,
    status: v.approvalStatus,
  }));
});

/**
 * 컴포넌트 최초 마운트 시 1 페이지 휴가 이력을 조회합니다.
 */
onMounted(async () => {
  await Promise.all([
    vacationSummaryStore.fetchVacationSummary(),
    vacationStore.fetchVacationHistory(1)
  ])
});

/**
 * 검색 버튼 클릭 시 실행되는 핸들러입니다.
 * - v-model로 이미 store.startDate / store.endDate가 갱신되므로
 *   1 페이지부터 다시 조회만 수행합니다.
 */
const onSearch = async (): Promise<void> => {
  await vacationStore.fetchVacationHistory(1);
};

/**
 * 초기화 버튼 클릭 시 실행되는 핸들러입니다.
 * - 스토어의 resetFilters 액션을 호출하여
 *   기간 필터값과 페이지를 초기 상태로 되돌립니다.
 */
const onReset = async (): Promise<void> => {
  await vacationStore.resetFilters();
};

const prevPage = computed<number | null>(() => {
  return currentPage.value > 1 ? currentPage.value - 1 : null
})

const nextPage = computed<number | null>(() => {
  return currentPage.value < totalPages.value ? currentPage.value + 1 : null
})

/**
 * 페이지 이동 핸들러입니다.
 * - 1보다 작거나 전체 페이지 수를 초과하는 경우 이동하지 않습니다.
 *
 * @param {number} page - 이동할 페이지 번호
 */
const goPage = async (page: number): Promise<void> => {
  if (page < 1 || page > safeTotalPages.value) {
    return;
  }

  await vacationStore.fetchVacationHistory(page);
};
</script>

<style scoped>
* {
  font-size: 14px;
  font-family: "Inter-Regular", sans-serif;
}

/* 전체 래퍼 – Personal.vue 구조와 맞춤 */
.vacation-history-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.vacation-history-page {
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
  font-size: 18px;
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

/* 하단 패널(검색 + 테이블 + 페이징) */
.vacation-panel {
  width: 100%;
  background: #ffffff;
  border-radius: 14px;
  border: 2px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}

/* 검색 영역 */
.panel-search {
  border-bottom: 2px solid #e2e8f0;
  padding: 14px 18px;
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

.filter-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.filter-group {
  display: flex;
  align-items: flex-end;   
  gap: 8px;
}

.date-filter-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.date-label {
  color: #64748b;
}

.date-input-wrapper {
  display: flex;
  align-items: center;
  width: 220px;
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
  color: #1f2933;
}

.date-input::-webkit-calendar-picker-indicator {
  cursor: pointer;
}

.search-button-group {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-bottom: 0;
}

.btn-search {
  width: 60px;
  height: 40px;
  border-radius: 10px;
  border: 2px solid #155dfc;
  background: #155dfc;
  color: #ffffff;
  cursor: pointer;
}

.btn-reset {
  width: 60px;
  height: 40px;
  border-radius: 10px;
  border: 2px solid #e2e8f0;
  background: #ffffff;
  color: #64748b;
  cursor: pointer;
}

/* 테이블 영역 – Personal.vue 구조와 동일 */
.panel-table-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 0 18px;
  gap: 20px;
}

.panel-table {
  width: 100%;
  overflow-x: auto;
}

.attendance-table {
  width: 100%;
  border-collapse: collapse;
}

/* 헤더 */
.attendance-table thead tr {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
}

.attendance-table th {
  padding: 11px 16px;
  text-align: left;
  font-weight: 700;
  color: #ffffff;
}

/* 휴가 이력 전용 컬럼 폭 */
.vacation-table th.col-period,
.vacation-table td.cell-period {
  width: 26%;
}

.vacation-table th.col-type,
.vacation-table td.cell-type {
  width: 14%;
}

.vacation-table th.col-reason,
.vacation-table td.cell-reason {
  width: 40%;
}

.vacation-table th.col-status,
.vacation-table td.cell-status {
  width: 20%;
}

/* 바디 */
.attendance-table td {
  padding: 16px;
  color: #62748e;
  border-top: 0.67px solid #e2e8f0;
}

.attendance-table tbody tr {
  background-color: #ffffff;
}

.attendance-table tbody tr.row-striped {
  background-color: #f8fafc;
}

/* 휴가 종류 Pill */
.vacation-type-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 47px;
  height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  color: #030213;
  background-color: #ffffff;
  border: 1px solid #cad5e2;
}

/* 빈 데이터 행 */
.empty-row {
  text-align: center;
  padding: 24px 0;
  color: #94a3b8;
}

/* 페이지네이션 – Personal.vue와 동일 느낌 */
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
  color: #ffffff;
  border-color: #155dfc;
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


.attendance-table tbody tr:last-child td {
  border-bottom: 1px solid #e2e8f0;
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

.summary-card-header {
  color: #64748b;
  font-size: 18px;
  font-weight: 500;
  line-height: 1.2;
  margin-bottom: 8px;
}

.summary-card-body{
  display: flex;
  align-items: baseline;
  gap: 8px;
}
</style>

