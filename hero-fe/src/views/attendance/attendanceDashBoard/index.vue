<!-- 
  <pre>
  (File => TypeScript / Vue) Name   : AttendanceScoreDashboard.vue
  Description : 근태 점수 대시보드 페이지
                - 상단 요약 카드(전체 직원 / 우수 직원 / 위험 직원 / 점수 계산식)
                - 검색(이름 / 부서 / 사번) + 페이지네이션
                - 근태 점수: 100 - (지각 × 1) - (결근 × 2)

  History
  2025/12/16 - 이지윤 최초 작성
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
        <div class="summary-value-row">
          <span class="summary-value">{{ totalEmployees }}</span>
          <span class="summary-unit">명</span>
        </div>
      </div>

      <!-- 우수 직원 -->
      <div class="summary-card">
        <div class="summary-title">우수 직원(95점 이상)</div>
        <div class="summary-value-row">
          <span class="summary-value">{{ excellentEmployees }}</span>
          <span class="summary-unit">명</span>
        </div>
      </div>

      <!-- 위험 직원 -->
      <div class="summary-card">
        <div class="summary-title">위험 직원(85점 이하)</div>
        <div class="summary-value-row">
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

    <!-- 하단 패널 (테이블 + 검색 + 페이지네이션) -->
    <div class="dashboard-panel">
      <!-- 패널 헤더 (검색 영역) -->
      <div class="panel-header">
        <div class="panel-title">근태 점수 현황</div>

        <div class="panel-search">
          <input
            v-model="searchKeyword"
            type="text"
            class="search-input"
            placeholder="이름 / 부서 / 사번 검색"
            @keyup.enter="onSearch"
          />
          <button
            type="button"
            class="btn-search"
            @click="onSearch"
          >
            검색
          </button>
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
              :key="row.empNo"
              :class="{ 'row-striped': index % 2 === 1 }"
            >
              <!-- 사번 -->
              <td>{{ row.empNo }}</td>

              <!-- 이름 -->
              <td>{{ row.name }}</td>

              <!-- 부서 -->
              <td>{{ row.department }}</td>

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
import { computed, ref } from 'vue';

/**
 * 근태 점수 행 데이터 타입
 * - empNo        : 사번
 * - name         : 이름
 * - department   : 부서
 * - tardyCount   : 지각 횟수
 * - absenceCount : 결근 횟수
 * - score        : 근태 점수
 */
interface EmployeeScoreRow {
  empNo: string;
  name: string;
  department: string;
  tardyCount: number;
  absenceCount: number;
  score: number;
}

/**
 * 더미 데이터 (추후 백엔드 연동 예정)
 * 점수 계산: 100 - (지각 × 1) - (결근 × 2)
 */
const employees = ref<EmployeeScoreRow[]>([
  {
    empNo: '1',
    name: '김철수',
    department: '개발팀',
    tardyCount: 3,
    absenceCount: 1,
    score: 100 - 3 * 1 - 1 * 2, // 95
  },
  {
    empNo: '2',
    name: '이영희',
    department: '디자인팀',
    tardyCount: 1,
    absenceCount: 2,
    score: 100 - 1 * 1 - 2 * 2, // 95
  },
  {
    empNo: '3',
    name: '박수민',
    department: '영업팀',
    tardyCount: 0,
    absenceCount: 3,
    score: 100 - 0 * 1 - 3 * 2, // 94
  },
  {
    empNo: '4',
    name: '정수진',
    department: '인사팀',
    tardyCount: 2,
    absenceCount: 0,
    score: 100 - 2 * 1 - 0 * 2, // 98
  },
  {
    empNo: '5',
    name: '최동욱',
    department: '마케팅팀',
    tardyCount: 5,
    absenceCount: 4,
    score: 100 - 5 * 1 - 4 * 2, // 87
  },
]);

/** 검색 키워드 */
const searchKeyword = ref<string>('');

/** 페이지네이션 상태 */
const currentPage = ref<number>(1);
const pageSize = ref<number>(5);

/**
 * 상단 카드용 집계 - 전체 직원 수
 *
 * @returns {number} 전체 직원 수
 */
const totalEmployees = computed<number>(() => employees.value.length);

/**
 * 상단 카드용 집계 - 우수 직원 수 (95점 이상)
 *
 * @returns {number} 우수 직원 수
 */
const excellentEmployees = computed<number>(() => {
  return employees.value.filter((emp) => emp.score >= 95).length;
});

/**
 * 상단 카드용 집계 - 위험 직원 수 (85점 이하)
 *
 * @returns {number} 위험 직원 수
 */
const riskyEmployees = computed<number>(() => {
  return employees.value.filter((emp) => emp.score <= 85).length;
});

/**
 * 검색 키워드를 적용한 직원 목록
 * - 사번 / 이름 / 부서에 대해 부분 일치 검색
 *
 * @returns {EmployeeScoreRow[]} 필터링된 직원 목록
 */
const filteredEmployees = computed<EmployeeScoreRow[]>(() => {
  const keyword = searchKeyword.value.trim();

  if (!keyword) {
    return employees.value;
  }

  return employees.value.filter((emp) => {
    return (
      emp.empNo.includes(keyword) ||
      emp.name.includes(keyword) ||
      emp.department.includes(keyword)
    );
  });
});

/**
 * 전체 페이지 수
 *
 * @returns {number} 전체 페이지 수 (최소 1)
 */
const totalPages = computed<number>(() => {
  return Math.max(1, Math.ceil(filteredEmployees.value.length / pageSize.value));
});

/**
 * 현재 페이지에 해당하는 직원 목록
 *
 * @returns {EmployeeScoreRow[]} 현재 페이지 직원 목록
 */
const pagedEmployees = computed<EmployeeScoreRow[]>(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;

  return filteredEmployees.value.slice(start, end);
});

/**
 * 검색 버튼 / Enter 입력 시 호출되는 핸들러
 * - 페이지를 1 페이지로 초기화하여 첫 페이지부터 다시 조회
 */
const onSearch = (): void => {
  currentPage.value = 1;
};

/**
 * 페이지 이동 핸들러
 * - 1보다 작거나 전체 페이지 수를 초과하는 경우 무시
 *
 * @param {number} page - 이동할 페이지 번호
 */
const goPage = (page: number): void => {
  if (page < 1 || page > totalPages.value) {
    return;
  }

  currentPage.value = page;
};
</script>

<style scoped>
/* TODO: attendance-dashboard-wrapper / summary-cards / dashboard-panel 등
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

/* 패널 헤더 */
.panel-header {
  height: 74px;
  padding: 16px 24px;
  border-bottom: 2px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-title {
  font-size: 16px;
  font-weight: 500;
  color: #1a1f36;
}

.panel-search {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-input {
  width: 260px;
  height: 40px;
  border-radius: 10px;
  border: 2px solid #cad5e2;
  padding: 0 12px;
  font-size: 14px;
  color: #1f2933;
}

.search-input::placeholder {
  color: #9ca3af;
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
</style>
