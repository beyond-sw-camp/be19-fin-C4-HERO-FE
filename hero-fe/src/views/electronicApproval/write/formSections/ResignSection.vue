<template>
  <div class="detail-form-section">
    <div 
      v-if="isDropdownOpen" 
      class="overlay-backdrop" 
      @click="isDropdownOpen = false"
    ></div>

    <div class="form-row">
      <div class="row-label">
        <span class="label-text">퇴직정보</span>
      </div>
      <div class="row-content">
        <div class="section-body">
          
          <div class="input-group-row">
            
            <div class="input-group col-quarter">
              <div class="group-label">
                <span class="label-text">사번</span>
              </div>
              <div class="text-input-box readonly">
                <input 
                  type="text" 
                  :value="user?.employeeId" 
                  class="native-input" 
                  readonly 
                  tabindex="-1"
                />
              </div>
            </div>

            <div class="input-group col-quarter">
              <div class="group-label">
                <span class="label-text">부서</span>
              </div>
              <div class="text-input-box readonly">
                <input 
                  type="text" 
                  :value="user?.departmentName" 
                  class="native-input" 
                  readonly 
                  tabindex="-1"
                />
              </div>
            </div>

            <div class="input-group col-quarter">
              <div class="group-label">
                <span class="label-text">직급</span>
              </div>
              <div class="text-input-box readonly">
                <input 
                  type="text" 
                  :value="user?.gradeName" 
                  class="native-input" 
                  readonly 
                  tabindex="-1"
                />
              </div>
            </div>

            <div class="input-group col-quarter">
              <div class="group-label">
                <span class="label-text">이름</span>
              </div>
              <div class="text-input-box readonly">
                <input 
                  type="text" 
                  :value="user?.employeeName" 
                  class="native-input" 
                  readonly 
                  tabindex="-1"
                />
              </div>
            </div>

            <div class="input-group col-quarter">
              <div class="group-label group-label-with-icon">
                <img class="icon-label" src="/images/vacation.svg" alt="date" />
                <span class="label-text">생년월일</span>
              </div>
              <div class="date-input-box">
                <input type="date" v-model="birthDate" class="native-input" />
              </div>
            </div>

            <div class="input-group col-quarter">
              <div class="group-label group-label-with-icon">
                <img class="icon-label" src="/images/vacation.svg" alt="date" />
                <span class="label-text">입사일자</span>
              </div>
              <div class="date-input-box">
                <input type="date" v-model="joinDate" class="native-input" />
              </div>
            </div>

            <div class="input-group col-quarter">
              <div class="group-label group-label-with-icon">
                <img class="icon-label" src="/images/vacation.svg" alt="date" />
                <span class="label-text">퇴사일자</span>
              </div>
              <div class="date-input-box">
                <input type="date" v-model="resignationDate" class="native-input" />
              </div>
            </div>

            <div class="input-group col-quarter">
              <div class="group-label">
                <span class="label-text">퇴직사유</span>
              </div>
              <div 
                class="dropdown-box" 
                :class="{ 'is-open': isDropdownOpen }" 
                @click="toggleDropdown"
              >
                <div class="dropdown-value">
                  <span :class="selectedReason ? 'text-selected' : 'placeholder-text'">
                    {{ selectedReason ? selectedReason.label : '선택하세요' }}
                  </span>
                </div>
                <img 
                  class="icon-dropdown" 
                  :class="{ 'rotate': isDropdownOpen }"
                  src="/images/dropdownarrow.svg" 
                  alt="arrow"
                />
                <ul v-if="isDropdownOpen" class="dropdown-options">
                  <li 
                    v-for="option in reasonOptions" 
                    :key="option.value" 
                    class="dropdown-item"
                    @click.stop="selectReason(option)"
                  >
                    {{ option.label }}
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <div class="form-row border-top">
      <div class="row-label label-bottom">
        <span class="label-text">퇴직사유상세</span>
      </div>
      <div class="row-content reason-content">
        <textarea 
          v-model="detailReason"
          class="input-textarea"
          placeholder="퇴직사유에 대한 상세 내용을 입력해 주세요."
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';

// v-model을 위한 Props와 Emits
const props = defineProps<{
  modelValue?: ResignFormData;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: ResignFormData];
}>();

// 타입 정의
export interface ResignFormData {
  employeeId: number;
  departmentName: string;
  gradeName: string;
  employeeName: string;
  birthDate: string;
  joinDate: string;
  resignationDate: string;
  resignReason: string;
  detailReason: string;
}

// Store 데이터 연결
const userStore = useAuthStore();
const { user } = storeToRefs(userStore);

// 폼 데이터 (reactive로 관리)
const formData = reactive<ResignFormData>({
  employeeId: props.modelValue?.employeeId ?? (user.value?.employeeId ? Number(user.value.employeeId) : 0),
  departmentName: props.modelValue?.departmentName || user.value?.departmentName || '',
  gradeName: props.modelValue?.gradeName || user.value?.gradeName || '',
  employeeName: props.modelValue?.employeeName || user.value?.employeeName || '',
  birthDate: props.modelValue?.birthDate || '',
  joinDate: props.modelValue?.joinDate || '',
  resignationDate: props.modelValue?.resignationDate || '',
  resignReason: props.modelValue?.resignReason || '',
  detailReason: props.modelValue?.detailReason || ''
});

const birthDate = ref(formData.birthDate);
const joinDate = ref(formData.joinDate);
const resignationDate = ref(formData.resignationDate);
const detailReason = ref(formData.detailReason);

// 드롭다운 로직
const isDropdownOpen = ref(false);
const selectedReason = ref<{ label: string, value: string } | null>(null);

const reasonOptions = [
  { label: '개인 사정', value: 'personal' },
  { label: '이직', value: 'job_change' },
  { label: '계약 만료', value: 'contract_end' },
  { label: '정년 퇴직', value: 'retirement' },
  { label: '기타', value: 'etc' },
];

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const selectReason = (option: { label: string, value: string }) => {
  selectedReason.value = option;
  formData.resignReason = option.value;
  isDropdownOpen.value = false;
};

// formData 변경 시 부모에게 자동 전달
watch(
  [() => formData.resignReason, birthDate, joinDate, resignationDate, detailReason],
  ([newResignReason, newBirthDate, newJoinDate, newResignationDate, newDetailReason]) => {
    formData.birthDate = newBirthDate;
    formData.joinDate = newJoinDate;
    formData.resignationDate = newResignationDate;
    formData.detailReason = newDetailReason;
    
    // Store 값도 항상 최신으로 유지
    formData.employeeId = user.value?.employeeId ? Number(user.value.employeeId) : 0;
    formData.departmentName = user.value?.departmentName || '';
    formData.gradeName = user.value?.gradeName || '';
    formData.employeeName = user.value?.employeeName || '';
    
    emit('update:modelValue', { ...formData });
  }
);
</script>

<style scoped>
.detail-form-section {
  border: 1px solid #e2e8f0;
  border-top: none;
  border-radius: 0 0 14px 14px;
  display: flex;
  flex-direction: column;
  width: 100%;
  font-family: "Inter-Regular", sans-serif;
}

.form-row {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  flex-wrap: wrap;
}

.border-top {
  border-top: 1px solid #e2e8f0;
}

.row-label {
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
  padding: 16px;
  width: 140px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.label-bottom {
  border-bottom-left-radius: 14px;
}

.row-content {
  padding: 16px 20px;
  flex: 1;
  min-width: 200px;
  display: flex;
  align-items: center;
}

.section-body {
  flex: 1;
  width: 100%;
}

/* 그리드 레이아웃 설정 */
.input-group-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 4열 컬럼 스타일 (25% 너비에서 gap 고려) */
.col-quarter {
  flex: 0 0 calc(25% - 12px); /* 16px gap * 3 / 4 = 12px */
  min-width: 150px; /* 반응형 최소 너비 */
}

/* 라벨 스타일 */
.group-label {
  display: flex;
  align-items: center;
  height: 20px; /* 라벨 높이 통일 */
}

.group-label-with-icon {
  gap: 6px;
}

.icon-label {
  width: 16px;
  height: 16px;
}

.label-text {
  color: #45556c;
  font-size: 14px;
  font-family: "Inter-Regular", sans-serif;
  font-weight: 400;
}

/* --- 입력 박스 공통 스타일 (높이 46px 통일) --- */
.text-input-box,
.date-input-box,
.dropdown-box {
  height: 46px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  background: #fff;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.text-input-box:focus-within,
.date-input-box:focus-within,
.dropdown-box.is-open {
  border-color: #cbd5e1;
}

/* Native Input (Text/Date) */
.native-input {
  border: none;
  outline: none;
  width: 100%;
  height: 100%;
  background: transparent;
  font-size: 15px;
  color: #0f172b;
  font-family: "Inter-Regular", sans-serif;
}

.native-input::placeholder {
  color: #90a1b9;
}

/* 드롭다운 스타일 */
.dropdown-box {
  justify-content: space-between;
  cursor: pointer;
  position: relative;
}

.dropdown-value {
  flex: 1;
  display: flex;
  align-items: center;
}

.placeholder-text {
  color: #90a1b9;
  font-size: 15px;
}

.text-selected {
  color: #0f172b;
  font-size: 15px;
}

.icon-dropdown {
  width: 18px;
  transition: transform 0.2s;
}

.icon-dropdown.rotate {
  transform: rotate(180deg);
}

.dropdown-options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  margin-top: 4px;
  padding: 0;
  list-style: none;
  z-index: 50;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
}

.dropdown-item {
  padding: 10px 12px;
  font-size: 14px;
  color: #0f172b;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #f1f5f9;
}

/* 오버레이 */
.overlay-backdrop {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background: transparent;
  z-index: 40;
}

/* 사유 상세 입력 (Textarea) */
.reason-content {
  flex-direction: column;
  padding: 16px 20px;
}

.input-textarea {
  width: 100%;
  height: 300px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 12px;
  resize: none;
  font-family: "Inter-Regular", sans-serif;
  font-size: 14px;
  color: #0f172b;
  outline: none;
  box-sizing: border-box;
}

.input-textarea:focus {
  border-color: #cbd5e1;
}
.input-textarea::placeholder {
  color: #90a1b9;
}
</style>