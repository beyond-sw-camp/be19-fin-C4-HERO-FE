<!-- 
  <pre>
  Vue Name   : PasswordChangeModal.vue
  Description : 비밀번호 변경 모달

  History
  2025/12/28 (혜원) 최초 작성
  </pre>
 
  @author 혜원
  @version 1.0
 -->
<template>
  <div v-if="isOpen" class="modal-overlay" @click="handleClose">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2>비밀번호 변경</h2>
        <button class="close-btn" @click="handleClose">×</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <!-- 현재 비밀번호 -->
        <div class="form-group">
          <label class="label-with-icon required">
            <svg class="label-icon" viewBox="0 0 16 16" fill="none">
              <path d="M2 8L14 8" stroke="#432DD7" stroke-width="1.33"/>
              <path d="M6 4L6 8M10 4L10 6" stroke="#432DD7" stroke-width="1.33"/>
            </svg>
            현재 비밀번호
          </label>
          <div class="input-wrapper">
            <input 
              v-model="formData.currentPassword" 
              :type="showCurrentPassword ? 'text' : 'password'"
              placeholder="현재 비밀번호를 입력하세요"
              required
              class="form-input"
            />
            <button 
              type="button" 
              class="toggle-password"
              @click="showCurrentPassword = !showCurrentPassword"
            >
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M2 10C2 10 5 4 10 4C15 4 18 10 18 10" stroke="#64748B" stroke-width="1.67"/>
                <circle cx="10" cy="10" r="3" stroke="#64748B" stroke-width="1.67"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="divider"></div>

        <!-- 새 비밀번호 -->
        <div class="form-group">
          <label class="label-with-icon required">
            <svg class="label-icon" viewBox="0 0 16 16" fill="none">
              <path d="M2 8L14 8" stroke="#432DD7" stroke-width="1.33"/>
              <path d="M6 4L6 8M10 4L10 6" stroke="#432DD7" stroke-width="1.33"/>
            </svg>
            새 비밀번호
          </label>
          <div class="input-wrapper">
            <input 
              v-model="formData.newPassword" 
              :type="showNewPassword ? 'text' : 'password'"
              placeholder="새 비밀번호를 입력하세요"
              required
              class="form-input"
              @input="validatePassword"
            />
            <button 
              type="button" 
              class="toggle-password"
              @click="showNewPassword = !showNewPassword"
            >
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M2 10C2 10 5 4 10 4C15 4 18 10 18 10" stroke="#64748B" stroke-width="1.67"/>
                <circle cx="10" cy="10" r="3" stroke="#64748B" stroke-width="1.67"/>
              </svg>
            </button>
          </div>
          <div class="password-requirements">
            <div :class="['requirement', { valid: requirements.minLength }]">
              • 최소 8자 이상
            </div>
            <div :class="['requirement', { valid: requirements.hasLetters }]">
              • 영문 대소문자 포함
            </div>
            <div :class="['requirement', { valid: requirements.hasNumbers }]">
              • 숫자 포함
            </div>
          </div>
        </div>

        <!-- 새 비밀번호 확인 -->
        <div class="form-group">
          <label class="label-with-icon required">
            <svg class="label-icon" viewBox="0 0 16 16" fill="none">
              <path d="M2 8L14 8" stroke="#432DD7" stroke-width="1.33"/>
              <path d="M6 4L6 8M10 4L10 6" stroke="#432DD7" stroke-width="1.33"/>
            </svg>
            새 비밀번호 확인
          </label>
          <div class="input-wrapper">
            <input 
              v-model="formData.confirmPassword" 
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="새 비밀번호를 다시 입력하세요"
              required
              class="form-input"
              @input="checkPasswordMatch"
            />
            <button 
              type="button" 
              class="toggle-password"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M2 10C2 10 5 4 10 4C15 4 18 10 18 10" stroke="#64748B" stroke-width="1.67"/>
                <circle cx="10" cy="10" r="3" stroke="#64748B" stroke-width="1.67"/>
              </svg>
            </button>
          </div>
          <div v-if="passwordMismatch" class="error-text">
            비밀번호가 일치하지 않습니다
          </div>
        </div>

        <!-- 버튼 -->
        <div class="modal-footer">
          <button type="submit" class="btn-submit" :disabled="!isFormValid || loading">
            <svg viewBox="0 0 16 16" fill="none">
              <path d="M2 2L14 2L14 14L2 14L2 2Z" stroke="white" stroke-width="1.33"/>
              <path d="M6 10L10 10M6 3L6 6" stroke="white" stroke-width="1.33"/>
            </svg>
            {{ loading ? '변경 중...' : '비밀번호 변경' }}
          </button>
          <button type="button" class="btn-cancel" @click="handleClose">
            취소
          </button>
        </div>
      </form>

      <!-- 에러 메시지 -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { changePassword } from '@/api/personnel/personnel';

interface Props {
  isOpen: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
  success: [];
}>();

const formData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);
const loading = ref(false);
const error = ref<string | null>(null);
const passwordMismatch = ref(false);

// 비밀번호 요구사항 체크
const requirements = ref({
  minLength: false,
  hasLetters: false,
  hasNumbers: false
});

/**
 * 비밀번호 유효성 검사
 */
const validatePassword = () => {
  const password = formData.value.newPassword;
  
  requirements.value.minLength = password.length >= 8;
  requirements.value.hasLetters = /[a-z]/.test(password) && /[A-Z]/.test(password);
  requirements.value.hasNumbers = /\d/.test(password);
};

/**
 * 비밀번호 일치 확인
 */
const checkPasswordMatch = () => {
  if (formData.value.confirmPassword) {
    passwordMismatch.value = formData.value.newPassword !== formData.value.confirmPassword;
  } else {
    passwordMismatch.value = false;
  }
};

/**
 * 폼 유효성 검사
 */
const isFormValid = computed(() => {
  return (
    formData.value.currentPassword &&
    formData.value.newPassword &&
    formData.value.confirmPassword &&
    requirements.value.minLength &&
    requirements.value.hasLetters &&
    requirements.value.hasNumbers &&
    !passwordMismatch.value
  );
});

/**
 * 모달 초기화
 */
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    formData.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    showCurrentPassword.value = false;
    showNewPassword.value = false;
    showConfirmPassword.value = false;
    error.value = null;
    passwordMismatch.value = false;
    requirements.value = {
      minLength: false,
      hasLetters: false,
      hasNumbers: false
    };
  }
});

/**
 * 모달 닫기
 */
const handleClose = () => {
  error.value = null;
  emit('close');
};

/**
 * 폼 제출
 */
const handleSubmit = async () => {
  if (!isFormValid.value) return;

  loading.value = true;
  error.value = null;

  try {
    await changePassword({
      currentPassword: formData.value.currentPassword,
      newPassword: formData.value.newPassword
    });
    emit('success');
    handleClose();
  } catch (err: any) {
    console.error('비밀번호 변경 에러:', err);
    error.value = err.response?.data?.message || '비밀번호 변경에 실패했습니다.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 16px;
  width: 600px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #E2E8F0;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1E293B;
}

.close-btn {
  background: none;
  border: none;
  font-size: 32px;
  color: #64748B;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #F1F5F9;
  color: #1E293B;
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.divider {
  height: 1.2px;
  background: #E2E8F0;
  margin: 1px 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label-with-icon {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 400;
  color: #334155;
}

.label-with-icon.required::after {
  content: ' *';
  color: #FB2C36;
  margin-left: 4px;
}

.label-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input {
  width: 100%;
  padding: 12px 48px 12px 16px;
  border: 1.2px solid #E2E8F0;
  border-radius: 8px;
  font-size: 16px;
  color: #1E293B;
  transition: all 0.2s;
  background: white;
}

.form-input::placeholder {
  color: #94A3B8;
}

.form-input:focus {
  outline: none;
  border-color: #432DD7;
  box-shadow: 0 0 0 3px rgba(67, 45, 215, 0.1);
}

.toggle-password {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.toggle-password:hover {
  background: #F8FAFC;
}

.toggle-password svg {
  width: 20px;
  height: 20px;
}

.password-requirements {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
}

.requirement {
  color: #64748B;
  font-size: 14px;
  line-height: 20px;
  transition: all 0.2s;
}

.requirement.valid {
  color: #10B981;
  font-weight: 500;
}

.error-text {
  color: #EF4444;
  font-size: 14px;
  line-height: 20px;
  margin-top: 4px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding-top: 24px;
  border-top: 1.2px solid #E2E8F0;
}

.btn-submit,
.btn-cancel {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btn-submit {
  background: linear-gradient(180deg, #372AAC 0%, #432DD7 100%);
  border: none;
  color: white;
  width: 174px;
}

.btn-submit svg {
  width: 16px;
  height: 16px;
}

.btn-submit:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cancel {
  background: white;
  border: 1.2px solid #E2E8F0;
  color: #64748B;
  width: 82px;
}

.btn-cancel:hover {
  background: #F8FAFC;
}

.error-message {
  margin: 0 24px 24px;
  padding: 12px;
  background: #FEE2E2;
  border: 1px solid #FCA5A5;
  border-radius: 8px;
  color: #DC2626;
  font-size: 14px;
}
</style>