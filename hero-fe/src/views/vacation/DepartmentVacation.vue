<!-- 
  <pre>
  (File => TypeScript / Vue) Name   : DeptVacationCalendar.vue
  Description : 부서 휴가 캘린더 페이지
                - 월 단위 캘린더에 부서원들의 휴가 일정을 시각화
                - 본인 휴가 / 팀원 휴가 색상 구분
                - 월 이동(이전/다음) 기능 지원

  History
  2025/12/16 - 이지윤 최초 작성
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
import { computed, ref } from 'vue';

/**
 * 부서 휴가 이벤트 한 건에 대한 타입
 * - employeeName : 직원명
 * - type         : 휴가 유형 (연차 / 반차 / 병가 등)
 * - startDate    : 시작일 (YYYY-MM-DD)
 * - endDate      : 종료일 (YYYY-MM-DD)
 * - isSelf       : 본인 여부 (색상 구분용)
 */
interface DeptVacationEvent {
  id: number;
  employeeName: string;
  type: string;
  startDate: string;
  endDate: string;
  isSelf: boolean;
}

/**
 * 캘린더 한 칸(셀)에 대한 타입
 * - isEmpty : 월 범위 바깥의 빈 셀 여부
 * - date    : 해당 셀의 실제 날짜 (빈 셀인 경우 null)
 * - events  : 해당 날짜에 포함된 휴가 이벤트 목록
 */
interface CalendarCell {
  isEmpty: boolean;
  date: Date | null;
  events: DeptVacationEvent[];
}

/**
 * 부서 휴가 이벤트 더미 데이터
 * - 나중에 백엔드 연동 시 API 응답으로 대체 예정
 */
const events = ref<DeptVacationEvent[]>([
  {
    id: 1,
    employeeName: '김철수',
    type: '연차',
    startDate: '2025-12-05',
    endDate: '2025-12-05',
    isSelf: false,
  },
  {
    id: 2,
    employeeName: '이영희',
    type: '반차',
    startDate: '2025-12-12',
    endDate: '2025-12-12',
    isSelf: false,
  },
  {
    id: 3,
    employeeName: '홍길동',
    type: '연차',
    startDate: '2025-12-10',
    endDate: '2025-12-12',
    isSelf: false,
  },
  {
    id: 4,
    employeeName: '박민수',
    type: '연차',
    startDate: '2025-12-20',
    endDate: '2025-12-20',
    isSelf: false,
  },
  {
    id: 5,
    employeeName: '본인',
    type: '연차',
    startDate: '2025-12-25',
    endDate: '2025-12-25',
    isSelf: true,
  },
]);

/**
 * 현재 표시 중인 연/월
 * - 디자인에 맞춰 2025년 12월로 초기화
 */
const currentYear = ref<number>(2025);
const currentMonth = ref<number>(11); // 0: 1월, 11: 12월

/** 요일 라벨 (일 ~ 토) */
const weekdayLabels: string[] = ['일', '월', '화', '수', '목', '금', '토'];

/**
 * 특정 날짜에 포함되는 휴가 이벤트 목록을 반환합니다.
 *
 * @param {Date} date - 기준 날짜
 * @returns {DeptVacationEvent[]} 해당 날짜에 시작일~종료일 범위가 포함된 이벤트 배열
 ****************************************
 * @param → 함수의 인자(Parameter)
 ****************************************
 */
const getEventsForDate = (date: Date): DeptVacationEvent[] => {
  const toDateString = (d: Date): string => d.toISOString().slice(0, 10);

  return events.value.filter((ev) => {
    const start = new Date(ev.startDate);
    const end = new Date(ev.endDate);

    const target = toDateString(date);
    const startStr = toDateString(start);
    const endStr = toDateString(end);

    // 날짜 범위 포함 여부
    return target >= startStr && target <= endStr;
  });
};

/**
 * 캘린더 셀 데이터
 * - 앞/뒤 빈 칸을 포함하여 7의 배수 길이로 구성
 *
 * @returns {CalendarCell[]} 캘린더 셀 배열
 */
const calendarCells = computed<CalendarCell[]>(() => {
  const first = new Date(currentYear.value, currentMonth.value, 1);
  const last = new Date(currentYear.value, currentMonth.value + 1, 0);

  const firstWeekday = first.getDay(); // 0: 일요일
  const totalDays = last.getDate();

  const cells: CalendarCell[] = [];

  // 앞쪽 빈 칸
  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push({
      isEmpty: true,
      date: null,
      events: [],
    });
  }

  // 실제 날짜 셀
  for (let day = 1; day <= totalDays; day += 1) {
    const date = new Date(currentYear.value, currentMonth.value, day);

    cells.push({
      isEmpty: false,
      date,
      events: getEventsForDate(date),
    });
  }

  // 뒤쪽 빈 칸 (행 맞추기)
  while (cells.length % 7 !== 0) {
    cells.push({
      isEmpty: true,
      date: null,
      events: [],
    });
  }

  return cells;
});

/**
 * 월 이동 (이전/다음)
 * - diff: -1 이면 이전 달, 1 이면 다음 달
 *
 * @param {number} diff - 이동할 개월 수 (보통 -1 또는 1)
 */
const moveMonth = (diff: number): void => {
  const year = currentYear.value;
  const month = currentMonth.value + diff;

  const newDate = new Date(year, month, 1);

  currentYear.value = newDate.getFullYear();
  currentMonth.value = newDate.getMonth();
};
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
