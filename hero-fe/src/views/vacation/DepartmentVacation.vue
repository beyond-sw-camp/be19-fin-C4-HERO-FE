<!-- 
  <pre>
  TypeScript Name   : DeptVacationCalendar.vue
  Description : 부서 휴가 캘린더 페이지
                - 월 단위 캘린더에 부서원들의 휴가 일정을 시각화
                - 본인 휴가 / 팀원 휴가 색상 구분
                - 월 이동(이전/다음) 기능 지원

  History
  2025/12/16(이지윤) 최초 작성
  2025/12/30(리팩토링) Google Calendar → DB 연동 + 내부 캘린더 렌더링
  </pre>

  @author 이지윤
  @version 1.2
-->

<template>
  <div class="dept-vacation-wrapper">
    <div class="dept-vacation-page">
      <!-- 메인 패널 -->
      <div class="dept-vacation-panel">
        <!-- 패널 헤더 : 제목 + 월 이동 -->
        <div class="panel-header">
          <div class="panel-title">{{ calendarTitle }}</div>

          <div class="month-nav">
            <button type="button" class="month-btn" @click="changeMonth(-1)">
              ‹
            </button>
            <span class="month-label">
              {{ currentYear }}년 {{ currentMonth + 1 }}월
            </span>
            <button type="button" class="month-btn" @click="changeMonth(1)">
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

          <!-- 월 캘린더 (주 단위 행, 일 단위 셀) -->
          <div class="calendar-grid">
            <div
              v-for="(week, wIdx) in calendarWeeks"
              :key="wIdx"
              class="calendar-row"
            >
              <div
                v-for="(day, dIdx) in week"
                :key="dIdx"
                class="calendar-cell"
                :class="{
                  'calendar-cell--other': !day.isCurrentMonth,
                  'calendar-cell--today': isToday(day.date)
                }"
              >
                <!-- 날짜 숫자 -->
                <div class="cell-date">
                  <span v-if="day.date">
                    {{ day.date.getDate() }}
                  </span>
                </div>

                <!-- 휴가 태그들 -->
                <div class="cell-events">
                  <div
                    v-for="ev in day.events"
                    :key="ev.id"
                    class="vacation-tag"
                    :class="ev.isSelf ? 'vacation-tag--self' : 'vacation-tag--team'"
                  >
                    {{ ev.employeeName }} - {{ ev.type }}
                  </div>
                </div>
              </div>
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
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useDepartmentVacationStore } from '@/stores/vacation/departmentVacation'

/**
 * ---------- 스토어 연동 ----------
 */
const authStore = useAuthStore()
const { employeeId, user } = storeToRefs(authStore)

const deptVacationStore = useDepartmentVacationStore()
const { items } = storeToRefs(deptVacationStore) // DepartmentVacationDTO 리스트

/**
 * ---------- 타입 정의 ----------
 * DepartmentVacationDTO를 화면용 이벤트로 변환
 *
 * DepartmentVacationDTO 가 아래 구조라고 가정:
 *  - vacationLogId: number
 *  - employeeId: number
 *  - employeeName: string
 *  - vacationTypeName: string
 *  - startDate: string (YYYY-MM-DD)
 *  - endDate:   string | null (없으면 startDate와 동일)
 */
interface DeptVacationEvent {
  id: string
  employeeId: number
  employeeName: string
  type: string
  startDate: string
  endDate: string
  isSelf: boolean
}

interface CalendarDay {
  date: Date | null
  isCurrentMonth: boolean
  events: DeptVacationEvent[]
}

/**
 * ---------- 날짜 / 캘린더 유틸 ----------
 */
const weekdayLabels = ['일', '월', '화', '수', '목', '금', '토']

const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth()) // 0-based

const monthStart = computed(() => new Date(currentYear.value, currentMonth.value, 1))
const monthEnd = computed(() => new Date(currentYear.value, currentMonth.value + 1, 0))

const toLocalMidnight = (d: Date): Date =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate())

const dateMs = (d: Date): number => toLocalMidnight(d).getTime()

const isToday = (date: Date | null): boolean => {
  if (!date) return false
  return dateMs(date) === dateMs(today)
}

const parseYmd = (ymd: string): Date => {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

/**
 * 백엔드 DTO → 화면용 이벤트
 */
const vacationEvents = computed<DeptVacationEvent[]>(() =>
  items.value.map((dto: any) => {
    const start = dto.startDate as string
    const end = (dto.endDate as string) || start

    const self =
      employeeId.value != null ? dto.employeeId === employeeId.value : false

    return {
      id: String(dto.vacationLogId),
      employeeId: dto.employeeId,
      employeeName: dto.employeeName,
      type: dto.vacationTypeName,
      startDate: start,
      endDate: end,
      isSelf: self,
    }
  }),
)

/**
 * 특정 날짜에 포함되는 휴가 이벤트 필터링
 */
const getEventsForDate = (date: Date): DeptVacationEvent[] => {
  const target = dateMs(date)

  return vacationEvents.value.filter((ev) => {
    if (!ev.startDate) return false

    const start = parseYmd(ev.startDate)
    const end = parseYmd(ev.endDate || ev.startDate)

    const sMs = dateMs(start)
    const eMs = dateMs(end)

    return sMs <= target && target <= eMs
  })
}

/**
 * 월 캘린더(주 단위) 생성
 */
const calendarWeeks = computed<CalendarDay[][]>(() => {
  const first = monthStart.value
  const last = monthEnd.value

  // 1일이 포함된 주의 일요일로 이동
  const firstWeekStart = new Date(first)
  firstWeekStart.setDate(first.getDate() - first.getDay()) // 0=일요일

  const weeks: CalendarDay[][] = []
  let cursor = new Date(firstWeekStart)

  while (true) {
    const week: CalendarDay[] = []

    for (let i = 0; i < 7; i += 1) {
      const date = new Date(cursor)
      const inMonth = date.getMonth() === currentMonth.value

      week.push({
        date,
        isCurrentMonth: inMonth,
        events: inMonth ? getEventsForDate(date) : [],
      })

      cursor.setDate(cursor.getDate() + 1)
    }

    weeks.push(week)

    // 마지막 날을 지나고, 다음 주의 시작(일요일)이면 종료
    if (cursor > last && cursor.getDay() === 0) {
      break
    }
  }

  return weeks
})

/**
 * ---------- 월 이동 + 데이터 로드 ----------
 * Pinia 액션 시그니처는 프로젝트에 맞게 구현:
 *   fetchDepartmentVacation(year: number, month: number)
 */
const loadCurrentMonth = async () => {
  await deptVacationStore.fetchDepartmentVacation(
    currentYear.value,
    currentMonth.value + 1, // month: 1~12
  )
}

const changeMonth = async (diff: number) => {
  const newDate = new Date(currentYear.value, currentMonth.value + diff, 1)
  currentYear.value = newDate.getFullYear()
  currentMonth.value = newDate.getMonth()

  await loadCurrentMonth()
}

onMounted(async () => {
  await loadCurrentMonth()
})

/**
 * ---------- 헤더 타이틀 ----------
 */
const calendarTitle = computed(() => {
  const deptName = user.value?.departmentName?.trim()
  return deptName ? `${deptName} 휴가 캘린더` : '부서 휴가 캘린더'
})
</script>

<style scoped>
* {
  font-size: 14px;
  font-family: 'Inter-Regular', sans-serif;
}

/* ---------- Layout ---------- */
.dept-vacation-wrapper {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 80px);
}

.dept-vacation-page {
  width: 100%;
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 36px;
  flex: 1;
}

.dept-vacation-panel {
  width: 100%;
  padding: 2px;
  background: #ffffff;
  border-radius: 14px;
  outline: 2px solid #e2e8f0;
  outline-offset: -2px;
  display: flex;
  flex-direction: column;
  flex: 1;
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
  font-size: 18px;
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
  font-size: 18px;
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
  --cell-padding: 12px;         
  --cell-min-height: 120px;    
  --date-row-height: 24px;
  --bar-height: 48px;       
  --bar-gap: 6px;
}


/* 요일 헤더 */
.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 8px;
}

.weekday {
  font-size: 16px;
  text-align: center;
  font-family: 'Arimo', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
    sans-serif;
  color: #6a7282;
}

/* 날짜 그리드 */
.calendar-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.calendar-row {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 8px;
}

.calendar-cell {
  background: #ffffff;
  border-radius: 10px;
  border: 0.8px solid #f3f4f6;
  padding: var(--cell-padding);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  /* 이 줄을 추가해서 강제로 더 크게 */
  min-height: calc(
    150px + (var(--week-lines, 0) * (var(--bar-height) + var(--bar-gap)))
  );
}

.calendar-cell--other {
  background: #f9fafb;
  color: #9ca3af;
}

.calendar-cell--today {
  border-color: #2563eb;
}

.cell-date {
  height: 24px;
  font-size: 16px;
  color: #101828;
}

.cell-events {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* 휴가 태그(한 칸 안에서만 표시, bar 연결 X) */
.vacation-tag {
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 18px;
  line-height: 32px;
  color: #ffffff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: 'Arimo', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
    sans-serif;
}

.vacation-tag--self {
  background: #2b7fff; /* 본인 휴가: 파란색 */
}

.vacation-tag--team {
  background: #99a1af; /* 팀원 휴가: 회색 */
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
