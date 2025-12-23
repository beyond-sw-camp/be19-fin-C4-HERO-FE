<!-- 
  <pre>
  TypeScript Name   : DeptVacationCalendar.vue
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
            <button type="button" class="month-btn" @click="moveMonth(-1)">
              ‹
            </button>
            <span class="month-label">
              {{ currentYear }}년 {{ currentMonth + 1 }}월
            </span>
            <button type="button" class="month-btn" @click="moveMonth(1)">
              ›
            </button>
          </div>
        </div>

        <!-- 캘린더 영역 -->
        <div class="calendar-container">
          <!-- 요일 헤더 -->
          <div class="calendar-weekdays">
            <div v-for="dayName in weekdayLabels" :key="dayName" class="weekday">
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
                  <!-- 최대 N개만 표시 -->
                  <div
                    v-for="event in cell.visibleEvents"
                    :key="event.id"
                    class="vacation-bar"
                    :class="{
                      'vacation-bar--self': event.isSelf,
                      'vacation-bar--team': !event.isSelf,
                    }"
                  >
                    {{ event.employeeName }} - {{ event.type }}
                  </div>

                  <!-- 나머지 개수 요약 -->
                  <div v-if="cell.hiddenCount > 0" class="vacation-more">
                    +{{ cell.hiddenCount }}
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
 * 캘린더에 뿌릴 이벤트 타입 (구글 캘린더 기반)
 * - employeeId는 구글에서 안 오므로(공개캘린더 A안) name 기반으로 self 판별
 */
interface DeptVacationEvent {
  id: string
  employeeName: string
  type: string
  startDate: string // YYYY-MM-DD (inclusive)
  endDate: string   // YYYY-MM-DD (inclusive)
  isSelf: boolean
}

interface CalendarCell {
  isEmpty: boolean
  date: Date | null
  events: DeptVacationEvent[]
  visibleEvents: DeptVacationEvent[]
  hiddenCount: number
}

const store = useDepartmentVacationStore()

const now = new Date()
const currentYear = ref(now.getFullYear())
const currentMonth = ref(now.getMonth()) // 0-based

/** 요일 라벨 (일 ~ 토) */
const weekdayLabels: string[] = ['일', '월', '화', '수', '목', '금', '토']

/** 셀 당 최대 표시 이벤트 수 */
const MAX_EVENTS_PER_CELL = 2

/** 구글 캘린더 이벤트 원본을 화면용으로 담을 상태 */
const googleEvents = ref<DeptVacationEvent[]>([])

/**
 * “본인” 판별용 이름
 * - 지금 프로젝트에서 로그인 정보가 어디에 저장되는지에 따라 키를 맞춰 주세요.
 * - 예) localStorage.getItem('employeeName') 또는 authStore.user.name 등
 */
const myEmployeeName = ref<string>(localStorage.getItem('employeeName') || '')

/**
 * 로컬 기준 YYYY-MM-DD 포맷 (toISOString 사용 금지: 타임존으로 하루 밀림 방지)
 */
const formatLocalDate = (d: Date): string => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** YYYY-MM-DD -> Date(로컬) */
const parseYmdToDate = (ymd: string): Date => {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

/** YYYY-MM-DD 하루 빼기 (종일 이벤트 end.date 보정용) */
const minusOneDay = (ymd: string): string => {
  const dt = parseYmdToDate(ymd)
  dt.setDate(dt.getDate() - 1)
  return formatLocalDate(dt)
}

/**
 * 구글 캘린더 이벤트 제목 파싱
 * - "김경영 - 연차휴가" 같은 형식이면 분리
 * - 아니면 전체를 employeeName에 두고 type은 빈값 처리(원하면 디폴트 문자열로)
 */
const parseSummary = (summary: string): { employeeName: string; type: string } => {
  const raw = summary?.trim() || ''
  const parts = raw.split(' - ')
  if (parts.length >= 2) {
    return { employeeName: parts[0].trim(), type: parts.slice(1).join(' - ').trim() }
  }
  return { employeeName: raw || '(제목 없음)', type: '' }
}

/**
 * 구글 캘린더에서 “해당 월” 이벤트를 가져옵니다.
 * - month: 1~12
 */
const fetchGoogleCalendarEvents = async (year: number, month: number): Promise<void> => {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY as string | undefined
  const calendarId = import.meta.env.VITE_GOOGLE_CALENDAR_ID as string | undefined

  if (!apiKey || !calendarId) {
    console.error('VITE_GOOGLE_API_KEY 또는 VITE_GOOGLE_CALENDAR_ID가 없습니다.')
    googleEvents.value = []
    return
  }

  // 해당 월 범위: [monthStart, nextMonthStart)
  const monthStart = new Date(year, month - 1, 1, 0, 0, 0)
  const nextMonthStart = new Date(year, month, 1, 0, 0, 0)

  const timeMin = monthStart.toISOString()
  const timeMax = nextMonthStart.toISOString()

  const url =
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events` +
    `?key=${encodeURIComponent(apiKey)}` +
    `&singleEvents=true` +
    `&orderBy=startTime` +
    `&timeMin=${encodeURIComponent(timeMin)}` +
    `&timeMax=${encodeURIComponent(timeMax)}` +
    `&timeZone=Asia/Seoul` +
    `&maxResults=2500`

  const res = await fetch(url)
  const data = await res.json()

  if (!res.ok) {
    console.error('Google Calendar API error:', res.status, data)
    googleEvents.value = []
    return
  }

  const items: any[] = Array.isArray(data.items) ? data.items : []

  googleEvents.value = items.map((it) => {
    const id = String(it.id)
    const summary = String(it.summary ?? '')
    const { employeeName, type } = parseSummary(summary)

    // dateTime(시간 있음) or date(종일)
    const startRaw: string | undefined = it?.start?.dateTime || it?.start?.date
    const endRaw: string | undefined = it?.end?.dateTime || it?.end?.date

    const startDate = startRaw ? String(startRaw).slice(0, 10) : ''
    const endDateOnly = endRaw ? String(endRaw).slice(0, 10) : startDate

    // 종일 이벤트면 end.date가 “다음날”로 내려오므로 하루 빼서 inclusive로 보정
    const isAllDay = Boolean(it?.start?.date && it?.end?.date)
    const inclusiveEndDate = isAllDay ? minusOneDay(endDateOnly) : endDateOnly

    const isSelf =
      myEmployeeName.value
        ? employeeName === myEmployeeName.value
        : false

    return {
      id,
      employeeName,
      type: type || '(휴가)',
      startDate,
      endDate: inclusiveEndDate,
      isSelf,
    } as DeptVacationEvent
  })
}

/**
 * 날짜별 이벤트 인덱스(Map) 생성
 * - 구글 이벤트 기반
 */
const eventIndex = computed(() => {
  const map = new Map<string, DeptVacationEvent[]>()

  for (const ev of googleEvents.value) {
    if (!ev.startDate || !ev.endDate) continue

    const start = parseYmdToDate(ev.startDate)
    const end = parseYmdToDate(ev.endDate)

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = formatLocalDate(d)
      const arr = map.get(key)
      if (arr) arr.push(ev)
      else map.set(key, [ev])
    }
  }

  return map
})

/**
 * 특정 날짜(셀)에 포함되는 이벤트 반환
 */
const getEventsForDate = (date: Date): DeptVacationEvent[] => {
  const key = formatLocalDate(date)
  return eventIndex.value.get(key) ?? []
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
    cells.push({
      isEmpty: true,
      date: null,
      events: [],
      visibleEvents: [],
      hiddenCount: 0,
    })
  }

  // 실제 날짜 셀
  for (let day = 1; day <= totalDays; day += 1) {
    const d = new Date(currentYear.value, currentMonth.value, day)
    const dayEvents = getEventsForDate(d)

    cells.push({
      isEmpty: false,
      date: d,
      events: dayEvents,
      visibleEvents: dayEvents.slice(0, MAX_EVENTS_PER_CELL),
      hiddenCount: Math.max(0, dayEvents.length - MAX_EVENTS_PER_CELL),
    })
  }

  // 뒤쪽 빈 칸
  while (cells.length % 7 !== 0) {
    cells.push({
      isEmpty: true,
      date: null,
      events: [],
      visibleEvents: [],
      hiddenCount: 0,
    })
  }

  return cells
})

/**
 * 월 이동 + 해당 월 데이터 재조회 (구글 캘린더)
 */
const moveMonth = async (diff: number): Promise<void> => {
  const newDate = new Date(currentYear.value, currentMonth.value + diff, 1)
  currentYear.value = newDate.getFullYear()
  currentMonth.value = newDate.getMonth()

  await fetchGoogleCalendarEvents(currentYear.value, currentMonth.value + 1)
}

/**
 * 초기 로딩
 * - 기존 store.fetchCalendar는 구글 적용 시점에는 사용하지 않습니다.
 * - (원하면) store는 myEmployeeId 같은 정보만 들고 있게 두고, 캘린더 데이터는 googleEvents로만 씁니다.
 */
onMounted(async () => {
  await fetchGoogleCalendarEvents(currentYear.value, currentMonth.value + 1)
})
</script>



<style scoped>
.dept-vacation-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: auto;
}

.dept-vacation-page {
  width: 100%;             
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 36px;
  overflow-y: auto; 
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
