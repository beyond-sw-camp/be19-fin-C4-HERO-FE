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

      <!-- 상단 탭 (라우터 탭으로 동작) -->
      <div class="panel-tabs">
        <!-- 개인 근태 이력 --> 
        <RouterLink
          :to="{ name: 'AttendancePersonal' }"
          class="tab tab-left"
          :class="{ 'tab-active': isActiveTab('AttendancePersonal') }"
        >
          개인 근태 이력
        </RouterLink>

        <!-- 초과 근무 이력 --> 
        <RouterLink
          :to="{ name: 'AttendanceOvertime' }"
          class="tab"
          :class="{ 'tab-active': isActiveTab('AttendanceOvertime') }"
        >
          초과 근무 이력
        </RouterLink>

        <!-- 근태 기록 수정 이력 --> 
        <RouterLink
          :to="{ name: 'AttendanceCorrection' }"
          class="tab"
          :class="{ 'tab-active': isActiveTab('AttendanceCorrection') }"
        >
          근태 기록 수정 이력
        </RouterLink>

        <!-- 근무제 변경 이력 --> 
        <RouterLink
          :to="{ name: 'AttendanceChangeLog' }"
          class="tab tab-right"
          :class="{ 'tab-active': isActiveTab('AttendanceChangeLog') }"
        >
          근무제 변경 이력
        </RouterLink>
      </div>

      <!-- 검색 영역 -->
      <div class="panel-search">
        <div class="panel-search-inner">
          <input
            class="search-input"
            type="text"
            placeholder="날짜, 상태, 근무제 등으로 검색"
          />
          <button class="btn-search">검색</button>
        </div>
      </div>

      <!-- 테이블 영역 -->
      <div class="panel-table-wrapper">
        <div class="panel-table">
        <table class="attendance-table">
          <thead>
            <tr>
              <th>날짜</th>
              <th>상태</th>
              <th>출근시간</th>
              <th>퇴근시간</th>
              <th>근무시간</th>
              <th>근무제</th>
              <th>결재양식 작성</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(row, index) in store.personalList"
              :key="row.attendanceId"
              :class="{ 'row-striped': index % 2 === 1 }"
            >
              <td>{{ row.workDate }}</td>

              <td>
                <span
                  class="status-pill"
                  :class="{
                    'status-normal': row.state === '정상',
                    'status-late': row.state === '지각'
                  }"
                >
                  {{ row.state }}
                </span>
              </td>

              <td>{{ formatTime(row.startTime)}}</td>
              <td>{{ formatTime(row.endTime) }}</td>

              <td>{{ row.workDuration }}</td>

              <td>{{ row.workSystemName }}</td>

              <td>
                <button class="link-button">
                  근태 정정 / 초과 근무 신청
                </button>
              </td>
            </tr>
          </tbody>
        </table> 
      </div>

        <!-- 페이지네이션 -->
        <div class="pagination">
          <!-- 이전 -->
          <button
            class="page-button"
            :disabled="store.currentPage === 1"
            @click="goPage(store.currentPage - 1)"
          >
            이전
          </button>

          <!-- 숫자 버튼 -->
          <button
            v-for="page in store.totalPages"
            :key="page"
            class="page-button"
            :class="{ 'page-active': page === store.currentPage }"
            @click="goPage(page)"
          >
            {{ page }}
          </button>

          <!-- 다음 -->
          <button
            class="page-button"
            :disabled="store.currentPage === store.totalPages"
            @click="goPage(store.currentPage + 1)"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { RouterLink, useRoute } from "vue-router";
import { onMounted } from "vue";
import { useAttendanceStore } from "@/stores/attendanceStore";

const store = useAttendanceStore()
const route = useRoute();
const isActiveTab = (name: string) => route.name === name;

onMounted(() => {
  store.fetchPersonal(1)
})

function formatTime(time: string) {
  return time ? time.substring(0, 5) : '';
}

function goPage(page: number) {
  if (page < 1 || page > store.totalPages) return
  store.fetchPersonal(page)
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
table {
  width: 100%;
  border-collapse: collapse;
}

thead tr {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
}

th {
  padding: 11px 16px;
  text-align: left;
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
}

td {
  padding: 16px;
  font-size: 14px;
  color: #62748e;
  border-top: 0.67px solid #e2e8f0;
}

tbody tr {
  background: #ffffff;
}

tbody tr.row-striped {
  background: #f8fafc;
}

/* 상태 pill */
.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: auto;
  height: 24px;
  border-radius: 999px;
  font-size: 12px;
  padding: 0 4px;
}

.status-normal {
  background: #ffffff;
  color: #000000;
}

.status-late {
  background: #f8fafc;
  color: #ff0000;
}

/* 링크 스타일 버튼 */
.link-button {
  background: none;
  border: none;
  padding: 0;
  font-size: 14px;
  color: #0069ff;
  cursor: pointer;
  text-align: left;
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

.attendance-table thead tr {
  background: linear-gradient(180deg, #1C398E 0%, #162456 100%);
}

.attendance-table th {
  color: white;
  font-size: 14px;
  font-weight: 700;
  padding: 16px;
  text-align: left;
}

.attendance-table td {
  padding: 16px;
  font-size: 14px;
  color: #62748e;
  border-top: 0.67px solid #e2e8f0;
}

.attendance-table tbody tr.row-striped {
  background: #f8fafc;
}

</style>
