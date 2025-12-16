<!-- 
  <pre>
  (File => TypeScript / Vue) Name   : DeptVacationCalendar.vue
  Description : 부서 휴가 캘린더 페이지
                - 월 단위 캘린더에 부서원들의 휴가 일정을 시각화
                - 본인 휴가 / 팀원 휴가 색상 구분
                - 월 이동(이전/다음) 기능 지원

  History
  2025/12/16(이지윤) 최초 작성
  </pre>

  @author 이지윤
  @version 1.0
-->

<template>
  <div class="dept-vacation-wrapper">
    <div class="dept-vacation-page">
      <!-- 메인 패널 -->
      <div class="dept-vacation-panel">
        <!-- 패널 헤더 : 제목 + 월 이동 -->
        <div class="panel-header">
          <div class="panel-title">부서 휴가 캘린더</div>

          <div class="month-nav">
            <button
              type="button"
              class="month-btn"
              @click="moveMonth(-1)"
            >
              ‹
            </button>
            <span class="month-label">
              {{ currentYear }}년 {{ currentMonth + 1 }}월
            </span>
            <button
              type="button"
              class="month-btn"
              @click="moveMonth(1)"
            >
              ›
            </button>
          </div>
        </div>

        <!-- 캘린더 영역 -->
        <div class="calendar-container">
          <!-- 요일 헤더 -->
          <div class="calendar-weekdays">
            <div
              v-for="dayName in weekdayLabels"
              :key="dayName"
              class="weekday"
            >
              {{ dayName }}
            </div>
          </div>

          <!-- 날짜 그리드 -->
          <div class="calendar-grid">
            <div
              v-for="(cell, index) in calendarCells"
              :key="index"
              class="calendar-cell"
              :class="{ 'calendar-cell--empty': cell.isEmpty }"
            >
              <template v-if="!cell.isEmpty && cell.date">
                <div class="cell-date">
                  {{ cell.date.getDate() }}
                </div>

                <div class="cell-events">
                  <div
                    v-for="event in cell.events"
                    :key="event.id"
                    class="vacation-bar"
                    :class="{
                      'vacation-bar--self': event.isSelf,
                      'vacation-bar--team': !event.isSelf
                    }"
                  >
                    {{ event.employeeName }} - {{ event.type }}
                  </div>
                </div>
              </template>
            </div>
          </div>

          <!-- 범례 -->
          <div class="legend">
            <div class="legend-item">
              <span class="legend-color legend-color--self"></span>
              <span class="legend-label">본인 휴가</span>
            </div>
            <div class="legend-item">
              <span class="legend-color legend-color--team"></span>
              <span class="legend-label">팀원 휴가</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useDepartmentVacationStore } from '@/stores/vacation/departmentVacation'

/**
 * 캘린더에 뿌릴 이벤트 타입
 */
interface DeptVacationEvent {
  id: number
  employeeId: number
  employeeName: string
  type: string
  startDate: string // YYYY-MM-DD
  endDate: string   // YYYY-MM-DD
  isSelf: boolean
}

interface CalendarCell {
  isEmpty: boolean
  date: Date | null
  events: DeptVacationEvent[]
}

const store = useDepartmentVacationStore()

const now = new Date()
const currentYear = ref(now.getFullYear())
const currentMonth = ref(now.getMonth()) 

/** 요일 라벨 (일 ~ 토) */
const weekdayLabels: string[] = ['일', '월', '화', '수', '목', '금', '토']

/**
 * 백엔드가 LocalDateTime을 내려줘도 캘린더에서는 날짜만 필요
 * "2025-12-05T09:00:00" -> "2025-12-05"
 */
const toDateOnly = (value: string): string => value?.slice(0, 10)

/**
 * store.items(DepartmentVacationDTO[]) -> 캘린더 표시용 이벤트로 변환
 */
const events = computed<DeptVacationEvent[]>(() => {
  const myId = store.myEmployeeId

  return store.items.map((it) => ({
    id: it.vacationLogId,
    employeeId: it.employeeId,
    employeeName: it.employeeName,
    type: it.vacationTypeName,
    startDate: toDateOnly(it.startDate),
    endDate: toDateOnly(it.endDate),
    isSelf: myId != null && it.employeeId === myId,
  }))
})

/**
 * 특정 날짜에 포함되는 이벤트 반환
 */
const getEventsForDate = (date: Date): DeptVacationEvent[] => {
  const target = date.toISOString().slice(0, 10)

  return events.value.filter((ev) => {
    return target >= ev.startDate && target <= ev.endDate
  })
}

/**
 * 캘린더 셀 구성 (7의 배수로 앞/뒤 빈칸 채우기)
 */
const calendarCells = computed<CalendarCell[]>(() => {
  const first = new Date(currentYear.value, currentMonth.value, 1)
  const last = new Date(currentYear.value, currentMonth.value + 1, 0)

  const firstWeekday = first.getDay()
  const totalDays = last.getDate()

  const cells: CalendarCell[] = []

  // 앞쪽 빈 칸
  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push({ isEmpty: true, date: null, events: [] })
  }

  // 실제 날짜 셀
  for (let day = 1; day <= totalDays; day += 1) {
    const d = new Date(currentYear.value, currentMonth.value, day)
    cells.push({
      isEmpty: false,
      date: d,
      events: getEventsForDate(d),
    })
  }

  // 뒤쪽 빈 칸
  while (cells.length % 7 !== 0) {
    cells.push({ isEmpty: true, date: null, events: [] })
  }

  return cells
})

/**
 * 월 이동 + 해당 월 데이터 재조회
 */
const moveMonth = async (diff: number): Promise<void> => {
  const newDate = new Date(currentYear.value, currentMonth.value + diff, 1)
  currentYear.value = newDate.getFullYear()
  currentMonth.value = newDate.getMonth()

  // API month는 1~12로 전달
  await store.fetchCalendar(currentYear.value, currentMonth.value + 1)
}

/**
 * 초기 로딩
 */
onMounted(async () => {
  // 로그인 전 임시 테스트용 (필요하면 켜서 사용)
  // store.setDepartmentId(1)
  // store.setMyEmployeeId(11)

  await store.fetchCalendar(currentYear.value, currentMonth.value + 1)
})
</script>

<style scoped>
/* TODO: dept-vacation-wrapper / dept-vacation-page / calendar-container 등
   BEM 네이밍 컨벤션에 맞춰 점진적 리팩터링 예정 */
</style>


<style scoped>
.dept-vacation-wrapper {
  width: 100%;
  height: 100%;
  padding: 20px 36px 20px 30px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow-y: auto; 
}

.dept-vacation-page {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.dept-vacation-panel {
  width: 100%;
  height: 100%;
  padding: 2px;
  background: #ffffff;
  border-radius: 14px;
  outline: 2px solid #e2e8f0;
  outline-offset: -2px;
  display: flex;
  flex-direction: column;
}

/* 헤더 */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 74px;
  padding: 19px 25px;
  border-bottom: 2px solid #e2e8f0;
  background: #ffffff;
  border-top-right-radius: 14px;
}

.panel-title {
  font-size: 16px;
  font-family: 'Arimo', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
    sans-serif;
  color: #1a1f36;
}

.month-nav {
  display: flex;
  align-items: center;
  gap: 16px;
}

.month-label {
  font-size: 16px;
  font-family: 'Arimo', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
    sans-serif;
  color: #101828;
}

.month-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* 캘린더 컨테이너 */
.calendar-container {
  flex: 1;
  padding: 24px;
  background: #ffffff;
  box-shadow: 0 1px 2px -1px rgba(0, 0, 0, 0.1);
  border-radius: 14px;
  border: 0.8px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 요일 헤더 */
.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 8px;
}

.weekday {
  text-align: center;
  font-size: 16px;
  font-family: 'Arimo', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
    sans-serif;
  color: #6a7282;
}

/* 날짜 그리드 */
.calendar-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  grid-auto-rows: 85px;
  gap: 8px 8px;
}

.calendar-cell {
  background: #ffffff;
  border-radius: 10px;
  border: 0.8px solid #f3f4f6;
  padding: 8px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.calendar-cell--empty {
  background: #f9fafb;
}

.cell-date {
  font-size: 16px;
  font-family: 'Arimo', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
    sans-serif;
  color: #101828;
  margin-bottom: 4px;
}

.cell-events {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* 휴가 바 */
.vacation-bar {
  height: 40px;
  border-radius: 4px;
  font-size: 12px;
  font-family: 'Arimo', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
    sans-serif;
  display: flex;
  align-items: center;
  padding: 3px 8px;
  color: #ffffff;
  box-sizing: border-box;
}

.vacation-bar--self {
  background: #2b7fff; /* 본인 휴가 */
}

.vacation-bar--team {
  background: #99a1af; /* 팀원 휴가 */
}

/* 범례 */
.legend {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  margin-top: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.legend-color--self {
  background: #2b7fff;
}

.legend-color--team {
  background: #99a1af;
}

.legend-label {
  font-size: 14px;
  color: #4a5565;
}
</style>
