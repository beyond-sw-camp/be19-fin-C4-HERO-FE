<!-- 
  <pre>
  Vue Name   : TheHeader.vue
  Description : 공통 헤더 컴포넌트 - 로고, 알림, 세션 타이머, 사용자 프로필 표시

  History
  2025/11/28 - 승건 최초 작성
  2025/12/02 - 동근 헤더 레이아웃 및 스타일링 수정 & js->ts 변환
  2025/12/08 - 승민 헤더 레이아웃 디자인 최종 수정
  2025/12/10 - 혜원 알림 페이지 라우팅 기능 추가
  2025/12/11 - 승건 프로필 드롭다운 및 로그아웃 기능 추가
  2025/12/11 - 동근 로고 클릭 시 대시보드 이동 기능 추가, 로그인 세션 남은 시간 표시 & JSDoc 추가
  2025/12/16 - 동근 logo-area 스타일 수정(border 제거)
  </pre>
 
  @author 동근
  @version 1.6
 -->
<template>
  <div class="header-container">
    <!-- 로고영역 : 클릭 시 대시보드 페이지로 이동 -->
    <div class="logo-area" @click="goDashboard">
      <div class="logo-box">
        <img class="logo" src="/images/logo.png" />
      </div>
    </div>

    <!-- 우측 영역 : 알림, 로그인 세션, 프로필 정보  -->
    <div class="right-area">
      <div class="right-content">
         <!-- 알림 버튼 클릭 이벤트 추가 -->
        <div class="icon-box" @click="goToNotifications">
          <div class="folder-wrap">
            <div class="folder-icon">
              <img class="alarm" src="/images/alarm.svg" />
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <!-- 로그인 세션 타이머 -->
        <div class="session-box">
          <div class="session-title">로그인 세션</div>
          <div class="session-time">
            <div class="clock-icon">
              <img class="clock" src="/images/clock.png"/>
            </div>
            <div class="time-text">{{ formattedTime }}</div>
          </div>
        </div>

        <div class="divider"></div>


        <!-- 사용자 프로필 정보 -->
        <div v-if="user" class="profile-container">
          <div class="profile-box" @click="toggleDropdown">
            <div class="profile-icon">{{ user.employeeName?.charAt(0) }}</div>
            <div class="profile-info">
              <div class="profile-name">{{ user.employeeName }} {{ user.gradeName }}</div>
              <div class="profile-team">{{ user.departmentName }}</div>
            </div>
            <div class="arrow-box">
              <img class="arrow-icon" :class="{ 'rotate': isDropdownOpen }" src="/images/dropdownArrow.png" />
            </div>
          </div>
          <!-- 드롭다운 메뉴 -->
          <div v-if="isDropdownOpen" class="profile-dropdown">
            <div class="dropdown-item" @click="goToMyPage">마이페이지</div>
            <div class="dropdown-item" @click="handleLogout">로그아웃</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
//세션 관리
import { useSessionStore } from '@/stores/session';
//인증 관리
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const session = useSessionStore(); // 로그인 세션 관리하는 Pinia 스토어

//인증 스토어
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const isDropdownOpen = ref(false);


// 메인 로고 버튼 클릭 시 대시보드 이동
const goDashboard = () => {
  router.push('/');
};

// 알림 아이콘 클릭 시 알림 페이지로 이동
const goToNotifications = () => {
  router.push('/notifications')
}

// 남은 세션 시간 포맷팅 (MM:SS)
const formattedTime = computed(() => {
  const minutes = Math.floor(session.remainingSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (session.remainingSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
});

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const goToMyPage = () => {
  // TODO: 마이페이지 라우트가 정의되면 활성화
  // router.push('/my-page');
  console.log('마이페이지로 이동');
  isDropdownOpen.value = false; // 클릭 후 드롭다운 닫기
};

const handleLogout = async () => {
  // 스토어의 logout 액션을 호출하고 완료될 때까지 기다립니다.
  await authStore.logout();

  isDropdownOpen.value = false; // 클릭 후 드롭다운 닫기

  // 상태가 모두 초기화된 후, 로그인 페이지로 이동합니다.
  router.push('/login');
};
</script>

<style scoped>
.header-container {
  align-self: stretch;
  height: 55px;
  background: white;
  border-bottom: 2px #E2E8F0 solid;
  justify-content: space-between;
  align-items: center;
  display: inline-flex;
}

.logo-area {
  width: 230px;
  align-self: stretch;
  padding: 7px 15px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.logo-box {
  flex: 1;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.logo {
  width: 120px;
  padding: 10px;
}

.logo-right {
  width: 146.36px;
  padding: 10px;
}

.right-area {
  width: 440px;
  padding: 0px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

.right-content {
  display: inline-flex;
  align-items: center;
  gap: 15px;
}

.icon-box {
  width: 40.5px;
  padding: 9px;
  border-radius: 11.25px;
  display: inline-flex;
  flex-direction: column;
  align-items: flex-end;
  cursor: pointer; /* 알림 클릭 가능하다는 표시 */
  transition: background-color 0.2s; /* 알림을 위한 부드러운 효과 */
}

.profile-container {
  position: relative; /* 드롭다운 메뉴의 기준점 */
}

/* 알림 호버 효과 추가 */
.icon-box:hover {
  background-color: #F8FAFC;
}


.folder-wrap {
  height: 22.5px;
  overflow: hidden;
  width: 100%;
}

.folder-icon {
  width: 22.5px;
  height: 22.5px;
  position: relative;
}

.folder-line1 {
  width: 3.25px;
  height: 0.94px;
  position: absolute;
  left: 9.63px;
  top: 19.69px;
  outline: 1.88px #45556C solid;
}

.folder-line2 {
  width: 16.87px;
  height: 14.06px;
  position: absolute;
  left: 2.81px;
  top: 1.88px;
  outline: 1.88px #45556C solid;
}

.divider {
  width: 1px;
  height: 36px;
  background: #E2E8F0;
}

.session-box {
  width: 70px; 
  height: 40px;
  padding: 5px 10px;
  background: #F8FAFC;
  border-radius: 11.25px;
  outline: 2px #E2E8F0 solid;
  display: flex; 
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  justify-content: center;
  align-items: center;
}

.session-title {
  color: #62748E;
  font-size: 8px;
  font-weight: 600;
  text-align: right;
  line-height: 12px; 
  margin-bottom: 2px;
}

.session-time {
  display: flex;
  gap: 5px;
  align-items: center;
  justify-content: flex-end; 
}

.clock-icon {
  width: 18px;
  height: 18px;
  position: relative;
}

.clock-hand {
  width: 3px;
  height: 6px;
  position: absolute;
  left: 9px;
  top: 4.5px;
  outline: 1.5px #1A327C solid;
}

.clock {
  width: 17px;
}

.clock-border {
  width: 15px;
  height: 15px;
  position: absolute;
  left: 1.5px;
  top: 1.5px;
  outline: 1.5px #1A327C solid;
}

.time-text {
  font-size: 12px; 
  color: #1A337D;
  font-weight: 700;
}

.profile-box {
  width: 210px;
  height: 50px;
  display: flex;
  gap: 10px;
  align-items: center;
  cursor: pointer;
  padding: 5px;
  border-radius: 12px;
  transition: background-color 0.2s;
}

.profile-icon {
  width: 40.5px;
  height: 40.5px;
  background: linear-gradient(135deg, #1C398E 0%, #162456 100%);
  border-radius: 11.25px;
  color: white;
  font-size: 18px;
  font-weight: 700;
  display: flex;
  justify-content: center;
  align-items: center;
}

.profile-info {
  flex: 1;
  width: 35px;
  height: 35px;
}

.profile-name {
  color: #1C398E;
  font-size: 13px;
  font-weight: 600;
}

.profile-team {
  color: #62748E;
  font-size: 13px;
}

.arrow-box {
  display: flex;
  align-items: center;
}

.arrow-icon {
  width: 20px;
  height: 15px;
}

.arrow-icon.rotate {
  transform: rotate(180deg);
}

.arrow-icon {
  transition: transform 0.3s ease;
}

.profile-dropdown {
  position: absolute;
  top: 100%; /* profile-box 바로 아래에 위치 */
  right: 0;
  margin-top: 8px;
  width: 160px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  z-index: 1000;
  overflow: hidden;
}

.dropdown-item {
  padding: 12px 16px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f1f3f5;
}
</style>