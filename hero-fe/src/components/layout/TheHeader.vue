
<template>
  <header class="header">
    <div class="header__left">
      <RouterLink to="/" class="header__banner-link">
     
      <img
        src="/images/logo-hero.png"
        alt="HERO - Human Employee Resources Operation"
        class="header__logo-banner"
      />

      
      <div class="header__brand">
        <div class="header__brand-main">
          <span class="header__brand-main--primary">HE</span>
          <span class="header__brand-main--accent">RO</span>
        </div>
        <div class="header__brand-sub">
          Human Employee Resources Operation
        </div>
      </div>
      </RouterLink>
    </div>

    <!-- 알림 버튼 (후에 코딩)-->
    <div class="header__right">
      <button class="header__icon-btn" aria-label="알림">
        🔔
      </button>

      <!-- 로그인 세션 -->
    <div class="header__session-box">
      <div class="session-box__label">로그인 세션</div>
        <div class="session-box__value">
          <span class="session-box__clock">🕒</span>
      <span class="session-time">{{ formattedTime }}</span>
      </div>
    </div>

    <!-- 로그인 회원 (후에 코딩) -->
      <div class="header__user">
        <div class="header__user-avatar">K</div>
        <div class="header__user-info">
          <div class="header__user-name">김히어로 대리</div>
          <div class="header__user-role">애플리케이션 개발 3팀</div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useSessionStore } from "@/stores/session";

const session = useSessionStore();

// 남은 세션 시간
const formattedTime = computed(() => {
  const m = Math.floor(session.remainingSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (session.remainingSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
});
</script>

<style scoped>
.header {
  height: 90px;
  padding: 0px;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
  position: sticky;
  top: 0;
  z-index: 20;
}

.header__left {
  display: flex;
  align-items: center;
  gap: 6px;
}


.header__logo-banner {
  width: 44px;          
  margin-left :20px;
  height: 44px;           
  object-fit: contain;
}


.header__brand {
  display: flex;
  flex-direction: column;
  justify-content: center;
  line-height: 1.2;
}

.header__brand-main {
  margin-left:32px;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: 0.01em;
}


.header__brand-main--primary {
  color: #1f2937;         
}


.header__brand-main--accent {
  color: #7ac143;         
}


.header__brand-sub {
  margin-top: 0;
  font-size: 8px;
  color: #6b7280;
}


.header__right {
  padding : 0 28px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.header__icon-btn {
  border: none;
  background: #f3f4ff;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
}

.header__icon-btn:hover {
  background: #e5edff;
}

.header__user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px;
  padding-right:10px;
  border-radius: 999px;
  background-color: #FFFFFF;
}

.header__user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: linear-gradient(135deg, #06336f, #16a34a);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.header__user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.header__user-name {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
}

.header__user-role {
  font-size: 11px;
  color: #6b7280;
}

.header__banner-link {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  text-decoration: none;
}


.header__banner-link:hover {
  opacity: 0.9;
  cursor: pointer;
}

.header__session-box {
  padding: 8px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: #F8FAFC;
  font-size: 12px;
  color: #6b7280;
}

.session-time {
  font-weight: 700;
  color: #1f2937;
}

.session-box__clock{
  margin-right: 6px;
}
</style>