<!-- 
  <pre>
  VUe Name   : Home
  Description : 대시보드 메인 페이지
                - 근태 현황, 최근 활동, 근무 통계 등을 한눈에 확인
                - 출근/퇴근 버튼을 통한 근태 관리
                - 실시간 알림 표시 및 각종 통계 데이터 시각화
 
  History
  2025/12/22 - (혜원) 최초 작성
  2025/12/22 - (혜원) 최근 활동 알림 연동 추가
  </pre>
 
  @author 혜원
  @version 1.0
-->

<template>
  <div class="dashboard-wrapper">
    <!-- 좌측 패널 -->
    <div class="left-panel">
      <!-- 근태현황 카드 -->
      <section class="card main-attendance-card">
        <div class="card-header">
          <div class="header-title-group">
            <h3>근태현황</h3>
            <p class="current-date">{{ currentDateTime }}</p>
          </div>
          <span class="text-link">최근 시간</span>
        </div>

        <!-- 출근/퇴근 버튼 -->
        <div class="punch-group-row">
          <button 
            class="btn-punch in" 
            @click="handlePunchIn"
          >
            <div class="btn-icon-box primary">
              <img 
                src="/images/home-check.svg" 
                alt="출근" 
                class="btn-icon-img" 
              />
            </div>
            <div class="btn-text">
              <span class="guide">오늘도 힘내봅시다</span>
              <strong class="action-label">출근하기</strong>
            </div>
          </button>

          <button 
            class="btn-punch out disabled" 
            disabled
          >
            <div class="btn-icon-box gray">
              <img 
                src="/images/home-out.svg" 
                alt="퇴근" 
                class="btn-icon-img" 
              />
            </div>
            <div class="btn-text">
              <span class="guide">먼저 출근해주세요</span>
              <strong class="action-label">퇴근하기</strong>
            </div>
          </button>
        </div>

        <!-- 휴식시간 정보 -->
        <div class="info-strip">
          <div class="strip-left">
            <i class="pi pi-coffee"></i>
            <span>휴식시간</span>
          </div>
          <span class="strip-value">0시간</span>
        </div>

        <!-- 주간 근무시간 차트 -->
        <div class="chart-section">
          <div class="chart-container">
            <Doughnut 
              :data="chartData" 
              :options="chartOptions" 
            />
            <div class="chart-center-text">
              <span class="hours-val">21.6</span>
              <span class="unit-val">시간</span>
            </div>
          </div>
          <div class="progress-footer">
            <span class="active-text">이번 주 근무</span>
            <span class="muted-text">/ 전체 시간</span>
          </div>
        </div>
      </section>

      <!-- 최근 활동 카드 -->
      <section class="card activity-card-container">
        <div class="activity-header">
          <h3>최근 활동</h3>
          <button 
            class="more-btn" 
            @click="router.push('/notifications')"
          >
            더보기 <i class="pi pi-angle-right"></i>
          </button>
        </div>
        <div class="activity-body-list">
          <div 
            v-if="notificationStore.isLoading" 
            class="loading-msg"
          >
            알림을 불러오는 중...
          </div>
          <template v-else-if="recentNotifications.length > 0">
            <div 
              v-for="item in recentNotifications" 
              :key="item.notificationId" 
              class="activity-row-item" 
              @click="handleNotificationClick(item)"
            >
              <div class="activity-icon-box">
                <img 
                  :src="getNotificationIcon(item.type)" 
                  class="custom-noti-icon" 
                  alt="알림 아이콘"
                />
              </div>
              <div class="activity-text-wrap">
                <p class="activity-msg">{{ item.message }} • {{ item.timeAgo }}</p>
              </div>
            </div>
          </template>
          <div 
            v-else 
            class="empty-msg"
          >
            최근 활동 내역이 없습니다.
          </div>
        </div>
      </section>
    </div>

    <!-- 우측 패널 -->
    <div class="right-panel">
      <!-- 오늘 근무 현황 -->
      <section class="card">
        <h3 class="card-title-blue">오늘 근무 현황</h3>
        <div class="grid-4">
          <div 
            v-for="s in todayStats" 
            :key="s.label" 
            class="status-box" 
            :class="s.class"
          >
            <div class="s-head">
              <i :class="s.icon"></i> {{ s.label }}
            </div>
            <div class="s-body">{{ s.value }}</div>
            <div class="s-foot">{{ s.footer }}</div>
          </div>
        </div>
      </section>

      <!-- 이번 달 요약 -->
      <section class="card">
        <h3 class="card-title-blue">이번 달 요약</h3>
        <div class="grid-3">
          <div 
            v-for="m in monthlySummary" 
            :key="m.label" 
            class="summary-box"
          >
            <div class="summary-icon">
              <img 
                :src="m.image" 
                :alt="m.label" 
                class="summary-icon-img" 
              />
            </div>
            <div class="summary-val">{{ m.value }}</div>
            <div class="summary-lab">{{ m.label }}</div>
            <div class="summary-sub">{{ m.sub }}</div>
          </div>
        </div>
      </section>

      <!-- 출근 통계 & 휴가 현황 -->
      <div class="grid-2">
        <section class="card">
          <h3 class="card-title-blue">출근 통계</h3>
          <div class="stats-table">
            <div class="stats-row">
              <span>이번 달 출근율</span>
              <strong class="t-blue">98.5%</strong>
            </div>
            <div class="stats-row">
              <span>정상 출근</span>
              <strong class="t-green">21일</strong>
            </div>
            <div class="stats-row">
              <span>지각</span>
              <strong class="t-red">0일</strong>
            </div>
            <div class="stats-row">
              <span>결근</span>
              <strong class="t-dark">0일</strong>
            </div>
          </div>
        </section>
        <section class="card">
          <h3 class="card-title-blue">휴가 현황</h3>
          <div class="stats-table">
            <div class="stats-row">
              <span>전체 연차</span>
              <strong class="t-blue">15일</strong>
            </div>
            <div class="stats-row">
              <span>사용 연차</span>
              <strong class="t-orange">7일</strong>
            </div>
            <div class="stats-row">
              <span>잔여 연차</span>
              <strong class="t-green">8일</strong>
            </div>
            <div class="stats-row">
              <span>소멸 예정</span>
              <strong class="t-red">0일</strong>
            </div>
          </div>
        </section>
      </div>

      <!-- 결재 현황 -->
      <section class="card">
        <h3 class="card-title-blue">결재 현황</h3>
        <div class="grid-3">
          <div class="summary-box">
            <div class="summary-val t-brown">5건</div>
            <div class="summary-sub">결재 대기</div>
          </div>
          <div class="summary-box">
            <div class="summary-val t-green">28건</div>
            <div class="summary-sub">결재 완료</div>
          </div>
          <div class="summary-box">
            <div class="summary-val t-red">1건</div>
            <div class="summary-sub">반려됨</div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Import 구문
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useNotificationStore } from '@/stores/notification/notificationStore';
import type { Notification } from '@/types/notification/notification.types';

// Chart.js 등록
ChartJS.register(ArcElement, Tooltip, Legend);

// 2. Composables
const router = useRouter();
const notificationStore = useNotificationStore();

// 3. Reactive 데이터
const currentDateTime = ref('2025년 11월 25일 (화) 14:30:25');

/**
 * 오늘 근무 현황 데이터
 * @type {Array<Object>} 출근, 퇴근, 근무시간, 상태 정보
 */
const todayStats = ref([
  { 
    label: '출근', 
    value: '--:--', 
    footer: '출근전', 
    icon: 'pi pi-sign-in', 
    class: 'border-blue' 
  },
  { 
    label: '퇴근', 
    value: '--:--', 
    footer: '근무중', 
    icon: 'pi pi-sign-out' 
  },
  { 
    label: '근무시간', 
    value: '5:59', 
    footer: '진행중', 
    icon: 'pi pi-clock' 
  },
  { 
    label: '상태', 
    value: '출근전', 
    footer: '', 
    icon: 'pi pi-user', 
    class: 'bg-red' 
  }
]);

/**
 * 이번 달 요약 데이터
 * @type {Array<Object>} 근무 일수, 잔여 연차, 사용 휴가 정보
 */
const monthlySummary = ref([
  { 
    label: '일수', 
    value: '12일', 
    sub: '근무', 
    image: '/images/home-day.svg' 
  },
  { 
    label: '잔여', 
    value: '5일', 
    sub: '연차', 
    image: '/images/home-annualleave.svg' 
  },
  { 
    label: '사용', 
    value: '15일', 
    sub: '휴가', 
    image: '/images/home-leave.svg' 
  }
]);

/**
 * 차트 데이터 설정
 * @type {Object} Doughnut 차트용 데이터
 */
const chartData = ref({
  datasets: [
    {
      data: [21.6, 18.4],
      backgroundColor: ['#1E3A8A', '#E2E8F0'],
      borderWidth: 0,
      cutout: '85%'
    }
  ]
});

/**
 * 차트 옵션 설정
 * @type {Object} Doughnut 차트용 옵션
 */
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false }
  }
});

// 4. Computed 속성
/**
 * 최근 알림 3개 추출
 * @returns {Array<Notification>} 최신 알림 3개
 */
const recentNotifications = computed(() => 
  notificationStore.notifications.slice(0, 3)
);

// 5. 메소드
/**
 * 알림 타입에 따른 아이콘 경로 반환
 * @param {string} type - 알림 타입 (attendance, payroll, approval 등)
 * @returns {string} 아이콘 이미지 경로
 */
const getNotificationIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    'attendance': '/images/alarm/alarm-check.svg',
    'payroll': '/images/alarm/alarm-money.svg',
    'approval': '/images/alarm/alarm-paper.svg',
    'evaluation': '/images/alarm/alarm-paper.svg',
    'system': '/images/alarm/alarmsetting.svg'
  };
  
  return iconMap[type] || '/images/alarm/alarmsetting.svg';
};

/**
 * 알림 클릭 핸들러
 * @param {Notification} notification - 클릭한 알림 객체
 */
const handleNotificationClick = async (notification: Notification): Promise<void> => {
  await notificationStore.markAsRead(notification.notificationId);
  
  if (notification.link) {
    router.push(notification.link);
  }
};

/**
 * 출근 버튼 클릭 핸들러
 */
const handlePunchIn = (): void => {
  alert('출근 완료!');
  // TODO: 실제 출근 API 호출 로직 구현 필요
};

// 6. 생명주기 훅
onMounted(async () => {
  await notificationStore.fetchNotifications();
});
</script>

<style scoped>
/* 전체 레이아웃 */
.dashboard-wrapper {
  display: flex;
  gap: 27px;
  padding: 30px;
  background-color: #f8fafc;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
}

.left-panel {
  width: 680px;
  display: flex;
  flex-direction: column;
  gap: 27px;
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 27px;
}

.card {
  background: #fff;
  border-radius: 11.25px;
  border: 2px solid #E2E8F0;
  padding: 29px;
  box-shadow: 0px 1px 2px -1px rgba(0, 0, 0, 0.10);
}

/* 근태 현황 카드 */
.main-attendance-card {
  min-height: 650px;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
}

.current-date {
  color: #90A1B9;
  font-size: 18px;
  margin-top: 5px;
}

/* 출근/퇴근 버튼 */
.punch-group-row {
  display: flex;
  gap: 18px;
  margin-bottom: 30px;
  width: 100%;
}

.btn-punch {
  flex: 1;
  height: 120px;
  border: none;
  border-radius: 11.25px;
  background: #F8FAFC;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 30px;
  cursor: pointer;
  gap: 20px;
}

.btn-punch.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon-box {
  width: 64px;
  height: 64px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;
}

.btn-icon-box.primary {
  background: #1E3A8A;
}

.btn-icon-box.gray {
  background: #90A1B9;
}

.btn-icon-img {
  width: 32px;
  height: 32px;
  filter: brightness(0) invert(1);
}

.btn-text {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.btn-text .guide {
  font-size: 14px;
  color: #62748E;
  margin-bottom: 4px;
}

.btn-text .action-label {
  font-size: 24px;
  color: #45556C;
  font-weight: 700;
}

/* 휴식시간 정보 */
.info-strip {
  background: #F8FAFC;
  border: 2px solid #E2E8F0;
  border-radius: 11.25px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

/* 차트 */
.chart-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.chart-container {
  width: 220px;
  height: 220px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart-center-text {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hours-val {
  font-size: 36px;
  font-weight: 700;
  color: #1C398E;
}

.progress-footer {
  margin-top: 36px;
}

/* 최근 활동 */
.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.activity-header h3 {
  color: #1C398E;
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.more-btn {
  background: none;
  border: none;
  color: #62748E;
  font-size: 16px;
  cursor: pointer;
}

.activity-row-item {
  height: 72px;
  padding: 18px;
  background: #EFF6FF;
  border-radius: 11.25px;
  outline: 2px #DBEAFE solid;
  outline-offset: -2px;
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 13.5px;
  cursor: pointer;
}

.activity-icon-box {
  width: 40.5px;
  height: 40.5px;
  background: #1E3A8A;
  border-radius: 11.25px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-noti-icon {
  width: 20px;
  height: 20px;
  filter: brightness(0) invert(1);
}

/* 우측 패널 */
.card-title-blue {
  color: #1C398E;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 20px;
}

.grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 27px;
}

/* 오늘 근무 현황 */
.status-box {
  background: #F8FAFC;
  border: 2px solid #E2E8F0;
  border-radius: 11.25px;
  padding: 15px;
}

.status-box.border-blue {
  border-color: #DBEAFE;
}

.status-box.bg-red {
  background: #FDF0F0;
  border-color: #FCDCDC;
}

.s-body {
  font-size: 24px;
  font-weight: 700;
  margin: 5px 0;
}

/* 이번 달 요약 */
.summary-box {
  background: #F8FAFC;
  border: 2px solid #E2E8F0;
  border-radius: 11.25px;
  padding: 25px;
  text-align: center;
}

.summary-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.summary-icon-img {
  width: 70%;
  height: 70%;
}

.summary-val {
  font-size: 26px;
  font-weight: 700;
  color: #1C398E;
  margin-bottom: 5px;
}

/* 통계 테이블 */
.stats-table .stats-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f1f5f9;
}

/* 색상 유틸리티 */
.t-blue { color: #1C398E; }
.t-green { color: #0D542B; }
.t-red { color: #82181A; }
.t-orange { color: #7E2A0C; }
.t-brown { color: #733E0A; }
.t-dark { color: #0F172B; }
</style>
