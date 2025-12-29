<!--
  * <pre>
  * Vue Name        : ApprovalResignForm.vue
  * Description     : 사직서
  *
  * 컴포넌트 연계
  *  - 부모 컴포넌트: ApprovalCreateCommonForm.vue
  *
  * History
  *   2025/12/10 - 민철 최초 작성
  *   2025/12/14 - 민철 공통 컴포넌트화
  *   2025/12/23 - 민철 파일명 변경
  * </pre>
  *
  * @module approval
  * @author 민철
  * @version 2.0
-->
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
                <span class="label-text">입사일자</span>
              </div>
              <div class="date-input-box">
                <input type="date" v-model="hireDate" class="native-input" />
              </div>
            </div>

            <div class="input-group col-quarter">
              <div class="group-label group-label-with-icon">
                <img class="icon-label" src="/images/vacation.svg" alt="date" />
                <span class="label-text">퇴사일자</span>
              </div>
              <div class="date-input-box">
                <input type="date" v-model="terminationDate" class="native-input" />
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
                    {{ selectedReason ? selectedReason.resignTypeName : '선택하세요' }}
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
                    v-for="option in resignTypes" 
                    :key="option.resignTypeId" 
                    class="dropdown-item"
                    @click.stop="selectReason(option)"
                  >
                    {{ option.resignTypeName }}
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
          v-model="terminateReasonDetail"
          class="input-textarea"
          placeholder="퇴직사유에 대한 상세 내용을 입력해 주세요."
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { useApprovalDataStore } from '@/stores/approval/approval_data.store';
import { ResignTypeResponseDTO } from '@/types/approval/approval_data.types';

const approvalDataStore = useApprovalDataStore();
const { resignTypes } = storeToRefs(approvalDataStore);

onMounted( async () => {
  await approvalDataStore.fetchResignTypes();
});



// v-model을 위한 Props와 Emits
const props = defineProps<{
  modelValue?: ResignFormData;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: ResignFormData];
}>();

// 타입 정의
export interface ResignFormData {
  employeeName: string;      // 사원명
  employeeNumber: number;         // 사원 ID
  department: string;     // 부서명
  grade: string;          // 직급명
  hireDate: string;          // 입사일 (YYYY-MM-DD)
  terminationDate: string;   // 퇴직일 (YYYY-MM-DD)
  terminateReason: string;      // 퇴직 사유 (드롭다운)
  terminateReasonDetail: string;      // 상세 사유
}

// Store 데이터 연결
const userStore = useAuthStore();
const { user } = storeToRefs(userStore);

// 폼 데이터 (reactive로 관리)
const formData = reactive<ResignFormData>({
  employeeName: props.modelValue?.employeeName || user.value?.employeeName || '',
  employeeNumber: props.modelValue?.employeeNumber ?? (user.value?.employeeId ? Number(user.value.employeeId) : 0),
  department: props.modelValue?.department || user.value?.departmentName || '',
  grade: props.modelValue?.grade || user.value?.gradeName || '',
  hireDate: props.modelValue?.hireDate || '',
  terminationDate: props.modelValue?.terminationDate || '',
  terminateReason: props.modelValue?.terminateReason || '',
  terminateReasonDetail: props.modelValue?.terminateReasonDetail || ''
});

const hireDate = ref(formData.hireDate);
const terminationDate = ref(formData.terminationDate);
const terminateReasonDetail = ref(formData.terminateReasonDetail);

// 드롭다운 로직
const isDropdownOpen = ref(false);
const selectedReason = ref<ResignTypeResponseDTO | null>(null);


const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const selectReason = (option: ResignTypeResponseDTO) => {
  selectedReason.value = option;
  formData.terminateReason = option.resignTypeName;
  isDropdownOpen.value = false;
};

// formData 변경 시 부모에게 자동 전달
watch(
  [() => formData.terminateReason, hireDate, terminationDate, terminateReasonDetail],
  ([newResignReason, newJoinDate, newResignationDate, newDetailReason]) => {
    formData.terminateReason = newResignReason;
    formData.hireDate = newJoinDate;
    formData.terminationDate = newResignationDate;
    formData.terminateReasonDetail = newDetailReason;
    // Store 값도 항상 최신으로 유지
    formData.employeeNumber = user.value?.employeeId ? Number(user.value.employeeId) : 0;
    formData.department = user.value?.departmentName || '';
    formData.grade = user.value?.gradeName || '';
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