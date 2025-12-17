<!--
  <pre>
  Vue Name: NotificationEmpty
  Description: 알림 빈 상태 컴포넌트
               - 사용자가 받은 알림이 없을 때 표시
               - 안내 메시지와 아이콘으로 구성된 빈 화면
               - NotificationList에서 알림 개수가 0일 때 렌더링

  History
  2025/12/09 (최혜원) 최초 작성
  </pre>

  @author 최혜원
  @version 1.0
-->
<template>
  <!-- 알림 없음 상태 표시 영역 -->
  <div class="empty-state">
    <!-- 알림 아이콘 -->
    <div class="empty-icon">
      <img src="/images/alarm.svg" alt="No Notifications" />
    </div>
    
    <!-- 안내 제목 -->
    <h3>알림이 없습니다</h3>
    
    <!-- 안내 설명 -->
    <p>새로운 알림이 도착하면 여기에 표시됩니다.</p>
  </div>
</template>

<script lang="ts" setup>
// Props, Emits, Composables가 필요 없는 정적 컴포넌트
</script>

<style scoped>
/* 빈 상태 컨테이너 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

/* 알림 아이콘 배경 */
.empty-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F1F5F9;
  border-radius: 20px;
  font-size: 40px;
  margin-bottom: 24px;
}

/* 안내 제목 스타일 */
.empty-state h3 {
  font-size: 20px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
}

/* 안내 설명 스타일 */
.empty-state p {
  font-size: 15px;
  color: #94A3B8;
}
</style>