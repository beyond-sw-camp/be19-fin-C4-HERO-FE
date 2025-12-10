<template>
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

      <!-- 검색 영역 (지금은 단순 텍스트 검색 인풋 + 버튼) -->
      <div class="panel-search">
        <div class="panel-search-inner">
          <input
            v-model="keyword"
            class="search-input"
            type="text"
            placeholder="날짜, 사유 등으로 검색"
          />
          <button class="btn-search" @click="onSearch">검색</button>
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
                v-for="(row, index) in filteredOvertimeList"
                :key="row.id"
                :class="{ 'row-striped': index % 2 === 1 }"
              >
                <td>{{ row.date }}</td>
                <td>{{ row.startTime }}</td>
                <td>{{ row.endTime }}</td>
                <td class="overtime-time">{{ row.overtimeDuration }}</td>
                <td>{{ row.reason }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 페이지네이션 (지금은 프론트에서만 동작하는 형태, 나중에 Personal처럼 교체 가능) -->
        <div class="pagination">
          <button class="page-button" @click="goPage(currentPage - 1)">
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

          <button class="page-button" @click="goPage(currentPage + 1)">
            다음
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { RouterLink, useRoute } from 'vue-router'
import { computed, ref } from 'vue'

interface OvertimeRow {
  id: number
  date: string
  startTime: string
  endTime: string
  overtimeDuration: string
  reason: string
}

const route = useRoute()
const isActiveTab = (name: string) => route.name === name

// TODO: 나중에 백엔드 연동 시 이 부분을 API 호출 결과로 교체
const overtimeList = ref<OvertimeRow[]>([
  {
    id: 1,
    date: '2025-12-01',
    startTime: '18:00',
    endTime: '20:05',
    overtimeDuration: '2시간 5분',
    reason: '프로젝트 마감',
  },
  {
    id: 2,
    date: '2025-11-30',
    startTime: '18:00',
    endTime: '19:30',
    overtimeDuration: '1시간 30분',
    reason: '월별 업무 처리',
  },
  {
    id: 3,
    date: '2025-11-29',
    startTime: '18:00',
    endTime: '21:00',
    overtimeDuration: '3시간',
    reason: '추가 근무',
  },
  {
    id: 4,
    date: '2025-11-28',
    startTime: '18:00',
    endTime: '20:30',
    overtimeDuration: '2시간 30분',
    reason: '고객 상담',
  },
  {
    id: 5,
    date: '2025-11-27',
    startTime: '18:00',
    endTime: '21:00',
    overtimeDuration: '3시간',
    reason: '회의',
  },
])

// 간단 검색용 키워드
const keyword = ref('')

// 페이지네이션용 상태 (지금은 프론트에서만 계산)
const currentPage = ref(1)
const pageSize = ref(10) // 한 페이지에 10건씩

// 검색 필터
const filteredOvertimeList = computed(() => {
  const k = keyword.value.trim()
  if (!k) return overtimeList.value

  return overtimeList.value.filter((row) => {
    return (
      row.date.includes(k) ||
      row.startTime.includes(k) ||
      row.endTime.includes(k) ||
      row.overtimeDuration.includes(k) ||
      row.reason.includes(k)
    )
  })
})

// 전체 페이지 수
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredOvertimeList.value.length / pageSize.value)),
)

// 현재 페이지에 보여줄 데이터
const pagedOvertimeList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredOvertimeList.value.slice(start, start + pageSize.value)
})

// 템플릿에서는 페이지 적용된 리스트 사용
const listForTemplate = computed(() => pagedOvertimeList.value)

/**
 * 템플릿에서 바로 filteredOvertimeList를 쓰지 않고,
 * listForTemplate를 노출하는 방식으로도 갈 수 있는데,
 * 여기서는 변수 이름만 맞춰 연결해줌
 */
const filteredListAlias = listForTemplate
// alias 이름을 template에서 쓰기 좋게 다시 노출
const filteredOvertimeListComputed = filteredListAlias

// 템플릿 바인딩용 이름으로 export
// (script setup에서는 이런 패턴 대신 바로 computed 이름을 맞춰줘도 됨)
const filteredOvertimeListRef = filteredOvertimeListComputed

function goPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

function onSearch() {
  currentPage.value = 1
}
</script>

<style scoped>
.attendance-page {
  width: 100%;
  height: 100%;
  padding: 36px;
  display: flex;
  flex-direction: column;
  gap: 36px;
  overflow: hidden;
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
  align-items: center;
  gap: 8px;
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
</style>
