<!-- 
  <pre>
  TypeScript Name   : AttendanceDashboard.vue
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
          <span class="summary-value">{{ summary.totalEmployees }}</span>
          <span class="summary-unit">명</span>
        </div>
      </div>

      <!-- 우수 직원 -->
      <div class="summary-card">
        <div class="summary-title">우수 직원(95점 이상)</div>
        <div class="summary-value-wrapper">
          <span class="summary-value">{{ summary.excellentEmployees }}</span>
          <span class="summary-unit">명</span>
        </div>
      </div>

      <!-- 위험 직원 -->
      <div class="summary-card">
        <div class="summary-title">위험 직원(85점 이하)</div>
        <div class="summary-value-wrapper">
          <span class="summary-value">{{ summary.riskyEmployees }}</span>
          <span class="summary-unit">명</span>
        </div>
      </div>

      <!-- 점수 계산 식 -->
      <div class="summary-card">
        <div class="summary-title">점수 계산 식</div>
        <div class="summary-formula">점수 : 100 - (지각 × 1) - (결근 × 2)</div>
      </div>
    </div>

    <!-- 하단 패널 (필터 + 테이블 + 페이지네이션) -->
    <div class="dashboard-panel">
      <!-- 필터 영역 -->
      <div class="panel-search">
        <div class="panel-search-inner">
          <div class="filter-row">
            <span class="filter-label">필터</span>

            <!-- 월 선택 -->
            <input
              v-model="selectedMonth"
              type="month"
              class="filter-select"
              :max="currentMonth"
            />

            <!-- 부서 선택 -->
            <select
              v-model="selectedDepartmentId"
              class="filter-select"
              :disabled="deptLoading"
            >
              <option :value="null">전체 부서</option>
              <option
                v-for="dept in departmentOptions"
                :key="dept.departmentId"
                :value="dept.departmentId"
              >
                {{ dept.departmentName }}
              </option>
            </select>

            <!-- 점수 정렬 -->
            <select v-model="scoreSort" class="filter-select">
              <option value="DESC">점수 높은 순</option>
              <option value="ASC">점수 낮은 순</option>
            </select>
          </div>

          <!-- 오른쪽: 검색 / 초기화 버튼 -->
          <div class="search-button-group">
            <button class="btn-search" @click="onSearch">검색</button>
            <button class="btn-reset" @click="onReset">초기화</button>
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
              @click="openEmployeeChart(row.employeeId)"
              style="cursor:pointer;"
            >
              <td>{{ row.employeeNumber }}</td>
              <td>{{ row.employeeName }}</td>
              <td>{{ row.departmentName }}</td>

              <td
                class="count-cell"
                :class="row.tardyCount > 0 ? 'status-late' : 'status-normal'"
              >
                {{ row.tardyCount }}회
              </td>

              <td
                class="count-cell"
                :class="row.absenceCount > 0 ? 'status-absent' : 'status-normal'"
              >
                {{ row.absenceCount }}회
              </td>

              <td>{{ row.score }}점</td>
            </tr>

            <tr v-if="pagedEmployees.length === 0">
              <td colspan="6" class="empty-row">검색 조건에 해당하는 직원이 없습니다.</td>
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
          :disabled="totalPages === 0 || currentPage >= totalPages"
          @click="goPage(currentPage + 1)"
        >
          다음
        </button>
      </div>
    </div>
    <EmployeeHalfChart
      :open="employeeDashboardOpen"
      :employee-id="selectedEmployeeId"
      @close="closeEmployeeChart"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import EmployeeHalfChart from '@/views/attendance/attendanceDashboard/EmplloyeeHalfChartDrawer.vue'
import { useAttendanceEmployeeDashboardStore } from '@/stores/attendance/attendanceEmployeeDashboard'
import {
  useAttendanceDashboardStore,
  type AttendanceDashboardDTO,
  type ScoreSort,
} from '@/stores/attendance/dashboard'

const employeeDashboardStore = useAttendanceEmployeeDashboardStore()
const { open: employeeDashboardOpen, selectedEmployeeId } = storeToRefs(employeeDashboardStore)

/** YYYY-MM (month input용) */
const currentMonth = new Date().toISOString().slice(0, 7)

/** 필터 로컬 상태 */
const selectedMonth = ref<string>(currentMonth)
const selectedDepartmentId = ref<number | null>(null)
const scoreSort = ref<ScoreSort>('DESC')

/** Store */
const dashboardStore = useAttendanceDashboardStore()
const {
  dashboardList,
  currentPage,
  totalPages,
  summary,
  departmentOptions,
  deptLoading,
} = storeToRefs(dashboardStore)

/** 현재 페이지 목록 */
const pagedEmployees = computed<AttendanceDashboardDTO[]>(() => dashboardList.value)

/** 검색 */
const onSearch = (): void => {
  dashboardStore.setMonth(selectedMonth.value)
  dashboardStore.setDepartment(selectedDepartmentId.value)
  dashboardStore.setScoreSort(scoreSort.value)
  dashboardStore.refreshDashboard(1)
}

/** 초기화 */
const onReset = (): void => {
  selectedMonth.value = currentMonth
  selectedDepartmentId.value = null
  scoreSort.value = 'DESC'

  dashboardStore.setMonth(currentMonth)
  dashboardStore.setDepartment(null)
  dashboardStore.setScoreSort('DESC')
  dashboardStore.refreshDashboard(1)
}

/** 페이지 이동 */
const goPage = (page: number): void => {
  if (page < 1 || page > totalPages.value) return
  dashboardStore.fetchDashboard(page)
}

const openEmployeeChart = async (employeeId: number): Promise<void> => {
  // year/half 기본값은 store에 있으니 employeeId만 넘겨도 됨
  await employeeDashboardStore.fetchEmployeeHalfDashboard(employeeId)
}

const closeEmployeeChart = (): void => {
  employeeDashboardStore.setOpen(false)
}


/** 초기 진입 */
onMounted(async () => {
  dashboardStore.setMonth(currentMonth)
  dashboardStore.setDepartment(null)
  dashboardStore.setScoreSort('DESC')

  if (!departmentOptions.value.length) {
    await dashboardStore.fetchDepartmentOptions()
  }
  dashboardStore.refreshDashboard(1)
})
</script>

<style scoped>
  * {
  font-size: 14px;
  font-family: "Inter-Regular", sans-serif;
}
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

.summary-formula {
  font-size: 16px;
  font-weight: 700;
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
.filter-select {
  width: 220px;
  height: 40px;
  border-radius: 10px;
  border: 2px solid #cad5e2;
  background: #ffffff;
  padding: 0 12px;
  color: #1f2933;
}

.filter-select:focus{
  outline: none;
}

.dashboard-table td.count-cell {
  font-weight: 600;
}

.dashboard-table td.status-normal {
  color: #000000;
}

.dashboard-table td.status-late {
  color: #ff0000;
}

.dashboard-table td.status-absent {
  color: #16a34a;
}

.dashboard-table td.status-early {
  color: rgb(187, 187, 30);
}
</style>