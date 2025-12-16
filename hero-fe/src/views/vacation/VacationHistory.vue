<!-- 
  <pre>
  (File => TypeScript / Vue) Name   : VacationHistory.vue
  Description : 개인 휴가 이력 조회 페이지
                - 상단 요약 카드(총 연차 / 사용 연차 / 남은 연차 / 소멸 예정)
                - 기간 필터(시작일 / 종료일) + 검색 / 초기화 버튼
                - 휴가 이력 테이블 + 페이지네이션

  History
  2025/12/16 - 이지윤 최초 작성
  </pre>

  @author 이지윤
  @version 1.0
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
        <!-- 검색 영역 (기간 필터) -->
        <div class="panel-search">
          <div class="panel-search-inner">
            <!-- 기간(시작) -->
            <div class="date-filter-group">
              <span class="date-label">기간(시작)</span>
              <div class="date-input-wrapper">
                <input
                  v-model="startDate"
                  type="date"
                  class="date-input"
                />
                <span class="date-icon">📅</span>
              </div>
            </div>

            <!-- 기간(종료) -->
            <div class="date-filter-group">
              <span class="date-label">기간(종료)</span>
              <div class="date-input-wrapper">
                <input
                  v-model="endDate"
                  type="date"
                  class="date-input"
                />
                <span class="date-icon">📅</span>
              </div>
            </div>

            <!-- 검색 / 초기화 버튼 -->
            <div class="search-button-group">
              <button
                class="btn-search"
                type="button"
                :disabled="loading"
                @click="onSearch"
              >
                검색
              </button>
              <button
                class="btn-reset"
                type="button"
                :disabled="loading"
                @click="onReset"
              >
                초기화
              </button>
            </div>
          </div>
        </div>

        <!-- 테이블 영역 -->
        <div class="vacation-table-wrapper">
          <table class="vacation-table">
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
                <td
                  colspan="4"
                  style="text-align: center; padding: 16px;"
                >
                  조회된 휴가 이력이 없습니다.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 페이지네이션 -->
        <div class="vacation-pagination">
          <button
            type="button"
            class="page-button"
            :disabled="loading || currentPage === 1"
            @click="goPage(currentPage - 1)"
          >
            이전
          </button>

          <button
            v-for="p in safeTotalPages"
            :key="p"
            type="button"
            class="page-button"
            :class="{ 'page-button--active': p === currentPage }"
            :disabled="loading"
            @click="goPage(p)"
          >
            {{ p }}
          </button>

          <button
            type="button"
            class="page-button"
            :disabled="loading || currentPage === safeTotalPages"
            @click="goPage(currentPage + 1)"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';

import { useVacationHistoryStore } from '@/stores/vacation/vacationHistory';

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
const totalAnnualLeave = computed<number>(() => 0);
const usedLeave = computed<number>(() => 0);
const remainingLeave = computed<number>(() => 0);
const expiringLeave = computed<number>(() => 0);

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
  await vacationStore.fetchVacationHistory(1);
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
/* TODO: vacation-history-wrapper / vacation-panel / vacation-table 등
   BEM 네이밍 컨벤션에 맞춰 점진적 리팩터링 예정 */
</style>



<style scoped>
.vacation-history-wrapper {
  width: 100%;
  height: 100%;
  padding: 20px 36px 20px 30px;
  display: flex;
  flex-direction: column;
}

.vacation-history-page {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
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


/* 하단 패널 */
.vacation-panel {
  width: 100%;
  background: #ffffff;
  border-radius: 14px;
  outline: 2px solid #e2e8f0;
  outline-offset: -2px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 테이블 */
.vacation-table-wrapper {
  width: 100%;
}

.vacation-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

/* 헤더 */
.vacation-table thead tr {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
}

.vacation-table th {
  padding: 11px 16px;
  text-align: left;
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
}

.col-period,
.col-type,
.col-reason,
.col-status {
  width: 25%;
}

/* 바디 */
.vacation-table td {
  padding: 16px;
  font-size: 14px;
  color: #62748e;
  border-top: 0.67px solid #e2e8f0;
}

.row-striped {
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
  font-size: 12px;
  color: #030213;
  background-color: #ffffff;
}

/* 페이지네이션 */
.vacation-pagination {
  display: flex;                      
  justify-content: center;             
  align-items: center;
  gap: 10px;
  padding: 16px 0 16px 0;            
  border-top: 2px solid #e2e8f0;
  background: #f8fafc;
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

.page-button--active {
  background: #155dfc;
  color: #ffffff;
  border-color: #155dfc;
}

.page-button:disabled {
  opacity: 0.5;
  cursor: default;
}

.panel-search {
  border-top: 2px solid #e2e8f0;
  border-bottom: 2px solid #e2e8f0;
  padding: 14px 18px;
}

.panel-search-inner {
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  gap: 16px;
}

.date-filter-group {
  display: flex;
  flex-direction: column;   
  gap: 6px;
}

.date-label {
  font-size: 12px;
  color: #64748b;
}

.date-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
}

.date-input {
  border: none;
  outline: none;
  font-size: 14px;
  color: #0f172a;
}

.date-input::-webkit-calendar-picker-indicator {
  cursor: pointer;
}

.date-icon {
  font-size: 16px;
}

.search-button-group {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-bottom: 2px;
}


.btn-search {
  width: 60px;
  height: 40px;
  border-radius: 10px;
  border: 2px solid #155dfc;
  background: #155dfc;
  font-size: 14px;
  color: #ffffff;
  cursor: pointer;
}

.btn-reset {
  width: 60px;
  height: 40px;
  border-radius: 10px;
  border: 2px solid #e2e8f0;
  background: #ffffff;
  font-size: 14px;
  color: #64748b;
  cursor: pointer;
}


</style>
