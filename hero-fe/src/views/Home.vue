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
  2025/12/26 - (혜원) 대시보드 API 연동
  2026/01/06 - (혜원) 디자인 수정 & 퇴근 확인 모달 추가
  2026/01/07 - (혜원) 휴게시간 데이터 연동 & 출근 전 기본 템플릿 조회
  </pre>
 
  @author 혜원
  @version 1.6
-->
<template>
  <div class="dashboard-wrapper">
    <!-- 좌측 패널 -->
    <div class="left-panel">
      <!-- 출퇴근 타각 -->
      <TimeClock
        :current-date-time="currentDateTime"
        :today-attendance="todayAttendance"
        :weekly-work-hours="weeklyWorkHours"
        :break-time-minutes="breakTimeMinutes"
        @punch-in="handlePunchIn"
        @punch-out="handlePunchOut"
      />

      <!-- 최근 활동 -->
      <RecentActivity
        :notifications="recentNotifications"
        :is-loading="notificationStore.isLoading"
        @view-all="router.push('/notifications')"
        @click-notification="handleNotificationClick"
      />
    </div>

    <!-- 우측 패널 -->
    <div class="right-panel">
      <!-- 오늘 근무 현황 -->
      <TodayStats :stats="todayStats" />

      <!-- 이번 달 요약 -->
      <MonthlySummary :summary="monthlySummary" />

      <!-- 출근 통계 & 휴가 현황 -->
      <div class="grid-2">
        <StatsCard
          title="출근 통계"
          type="table"
          :items="attendanceStatsItems"
        />
        <StatsCard
          title="휴가 현황"
          type="table"
          :items="vacationStatsItems"
        />
      </div>

      <!-- 결재 현황 -->
      <StatsCard
        title="결재 현황"
        type="grid"
        :items="approvalStatsItems"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useNotificationStore } from '@/stores/notification/notification.store';
import type { Notification } from '@/types/notification/notification.types';
import dashboardApi from '@/api/dashboard/dashboard.api';
import type { 
  ClockStatusDTO,
  WorkSystemTemplateDTO
} from '@/types/dashboard/dashboard.types';
import { fetchMyProfile, generateMySeal } from '@/api/personnel/personnel';

// 컴포넌트 임포트
import TimeClock from '@/components/dashboard/TimeClock.vue';
import RecentActivity from '@/components/dashboard/RecentActivity.vue';
import TodayStats from '@/components/dashboard/TodayStats.vue';
import MonthlySummary from '@/components/dashboard/MonthlySummary.vue';
import StatsCard from '@/components/dashboard/StatsCard.vue';

const router = useRouter();
const notificationStore = useNotificationStore();

// 상태
const currentDateTime = ref('');
const isLoading = ref(false);
const todayAttendance = ref<ClockStatusDTO | null>(null);
const currentWorkDuration = ref(0);
const weeklyWorkHours = ref(0);
const workSystemTemplate = ref<WorkSystemTemplateDTO | null>(null);
let timeInterval: ReturnType<typeof setInterval> | null = null;
let workDurationInterval: ReturnType<typeof setInterval> | null = null;

// 휴게시간 계산 (분 → 시간 변환)
const breakTimeMinutes = computed(() => {
  if (workSystemTemplate.value?.breakMinMinutes) {
    return workSystemTemplate.value.breakMinMinutes / 60;
  }
  return 1; // 기본값 1시간
});

// 오늘 근무 현황
const todayStats = computed(() => [
  { 
    label: '출근', 
    value: todayAttendance.value?.startTime || '--:--', 
    footer: todayAttendance.value?.startTime ? '출근 완료' : '출근전', 
    icon: 'pi pi-sign-in', 
    class: todayAttendance.value?.startTime ? '' : 'border-blue' 
  },
  { 
    label: '퇴근', 
    value: todayAttendance.value?.endTime || '--:--', 
    footer: todayAttendance.value?.endTime ? '퇴근 완료' : (todayAttendance.value?.startTime ? '근무중' : '출근전'),
    icon: 'pi pi-sign-out' 
  },
  { 
    label: '근무시간',
    get value() {
      if (todayAttendance.value?.endTime && todayAttendance.value?.workDuration) {
        const duration = todayAttendance.value.workDuration;
        return `${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, '0')}`;
      }
      if (todayAttendance.value?.startTime && !todayAttendance.value?.endTime) {
        if (currentWorkDuration.value > 0) {
          return `${Math.floor(currentWorkDuration.value / 60)}:${String(currentWorkDuration.value % 60).padStart(2, '0')}`;
        }
        return '0:00';
      }
      return '--:--';
    },
    footer: todayAttendance.value?.endTime ? '완료' : (todayAttendance.value?.startTime ? '진행중' : '출근전'), 
    icon: 'pi pi-clock' 
  },
  { 
    label: '상태', 
    value: todayAttendance.value?.state || '출근전', 
    footer: '', 
    icon: 'pi pi-user', 
    class: !todayAttendance.value?.startTime ? 'bg-red' : '' 
  }
]);

// 이번 달 요약
const monthlySummary = ref([
  { label: '일수', value: '0일', sub: '근무', image: '/images/home-day.svg' },
  { label: '잔여', value: '0일', sub: '연차', image: '/images/home-annualleave.svg' },
  { label: '사용', value: '0일', sub: '휴가', image: '/images/home-leave.svg' }
]);

// 출근 통계
const attendanceStatsItems = ref([
  { label: '이번 달 출근율', value: '98.5%', colorClass: 't-blue' },
  { label: '정상 출근', value: '21일', colorClass: 't-green' },
  { label: '지각', value: '0일', colorClass: 't-red' },
  { label: '결근', value: '0일', colorClass: 't-dark' }
]);

// 휴가 현황
const vacationStatsItems = ref([
  { label: '전체 연차', value: '15일', colorClass: 't-blue' },
  { label: '사용 연차', value: '7일', colorClass: 't-orange' },
  { label: '잔여 연차', value: '8일', colorClass: 't-green' },
  { label: '소멸 예정', value: '0일', colorClass: 't-red' }
]);

// 결재 현황
const approvalStatsItems = ref([
  { label: '결재 대기', value: '5건', colorClass: 't-brown' },
  { label: '결재 완료', value: '28건', colorClass: 't-green' },
  { label: '반려됨', value: '1건', colorClass: 't-red' }
]);

// 최근 알림
const recentNotifications = computed(() => 
  notificationStore.notifications.slice(0, 3)
);

// 메소드
const updateCurrentDateTime = (): void => {
  const now = new Date();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');
  const day = days[now.getDay()];
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  currentDateTime.value = `${year}년 ${month}월 ${date}일 (${day}) ${hours}:${minutes}:${seconds}`;
};

const updateWorkDuration = (): void => {
  if (todayAttendance.value?.startTime && !todayAttendance.value?.endTime) {
    const now = new Date();
    
    const [hours, minutes, seconds] = todayAttendance.value.startTime.split(':').map(Number);
    const startDateTime = new Date();
    startDateTime.setHours(hours, minutes, seconds, 0);

    let diffMs = now.getTime() - startDateTime.getTime();
    
    currentWorkDuration.value = diffMs > 0 ? Math.floor(diffMs / 60000) : 0;
  } else {
    currentWorkDuration.value = 0;
  }
};

const startWorkDurationTimer = (): void => {
  if (workDurationInterval) {
    clearInterval(workDurationInterval);
  }
  
  if (todayAttendance.value?.startTime && !todayAttendance.value?.endTime) {
    updateWorkDuration();
    workDurationInterval = setInterval(updateWorkDuration, 1000);
  }
};

const stopWorkDurationTimer = (): void => {
  if (workDurationInterval) {
    clearInterval(workDurationInterval);
    workDurationInterval = null;
  }
};
const fetchWorkSystemTemplate = async (templateId: number): Promise<void> => {
  try {
    const response = await dashboardApi.getWorkSystemTemplate(templateId);
    workSystemTemplate.value = (response as any).data.data;  // ✅ 타입 단언
    
    console.log('✅ 근무제 템플릿 조회 성공:', {
      templateId,
      breakMinMinutes: workSystemTemplate.value?.breakMinMinutes,
      breakTimeHours: breakTimeMinutes.value
    });
  } catch (error) {
    console.error('❌ 근무제 템플릿 조회 실패:', error);
    workSystemTemplate.value = null;
  }
};

const fetchMyDefaultTemplate = async (): Promise<void> => {
  try {
    const response = await dashboardApi.getMyDefaultTemplate();
    workSystemTemplate.value = (response as any).data.data;  // ✅ 타입 단언
    
    console.log('✅ 기본 템플릿 조회 성공 (출근 전):', {
      breakMinMinutes: workSystemTemplate.value?.breakMinMinutes,
      breakTimeHours: breakTimeMinutes.value
    });
  } catch (error) {
    console.error('❌ 기본 템플릿 조회 실패:', error);
    workSystemTemplate.value = {
      workSystemTemplateId: 1,
      startTime: '09:00:00',
      endTime: '18:00:00',
      breakMinMinutes: 60,
      reason: '기본 근무제',
      workSystemTypeId: 1
    };
  }
};

const fetchTodayAttendance = async (): Promise<void> => {
  try {
    const response = await dashboardApi.getTodayStatus();
    todayAttendance.value = response.data || null;
    
    // ✅ 출근한 경우: 출근 시 저장된 템플릿 조회
    if (todayAttendance.value?.workSystemTemplateId) {
      console.log('📌 출근 완료 - 템플릿 ID:', todayAttendance.value.workSystemTemplateId);
      await fetchWorkSystemTemplate(todayAttendance.value.workSystemTemplateId);
    } 
    // ✅ 출근 전인 경우: 기본 템플릿 조회
    else {
      console.log('📌 출근 전 - 기본 템플릿 조회');
      await fetchMyDefaultTemplate();
    }
  } catch (error) {
    console.error('❌ 오늘 근태 정보 조회 실패:', error);
    todayAttendance.value = null;
    // 출근 정보 조회 실패 시에도 기본 템플릿 조회
    await fetchMyDefaultTemplate();
  }
};

const fetchWeeklyAttendance = async (): Promise<void> => {
  try {
    const response = await dashboardApi.getWeeklyStats();
    const stats = response.data;
    
    if (stats) {
      weeklyWorkHours.value = stats.totalWorkHours || 0;
      
      console.log('주간 통계 조회 성공:', {
        totalWorkHours: stats.totalWorkHours,
        totalWorkMinutes: stats.totalWorkMinutes,
        achievementRate: stats.achievementRate,
        isWorkingToday: stats.isWorkingToday
      });
    }
  } catch (error) {
    console.error('주간 근태 정보 조회 실패:', error);
    weeklyWorkHours.value = 0;
  }
};

// 이번 달 요약 조회
const fetchMonthlyStats = async (): Promise<void> => {
  try {
    const response = await dashboardApi.getMonthlySummary();
    const data = response.data;
    
    if (data) {
      monthlySummary.value = [
        { label: '근무', value: `${data.workDays}일`, sub: '일수', image: '/images/home-day.svg' },
        { label: '잔여', value: `${data.remainingAnnualLeave}일`, sub: '연차', image: '/images/home-annualleave.svg' },
        { label: '사용', value: `${data.usedVacationDays}일`, sub: '휴가', image: '/images/home-leave.svg' }
      ];
    }
  } catch (error) {
    console.error('월간 요약 조회 실패:', error);
  }
};

// 출근 통계 조회
const fetchAttendanceStats = async (): Promise<void> => {
  try {
    const response = await dashboardApi.getAttendanceStats();
    const data = response.data;
    
    if (data) {
      const total = data.normalDays + data.lateDays + data.absentDays + data.earlyLeaveDays;
      const rate = total > 0 ? ((data.normalDays / total) * 100).toFixed(1) : '0.0';
      
      attendanceStatsItems.value = [
        { label: '이번 달 출근율', value: `${rate}%`, colorClass: 't-blue' },
        { label: '정상 출근', value: `${data.normalDays}일`, colorClass: 't-green' },
        { label: '지각', value: `${data.lateDays}일`, colorClass: 't-red' },
        { label: '결근', value: `${data.absentDays}일`, colorClass: 't-dark' }
      ];
    }
  } catch (error) {
    console.error('출근 통계 조회 실패:', error);
  }
};

// 휴가 현황 조회
const fetchVacationStats = async (): Promise<void> => {
  try {
    const response = await dashboardApi.getVacationStats();
    const data = response.data;
    
    if (data) {
      const total = data.annualLeaveDays + data.halfDayDays + data.sickLeaveDays + data.otherLeaveDays;
      
      vacationStatsItems.value = [
        { label: '연차', value: `${data.annualLeaveDays}일`, colorClass: 't-blue' },
        { label: '반차', value: `${data.halfDayDays}일`, colorClass: 't-orange' },
        { label: '병가', value: `${data.sickLeaveDays}일`, colorClass: 't-green' },
        { label: '기타', value: `${data.otherLeaveDays}일`, colorClass: 't-red' }
      ];
    }
  } catch (error) {
    console.error('휴가 현황 조회 실패:', error);
  }
};

// 결재 현황 조회
const fetchApprovalStats = async (): Promise<void> => {
  try {
    const response = await dashboardApi.getApprovalStats();
    const data = response.data;
    
    if (data) {
      approvalStatsItems.value = [
        { label: '결재 대기', value: `${data.pendingCount}건`, colorClass: 't-blue' },
        { label: '결재 완료', value: `${data.approvedCount}건`, colorClass: 't-green' },
        { label: '결재 반려', value: `${data.rejectedCount}건`, colorClass: 't-red' }
      ];
    }
  } catch (error) {
    console.error('결재 현황 조회 실패:', error);
  }
};

/**
 * 직인 체크 및 자동 생성
 */
const checkAndGenerateSeal = async (): Promise<void> => {
  try {
    const response = await fetchMyProfile();
    const profile = response.data.data;
    
    if (!profile?.sealImageUrl) {
      console.log('직인이 없습니다. 자동 생성을 시작합니다...');
      await generateMySeal();
      console.log('직인 자동 생성 완료');
    } else {
      console.log('직인이 이미 존재합니다');
    }
  } catch (error) {
    console.warn('직인 생성 중 오류 발생 (무시):', error);
  }
};

const handleNotificationClick = async (notification: Notification): Promise<void> => {
  await notificationStore.markAsRead(notification.notificationId);
  if (notification.link) {
    router.push(notification.link);
  }
};

const handlePunchIn = async (): Promise<void> => {
  try {
    isLoading.value = true;
    await dashboardApi.clockIn();
    alert('출근 완료!');
    
    // ✅ 출퇴근 상태 먼저 갱신 (템플릿 정보도 함께 조회됨)
    await fetchTodayAttendance();
    
    // 타이머 시작
    startWorkDurationTimer();
    
    // 주간/월간 통계 갱신
    await Promise.all([
      fetchWeeklyAttendance(),
      fetchMonthlyStats(),
      fetchAttendanceStats(),
      fetchVacationStats()
    ]);
  } catch (error: any) {
    console.error('출근 처리 실패:', error);
    const errorMessage = error.response?.data?.message || '출근 처리에 실패했습니다.';
    alert(errorMessage);
  } finally {
    isLoading.value = false;
  }
};

const handlePunchOut = async (): Promise<void> => {
  // 현재 시간이 오후 1시 이후인지 확인
  const now = new Date();
  const currentHour = now.getHours();
  const isAfter1PM = currentHour >= 13;

  // 시간대에 따른 경고 메시지
  let confirmMessage: string;
  if (isAfter1PM) {
    confirmMessage = '퇴근 처리하시겠습니까?';
  } else {
    confirmMessage = '퇴근시간이 아닙니다.\n퇴근 처리하시겠습니까?';
  }
  
  // 퇴근 확인
  const confirmed = confirm(confirmMessage);
  if (!confirmed) {
    return;
  }

  try {
    isLoading.value = true;
    
    // API 호출 시 휴게시간 포함 여부 전달
    await dashboardApi.clockOut(isAfter1PM);
    
    alert('퇴근 완료! 오늘도 수고하셨습니다.');
    
    // 타이머 정지
    stopWorkDurationTimer();
    
    // 출퇴근 상태 먼저 갱신
    await fetchTodayAttendance();
    
    // 주간/월간 통계 갱신
    await Promise.all([
      fetchWeeklyAttendance(),
      fetchMonthlyStats(),
      fetchAttendanceStats(),
      fetchVacationStats()
    ]);
  } catch (error: any) {
    console.error('퇴근 처리 실패:', error);
    const errorMessage = error.response?.data?.message || '퇴근 처리에 실패했습니다.';
    alert(errorMessage);
  } finally {
    isLoading.value = false;
  }
};

const loadDashboardData = async (): Promise<void> => {
  isLoading.value = true;
  try {
    // 직인 체크 및 자동 생성
    checkAndGenerateSeal();
    
    await Promise.all([
      notificationStore.fetchNotifications(),
      fetchTodayAttendance(), // ✅ 출근 전/후 모두 템플릿 조회
      fetchWeeklyAttendance(),
      fetchMonthlyStats(),
      fetchAttendanceStats(),
      fetchVacationStats(),
      fetchApprovalStats()
    ]);
    
    if (todayAttendance.value?.startTime && !todayAttendance.value?.endTime) {
      startWorkDurationTimer();
    }
  } catch (error) {
    console.error('대시보드 데이터 로드 실패:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  updateCurrentDateTime();
  timeInterval = setInterval(updateCurrentDateTime, 1000);
  await loadDashboardData();
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
  if (workDurationInterval) {
    clearInterval(workDurationInterval);
  }
});
</script>

<style scoped>
.dashboard-wrapper {
  display: flex;
  gap: 27px;
  padding: 30px;
  background-color: #f8fafc;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
}

.left-panel {
  width: 600px;
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

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 27px;
}

/* 모든 카드 제목 통일 */
:deep(.time-clock-card h3),
:deep(.card-title),
:deep(h3) {
  font-size: 20px !important;
  font-weight: 600 !important;
  color: #1e293b !important;
  letter-spacing: -0.02em;
}
</style>