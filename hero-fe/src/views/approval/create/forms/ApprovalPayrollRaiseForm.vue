<!--
  * <pre>
  * Vue Name        : ApprovalPayrollRaiseForm.vue
  * Description     : 급여인상신청서
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
        <span class="label-text">급여 인상 신청 정보</span>
      </div>
      <div class="row-content">
        <div class="section-body">
          
          <div class="radio-group-row">
            <span class="label-text group-title">인상액 입력 방식을 선택하세요:</span>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" name="increaseType" value="direct" v-model="increaseType" />
                <span class="radio-text">직접 입력</span>
              </label>
              <label class="radio-label">
                <input type="radio" name="increaseType" value="rate" v-model="increaseType" />
                <span class="radio-text">인상률로 계산</span>
              </label>
            </div>
          </div>

          <div class="input-group-row calculation-row">
            
            <!-- 인상률 입력 -->
            <div class="input-group col-rate">
              <div class="input-box rate-box">
                <input 
                  v-if="increaseType === 'rate'"
                  type="number" 
                  class="input-invisible text-right" 
                  v-model.number="raisePercent"
                  placeholder="0.0"
                  step="0.1"
                  min="0"
                />
                <span v-else class="input-invisible text-right">{{ calculatedRate.toFixed(1) }}</span>
                <span class="unit-text">%</span>
              </div>
            </div>

            <!-- 기존 기본급 -->
            <div class="input-group col-salary">
              <div class="input-box salary-box disabled">
                <span class="placeholder-text">기존 기본급</span>
                <span class="input-value">{{ formatNumber(beforeSalary) }}</span>
                <span class="unit-text">원</span>
              </div>
            </div>

            <div class="arrow-icon">&gt;</div>

            <!-- ✅ 인상 후 기본급 (콤마 포맷팅 적용) -->
            <div class="input-group col-salary">
              <div class="input-box salary-box active">
                <span class="placeholder-text active-placeholder">인상 후 기본급</span>
                
                <!-- 직접입력 모드: 콤마 포맷팅 input -->
                <input 
                  v-if="increaseType === 'direct'"
                  type="text"
                  class="input-invisible text-right input-value active-value"
                  v-model="displayAfterSalary"
                  @focus="onFocus"
                  @blur="onBlur"
                  placeholder="0"
                />
                
                <!-- 인상률 계산 모드: 계산된 값 표시 -->
                <span v-else class="input-value active-value">{{ formatNumber(calculatedSalary) }}</span>
                
                <span class="unit-text active-unit">원</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <div class="form-row border-top">
      <div class="row-label label-bottom">
        <span class="label-text">인상사유</span>
      </div>
      <div class="row-content reason-content">
        <textarea 
          v-model="reason"
          class="input-textarea"
          placeholder="인상사유를 입력해 주세요."
        ></textarea>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted } from 'vue';
import { useApprovalDataStore } from '@/stores/approval/approval_data.store';
import { storeToRefs } from 'pinia';

const approvalDataStore = useApprovalDataStore();
const { payroll } = storeToRefs(approvalDataStore);

onMounted(async () => {
  await approvalDataStore.fetchPayroll();
});

const props = defineProps<{
  modelValue?: RaisePayrollFormData;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: RaisePayrollFormData];
}>();

export interface RaisePayrollFormData {
  raisePercent: number;
  beforeSalary: number;
  afterSalary: number;
  reason: string;
}

const formData = reactive<RaisePayrollFormData>({
  raisePercent: props.modelValue?.raisePercent || 0,
  beforeSalary: props.modelValue?.beforeSalary || 0,
  afterSalary: props.modelValue?.afterSalary || 0,
  reason: props.modelValue?.reason || ''
});

const increaseType = ref<'direct' | 'rate'>('rate');
const raisePercent = ref(formData.raisePercent);
const afterSalary = ref(formData.afterSalary);
const reason = ref(formData.reason);

const beforeSalary = computed(() => {
  return payroll.value?.beforePayroll || formData.beforeSalary || 0;
});

// ✅ 포커스 상태 관리
const isFocused = ref(false);

// ✅ 화면에 표시할 포맷팅된 급여 값
const displayAfterSalary = computed({
  get() {
    if (isFocused.value) {
      // 포커스 시: 숫자만 표시 (편집하기 쉽게)
      return afterSalary.value ? afterSalary.value.toString() : '';
    } else {
      // 블러 시: 콤마 포맷팅
      return formatNumber(afterSalary.value);
    }
  },
  set(value: string) {
    // 입력값에서 숫자만 추출
    const numericValue = value.replace(/[^\d]/g, '');
    afterSalary.value = numericValue ? parseInt(numericValue) : 0;
  }
});

// ✅ 포커스 이벤트 핸들러
const onFocus = () => {
  isFocused.value = true;
};

const onBlur = () => {
  isFocused.value = false;
};

// 인상률로 계산된 급여
const calculatedSalary = computed(() => {
  if (increaseType.value === 'rate' && raisePercent.value !== null) {
    return Math.round(beforeSalary.value * (1 + raisePercent.value / 100));
  }
  return afterSalary.value || 0;
});

// 급여로 역산된 인상률
const calculatedRate = computed(() => {
  if (increaseType.value === 'direct' && afterSalary.value > 0 && beforeSalary.value > 0) {
    const rate = ((afterSalary.value - beforeSalary.value) / beforeSalary.value) * 100;
    return Math.round(rate * 100) / 100;
  }
  return raisePercent.value || 0;
});

const formatNumber = (num: number | undefined) => {
  if (num === undefined || num === null || isNaN(num)) {
    return '0';
  }
  return num.toLocaleString('ko-KR');
};

// 인상률 변경 감지
watch(raisePercent, (newRate) => {
  if (increaseType.value === 'rate') {
    const calculated = Math.round(beforeSalary.value * (1 + newRate / 100));
    afterSalary.value = calculated;
  }
});

// 급여 직접 입력 감지
watch(afterSalary, (newSalaryValue) => {
  if (increaseType.value === 'direct' && newSalaryValue > 0 && beforeSalary.value > 0) {
    const rate = ((newSalaryValue - beforeSalary.value) / beforeSalary.value) * 100;
    raisePercent.value = Math.round(rate * 100) / 100;
  }
});

// formData 변경 시 부모에게 자동 전달
watch(
  [raisePercent, beforeSalary, afterSalary, reason],
  ([newIncreaseRate, newCurrentSalary, newNewSalary, newReason]) => {
    formData.raisePercent = newIncreaseRate;
    formData.beforeSalary = newCurrentSalary;
    formData.afterSalary = newNewSalary;
    formData.reason = newReason;
    
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
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.label-text {
  color: #45556c;
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
}

.radio-group-row {
  display: flex;
  align-items: center;
  gap: 5px;
}

.group-title {
  margin-right: 8px;
}

.radio-group {
  display: flex;
  gap: 16px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.radio-text {
  color: #0f172b;
  font-size: 14px;
}

.input-group-row.calculation-row {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-box {
  height: 46px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  background: #fff;
  box-sizing: border-box;
}

.col-rate .input-box.rate-box {
  width: 90px;
  justify-content: flex-end;
  background: #f8fafc;
}

.input-invisible {
  border: none;
  background: transparent;
  width: 100%;
  outline: none;
  font-size: 15px;
  color: #0f172b;
  font-family: inherit;
}
.text-right { text-align: right; }

.col-salary {
  flex: 1;
}

.input-box.salary-box {
  justify-content: space-between;
}

.input-box.salary-box.disabled {
  background: #f8fafc;
  border-color: #e2e8f0;
  color: #94a3b8;
}

.input-box.salary-box.active {
  border: 1px solid #4f46e5;
  background: #fff;
}

.placeholder-text {
  color: #94a3b8;
  font-size: 14px;
}

.placeholder-text.active-placeholder {
  color: #4f46e5;
}

.input-value {
  font-size: 15px;
  font-weight: 500;
  color: #64748b;
  text-align: right;
  flex: 1;
  margin-right: 4px;
}

.input-value.active-value {
  color: #0f172b;
}

.unit-text {
  font-size: 14px;
  color: #64748b;
}

.unit-text.active-unit {
  color: #4f46e5;
}

.arrow-icon {
  color: #94a3b8;
  font-size: 18px;
  padding-bottom: 12px;
}

.reason-content {
  flex-direction: column;
  padding: 16px 20px;
}

.input-textarea {
  width: 100%;
  height: 250px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 12px;
  resize: none;
  font-family: "Inter-Regular", sans-serif;
  font-size: 14px;
  color: #0f172b;
  outline: none;
  transition: border-color 0.2s;
}

.input-textarea::placeholder {
  color: #94a3b8;
}

.input-textarea:focus {
  border-color: #cbd5e1;
}
</style>