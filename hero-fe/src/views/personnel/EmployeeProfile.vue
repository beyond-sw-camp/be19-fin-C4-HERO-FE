<!-- 
  <pre>
  Vue Name   : EmployeeProfile.vue
  Description : 직원 프로필 페이지 - 마이페이지 및 직원 상세 조회

  History
  2025/12/28 (혜원) 최초 작성
  2025/12/28 (혜원) 연락처 수정 기능 추가
  2025/12/28 (혜원) 비밀번호 변경 기능 추가
  2025/12/29 (혜원) Null-safe 처리 추가 (빈 값 저장 허용)
  </pre>
 
  @author 혜원
  @version 1.3
 -->
<template>
  <div class="profile-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>프로필 정보를 불러오는 중...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button @click="loadProfile" class="retry-button">다시 시도</button>
    </div>

    <!-- Profile Content -->
    <template v-else-if="employee">
      <!-- Left Sidebar -->
      <div class="sidebar-card">
        <!-- Profile Section -->
        <div class="profile-section">
          <div class="profile-avatar">{{ employee.employeeName?.charAt(0) || '?' }}</div>
          <div class="profile-name">{{ employee.employeeName || '이름 없음' }}</div>
          <div class="profile-team">{{ employee.team || '-' }}</div>
          <div class="profile-badge">{{ employee.rank || '-' }}</div>
        </div>

        <!-- Stamp Section -->
        <div class="stamp-section">
          <div class="stamp-header">
            <img src="/images/seal.svg" alt="직인" style="width: 16px; height: 16px;" />
            <span>등록된 직인</span>
          </div>
          <div class="stamp-empty" v-if="!employee.sealImageUrl">
          <img 
            src="/images/seal.svg" 
            alt="직인" 
            style="width: 32px; height: 32px; filter: grayscale(80%) brightness(0.6);"
          />
            <div class="empty-text">등록된 직인이 없습니다</div>
            <div class="empty-subtext">아래 버튼을 눌러 등록하세요</div>
          </div>
          <div class="stamp-image" v-else>
            <img :src="employee.sealImageUrl" alt="직인" />
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button class="btn-secondary" @click="handlePasswordChange">
            <img src="/images/password.svg" alt="비밀번호" style="width: 16px; height: 16px;" />  
            비밀번호 변경
          </button>
          <button class="btn-primary" @click="handleSealEdit">
            <img src="/images/seal.svg" alt="직인" style="width: 16px; height: 16px; filter: brightness(0) invert(1);" />
            직인 편집
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Basic Information -->
        <section class="info-card">
          <h2 class="card-title">기본 정보</h2>
          <div class="info-grid">
            <div class="info-item">
              <label>사원번호</label>
              <div class="info-value">{{ employee.employeeNumber || '-' }}</div>
            </div>
            <div class="info-item">
              <label>이름</label>
              <div class="info-value">{{ employee.employeeName || '-' }}</div>
            </div>
            <div class="info-item">
              <label>
                <svg class="label-icon" viewBox="0 0 12 12" fill="none">
                  <path d="M2 5.5L10 5.5M2 7.5L10 7.5" stroke="#64748B" stroke-width="1"/>
                </svg>
                생년월일
              </label>
              <div class="info-value">{{ formatDate(employee.birthDate) }}</div>
            </div>
            <div class="info-item">
              <label>
                <svg class="label-icon" viewBox="0 0 12 12" fill="none">
                  <path d="M2 1L10 1L10 11M7 1L10 1" stroke="#64748B" stroke-width="1"/>
                </svg>
                계약 구분
              </label>
              <div class="badge badge-blue">{{ employee.contractType || '-' }}</div>
            </div>
            <div class="info-item">
              <label>직책</label>
              <div class="info-value">{{ employee.position || '-' }}</div>
            </div>
            <div class="info-item">
              <label>직급</label>
              <div class="info-value">{{ employee.rank || '-' }}</div>
            </div>
            <div class="info-item">
              <label>부서</label>
              <div class="info-value">{{ employee.department || '-' }}</div>
            </div>
            <div class="info-item">
              <label>팀</label>
              <div class="info-value">{{ employee.team || '-' }}</div>
            </div>
          </div>
        </section>

        <!-- Contact Information -->
        <section class="info-card">
          <div class="card-header">
            <h2 class="card-title">연락처 정보</h2>
            <button class="btn-edit" @click="handleEdit">수정</button>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <label>이메일</label>
              <div class="info-value">{{ employee.email || '-' }}</div>
            </div>
            <div class="info-item">
              <label>회사 전화</label>
              <div class="info-value">{{ employee.officePhone || '-' }}</div>
            </div>
            <div class="info-item">
              <label>휴대폰</label>
              <div class="info-value">{{ employee.mobile || '-' }}</div>
            </div>
            <div class="info-item">
              <label>주소</label>
              <div class="info-value">{{ employee.address || '-' }}</div>
            </div>
          </div>
        </section>

        <!-- Work Information -->
        <section class="info-card">
          <h2 class="card-title">근무 정보</h2>
          <div class="info-grid">
            <div class="info-item">
              <label>입사일</label>
              <div class="info-value">{{ formatDate(employee.hireDate) }}</div>
            </div>
            <div class="info-item">
              <label>근속연수</label>
              <div class="info-value">{{ employee.yearsOfService || '0' }}년</div>
            </div>
            <div class="info-item">
              <label>
                <svg class="label-icon" viewBox="0 0 12 12" fill="none">
                  <path d="M3 2.5L9 2.5L9 9.5L3 9.5Z" stroke="#64748B" stroke-width="1"/>
                </svg>
                기본급 (연봉)
              </label>
              <div class="info-value">{{ formatCurrency(employee.salary) }}원</div>
            </div>
            <div class="info-item">
              <label>재직 상태</label>
              <div class="badge badge-green">{{ employee.status || '-' }}</div>
            </div>
            <div class="info-item">
              <label>성과평가</label>
              <div class="info-value">{{ employee.performance || '-' }}</div>
            </div>
          </div>
        </section>

        <!-- History Cards -->
        <section class="info-card">
          <h2 class="card-title">이력 조회</h2>
          <div class="history-grid">
            <div class="history-card history-blue" @click="handleDepartmentHistory">
              <div class="history-icon-wrapper blue">
                <svg viewBox="0 0 20 20" fill="none">
                  <path d="M2.5 2.5L17.5 2.5L17.5 17.5L2.5 17.5Z" stroke="white" stroke-width="1.67"/>
                  <path d="M2.5 2.5L6.66 2.5M10 5.83L13.33 11.66" stroke="white" stroke-width="1.67"/>
                </svg>
              </div>
              <div class="history-content">
                <div class="history-title">부서 이동 이력 조회</div>
                <div class="history-subtitle">부서 이동 이력 조회</div>
              </div>
            </div>
            <div class="history-card history-purple" @click="handleGradeHistory">
              <div class="history-icon-wrapper purple">
                <svg viewBox="0 0 20 20" fill="none">
                  <path d="M13.32 5.83L18.32 5.83L18.32 10.83" stroke="white" stroke-width="1.67"/>
                  <path d="M1.67 5.83L18.33 5.83" stroke="white" stroke-width="1.67"/>
                </svg>
              </div>
              <div class="history-content">
                <div class="history-title">직급 변경</div>
              </div>
            </div>
            <div class="history-card history-green" @click="handlePerformanceHistory">
              <div class="history-icon-wrapper green">
                <svg viewBox="0 0 20 20" fill="none">
                  <path d="M5.83 10.73L14.16 10.73" stroke="white" stroke-width="1.67"/>
                  <path d="M5 1.67L15 1.67L15 11.66L5 11.66Z" stroke="white" stroke-width="1.67"/>
                </svg>
              </div>
              <div class="history-content">
                <div class="history-title">성과평가 이력</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </template>

    <!-- Contact Edit Modal -->
    <ContactEditModal
      v-if="employee"
      :is-open="isContactModalOpen"
      :initial-data="{
        email: employee.email || '',
        mobile: employee.mobile || '',
        address: employee.address || ''
      }"
      @close="handleContactModalClose"
      @success="handleContactUpdateSuccess"
    />

    <!-- Password Change Modal -->
    <PasswordChangeModal
      :is-open="isPasswordModalOpen"
      @close="handlePasswordModalClose"
      @success="handlePasswordChangeSuccess"
    />

    <!-- Seal Edit Modal -->
    <SealEditModal
      v-if="employee"
      :is-open="isSealModalOpen"
      :employee-name="employee.employeeName || ''"
      :current-seal-url="employee.sealImageUrl"
      @close="handleSealModalClose"
      @success="handleSealUpdateSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import { fetchMyProfile, type EmployeeProfileResponse } from '@/api/personnel/personnel';
import ContactEditModal from '@/components/personnel/ContactEditModal.vue';
import PasswordChangeModal from '@/components/personnel/PasswordChangeModal.vue';
import SealEditModal from '@/components/personnel/SealEditModal.vue';

const toast = useToast();
const employee = ref<EmployeeProfileResponse | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const isContactModalOpen = ref(false);
const isPasswordModalOpen = ref(false);
const isSealModalOpen = ref(false);

/**
 * 프로필 정보 로드
 * JWT 토큰에서 사용자 정보를 추출하여 조회
 */
const loadProfile = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await fetchMyProfile();
    employee.value = response.data.data;
  } catch (err: any) {
    console.error('프로필 로드 에러:', err);
    error.value = err.response?.data?.message || '프로필 정보를 불러오는 중 오류가 발생했습니다.';
    toast.error(error.value);
  } finally {
    loading.value = false;
  }
};

/**
 * 날짜 포맷팅 (YYYY-MM-DD)
 */
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  return dateString;
};

/**
 * 금액 포맷팅
 */
const formatCurrency = (value: number | null | undefined): string => {
  if (!value) return '0';
  return value.toLocaleString('ko-KR');
};

/**
 * 비밀번호 변경 핸들러
 */
const handlePasswordChange = () => {
  isPasswordModalOpen.value = true;
};

/**
 * 비밀번호 모달 닫기
 */
const handlePasswordModalClose = () => {
  isPasswordModalOpen.value = false;
};

/**
 * 비밀번호 변경 성공
 * Toast는 PasswordChangeModal에서 표시
 */
const handlePasswordChangeSuccess = () => {
  // 추가 작업 필요 시 여기에 작성
};

/**
 * 직인 편집 핸들러
 */
const handleSealEdit = () => {
  if (!employee.value) {
    toast.error('프로필 정보를 불러온 후 시도해주세요');
    return;
  }
  isSealModalOpen.value = true;
};

/**
 * 직인 모달 닫기
 */
const handleSealModalClose = () => {
  isSealModalOpen.value = false;
};

/**
 * 직인 수정 성공 시 프로필 새로고침
 * Toast는 SealEditModal에서 표시
 */
const handleSealUpdateSuccess = async () => {
  await loadProfile();
};

/**
 * 연락처 수정 핸들러
 */
const handleEdit = () => {
  if (!employee.value) {
    toast.error('프로필 정보를 불러온 후 시도해주세요');
    return;
  }
  isContactModalOpen.value = true;
};

/**
 * 연락처 모달 닫기
 */
const handleContactModalClose = () => {
  isContactModalOpen.value = false;
};

/**
 * 연락처 수정 성공 시 프로필 새로고침
 * Toast는 ContactEditModal에서 표시
 */
const handleContactUpdateSuccess = async () => {
  await loadProfile();
};

/**
 * 부서 이동 이력 핸들러
 */
const handleDepartmentHistory = () => {
  console.log('부서 이동 이력 조회');
  toast.info('부서 이동 이력 조회 기능은 준비 중입니다');
};

/**
 * 직급 변경 이력 핸들러
 */
const handleGradeHistory = () => {
  console.log('직급 변경 이력 조회');
  toast.info('직급 변경 이력 조회 기능은 준비 중입니다');
};

/**
 * 성과평가 이력 핸들러
 */
const handlePerformanceHistory = () => {
  console.log('성과평가 이력 조회');
  toast.info('성과평가 이력 조회 기능은 준비 중입니다');
};

// 컴포넌트 마운트 시 프로필 로드
onMounted(() => {
  loadProfile();
});
</script>

<style scoped>
.profile-container {
  display: flex;
  gap: 32px;
  padding: 32px;
  background: #F8FAFC;
  min-height: 100vh;
}

/* Loading & Error States */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
  width: 100%;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #E2E8F0;
  border-top: 4px solid #432DD7;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  color: #EF4444;
  font-size: 16px;
  text-align: center;
}

.retry-button {
  padding: 10px 20px;
  background: #432DD7;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.retry-button:hover {
  opacity: 0.9;
}

/* Sidebar Styles */
.sidebar-card {
  width: 544px;
  background: white;
  border-radius: 16px;
  border: 1.2px solid #E2E8F0;
  padding: 25px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: fit-content;
}

.profile-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding-bottom: 24px;
}

.profile-avatar {
  width: 128px;
  height: 128px;
  background: linear-gradient(180deg, #1C398E 0%, #162456 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 48px;
  font-weight: 400;
}

.profile-name {
  color: #1E293B;
  font-size: 16px;
  line-height: 24px;
}

.profile-team {
  color: #62748E;
  font-size: 18px;
  line-height: 24px;
}

.profile-badge {
  background: rgba(67, 45, 215, 0.10);
  color: #432DD7;
  padding: 2px 12px;
  border-radius: 6px;
  font-size: 14px;
  line-height: 20px;
}

.stamp-section {
  padding-bottom: 24px;
  border-bottom: 1.2px solid #E2E8F0;
}

.stamp-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748B;
  font-size: 14px;
  line-height: 20px;
  margin-bottom: 12px;
}

.stamp-icon {
  width: 16px;
  height: 16px;
}

.stamp-empty {
  background: #F8FAFC;
  border: 1.2px solid #E2E8F0;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.stamp-image {
  background: #F8FAFC;
  border: 1.2px solid #E2E8F0;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.stamp-image img {
  max-width: 20%;
  height: auto;
}

.empty-icon {
  width: 48px;
  height: 48px;
  opacity: 0.3;
}

.empty-text {
  color: #94A3B8;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
}

.empty-subtext {
  color: #94A3B8;
  font-size: 12px;
  line-height: 16px;
  text-align: center;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-secondary,
.btn-primary {
  border-radius: 8px;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 16px;
  line-height: 24px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: white;
  border: 1.2px solid #E2E8F0;
  color: #1E293B;
}

.btn-secondary:hover {
  background: #F8FAFC;
}

.btn-primary {
  background: linear-gradient(180deg, #1C398E 0%, #162456 100%);
  border: none;
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-secondary svg,
.btn-primary svg {
  width: 16px;
  height: 16px;
}

/* Main Content Styles */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-card {
  background: white;
  border-radius: 16px;
  border: 1.2px solid #E2E8F0;
  padding: 25px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  color: #1E293B;
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;
  margin: 0;
}

.btn-edit {
  color: #432DD7;
  font-size: 14px;
  line-height: 20px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s;
}

.btn-edit:hover {
  text-decoration: underline;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  background: #F8FAFC;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item label {
  color: #64748B;
  font-size: 12px;
  line-height: 16px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.label-icon {
  width: 12px;
  height: 12px;
}

.info-value {
  color: #1E293B;
  font-size: 16px;
  line-height: 24px;
}

.badge {
  width: fit-content;
  padding: 2px 12px;
  border-radius: 6px;
  font-size: 14px;
  line-height: 20px;
}

.badge-blue {
  background: #DBEAFE;
  color: #1447E6;
}

.badge-green {
  background: #DCFCE7;
  color: #008236;
}

/* History Cards */
.history-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 23px;
}

.history-card {
  border-radius: 12px;
  border: 1.2px solid;
  padding: 17px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.history-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.history-blue {
  background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
  border-color: #BEDBFF;
}

.history-purple {
  background: linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%);
  border-color: #E9D4FF;
}

.history-green {
  background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%);
  border-color: #B9F8CF;
}

.history-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.history-icon-wrapper.blue {
  background: #2B7FFF;
}

.history-icon-wrapper.purple {
  background: #AD46FF;
}

.history-icon-wrapper.green {
  background: #00C950;
}

.history-icon-wrapper svg {
  width: 20px;
  height: 20px;
}

.history-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-title {
  color: #1E293B;
  font-size: 14px;
  line-height: 20px;
}

.history-subtitle {
  color: #64748B;
  font-size: 12px;
  line-height: 16px;
}

/* Responsive Design */
@media (max-width: 1440px) {
  .profile-container {
    flex-direction: column;
  }

  .sidebar-card {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .history-grid {
    grid-template-columns: 1fr;
  }

  .profile-container {
    padding: 16px;
  }
}
</style>