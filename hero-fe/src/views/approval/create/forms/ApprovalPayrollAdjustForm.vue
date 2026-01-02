<!--
  * <pre>
  * Vue Name        : ApprovalPayrollAdjustForm.vue
  * Description     : 급여조정신청서
  *
  * 컴포넌트 연계
  *  - 부모 컴포넌트: ApprovalCreateCommonForm.vue
  *
  * History
  * 2025/12/10 (민철) 최초 작성
  * 2025/12/14 (민철) 공통 컴포넌트화
  * 2025/12/23 (민철) 파일명 변경
  * 2025/12/30 (민철) readonly 모드 지원 추가 (작성용/조회용 통합)
  * 2025/12/30 (민철) 모두 지원하도록 수정
  * 2025/12/30 (민철) Watch 최적화, Computed 적용
  * </pre>
  *
  * @module approval
  * @author 민철
  * @version 3.1
-->
<template>
  <div class="detail-form-section">
    <div class="form-row">
      <div class="row-label">
        <span class="label-text">급여 조정 정보</span>
      </div>
      <div class="row-content">
        <div class="section-body">
          <div class="input-group-row">

            <div class="input-group col-amount">
              <div class="group-label">
                <span class="label-text">조정 금액 {{ readonly ? '' : '*' }}</span>
              </div>

              <div class="calculation-box">
                <div class="input-box disabled">
                  <span class="placeholder-text">기존</span>
                  <div class="value-wrapper">
                    <span class="input-value">{{ formatNumber(currentAmount) }}</span>
                    <span class="unit-text">원</span>
                  </div>
                </div>

                <div class="arrow-icon">&gt;</div>

                <div class="input-box active" :class="{ 'disabled': readonly }">
                  <span class="placeholder-text text-blue">조정</span>
                  <div class="value-wrapper">

                    <span v-if="readonly" class="input-value text-right text-blue">
                      {{ formatNumber(formData.adjustmentAmount) }}
                    </span>

                    <input v-else type="text" v-model="displayAdjustmentAmount" @focus="onFocus" @blur="onBlur"
                      class="input-invisible text-right" placeholder="0" />
                    <span class="unit-text text-blue">원</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <div class="form-row border-top">
      <div class="row-label label-bottom">
        <span class="label-text">조정사유</span>
      </div>
      <div class="row-content reason-content">
        <div v-if="readonly" class="readonly-textarea">
          <span class="value-text">{{ formData.reason || '-' }}</span>
        </div>
        <textarea v-else v-model="formData.reason" class="input-textarea" placeholder="조정사유를 입력해 주세요."></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted } from 'vue';
import { useApprovalDataStore } from '@/stores/approval/approval_data.store';
import { storeToRefs } from 'pinia';

// Props & Emits
const props = defineProps<{
  modelValue?: ModifyPayrollFormData;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: ModifyPayrollFormData];
}>();

// 타입 정의
export interface ModifyPayrollFormData {
  currentAmount: number;      // 기존 급여
  adjustmentAmount: number;   // 조정 후 급여
  reason: string;             // 사유
}

// Store
const approvalDataStore = useApprovalDataStore();
const { payroll } = storeToRefs(approvalDataStore);

onMounted(async () => {
  if (!payroll.value) {
    await approvalDataStore.fetchPayroll();
  }
});

// --- State Management ---
const formData = reactive<ModifyPayrollFormData>({
  currentAmount: props.modelValue?.currentAmount || 0,
  adjustmentAmount: props.modelValue?.adjustmentAmount || 0,
  reason: props.modelValue?.reason || ''
});

// [동기화 1] 부모 -> 자식 (초기 데이터 로딩)
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



/**
 * 기존 급여
 * 1. API(Store)에서 가져온 값이 있으면 그 값 사용 (신규 작성 시)
 * 2. 이미 저장된(modelValue) 값이 있으면 그 값 사용 (수정/조회 시)
 * 3. 없으면 0
 */
const currentAmount = computed(() => {
  if (props.modelValue?.currentAmount) {
    return props.modelValue.currentAmount;
  }
  const storeVal = payroll.value?.beforePayroll || 0;

  if (!props.readonly && formData.currentAmount !== storeVal) {
    formData.currentAmount = storeVal;
  }

  return storeVal;
});


const isFocused = ref(false);

const displayAdjustmentAmount = computed({
  get() {
    if (isFocused.value) {
      return formData.adjustmentAmount ? formData.adjustmentAmount.toString() : '';
    } else {
      return formatNumber(formData.adjustmentAmount);
    }
  },
  set(value: string) {
    const numericValue = value.replace(/[^\d]/g, '');
    formData.adjustmentAmount = numericValue ? parseInt(numericValue) : 0;
  }
});

const onFocus = () => {
  isFocused.value = true;
};

const onBlur = () => {
  isFocused.value = false;
};

// 숫자 포맷팅 (천 단위 콤마)
const formatNumber = (num: number | undefined) => {
  if (num === undefined || num === null || isNaN(num)) {
    return '0';
  }
  return num.toLocaleString('ko-KR');
};

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
  font-weight: 400;
}

.col-type {
  width: 200px;
  flex-shrink: 0;
}

.dropdown-box {
  height: 46px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  cursor: pointer;
  position: relative;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.dropdown-box:hover,
.dropdown-box.is-open {
  border-color: #cbd5e1;
}

.dropdown-value {
  flex: 1;
  display: flex;
  align-items: center;
}

.placeholder-text {
  color: #94a3b8;
  font-size: 15px;
}

.text-selected {
  color: #0f172b;
  font-size: 15px;
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
  border-radius: 6px;
  margin-top: 4px;
  padding: 0;
  list-style: none;
  z-index: 10;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.dropdown-item {
  padding: 10px 12px;
  font-size: 14px;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #f1f5f9;
}

.col-amount {
  flex: 1;
  min-width: 300px;
}

.calculation-box {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.input-box {
  flex: 1;
  height: 46px;
  border-radius: 6px;
  padding: 0 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
}

.input-box.disabled {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #94a3b8;
}

.input-box.active {
  background: #fff;
  border: 1px solid #4f46e5;
}

.value-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
}

.input-value {
  color: #64748b;
  font-size: 15px;
  text-align: right;
}

.input-invisible {
  border: none;
  background: transparent;
  outline: none;
  font-size: 15px;
  color: #0f172b;
  width: fit-content;
}

.text-right {
  text-align: right;
}

.unit-text {
  font-size: 14px;
  color: #64748b;
}

/* 파란색 텍스트 강조 */
.text-blue {
  color: #4f46e5;
}

.arrow-icon {
  color: #94a3b8;
  font-size: 18px;
  font-weight: 500;
}

.reason-content {
  flex-direction: column;
  padding: 16px 20px;
}

.input-textarea {
  width: 100%;
  height: 150px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 12px;
  resize: none;
  font-family: "Inter-Regular", sans-serif;
  font-size: 14px;
  color: #0f172b;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.input-textarea::placeholder {
  color: #94a3b8;
}

.input-textarea:focus {
  border-color: #cbd5e1;
}

/* 읽기 전용 모드 스타일 */
.readonly-value {
  flex: 1;
  padding: 10px 12px;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  min-height: 40px;
  display: flex;
  align-items: center;
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