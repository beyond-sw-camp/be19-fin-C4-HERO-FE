<template>
  <div class="attendance-wrapper">
      <div class="attendance-page">
        <!-- 상단 요약 카드 4개 -->
        <div class="summary-cards">
          <div class="summary-card">
            <div class="summary-title">이번 달 근무일</div>
            <div class="summary-value-wrapper">
              <span class="summary-value">15</span>
              <span class="summary-unit">시간</span>
            </div>
          </div>

          <div class="summary-card">
            <div class="summary-title">오늘 근무</div>
            <div class="summary-value-wrapper">
              <span class="summary-value">기본근무제</span>
            </div>
          </div>

          <div class="summary-card">
            <div class="summary-title">이번 달 지각</div>
            <div class="summary-value-wrapper">
              <span class="summary-value">2</span>
              <span class="summary-unit">회</span>
            </div>
          </div>

          <div class="summary-card">
            <div class="summary-title">이번 달 결근</div>
            <div class="summary-value-wrapper">
              <span class="summary-value">0</span>
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

          <!-- 검색 영역(기간 필터)  -->
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
                    <th>시작시간</th>
                    <th>종료시간</th>
                    <th>초과 근무 시간</th>
                    <th>사유</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(row, index) in displayList"
                    :key="row.overtimeId"
                    :class="{ 'row-striped': index % 2 === 1 }"
                  >
                    <td>{{ row.date }}</td>
                    <td>{{ formatTime(row.startTime) }}</td>
                    <td>{{ formatTime(row.endTime) }}</td>
                    <td class="overtime-time">{{ formatOvertime(row.overtimeHours) }}</td>
                    <td>{{ row.reason }}</td>
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
</template>

<script lang="ts" setup>
import { RouterLink, useRoute } from 'vue-router'
import { computed, ref, onMounted } from 'vue'
import { useOvertimeStore } from '@/stores/attendance/overtime'

const route = useRoute()
const store = useOvertimeStore()

const isActiveTab = (name: string) => route.name === name

// 기간 필터용 날짜 (프론트 입력 값)
const startDate = ref('')
const endDate = ref('')

// 키워드 검색 (사유, 날짜 등)
const keyword = ref('')

// 최초 진입 시 1페이지 로딩
onMounted(() => {
  store.fetchOvertime(1)
})

// 서버에서 받아온 원본 리스트
const overtimeList = computed(() => store.overtimeList)

// 키워드 필터 (현재 페이지 데이터에 대해 추가 필터링)
const displayList = computed(() => {
  const k = keyword.value.trim()
  if (!k) return overtimeList.value

  return overtimeList.value.filter((row) => {
    return (
      row.date.includes(k) ||
      row.startTime.includes(k) ||
      row.endTime.includes(k) ||
      String(row.overtimeHours).includes(k) ||
      row.reason.includes(k)
    )
  })
})

// 페이지네이션 정보는 전부 store에서 사용
const currentPage = computed(() => store.currentPage)
const totalPages = computed(() => store.totalPages)

// 페이지 이동 → 서버 호출
function goPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  store.fetchOvertime(page)
}

// 검색 버튼: 기간 필터 + 키워드 검색
function onSearch() {
  // 기간 필터를 스토어에 반영
  store.setFilterDates(startDate.value, endDate.value)
  // 1페이지부터 다시 조회
  store.fetchOvertime(1)
}

// 초기화 버튼 (필요하면)
function onReset() {
  startDate.value = ''
  endDate.value = ''
  keyword.value = ''
  store.setFilterDates('', '')
  store.fetchOvertime(1)
}

// 시간 포맷
function formatTime(time: string) {
  return time ? time.substring(0, 5) : ''
}

// 초과 근무 시간 포맷
function formatOvertime(hours: number) {
  if (hours == null) return '-'
  return `${hours}시간`
}
</script>

<style scoped>
.attendance-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: auto;
}

.attendance-page {
  width: 100%;
  height: 85%;
  padding: 36px;
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
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.summary-title {
  color: #64748b;
  font-size: 24px;
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
  font-size: 38px;
  font-weight: 700;
  color: #000000;
}

.summary-unit {
  font-size: 26px;
  font-weight: 500;
  color: #64748b;
}

/* 메인 패널 */
.panel {
  width: 100%;
  background: #ffffff;
  border-radius: 14px;
  border: 2px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}

/* 탭 영역 */
.panel-tabs {
  display: inline-flex;
  border-bottom: 1px solid #e2e8f0;
}

.tab {
  width: 146px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border-top: 2px solid #e2e8f0;
  border-bottom: 2px solid #e2e8f0;
  border-right: 2px solid #e2e8f0;
  font-size: 14px;
  color: #62748e;
  text-decoration: none;
}

.tab-left {
  border-left: 2px solid #e2e8f0;
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

/* 검색 영역 */
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

.search-input {
  width: 360px;
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
  border: 2px solid #cad5e2;
  background: #ffffff;
  font-size: 14px;
  color: #62748e;
  cursor: pointer;
}

/* 테이블 영역 */
.panel-table-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 14px 18px 0 18px;
  gap: 20px;
}

.panel-table {
  border: 2px solid #e2e8f0;
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
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
}

.attendance-table td {
  padding: 16px;
  font-size: 14px;
  color: #62748e;
  border-top: 0.67px solid #e2e8f0;
}

.attendance-table tbody tr {
  background: #ffffff;
}

.attendance-table tbody tr.row-striped {
  background: #f8fafc;
}

/* 초과 근무 시간 강조 색상 */
.overtime-time {
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
  font-size: 14px;
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
.date-filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.date-label {
  font-size: 13px;
  color: #64748b;
}

/* 인풋 + 캘린더 아이콘 박스 */
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

/* 검색 / 초기화 버튼 묶음 */
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
