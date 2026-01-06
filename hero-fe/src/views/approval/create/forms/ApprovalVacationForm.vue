<!--
  * <pre>
  * Vue Name        : ApprovalVacationForm.vue
  * Description     : 휴가신청서 (작성용 + 조회용 통합)
  *
  * 컴포넌트 연계
  *  - 부모 컴포넌트: ApprovalCreateCommonForm.vue, ApprovalDetailCommonForm.vue
  *
  * History
  * 2025/12/10 (민철) 최초 작성
  * 2025/12/14 (민철) 공통 컴포넌트화
  * 2025/12/23 (민철) 파일명 변경
  * 2025/12/29 (민철) readonly 모드 지원 추가 (작성용/조회용 통합)
  * 2025/12/29 (민철) 이름/ID 모두 지원하도록 수정
  * 2025/12/30 (민철) Watch 최적화, Computed 적용
  * 2026/01/06 (민철) 주석 제거
  * </pre>
  *
  * @module approval
  * @author 민철
  * @version 3.2
-->
<template>
  <div class="detail-form-section">
    <div v-if="isDropdownOpen" class="overlay-backdrop" @click="closeDropdown"></div>

    <div class="form-row">
      <div class="row-label">
        <span class="label-text">휴가신청정보</span>
      </div>
      <div class="row-content">
        <div class="section-body">
          <div class="input-group-row">

            <div class="input-group col-type">
              <div class="group-label">
                <span class="label-text">휴가 종류 {{ readonly ? '' : '*' }}</span>
              </div>

              <div v-if="readonly" class="readonly-value">
                <span class="value-text">{{ formData.vacationType || '-' }}</span>
              </div>

              <div v-else class="dropdown-box" :class="{ 'is-open': isDropdownOpen }" @click.stop="toggleDropdown">
                <div class="dropdown-value">
                  <span :class="formData.vacationType ? 'text-selected' : 'placeholder-text'">
                    {{ currentVacationTypeName || '선택하세요' }}
                  </span>
                </div>
                <img class="icon-dropdown" :class="{ 'rotate': isDropdownOpen }" src="/images/dropdownarrow.svg"
                  alt="dropdown" />

                <ul v-if="isDropdownOpen" class="dropdown-options">
                  <li v-for="option in vacationTypes" :key="option.vacationTypeId" class="dropdown-item"
                    @click.stop="selectVacationType(option)">
                    {{ option.vacationTypeName }}
                  </li>
                </ul>
              </div>
            </div>

            <div class="input-group col-period">
              <div class="group-label">
                <span class="label-text">휴가 기간 {{ readonly ? '' : '*' }}</span>
              </div>

              <div v-if="readonly" class="date-range-box">
                <div class="readonly-value date-input">
                  <span class="value-text">{{ formatReadOnlyDate(formData.startDate) }}</span>
                </div>
                <div class="tilde">~</div>
                <div class="readonly-value date-input">
                  <span class="value-text">{{ formatReadOnlyDate(formData.endDate) }}</span>
                </div>
              </div>

              <div v-else class="date-range-box">
                <div class="date-input-box">
                  <input type="date" v-model="formData.startDate" class="date-input" />
                </div>
                <div class="tilde">~</div>
                <div class="date-input-box">
                  <input type="date" v-model="formData.endDate" class="date-input" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="form-row border-top">
      <div class="row-label label-bottom">
        <span class="label-text">사유</span>
      </div>
      <div class="row-content reason-content">
        <div v-if="readonly" class="readonly-textarea">
          <span class="value-text">{{ formData.reason || '-' }}</span>
        </div>
        <textarea v-else v-model="formData.reason" class="input-textarea" placeholder="사유를 입력해 주세요."></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, computed } from 'vue';
import { useApprovalDataStore } from '@/stores/approval/approval_data.store';
import { storeToRefs } from 'pinia';
import type { VacationTypeResponseDTO } from '@/types/approval/approval_data.types';

const props = defineProps<{
  modelValue?: VacationFormData;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: VacationFormData];
}>();

export interface VacationFormData {
  vacationType: number;
  startDate: string;
  endDate: string;
  reason: string;
}

const approvalDataStore = useApprovalDataStore();
const { vacationTypes } = storeToRefs(approvalDataStore);

onMounted(async () => {
  if (!vacationTypes.value || vacationTypes.value.length === 0) {
    await approvalDataStore.fetchVacationTypes();
  }
});

const formData = reactive<VacationFormData>({
  vacationType: props.modelValue?.vacationType || 0,
  startDate: props.modelValue?.startDate || '',
  endDate: props.modelValue?.endDate || '',
  reason: props.modelValue?.reason || ''
});

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    Object.assign(formData, newVal);
  }
}, { deep: true });

watch(formData, (newVal) => {
  if (!props.readonly) {
    emit('update:modelValue', { ...newVal });
  }
}, { deep: true });


const isDropdownOpen = ref(false);

const toggleDropdown = () => {
  if (props.readonly) return;
  isDropdownOpen.value = !isDropdownOpen.value;
};

const closeDropdown = () => {
  isDropdownOpen.value = false;
};

const selectVacationType = (option: VacationTypeResponseDTO) => {
  if (props.readonly) return;
  formData.vacationType = option.vacationTypeId; // ID 저장
  isDropdownOpen.value = false;
};

const currentVacationTypeName = computed(() => {
  const targetId = formData.vacationType;

  if (!targetId) return null;

  if (!vacationTypes.value) return targetId;

  const matched = vacationTypes.value.find(v => v.vacationTypeId === targetId);

  return matched ? matched.vacationTypeName : targetId;
});


const formatReadOnlyDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) return dateStr;
  return `${year}년 ${month}월 ${day}일`;
};

</script>

<style scoped>
.detail-form-section {
  border: 1px solid #e2e8f0;
  border-top: none;
  border-radius: 0 0 14px 14px;
  display: flex;
  flex-direction: column;
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
  padding: 0;
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

.dropdown-box:hover,
.dropdown-box.is-open {
  border-color: #cbd5e1;
  z-index: 50;
  position: relative;
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
  z-index: 50;
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
  padding: 0;
}

.date-input-box {
  height: 46px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 15px;
  display: flex;
  align-items: center;
  background: #fff;
  width: 100%;
}

.date-input {
  border: none;
  outline: none;
  width: 100%;
  background: transparent;
  font-size: 15px;
  color: #0f172b;
  font-family: "Inter-Regular", sans-serif;
}

.date-input:focus {
  outline: none;
  border-color: #cbd5e1;
}

.tilde {
  color: #90a1b9;
  font-size: 16px;
}

.overlay-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: transparent;
  z-index: 40;
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

.input-textarea:focus {
  border-color: #cbd5e1;
}

.input-textarea::placeholder {
  color: #90a1b9;
}

.readonly-value {
  padding: 10px 12px;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  min-height: 40px;
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.readonly-textarea {
  width: 100%;
  height: 200px;
  background-color: #f9fafb;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 16px;
}

.value-text {
  flex: 1;
  font-size: 14px;
  color: #374151;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>