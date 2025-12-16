<template>
  <div class="detail-form-section">
    <div class="form-row">
      <div class="row-label">
        <span class="label-text">급여 조정 정보</span>
      </div>
      <div class="row-content">
        <div class="section-body">
          <div class="input-group-row">
            
            <div class="input-group col-type">
              <div class="group-label">
                <span class="label-text">조정항목타입 *</span>
              </div>
              
              <div 
                class="dropdown-box" 
                :class="{ 'is-open': isOpen }" 
                @click="toggleDropdown"
              >
                <div class="dropdown-value">
                  <span :class="selectedType ? 'text-selected' : 'placeholder-text'">
                    {{ selectedType ? selectedType.label : '선택하세요' }}
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
                    v-for="option in adjustmentOptions" 
                    :key="option.value" 
                    class="dropdown-item"
                    @click.stop="selectType(option)"
                  >
                    {{ option.label }}
                  </li>
                </ul>
              </div>
            </div>

            <div class="input-group col-amount">
              <div class="group-label">
                <span class="label-text">조정 금액 *</span>
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

                <div class="input-box active">
                  <span class="placeholder-text text-blue">조정</span>
                  <div class="value-wrapper">
                    <input 
                      type="number" 
                      v-model.number="adjustedAmount" 
                      class="input-invisible text-right" 
                      placeholder="0"
                      min="0"
                    />
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
        <textarea 
          v-model="reason"
          class="input-textarea"
          placeholder="조정사유를 입력해 주세요."
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';

// v-model을 위한 Props와 Emits
const props = defineProps<{
  modelValue?: ModifyPayrollFormData;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: ModifyPayrollFormData];
}>();

// 타입 정의
export interface ModifyPayrollFormData {
  adjustmentType: string;
  currentAmount: number;
  adjustedAmount: number;
  reason: string;
}

// 폼 데이터 (reactive로 관리)
const formData = reactive<ModifyPayrollFormData>({
  adjustmentType: props.modelValue?.adjustmentType || '',
  currentAmount: props.modelValue?.currentAmount || 2000000,
  adjustedAmount: props.modelValue?.adjustedAmount || 0,
  reason: props.modelValue?.reason || ''
});

const isOpen = ref(false);
const selectedType = ref<{ label: string, value: string } | null>(null);

const adjustmentOptions = [
  { value: 'basic', label: '기본급 조정' },
  { value: 'position', label: '직책 수당' },
  { value: 'overtime', label: '연장 근로 수당' },
  { value: 'bonus', label: '상여금' },
];

const currentAmount = ref(formData.currentAmount);
const adjustedAmount = ref(formData.adjustedAmount);
const reason = ref(formData.reason);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const selectType = (option: { label: string, value: string }) => {
  selectedType.value = option;
  formData.adjustmentType = option.value;
  isOpen.value = false;
};

// 숫자 포맷팅 (천 단위 콤마)
const formatNumber = (num: number) => {
  return num.toLocaleString('ko-KR');
};

// formData 변경 시 부모에게 자동 전달
watch(
  [() => formData.adjustmentType, currentAmount, adjustedAmount, reason],
  ([newType, newCurrentAmount, newAdjustedAmount, newReason]) => {
    formData.currentAmount = newCurrentAmount;
    formData.adjustedAmount = newAdjustedAmount;
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

.dropdown-box:hover, .dropdown-box.is-open {
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
  width: 100px;
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

</style>