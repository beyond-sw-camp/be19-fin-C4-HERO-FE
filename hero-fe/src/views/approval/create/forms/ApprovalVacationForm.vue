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
                <input type="date" v-model="formData.startDate" class="date-input" />
                <div class="tilde">~</div>
                <input type="date" v-model="formData.endDate" class="date-input" />
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
        <textarea v-else v-model="formData.reason" class="input-textarea" placeholder="휴가사유를 입력해 주세요."></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, computed } from 'vue';
import { useApprovalDataStore } from '@/stores/approval/approval_data.store';
import { storeToRefs } from 'pinia';
import type { VacationTypeResponseDTO } from '@/types/approval/approval_data.types';

// Props & Emits
const props = defineProps<{
  modelValue?: VacationFormData;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: VacationFormData];
}>();

export interface VacationFormData {
  vacationType: number;  // 휴가 종류 ID (문자열 형태)
  startDate: string;     // YYYY-MM-DD
  endDate: string;       // YYYY-MM-DD
  reason: string;
}

// Store
const approvalDataStore = useApprovalDataStore();
const { vacationTypes } = storeToRefs(approvalDataStore);

onMounted(async () => {
  // 데이터가 없을 때만 호출
  if (!vacationTypes.value || vacationTypes.value.length === 0) {
    await approvalDataStore.fetchVacationTypes();
  }
});

// --- State Management ---
const formData = reactive<VacationFormData>({
  vacationType: props.modelValue?.vacationType || 0,
  startDate: props.modelValue?.startDate || '',
  endDate: props.modelValue?.endDate || '',
  reason: props.modelValue?.reason || ''
});

// [동기화 1] 부모 -> 자식 (API 로딩 등으로 늦게 들어오는 데이터 처리)
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    Object.assign(formData, newVal);
  }
}, { deep: true });

// [동기화 2] 자식 -> 부모 (폼 변경 시 자동 emit)
watch(formData, (newVal) => {
  if (!props.readonly) {
    emit('update:modelValue', { ...newVal });
  }
}, { deep: true });


// --- Dropdown Logic (Computed 활용) ---
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

/**
 * 현재 선택된 휴가 종류의 '이름'을 계산
 * (Readonly와 Writable 모드 둘 다 사용)
 */
const currentVacationTypeName = computed(() => {
  const targetId = formData.vacationType;

  // 1. 선택된 값이 없으면 null
  if (!targetId) return null;

  // 2. 목록이 로드되지 않았으면 기존 값(ID)이라도 잠시 보여줌 (혹은 빈값)
  if (!vacationTypes.value) return targetId;

  // 3. ID로 매칭 (String 변환 후 비교 권장)
  const matched = vacationTypes.value.find(v => v.vacationTypeId === targetId);

  // 4. 매칭된 객체가 있으면 이름 반환, 없으면(예외 케이스) 원래 값 반환
  return matched ? matched.vacationTypeName : targetId;
});


// --- Readonly Helper ---
const formatDateRange = (startDate: string, endDate: string): string => {
  if (!startDate || !endDate) return '-';

  const format = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
  };

  return `${format(startDate)} ~ ${format(endDate)}`;
};

// --- Readonly Formatters ---
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
  /* 추가: 배경 위로 올라오게 함 */
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

/* 읽기 전용 모드 스타일 */
.readonly-value {
  /* flex: 1; */
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