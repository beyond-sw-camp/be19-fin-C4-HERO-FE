<!-- 
  <pre>
  Vue Name   : TheSidebar.vue
  Description : 좌측 공통 사이드바 네비게이션 컴포넌트
 
  History
  2025/11/28 - 승건 최초 작성
  2025/12/02 - 동근 Sidebar 레이아웃 및 스타일링 수정 & js->ts 변환
  2025/12/08 - 승민 Sidebar 레이아웃 디자인 최종 수정
  2025/12/10 - 민철 결재 도메인 라우터 추가
  2025/12/11 - 동근 급여 부분 추가 & JSDoc 추가
  </pre>
 
  @author 승건
  @version 1.4
 -->
<template>
  <div :class="['sidebar-container', { collapsed: isCollapsed }]">
    <div class="sidebar-wrapper">
      <div class="menu-list-top">

        <!-- 대시보드 -->
        <div class="menu-item"
             :class="{ 'active-parent': activeParent === 'dashboard' }"
             @click="handleParentClick('dashboard')">
          <div class="menu-content">
            <div class="icon-wrapper">
              <img class="dashboard-icon sidebar-icon" :src="getMenuIcon('dashboard')" />
            </div>
            <div class="menu-text">대시보드</div>
          </div>
        </div>

        <!-- 근태관리  -->
        <div
             class="menu-item has-dropdown"
             :class="{
                'active-parent':
                  activeParent === 'attendance' || $route.path.startsWith('/attendance')
             }"
             @click="handleParentClick('attendance')"
        >
          <div class="menu-content">
            <div class="icon-wrapper">
              <img
                class="attendance-icon sidebar-icon"
                :src="getMenuIcon('attendance')"
              />
            </div>
            <div class="menu-text">근태관리</div>
          </div>
          <div class="dropdown-arrow" :class="{rotate:isAttendanceOpen}">
            <img src="/images/dropdownArrow.png" />
          </div>
        </div>

        <!-- 근태관리 하위 메뉴 -->
        <div v-if="isAttendanceOpen && !isCollapsed" class="sub-menu-list">
          <div
            class="sub-menu-item"
            :class="{ active: activeSubMenu === 'attendanceRecord' }"
            @click="handleSubMenuClick('attendanceRecord')"
          >
            <div class="sub-menu-text">근태 기록</div>
          </div>
          <div
            class="sub-menu-item"
            :class="{ active: activeSubMenu === 'attendanceDept' }"
            @click="handleSubMenuClick('attendanceDept')"
          >
            <div class="sub-menu-text">부서 근태 현황</div>
          </div>
        </div>

        <!-- 휴가/연차 -->
        <div class="menu-item has-dropdown"
             :class="{ 'active-parent': activeParent === 'vacation' }"
             @click="handleParentClick('vacation')">
          <div class="menu-content">
            <div class="icon-wrapper">
              <img class="vacation-icon sidebar-icon" :src="getMenuIcon('vacation')" />
            </div>
            <div class="menu-text">휴가/연차</div>
          </div>
          <div class="dropdown-arrow" :class="{ rotate: isVacationOpen }">
            <img class="vacation-dropdown-arrow" src="/images/dropdownArrow.png" />
          </div>
        </div>

        <!-- 휴가/연차 하위 메뉴 -->
        <div v-if="isVacationOpen && !isCollapsed" class="sub-menu-list">
          <div class="sub-menu-item" :class="{ active: activeSubMenu === 'vacationHistory' }"
              @click="handleSubMenuClick('vacationHistory')">
            <div class="sub-menu-text">휴가 이력</div>
          </div>
          <div class="sub-menu-item" :class="{ active: activeSubMenu === 'vacationDept' }"
              @click="handleSubMenuClick('vacationDept')">
            <div class="sub-menu-text">부서 휴가 현황</div>
          </div>
        </div>

        <!-- 전자결재 -->
        <div class="menu-item has-dropdown"
             :class="{ 'active-parent': activeParent === 'approval' }"
             @click="handleParentClick('approval')">
          <div class="menu-content">
            <div class="icon-wrapper">
              <img class="approval-icon sidebar-icon" :src="getMenuIcon('approval')" />
            </div>
            <div class="menu-text">전자결재</div>
          </div>
          <div class="dropdown-arrow" :class="{ rotate: isApprovalOpen }">
            <img src="/images/dropdownArrow.png" />
          </div>
        </div>

        <div v-if="isApprovalOpen && !isCollapsed" class="sub-menu-list">
          <div class="sub-menu-item" :class="{ active: activeSubMenu === 'document-templates' }"
               @click="handleSubMenuClick('document-templates')">
            <div class="sub-menu-text">결재문서서식</div>
          </div>
          <div class="sub-menu-item" :class="{ active: activeSubMenu === 'inbox' }"
               @click="handleSubMenuClick('inbox')">
            <div class="sub-menu-text">결재문서함</div>
          </div>
        </div>

        <!-- 성과평가 -->
        <div class="menu-item has-dropdown"
             :class="{ 'active-parent': activeParent === 'evaluation' }"
             @click="handleParentClick('evaluation')">
          <div class="menu-content">
            <div class="icon-wrapper">
              <img class="evaluation-icon sidebar-icon" :src="getMenuIcon('evaluation')" />
            </div>
            <div class="menu-text">성과평가</div>
          </div>
          <div class="dropdown-arrow" :class="{ rotate: isEvaluationOpen }">
            <img src="/images/dropdownArrow.png" />
          </div>
        </div>
        <div v-if="isEvaluationOpen && !isCollapsed" class="sub-menu-list">
          <div class="sub-menu-item" :class="{ active: activeSubMenu === 'template' }"
               @click="handleSubMenuClick('template')">
            <div class="sub-menu-text">평가템플릿</div>
          </div>
          <div class="sub-menu-item" :class="{ active: activeSubMenu === 'list' }"
               @click="handleSubMenuClick('list')">
            <div class="sub-menu-text">평가 목록</div>
          </div>
          <div class="sub-menu-item" :class="{ active: activeSubMenu === 'guide' }"
               @click="handleSubMenuClick('guide')">
            <div class="sub-menu-text">평가 가이드</div>
          </div>
          <div class="sub-menu-item" :class="{ active: activeSubMenu === 'teamDash' }"
               @click="handleSubMenuClick('teamDash')">
            <div class="sub-menu-text">팀 평가 대시보드</div>
          </div>
          <div class="sub-menu-item" :class="{ active: activeSubMenu === 'deptDash' }"
               @click="handleSubMenuClick('deptDash')">
            <div class="sub-menu-text">부서별 역량 대시보드</div>
          </div>
        </div>

          <!-- 급여 -->
        <div
          class="menu-item has-dropdown"
          :class="{ 'active-parent': activeParent === 'payroll' }"
          @click="handleParentClick('payroll')"
        >
          <div class="menu-content">
            <div class="icon-wrapper">
              <img
                class="payroll-icon sidebar-icon"
                :src="getMenuIcon('payroll')"
              />
            </div>
            <div class="menu-text">급여</div>
          </div>
          <div class="dropdown-arrow" :class="{ rotate: isPayrollOpen }">
            <img class="payroll-dropdown-arrow" src="/images/dropdownArrow.png" />
          </div>
        </div>

        <!-- 급여 하위 메뉴 -->
        <div v-if="isPayrollOpen && !isCollapsed" class="sub-menu-list">
          <div
            class="sub-menu-item"
            :class="{ active: activeSubMenu === 'myPayroll' }"
            @click="handleSubMenuClick('myPayroll')"
          >
            <div class="sub-menu-text">내 급여</div>
          </div>
          <div
            class="sub-menu-item"
            :class="{ active: activeSubMenu === 'myPayrollHistory' }"
            @click="handleSubMenuClick('myPayrollHistory')"
          >
            <div class="sub-menu-text">내 급여 이력</div>
          </div>
        </div>
        <!-- 인사 관리 -->
        <div class="menu-item has-dropdown"
            :class="{ 'active-parent': activeParent === 'personnel' }"
            @click="handleParentClick('personnel')">
          <div class="menu-content">
            <div class="icon-wrapper">
              <img class="personnel-icon sidebar-icon" :src="getMenuIcon('personnel')" />
            </div>
            <div class="menu-text">사원 관리</div>
          </div>
          <div class="dropdown-arrow" :class="{ rotate: isPersonnelOpen }">
            <img class="personnel-dropdown-arrow" src="/images/dropdownArrow.png" />
          </div>
        </div>

        <div v-if="isPersonnelOpen && !isCollapsed" class="sub-menu-list">
          <div class="sub-menu-item" :class="{ active: activeSubMenu === 'register' }"
              @click="handleSubMenuClick('register')">
            <div class="sub-menu-text">신규 사원 등록</div>
          </div>
          <div class="sub-menu-item" :class="{ active: activeSubMenu === 'turnover' }"
              @click="handleSubMenuClick('turnover')">
            <div class="sub-menu-text">이직률</div>
          </div>
          <div class="sub-menu-item" :class="{ active: activeSubMenu === 'plan' }"
              @click="handleSubMenuClick('plan')">
            <div class="sub-menu-text">승진 계획 등록</div>
          </div>
          <div class="sub-menu-item" :class="{ active: activeSubMenu === 'recommend' }"
              @click="handleSubMenuClick('recommend')">
            <div class="sub-menu-text">승진 추천</div>
          </div>
          <div class="sub-menu-item" :class="{ active: activeSubMenu === 'review' }"
              @click="handleSubMenuClick('review')">
            <div class="sub-menu-text">승진 심사</div>
          </div>
          <div class="sub-menu-item" :class="{ active: activeSubMenu === 'special' }"
              @click="handleSubMenuClick('special')">
            <div class="sub-menu-text">특별 승진</div>
          </div>
        </div>

        <!-- 조직도 -->
        <div class="menu-item"
             :class="{ 'active-parent': activeParent === 'organization' }"
             @click="handleParentClick('organization')">
          <div class="menu-content">
            <div class="icon-wrapper">
              <img class="organization-icon sidebar-icon" :src="getMenuIcon('organization')" />
            </div>
            <div class="menu-text">조직도</div>
          </div>
        </div>

      </div>

      <!-- 아래 유지 -->
      <div class="menu-list-bottom">
        <div class="admin-link" v-if="!isCollapsed">
          <div class="icon-wrapper">
            <img class="config-icon sidebar-icon" src="/images/config.svg" />
          </div>
          <div class="menu-text">관리자 페이지</div>
        </div>

        <div class="divider" v-if="!isCollapsed"></div>

        <div class="collapse-item" @click="handleCollapse">
          <div class="collapse-content">
            <div class="icon-wrapper">
              <img 
                :src="isCollapsed ? '/images/spread.svg' : '/images/fold.svg'" 
                alt="collapse-icon"
              />
            </div>
            <div class="menu-text" v-if="!isCollapsed">접기</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();

// 활성화 된 상위 메뉴
const activeParent = ref<string>('dashboard');
// 활성화 된 서브 메뉴
const activeSubMenu = ref<string>('');

// 각 도메인의 서브 메뉴 오픈 여부
const isPersonnelOpen = ref<boolean>(false);
const isEvaluationOpen = ref<boolean>(false);
const isApprovalOpen = ref<boolean>(false);
const isAttendanceOpen = ref<boolean>(false);
const isVacationOpen = ref<boolean>(false);
const isPayrollOpen = ref<boolean>(false);

//Sidebar 접힘 여부
const isCollapsed = ref<boolean>(false);

//상위 메뉴별 아이콘 (활성/비활성)
const menuIcons = {
  dashboard: { default: '/images/dashboard.svg', active: '/images/dashboard-white.svg' },
  attendance: { default: '/images/attendance.svg', active: '/images/attendance-white.svg' },
  vacation: { default: '/images/vacation.svg', active: '/images/vacation-white.svg' },
  approval: { default: '/images/approval.svg', active: '/images/approval-white.svg' },
  evaluation: { default: '/images/evaluation.svg', active: '/images/evaluation-white.svg' },
  personnel: { default: '/images/personnel.svg', active: '/images/personnel-white.svg' },
  payroll: { default: '/images/payroll.svg', active: '/images/payroll-white.svg' },
  organization: { default: '/images/organization.svg', active: '/images/organization-white.svg' },
};

/**
 * 상위 메뉴 활성 상태에 따라 적절한 아이콘 경로를 반환
 * @param {string} key - 상위 메뉴
 * @return {string} - 아이콘 경로
 */
const getMenuIcon = (key: string) => {
  return activeParent.value === key ? (menuIcons as any)[key].active : (menuIcons as any)[key].default;
};

/**
 * 상위 메뉴 클릭 시 호출되는 핸들러 
 * - 클릭한 메뉴를 활성화하고, 해당 메뉴의 서브메뉴 오픈 상태를 토글
 * - 대시보드인 경우 '/'로 라우팅
 * @param {string} key - 상위 메뉴 키
 */
const handleParentClick = (key: string) => {

  if (isCollapsed.value) {
    isCollapsed.value = false;
  }

  activeParent.value = key;
// 대시보드는 바로 이동
  if( key === 'dashboard'){
    router.push('/');
  }

  //클릭한 메뉴만 토글, 나머지는 자동으로 열린 메뉴 닫기
  isPersonnelOpen.value = key === 'personnel' ? !isPersonnelOpen.value : false;
  isEvaluationOpen.value = key === 'evaluation' ? !isEvaluationOpen.value : false;
  isApprovalOpen.value = key === 'approval' ? !isApprovalOpen.value : false;
  isAttendanceOpen.value = key === 'attendance' ? !isAttendanceOpen.value : false;
  isVacationOpen.value = key === 'vacation' ? !isVacationOpen.value : false;
  isPayrollOpen.value = key === 'payroll' ? !isPayrollOpen.value : false;
};

/**
 * 서브 메뉴 클릭 시 호출되는 핸들러
 * @param {string} key - 서브 메뉴 키
 */
const handleSubMenuClick = (key: string) => {
  activeSubMenu.value = key;
  if (key === 'template') {
    router.push('/evaluation/template/list');
  } else if (key === 'guide') {
    router.push('/evaluation/guide/list');
  } else if (key === 'document-templates') {
    router.push('/approval/document-templates');
  } else if (key === 'inbox') {
    router.push('/approval/inbox');
  }


  // 근태 관리 하위 메뉴 라우팅
  if(key === 'attendanceRecord') {
    router.push('/attendance/attendance_record/personal');
  } else if (key === 'attendanceDept'){
    router.push('/attendance/department')
  }

  if (key === 'myPayroll') {
    router.push('/payroll'); 
    }else if (key === 'myPayrollHistory') {
      router.push('/payroll/history'); 
      }

};

// 사이드바 접기/펼치기 토글
const handleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;

  if (isCollapsed.value) {
   
    isPersonnelOpen.value = false;
    isEvaluationOpen.value = false;
    isApprovalOpen.value = false;
    isAttendanceOpen.value = false;
    isVacationOpen.value = false;
    isPayrollOpen.value = false;

    activeParent.value = '';
    activeSubMenu.value = '';
  }
};
</script>

<style scoped>
.sidebar-container {
  height: 100%;
  max-width: 100%;
  width: 230px;
  background: white;
  transition: width 0.3s ease;
}

.sidebar-container.collapsed {
  width: 60px;
}

.sidebar-wrapper {
  height: 100%;
  padding: 20px;
  border-right: 2px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  overflow-y: auto;
  /* IE, Edge (구버전) */
  -ms-overflow-style: none;
  /* Firefox */
  scrollbar-width: none;
}

/* 크롬 등 다양한 브라우저 */
.sidebar-wrapper::-webkit-scrollbar {
    display: none;
}

.menu-list-top {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.menu-item {
  align-self: stretch;
  height: 40px;
  padding: 0 18px;
  border-radius: 11.25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.menu-item:not(.active-parent):not(.sub-menu-item):hover {
  background-color: #f0f4f8;
}

.menu-content {
  display: flex;
  align-items: center;
  gap: 13.5px;
  flex: 1;
  transition: opacity 0.3s ease;
}

.sidebar-container.collapsed .menu-text {
  display: none;
}

.sidebar-icon {
  width: 20px;
  height: 20px;
}

.icon-wrapper {
  width: 22.5px;
  height: 22.5px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.menu-text {
  color: #45556c;
  font-size: 13px;
  font-family: Inter, sans-serif;
  font-weight: 400;
  line-height: 27px;
}

/* 하위 메뉴 */
.sub-menu-list {
  width: 100%;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  align-self: flex-end;
}

.sub-menu-item {
  height: 40px;
  margin-left: 10px;
  padding: 10px;
  border-radius: 11.25px;
  background: white;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.sub-menu-item:hover {
  background-color: #f0f4f8;
}

.sub-menu-text {
  color: #62748e;
  font-size: 12px;
  font-family: Inter, sans-serif;
  font-weight: 400;
  line-height: 24px;
  padding-left: 20px;
}

.sub-menu-item.active {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
}

.sub-menu-item.active .sub-menu-text {
  color: white;
  font-weight: 700;
}

.dropdown-arrow.rotate img {
  transform: rotate(180deg);
  transition: transform 0.25s ease;
}

.active-parent {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
}

.active-parent .menu-text {
  color: white;
}

.menu-list-bottom {
  height: 148px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  align-self: stretch;
}

.admin-link {
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.divider {
  width: 100%;
  height: 2px;
  background-color: #e2e8f0;
}

.collapse-item {
  align-self: stretch;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.collapse-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
}

.sidebar-container.collapsed .menu-item,
.sidebar-container.collapsed .sub-menu-item {
  justify-content: center; /* 텍스트 없이 아이콘만 가운데 정렬 */
  padding: 0;
}

.sidebar-container.collapsed .menu-content {
  gap: 0; /* 아이콘만 남기기 */
  justify-content: center;
}

.sidebar-container.collapsed .sub-menu-list {
  display: none; /* 하위 메뉴 숨김 */
}

.sidebar-container.collapsed .dropdown-arrow {
  display: none;
}
</style>