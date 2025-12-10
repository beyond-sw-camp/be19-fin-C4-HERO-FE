<!-- 
 <pre>
 Vue Name: Header
 Description: 공통 헤더 컴포넌트 - 로고, 알림, 세션 타이머, 사용자 프로필 표시
 
 History
 2025/12/08 (동근) 최초 작성 
 2025/12/09 (승민) 헤더 사이즈 조정
 2025/12/10 (혜원) 알림 페이지 라우팅 기능 추가
 </pre>
 
 @author 동근
 @version 1.2 
 -->

<template>
  <div class="header-container">
    <div class="logo-area">
      <div class="logo-box">
        <img class="logo" src="/images/logo.png" />
      </div>
    </div>

    <div class="right-area">
      <div class="right-content">
         <!-- 알림 버튼 클릭 이벤트 추가 -->
        <div class="icon-box" @click="goToNotifications">
          <div class="folder-wrap">
            <div class="folder-icon">
              <img class="alarm" src="/images/alarm.png" />
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <div class="session-box">
          <div class="session-title">로그인 세션</div>
          <div class="session-time">
            <div class="clock-icon">
              <img class="clock" src="/images/clock.png"/>
            </div>
            <div class="time-text">60:00</div>
          </div>
        </div>

        <div class="divider"></div>

        <div class="profile-box">
          <div class="profile-icon">K</div>
          <div class="profile-info">
            <div class="profile-name">김히어로 대리</div>
            <div class="profile-team">애플리케이션 개발3팀</div>
          </div>
          <div class="arrow-box">
            <img class="arrow-icon" src="/images/dropdownArrow.png" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goToNotifications = () => {
  router.push('/notifications')
}
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
  border-right: 2px #E2E8F0 solid;
  display: inline-flex;
  justify-content: center;
  align-items: center;
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
</style>