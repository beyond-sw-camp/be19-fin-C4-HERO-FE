<!-- 
  <pre>
  TypeScript Name   : DeptVacationCalendar.vue
  Description : 부서 휴가 캘린더 페이지
                - 월 단위 캘린더에 부서원들의 휴가 일정을 시각화
                - 본인 휴가 / 팀원 휴가 색상 구분
                - 월 이동(이전/다음) 기능 지원
                - (개선) 연속 휴가 bar 연결 + 주 단위 자동 높이 확장

  History
  2025/12/16(이지윤) 최초 작성
  2025/12/23(리팩토링) 주 단위 bar 렌더링 적용
  </pre>

  @author 이지윤
  @version 1.1
-->

<template>
  <div class="dept-vacation-wrapper">
    <div class="dept-vacation-page">
      <!-- 메인 패널 -->
      <div class="dept-vacation-panel">
        <!-- 패널 헤더 : 제목 + 월 이동 -->
        <div class="panel-header">
          <div class="panel-title">{{ calendarTitle }} 휴가 캘린더</div>

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

          <!-- 주(week) 단위 렌더 -->
          <div class="calendar-weeks">
            <div
              v-for="(week, wIdx) in calendarWeeks"
              :key="wIdx"
              class="calendar-week"
              :style="weekStyle(wIdx)"
            >
              <!-- 날짜 셀 (배경/테두리/날짜 숫자) -->
              <div class="week-grid">
                <div
                  v-for="(cell, cIdx) in week"
                  :key="cIdx"
                  class="calendar-cell"
                  :class="{ 'calendar-cell--empty': cell.isEmpty }"
                >
                  <template v-if="!cell.isEmpty && cell.date">
                    <div class="cell-date">
                      {{ cell.date.getDate() }}
                    </div>
                  </template>
                </div>
              </div>

              <!-- 이벤트 bar 레이어 (주 단위로 grid-column span) -->
              <div class="week-bars">
                <div
                  v-for="seg in weekSegmentsByWeek.get(wIdx) ?? []"
                  :key="seg.key"
                  class="vacation-bar"
                  :class="{
                    'vacation-bar--self': seg.isSelf,
                    'vacation-bar--team': !seg.isSelf,
                  }"
                  :style="barStyle(seg)"
                >
                  {{ seg.employeeName }} - {{ seg.type }}
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
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const { employeeId, user } = storeToRefs(authStore)

const myEmployeeName = computed(() => user.value?.employeeName ?? '')

/**
 * 캘린더에 뿌릴 이벤트 타입 (구글 캘린더 기반)
 * - 공개 캘린더는 employeeId가 기본으로 오지 않으므로,
 *   제목(summary)에 employeeId를 심어두는 방식이면 여기서 파싱해서 isSelf를 더 정확히 만들 수 있음.
 */
interface DeptVacationEvent {
  id: string
  employeeId?: number
  employeeName: string
  type: string
  startDate: string // YYYY-MM-DD (inclusive)
  endDate: string   // YYYY-MM-DD (inclusive)
  isSelf: boolean
}

interface DayCell {
  isEmpty: boolean
  date: Date | null
}

/** 주(week) 단위로 렌더링할 bar segment */
interface WeekSegment {
  key: string
  eventId: string
  employeeName: string
  type: string
  isSelf: boolean
  weekIndex: number
  startCol: number // 0~6
  endCol: number   // 0~6
  line: number     // 0부터
}

const now = new Date()
const currentYear = ref(now.getFullYear())
const currentMonth = ref(now.getMonth()) // 0-based

/** 요일 라벨 (일 ~ 토) */
const weekdayLabels: string[] = ['일', '월', '화', '수', '목', '금', '토']

/** 구글 캘린더 이벤트 원본을 화면용으로 담을 상태 */
const googleEvents = ref<DeptVacationEvent[]>([])

/** 본인 판별 기준: employeeId 우선, 없으면 name fallback */
const getEmployeeIdFromStorage = (): number | null => {
  const raw = localStorage.getItem('employeeId')
  if (!raw) return null

  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

const myEmployeeId = ref<number | null>(getEmployeeIdFromStorage())


/** ---------- Date Utils ---------- */

/** 로컬 기준 YYYY-MM-DD 포맷 (toISOString 사용 금지: 타임존으로 하루 밀림 방지) */
const formatLocalDate = (d: Date): string => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** YYYY-MM-DD -> Date(로컬, 00:00) */
const parseYmdToDate = (ymd: string): Date => {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

const toLocalMidnight = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate())

const addDays = (d: Date, days: number): Date => {
  const nd = new Date(d)
  nd.setDate(nd.getDate() + days)
  return nd
}

const diffDays = (a: Date, b: Date): number => {
  const aa = toLocalMidnight(a).getTime()
  const bb = toLocalMidnight(b).getTime()
  return Math.floor((bb - aa) / 86400000)
}

/** YYYY-MM-DD 하루 빼기 (종일 이벤트 end.date 보정용) */
const minusOneDay = (ymd: string): string => {
  const dt = parseYmdToDate(ymd)
  dt.setDate(dt.getDate() - 1)
  return formatLocalDate(dt)
}

/** ---------- Summary Parsing ---------- */
/**
 * 구글 캘린더 이벤트 제목 파싱
 * - 기본: "김경영 - 연차휴가"
 * - employeeId까지 심어둔 경우(권장 예):
 *   "[45] 김경영 - 연차휴가"
 *   "(45) 김경영 - 연차휴가"
 *   "45|김경영 - 연차휴가"
 */
const parseSummary = (
  summary: string,
): { employeeId?: number; employeeName: string; type: string } => {
  const raw = summary?.trim() || ''

  // employeeId prefix 추출
  const m = raw.match(/^\s*(?:\[(\d+)\]|\((\d+)\)|(\d+)\s*\|)\s*(.*)$/)
  const idStr = m?.[1] || m?.[2] || m?.[3]
  const rest = m ? (m[4] ?? '').trim() : raw
  const employeeId = idStr ? Number(idStr) : undefined

  const parts = rest.split(' - ')
  if (parts.length >= 2) {
    return {
      employeeId: Number.isFinite(employeeId as number) ? employeeId : undefined,
      employeeName: parts[0].trim(),
      type: parts.slice(1).join(' - ').trim(),
    }
  }

  return {
    employeeId: Number.isFinite(employeeId as number) ? employeeId : undefined,
    employeeName: rest || '(제목 없음)',
    type: '',
  }
}

/** ---------- Google Calendar Fetch ---------- */
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
    const parsed = parseSummary(summary)

    // dateTime(시간 있음) or date(종일)
    const startRaw: string | undefined = it?.start?.dateTime || it?.start?.date
    const endRaw: string | undefined = it?.end?.dateTime || it?.end?.date

    const startDate = startRaw ? String(startRaw).slice(0, 10) : ''
    const endDateOnly = endRaw ? String(endRaw).slice(0, 10) : startDate

    // 종일 이벤트면 end.date가 “다음날”로 내려오므로 하루 빼서 inclusive로 보정
    const isAllDay = Boolean(it?.start?.date && it?.end?.date)
    const inclusiveEndDate = isAllDay ? minusOneDay(endDateOnly) : endDateOnly

    // self 판별: employeeId 우선, 없으면 이름 비교
    const isSelfById =
      parsed.employeeId != null && myEmployeeId.value != null
        ? parsed.employeeId === myEmployeeId.value
        : false

    const isSelfByName =
      myEmployeeName.value ? parsed.employeeName === myEmployeeName.value : false

    return {
      id,
      employeeId: parsed.employeeId,
      employeeName: parsed.employeeName,
      type: parsed.type || '(휴가)',
      startDate,
      endDate: inclusiveEndDate,
      isSelf: isSelfById || (!parsed.employeeId && isSelfByName),
    } as DeptVacationEvent
  })
}

/** ---------- Calendar Cells (Weeks) ---------- */

/** 그리드 시작일(해당 월 1일이 포함된 주의 일요일) */
const gridStartDate = computed(() => {
  const first = new Date(currentYear.value, currentMonth.value, 1)
  const offset = first.getDay() // 0=일
  return addDays(first, -offset)
})

/** 월의 마지막 날짜 */
const monthEndDate = computed(() => {
  return new Date(currentYear.value, currentMonth.value + 1, 0)
})

/** 월 그리드(주 단위) */
const calendarWeeks = computed<DayCell[][]>(() => {
  const first = new Date(currentYear.value, currentMonth.value, 1)
  const last = new Date(currentYear.value, currentMonth.value + 1, 0)

  const firstWeekday = first.getDay()
  const totalDays = last.getDate()

  const totalCells = firstWeekday + totalDays
  const padded = Math.ceil(totalCells / 7) * 7
  const weeksCount = padded / 7

  const weeks: DayCell[][] = []

  // gridStart 기준으로 padded 만큼 채움
  const start = gridStartDate.value
  for (let w = 0; w < weeksCount; w += 1) {
    const week: DayCell[] = []
    for (let d = 0; d < 7; d += 1) {
      const cur = addDays(start, w * 7 + d)

      const isInMonth = cur.getMonth() === currentMonth.value
      week.push({
        isEmpty: !isInMonth,
        date: isInMonth ? cur : null,
      })
    }
    weeks.push(week)
  }

  return weeks
})

/** ---------- Week Segments (연속 bar 렌더링 핵심) ---------- */

/** month 범위(clip용) */
const monthStartDate = computed(() => new Date(currentYear.value, currentMonth.value, 1))

/** 이벤트를 "주 단위 segment"로 쪼개고, 겹치면 line을 늘려서 배치 */
const weekSegmentsByWeek = computed(() => {
  const map = new Map<number, WeekSegment[]>()

  const gridStart = gridStartDate.value
  const clipStartMonth = monthStartDate.value
  const clipEndMonth = monthEndDate.value

  // 1) 이벤트를 주 단위 segment로 분할
  for (const ev of googleEvents.value) {
    if (!ev.startDate || !ev.endDate) continue

    const rawStart = parseYmdToDate(ev.startDate)
    const rawEnd = parseYmdToDate(ev.endDate)

    const clippedStart = rawStart < clipStartMonth ? clipStartMonth : rawStart
    const clippedEnd = rawEnd > clipEndMonth ? clipEndMonth : rawEnd
    if (clippedStart > clippedEnd) continue

    let cursor = toLocalMidnight(clippedStart)
    const end = toLocalMidnight(clippedEnd)

    while (cursor <= end) {
      const weekIndex = Math.floor(diffDays(gridStart, cursor) / 7)
      const weekStart = addDays(gridStart, weekIndex * 7)
      const weekEnd = addDays(weekStart, 6)

      const segStart = cursor
      const segEnd = end < weekEnd ? end : weekEnd

      const startCol = segStart.getDay()
      const endCol = segEnd.getDay()

      const seg: WeekSegment = {
        key: `${ev.id}-${weekIndex}-${startCol}-${endCol}`,
        eventId: ev.id,
        employeeName: ev.employeeName,
        type: ev.type,
        isSelf: ev.isSelf,
        weekIndex,
        startCol,
        endCol,
        line: -1,
      }

      const arr = map.get(weekIndex)
      if (arr) arr.push(seg)
      else map.set(weekIndex, [seg])

      cursor = addDays(segEnd, 1)
    }
  }

  // 2) 주별로 겹침(line) 배치
  for (const [weekIndex, segs] of map.entries()) {
    // 정렬: 시작 빠른 것 우선, 같은 시작이면 길이가 긴 것 우선
    segs.sort((a, b) => {
      if (a.startCol !== b.startCol) return a.startCol - b.startCol
      const lenA = a.endCol - a.startCol
      const lenB = b.endCol - b.startCol
      if (lenA !== lenB) return lenB - lenA
      return a.employeeName.localeCompare(b.employeeName)
    })

    const lines: WeekSegment[][] = []

    for (const seg of segs) {
      let placed = false

      for (let li = 0; li < lines.length; li += 1) {
        const lineSegs = lines[li]
        const overlap = lineSegs.some(
          (s) => !(seg.endCol < s.startCol || seg.startCol > s.endCol),
        )
        if (!overlap) {
          seg.line = li
          lineSegs.push(seg)
          placed = true
          break
        }
      }

      if (!placed) {
        seg.line = lines.length
        lines.push([seg])
      }
    }

    // line 안에서도 startCol로 정렬(미세 정리)
    for (const line of lines) {
      line.sort((a, b) => a.startCol - b.startCol)
    }

    // 평탄화
    map.set(weekIndex, lines.flat())
  }

  return map
})

/** 주별 line 개수(높이 계산용) */
const weekLineCount = computed(() => {
  const cnt = new Map<number, number>()
  for (const [weekIndex, segs] of weekSegmentsByWeek.value.entries()) {
    const maxLine = segs.reduce((m, s) => Math.max(m, s.line), -1)
    cnt.set(weekIndex, maxLine + 1)
  }
  return cnt
})

/** 주(week) 높이를 “겹친 줄 수”만큼 늘리기 */
const weekStyle = (weekIndex: number) => {
  const lines = weekLineCount.value.get(weekIndex) ?? 0
  return {
    // CSS 변수로 전달
    '--week-lines': String(lines),
  } as Record<string, string>
}

/** bar 배치 스타일: grid-column span + grid-row(line) */
const barStyle = (seg: WeekSegment) => {
  return {
    gridColumn: `${seg.startCol + 1} / ${seg.endCol + 2}`,
    gridRow: `${seg.line + 1}`,
  } as Record<string, string>
}

/** ---------- Navigation ---------- */
const moveMonth = async (diff: number): Promise<void> => {
  const newDate = new Date(currentYear.value, currentMonth.value + diff, 1)
  currentYear.value = newDate.getFullYear()
  currentMonth.value = newDate.getMonth()

  await fetchGoogleCalendarEvents(currentYear.value, currentMonth.value + 1)
}

onMounted(async () => {
  await fetchGoogleCalendarEvents(currentYear.value, currentMonth.value + 1)
})

const calendarTitle = computed(() => {
  const deptName = authStore.user?.departmentName?.trim()
  return deptName ? `${deptName} 휴가 캘린더` : '부서 휴가 캘린더'
})
</script>

<style scoped>
* {
  font-size: 14px;
  font-family: "Inter-Regular", sans-serif;
}

/* ---------- Layout ---------- */
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

  /* ==== 핵심 변수(원하면 여기만 조절) ==== */
  --cell-padding: 8px;
  --cell-min-height: 85px;
  --date-row-height: 22px;

  --bar-height: 40px;
  --bar-gap: 4px;
}

/* 요일 헤더 */
.calendar-weekdays {
  font-size: 18px;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 8px;
}

.weekday {
  font-size: 18px;
  text-align: center;
  font-family: 'Arimo', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
    sans-serif;
  color: #6a7282;
}

/* 주 단위 */
.calendar-weeks {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.calendar-week {
  position: relative;
}

/* 날짜 셀 그리드 */
.week-grid {
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

  /* (3) 주의 라인 수만큼 셀 자체 높이를 늘려서, bar가 밖으로 안 나가게 함 */
  min-height: calc(
    var(--cell-min-height) +
      (var(--week-lines, 0) * (var(--bar-height) + var(--bar-gap)))
  );
}

.calendar-cell--empty {
  background: #f9fafb;
}

.cell-date {
  color: #101828;
  height: var(--date-row-height);
}

/* 이벤트 bar 레이어 */
.week-bars {
  position: absolute;

  /* 각 셀 padding/top date 영역 아래에 bar가 오게 */
  left: 0;
  right: 0;
  top: calc(var(--cell-padding) + var(--date-row-height) + 4px);

  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  grid-auto-rows: var(--bar-height);
  column-gap: 8px;
  row-gap: var(--bar-gap);

  /* 셀 padding 영역에 맞춰 좌우 살짝 여백 */
  padding: 0 var(--cell-padding);
  box-sizing: border-box;
}

/* 휴가 바 */
.vacation-bar {
  border-radius: 4px;
  /* font-size: 1px; */
  font-family: 'Arimo', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
    sans-serif;
  display: flex;
  align-items: center;
  padding: 3px 8px;
  color: #ffffff;
  box-sizing: border-box;

  /* 긴 텍스트 처리 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vacation-bar--self {
  background: #2b7fff; /* (2) 본인 휴가: 파란색 */
}

.vacation-bar--team {
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
