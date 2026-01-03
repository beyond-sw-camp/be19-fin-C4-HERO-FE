<!-- 
  <pre>
  TypeScript Name   : WorkSystemStatus.vue
  Description : 부서 근태 현황 조회 페이지
                - 단일 날짜 기준 조회
                - 로그인한 사용자의 부서(departmentId) 기준 조회
                - 프론트 단 페이지네이션
  History
  2025/12/26 - 이지윤 최초 작성
  2026/01/01 - (지윤) 페이지네이션 디자인 수정 및 필터링 부분 수정
  </pre>

  @author 이지윤
  @version 1.1
-->

<template>
  <div class="worksystem-wrapper">
    <div class="worksystem-page">
      <div class="panel">
        <!-- 검색 영역 : 단일 날짜 -->
        <div class="panel-search">
          <div class="panel-search-inner">
            <!-- 왼쪽 안내 문구 -->
            <p class="search-info">
              오늘 날짜 기준으로 표시됩니다.
            </p>

            <!-- 오른쪽 : 날짜 + 버튼 묶음 -->
            <div class="filter-group">
              <!-- 날짜 -->
              <div class="date-filter-group">
                <span class="date-label">날짜</span>
                <div class="date-input-wrapper">
                  <input
                    v-model="selectedDate"
                    type="date"
                    class="date-input"
                    :min="minDate"
                    :max="today"
                  />
                </div>
              </div>

              <!-- 검색 / 초기화 버튼 -->
              <div class="search-button-group">
                <button
                  class="btn-search"
                  :class="{ 'btn-search--active': isSearching }"
                  @click="onSearch"
                >
                  검색
                </button>
                <button
                  class="btn-reset"
                  :class="{ 'btn-search--active': isSearching }"
                  @click="onReset"
                >
                  초기화
                </button>
              </div>
            </div>
          </div>
        </div>


        <!-- 테이블 영역 -->
        <div class="panel-table-wrapper">
          <div class="panel-table">
            <table class="employee-table">
              <thead>
                <tr>
                  <th class="col-date">날짜</th>
                  <th class="col-name">이름</th>
                  <th class="col-status">상태</th>
                  <th class="col-position">직급</th>
                  <th class="col-worksystem">근무제</th>
                  <th class="col-worktime">근무시간</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, index) in pagedList"
                  :key="row.id"
                  :class="{ 'row-striped': index % 2 === 1 }"
                >
                  <td class="cell-date">
                    {{ row.date }}
                  </td>

                  <td class="cell-name">
                    {{ row.name }}
                  </td>

                  <td class="cell-status">
                    <span
                      class="status-pill"
                      :class="{
                        'status-normal': row.status === '정상',
                        'status-late': row.status === '지각',
                        'status-absent': row.status === '결근',
                        'status-early': row.status === '조퇴'
                      }"
                    >
                      {{ row.status }}
                    </span>
                  </td>

                  <td class="cell-position">
                    {{ row.position }}
                  </td>

                  <td class="cell-worksystem">
                    {{ row.workSystem }}
                  </td>

                  <td class="cell-worktime">
                    {{ row.workTime }}
                  </td>
                </tr>

                <tr v-if="pagedList.length === 0">
                  <td
                    colspan="6"
                    class="empty-row"
                  >
                    조회된 근무제 현황이 없습니다.
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

            <!-- 현재 페이지(가운데 고정 역할, disabled + active) -->
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
/**
 * WorkSystemStatus.vue
 * - 부서 근무제/근태 현황 조회 화면
 * - 단일 날짜 기준 조회 + 로그인 사용자의 부서 기준으로 필터링
 * - 프론트 단 페이지네이션 적용
 */

import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';

import {
  useDeptWorkSystemStore,
  type DeptWorkSystemRowDTO,
} from '@/stores/attendance/deptWorkSystem';
import { useAuthStore } from '@/stores/auth';

/**
 * 오늘 날짜(YYYY-MM-DD)
 * - date input의 max 속성에 사용
 */
const today = new Date().toISOString().slice(0, 10);
const minDate = '2025-01-01';

/**
 * 화면에서 사용하는 테이블 한 행 타입
 * - 백엔드 DTO(DeptWorkSystemRowDTO)를 화면 표시용 필드로 변환한 형태
 */
interface EmployeeWorkSystemRow {
  id: string;
  date: string;
  name: string;
  status: string;
  position: string;
  workSystem: string;
  workTime: string;
}

/* =========================
   스토어 & 인증 관련
   ========================= */

/** 부서 근태 현황 스토어 */
const deptWorkStore = useDeptWorkSystemStore();
const { workDate } = storeToRefs(deptWorkStore);

/** 인증 스토어 (TODO: departmentId 연동 시 사용) */
const authStore = useAuthStore();

/* =========================
   화면 상태 (필터/페이지)
   ========================= */

/** 단일 날짜 필터 */
const selectedDate = ref<string>('');

/** 검색/초기화 진행 여부 (버튼 상태 표현용) */
const isSearching = ref(false);
const isResetting = ref(false);

/** 페이지네이션 상태(프론트 전용) */
const currentPage = ref<number>(1);
const pageSize = ref<number>(5);

/* =========================
   DTO → 화면 행 데이터 변환
   ========================= */

/**
 * 스토어의 DTO 목록을 화면용 행 데이터로 변환
 * - date/name/status/position/workSystem/workTime 형식으로 정규화
 */
const allList = computed<EmployeeWorkSystemRow[]>(() => {
  // 이번 조회에 사용된 날짜(백엔드 필터용)를 스토어에서 가져옴
  const dateForRow = workDate.value;

  return deptWorkStore.rows.map((row: DeptWorkSystemRowDTO, index) => ({
    // 각 행마다 고유한 key (employeeId + index 조합)
    id: `${row.employeeId}-${index}`,
    // 테이블에 표시할 날짜는 현재 조회 기준 workDate
    date: dateForRow,
    name: row.employeeName,
    status: row.state,
    position: row.jobTitle,
    workSystem: row.workSystemName,
    workTime: `${row.startTime} - ${row.endTime}`,
  }));
});

/**
 * 전체 페이지 수(프론트 기준)
 */
const totalPages = computed<number>(() => {
  return Math.max(1, Math.ceil(allList.value.length / pageSize.value));
});

const prevPage = computed<number | null>(() => {
  return currentPage.value > 1 ? currentPage.value - 1 : null;
});

const nextPage = computed<number | null>(() => {
  return currentPage.value < totalPages.value ? currentPage.value + 1 : null;
});

/**
 * 현재 페이지에 보여줄 데이터
 */
const pagedList = computed<EmployeeWorkSystemRow[]>(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;

  return allList.value.slice(start, end);
});

/* =========================
   이벤트 핸들러 (검색/초기화/페이지 이동)
   ========================= */

/**
 * 검색 버튼 클릭
 * - 선택한 날짜 기준으로 부서 근태 현황 조회
 */
const onSearch = async (): Promise<void> => {
  if (!selectedDate.value) {
    return;
  }

  isSearching.value = true;

  try {
    currentPage.value = 1;
    workDate.value = selectedDate.value;

    // TODO: authStore.user?.departmentId 등으로 실제 로그인 사용자 부서 연결
    const departmentId = 1;

    deptWorkStore.setFilters(departmentId, workDate.value);
    await deptWorkStore.fetchDeptWorkSystem(1);
  } finally {
    isSearching.value = false;
  }
};

/**
 * 초기화 버튼 클릭
 * - 날짜를 오늘로 초기화하고 해당 날짜 기준으로 다시 조회
 */
const onReset = async (): Promise<void> => {
  isResetting.value = true;

  try {
    const todayDate = new Date();
    const iso = todayDate.toISOString().slice(0, 10);

    selectedDate.value = iso;
    workDate.value = iso;
    currentPage.value = 1;

    // TODO: authStore.user?.departmentId 로 교체 예정
    const departmentId = 1;

    deptWorkStore.setFilters(departmentId, iso);
    await deptWorkStore.fetchDeptWorkSystem(1);
  } finally {
    isResetting.value = false;
  }
};

/**
 * 페이지 이동 (프론트 페이지네이션)
 */
const goPage = (page: number): void => {
  if (page < 1 || page > totalPages.value) {
    return;
  }

  currentPage.value = page;
};

/**
 * 화면 진입 시 기본 조회
 * - 오늘 날짜 + 내 부서 기준으로 조회
 */
onMounted(async () => {
  await onReset();
});
</script>


<style scoped>
* {
  font-size: 14px;
  font-family: "Inter-Regular", sans-serif;
}
.worksystem-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.worksystem-page {
  width: 100%;
  height: 85%;              
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 36px;
  overflow-y: auto;
}

/* 메인 패널 */
.panel {
  width: 100%;
  background-color: #ffffff;
  border-radius: 14px;
  border: 2px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}

/* 버튼 */
.btn-search,
.btn-reset {
  min-width: 60px;
  height: 40px;
  border-radius: 10px;
  border: 2px solid #cad5e2;
  background-color: #ffffff;
  color: #62748e;
  cursor: pointer;
}

.btn-search {
  background-color: #155dfc;
  border-color: #155dfc;
  color: #ffffff;
}

.btn-search:disabled,
.btn-reset:disabled {
  opacity: 0.5;
  cursor: default;
}

/* 테이블 영역 */
.panel-table-wrapper {
  padding: 0 0 16px;
}

.panel-table {
  width: 100%;
  overflow-x: auto;
}

.employee-table {
  width: 100%;
  border-collapse: collapse;
}

/* 헤더 */
.employee-table thead tr {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
}

.employee-table th {
  height: 48px;
  padding: 11px 16px;
  font-weight: 700;
  color: #ffffff;
  text-align: center;
  border: none;
}

/* 컬럼 폭 */
.employee-table th.col-date {
  text-align: left;
  width: 10%;
}
.col-name {
  width: 18%;
}
.col-status {
  width: 14%;
}
.col-position {
  width: 14%;
}
.col-worksystem {
  width: 16%;
}
.col-worktime {
  width: 25%;
}

.col-date,
.col-name,
.col-position,
.col-worksystem,
.col-worktime {
  text-align: left;
}

.col-status {
  text-align: center;
}


/* 바디 */
.employee-table td {
  height: 60px;
  padding: 0 16px;
  color: #7b839f;
  border-top: 1px solid #e2e8f0;
  vertical-align: middle;
  text-align: center;
}


.row-striped {
  background-color: #f8fafc;
}


.cell-name {
  font-weight: 400;
}

/* 좌측 정렬해야 자연스러운 컬럼들만 override */
.employee-table td.cell-date{
  text-align: left;
}

.cell-name,
.cell-position,
.cell-worksystem,
.cell-worktime {
  text-align: left;
}

.cell-status {
  padding-top: 0;
  padding-bottom: 0;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  height: 24px;
  padding: 0 12px;
  border-radius: 9999px;
  border: 1px solid #cad5e2;
  background-color: #ffffff;
}

/* 상태별 색상 */
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

/* 근무시간은 살짝 가운데 정렬 */
.cell-worktime {
  text-align: left;
}

/* 빈 데이터 */
.empty-row {
  text-align: center;
  padding: 24px 0;
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


.page-button.page-active:disabled {
  opacity: 1;
}

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

.employee-table tbody tr:last-child td {
  border-bottom: 1px solid #e2e8f0;
}

.panel-search {
  border-bottom: 2px solid #e2e8f0;
  padding: 14px 18px;
}

.panel-search-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.search-info {
  font-size: 18px;
  color: #94a3b8;
  margin: 0;

  position: relative;
  top: -2px;   
}

.filter-group {
  display: flex;
  align-items: flex-end;
  gap: 8px;   /* 날짜와 버튼 사이 간격 */
}

/* 날짜 필터 그룹 */
.date-filter-group {
  display: flex;
  flex-direction: row;  
  align-items: center;   
  gap: 10px;            
}

/* 날짜 라벨 */
.date-label {
  color: #64748b;
  white-space: nowrap;   
  margin: 0;             
}


/* 인풋 + 캘린더 아이콘 */
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
  color: #1f2933;
}

.date-input:focus {
  outline: none;
}

/* 버튼 영역 */
.search-button-group {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-bottom: 2px;
}

.btn-search--active {
  background-color: #2b6bff;
  border-color: #2b6bff;
}

.btn-reset--active {
  background-color: #e5edff;
}
</style>
