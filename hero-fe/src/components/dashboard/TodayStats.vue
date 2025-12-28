<!-- 
  <pre>
  Component Name : TodayStats
  Description : 오늘 근무 현황 컴포넌트
                - 출근, 퇴근, 근무시간, 상태 4가지 정보 표시
                - 실시간 근무시간 업데이트 지원
 
  History
  2025/12/26 (혜원) 최초 작성
  </pre>
 
  @author 혜원
  @version 1.0
-->
<template>
  <section class="card">
    <h3 class="card-title-blue">오늘 근무 현황</h3>
    <!-- 4개 그리드로 통계 표시 -->
    <div class="grid-4">
      <div 
        v-for="s in stats" 
        :key="s.label" 
        class="status-box" 
        :class="s.class"
      >
        <!-- 헤더: 아이콘 + 라벨 -->
        <div class="s-head">
          <i :class="s.icon"></i> {{ s.label }}
        </div>
        <!-- 본문: 값 (출근 시각, 퇴근 시각, 근무시간, 상태) -->
        <div class="s-body">{{ s.value }}</div>
        <!-- 푸터: 상태 메시지 (출근전, 근무중, 완료 등) -->
        <div class="s-foot">{{ s.footer }}</div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * 통계 아이템 인터페이스
 */
interface Stat {
  label: string;   // 라벨 (출근, 퇴근, 근무시간, 상태)
  value: string;   // 값 (09:00, 18:00, 8:30, 정상)
  footer: string;  // 푸터 메시지 (출근전, 근무중, 완료)
  icon: string;    // PrimeVue 아이콘 클래스
  class?: string;  // 추가 스타일 클래스
}

interface Props {
  stats: Stat[];  // 4개 통계 배열 (출근, 퇴근, 근무시간, 상태)
}

defineProps<Props>();
</script>

<style scoped>
.card {
  background: #fff;
  border-radius: 11.25px;
  border: 2px solid #E2E8F0;
  padding: 29px;
  box-shadow: 0px 1px 2px -1px rgba(0, 0, 0, 0.10);
}

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
</style>