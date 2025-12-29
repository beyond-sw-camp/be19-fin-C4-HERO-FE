<!--
  * <pre>
  * Vue Name        : ApprovalVacationForm.vue
  * Description     : 휴가신청서
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
    <div class="form-row">
      <div class="row-label">
        <span class="label-text">휴가신청정보</span>
      </div>
      <div class="row-content">
        <div class="section-body">
          <div class="input-group-row">
            
            <!-- 휴가 종류 -->
            <div class="input-group col-type">
              <div class="group-label">
                <span class="label-text">휴가 종류 *</span>
              </div>
              
              <div 
                class="dropdown-box" 
                :class="{ 'is-open': isOpen }" 
                @click="toggleDropdown"
              >
                <div class="dropdown-value">
                  <span 
                    :class="selectedOption ? 'text-selected' : 'placeholder-text'"
                  >
                    {{ selectedOption ? selectedOption.vacationTypeName : '선택하세요' }}
                  </span>
                </div>
                <img 
                  class="icon-dropdown" 
                  :class="{ 'rotate': isOpen }"
                  src="/images/dropdownarrow.svg" 
                  alt="dropdown"
                />

                <ul v-if="isOpen" class="dropdown-options">
                  <li 
                    v-for="option in vacationTypes" 
                    :key="option.vacationTypeId" 
                    class="dropdown-item"
                    @click.stop="selectOption(option)"
                  >
                    {{ option.vacationTypeName }}
                  </li>
                </ul>
              </div>
            </div>

            <!-- 휴가 기간 -->
            <div class="input-group col-period">
              <div class="group-label">
                <span class="label-text">휴가 기간 *</span>
              </div>
              <div class="date-range-box">
                <input
                  type="date"
                  v-model="formData.startDate"
                  class="date-input"
                />
                <div class="tilde">~</div>
                <input
                  type="date"
                  v-model="formData.endDate"
                  class="date-input"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 사유 -->
    <div class="form-row border-top">
      <div class="row-label label-bottom">
        <span class="label-text">사유</span>
      </div>
      <div class="row-content reason-content">
        <textarea 
          v-model="formData.reason"
          class="input-textarea"
          placeholder="휴가사유를 입력해 주세요."
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue';
import { useApprovalDataStore } from '@/stores/approval/approval_data.store';
import { storeToRefs } from 'pinia';
import { VacationTypeResponseDTO } from '@/types/approval/approval_data.types';

const approvalDataStore = useApprovalDataStore();
const { vacationTypes } = storeToRefs(approvalDataStore);

onMounted( async () => {
  await approvalDataStore.fetchVacationTypes();
});

// v-model을 위한 Props와 Emits
const props = defineProps<{
  modelValue?: VacationFormData;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: VacationFormData];
}>();

// 타입 정의
export interface VacationFormData {
  vacationType: string;  // 휴가 종류 (annual, half_am, half_pm, sick, public, special)
  startDate: string;     // 시작일 (YYYY-MM-DD)
  endDate: string;       // 종료일 (YYYY-MM-DD)
  reason: string;        // 사유
}

// 폼 데이터 (reactive로 관리)
const formData = reactive<VacationFormData>({
  vacationType: props.modelValue?.vacationType || '',
  startDate: props.modelValue?.startDate || '',
  endDate: props.modelValue?.endDate || '',
  reason: props.modelValue?.reason || ''
});

// 드롭다운 관련 (UI만)
const isOpen = ref(false);
const selectedOption = ref<VacationTypeResponseDTO>();

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

// 옵션 선택 시 formData 업데이트
const selectOption = (option: { vacationTypeId: number; vacationTypeName: string; }) => {
  selectedOption.value = option;
  formData.vacationType = option.vacationTypeName;
  emit('update:modelValue', { ...formData })  // formData 업데이트
  isOpen.value = false;
};

// formData 변경 시 부모에게 자동 전달
watch(
  formData,
  (newValue) => {
    emit('update:modelValue', { ...newValue });
  },
  { deep: true }
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

.group-label {
  display: flex;
  align-items: center;
}

.label-text {
  color: #45556c;
  font-size: 14px;
  line-height: 20px;
  font-family: "Inter-Regular", sans-serif;
  font-weight: 400;
}

/* 휴가 종류 드롭다운 */
.col-type {
  width: 208px;
  flex-shrink: 0;
}

.dropdown-box {
  height: 46px; 
  padding: 0 12px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  cursor: pointer;
  position: relative;
  transition: border-color 0.2s;
}

.dropdown-box:hover, .dropdown-box.is-open {
  border-color: #cbd5e1;
}

.dropdown-value {
  display: flex;
  align-items: center;
  flex: 1;
}

.placeholder-text {
  color: #90a1b9;
  font-size: 16px;
  font-family: "Inter-Regular", sans-serif;
}

.text-selected {
  color: #0f172b;
  font-size: 16px;
  font-family: "Inter-Regular", sans-serif;
}

.icon-dropdown {
  width: 18px;
  transition: transform 0.2s ease;
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
  z-index: 10;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  max-height: 200px;
  overflow-y: auto;
}

.dropdown-item {
  padding: 10px 12px;
  color: #0f172b;
  font-size: 15px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f1f5f9;
}

.dropdown-item:first-child {
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

.dropdown-item:last-child {
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}

.col-period {
  flex: 1;
  min-width: 300px;
}

.date-range-box {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.date-input {
  height: 46px;
  padding: 0 12px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  flex: 1;
  display: flex;
  align-items: center;
  background: #fff;
  overflow: hidden;
}

.native-date-input {
  border: none;
  outline: none;
  width: 100%;
  color: #0f172b;
  font-size: 15px;
  font-family: "Inter-Regular", sans-serif;
  background: transparent;
  cursor: pointer;
  height: 100%;
}

.native-date-input::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.6;
}

.native-date-input::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}

.tilde {
  color: #90a1b9;
  font-size: 16px;
}

.reason-content {
  flex-direction: column;
  padding: 16px 20px;
}

.input-textarea {
  width: 100%;
  height: 200px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 16px;
  resize: none;
  font-family: "Inter-Regular", sans-serif;
  font-size: 14px;
  color: #0f172b;
  outline: none;
  transition: border-color 0.2s;
}

.input-textarea::placeholder {
  color: #90a1b9;
}

.input-textarea:focus {
  border-color: #cbd5e1;
}
</style>