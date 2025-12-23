<!--
  * <pre>
  * Vue Name        : ApprovalWorkChangeForm.vue
  * Description     : 근무변경신청서
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
      v-if="activePicker || isDropdownOpen" 
      class="overlay-backdrop" 
      @click="closeAllPickers"
    ></div>

    <div class="form-row">
      <div class="row-label">
        <span class="label-text">근무 변경 정보</span>
      </div>
      <div class="row-content">
        <div class="section-body">
          
          <div class="input-group-row">
            
            <!-- 변경된 근무제 이름 -->
            <div class="input-group col-half">
              <div class="group-label">
                <span class="label-text">변경된 근무제 이름 *</span>
              </div>
              <div 
                class="dropdown-box" 
                :class="{ 'is-open': isDropdownOpen }" 
                @click.stop="toggleDropdown"
              >
                <div class="dropdown-value">
                  <span :class="selectedSchedule ? 'text-selected' : 'placeholder-text'">
                    {{ selectedSchedule ? selectedSchedule.label : '선택하세요' }}
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
                    v-for="option in scheduleOptions" 
                    :key="option.value" 
                    class="dropdown-item"
                    @click.stop="selectSchedule(option)"
                  >
                    {{ option.label }}
                  </li>
                </ul>
              </div>
            </div>

            <!-- 적용일 -->
            <div class="input-group col-half">
              <div class="group-label group-label-with-icon">
                <img class="icon-label" src="/images/vacation.svg" alt="date" />
                <span class="label-text">적용일 *</span>
              </div>
              <div class="date-input-box">
                <input 
                  type="date" 
                  v-model="applyDate" 
                  class="native-input"
                />
              </div>
            </div>
          </div>

          <!-- 근무시간 -->
          <div class="input-group-row mt-16">
            <div class="input-group col-half relative-box">
              <div class="group-label group-label-with-icon">
                <img class="icon-label" src="/images/clock.svg" alt="time" />
                <span class="label-text">근무 시작 *</span>
              </div>
              
              <div 
                class="date-input-box pointer" 
                :class="{ 'active-border': activePicker === 'start' }"
                @click="openPicker('start')"
              >
                <span :class="startTime.hour ? 'text-value' : 'placeholder-text'">
                  {{ formatTime(startTime) || '09:00' }}
                </span>
              </div>

              <div v-if="activePicker === 'start'" class="time-picker-dropdown">
                <div class="time-column">
                  <div 
                    v-for="h in hours" :key="h" 
                    class="time-cell"
                    @click.stop="selectTime('start', 'hour', h)"
                  >
                    <span :class="{ 'selected-text': startTime.hour === h }">{{ h }}</span>
                  </div>
                </div>
                <div class="time-column border-left">
                  <div 
                    v-for="m in minutes" :key="m" 
                    class="time-cell"
                    @click.stop="selectTime('start', 'minute', m)"
                  >
                    <span :class="{ 'selected-text': startTime.minute === m }">{{ m }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="input-group col-half relative-box">
              <div class="group-label group-label-with-icon">
                <img class="icon-label" src="/images/clock.svg" alt="time" />
                <span class="label-text">근무 종료 *</span>
              </div>

              <div 
                class="date-input-box pointer" 
                :class="{ 'active-border': activePicker === 'end' }"
                @click="openPicker('end')"
              >
                <span :class="endTime.hour ? 'text-value' : 'placeholder-text'">
                  {{ formatTime(endTime) || '18:00' }}
                </span>
              </div>

              <div v-if="activePicker === 'end'" class="time-picker-dropdown">
                <div class="time-column">
                  <div 
                    v-for="h in hours" :key="h" 
                    class="time-cell"
                    @click.stop="selectTime('end', 'hour', h)"
                  >
                    <span :class="{ 'selected-text': endTime.hour === h }">{{ h }}</span>
                  </div>
                </div>
                <div class="time-column border-left">
                  <div 
                    v-for="m in minutes" :key="m" 
                    class="time-cell"
                    @click.stop="selectTime('end', 'minute', m)"
                  >
                    <span :class="{ 'selected-text': endTime.minute === m }">{{ m }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
    
    <!-- 사유 -->
    <div class="form-row border-top">
      <div class="row-label label-bottom">
        <span class="label-text">신청사유</span>
      </div>
      <div class="row-content reason-content">
        <textarea 
          v-model="reason"
          class="input-textarea"
          placeholder="근무 변경 신청사유를 입력해 주세요."
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';

// v-model을 위한 Props와 Emits
const props = defineProps<{
  modelValue?: ChangeWorkFormData;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: ChangeWorkFormData];
}>();

// 타입 정의
export interface ChangeWorkFormData {
  workSystemName: string;
  applyDate: string;
  workStartTime: string;
  workEndTime: string;
  reason: string;
}

// 폼 데이터 (reactive로 관리)
const formData = reactive<ChangeWorkFormData>({
  workSystemName: props.modelValue?.workSystemName || '',
  applyDate: props.modelValue?.applyDate || '',
  workStartTime: props.modelValue?.workStartTime || '09:00',
  workEndTime: props.modelValue?.workEndTime || '18:00',
  reason: props.modelValue?.reason || ''
});

const reason = ref(formData.reason);
const applyDate = ref(formData.applyDate);

// 드롭다운
const isDropdownOpen = ref(false);
const selectedSchedule = ref<{ label: string, value: string } | null>(null);

const scheduleOptions = [
  { value: 'flexible', label: '선택적 근무시간제' },
  { value: 'shift', label: '교대 근무제' },
  { value: 'remote', label: '재택 근무제' },
];

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const selectSchedule = (option: { label: string, value: string }) => {
  selectedSchedule.value = option;
  formData.workSystemName = option.value;
  isDropdownOpen.value = false;
};

const parseTime = (timeStr: string) => {
  if (!timeStr) return { hour: '09', minute: '00' };
  const [hour, minute] = timeStr.split(':');
  return { hour: hour || '09', minute: minute || '00' };
};

const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

const startTime = reactive(parseTime(formData.workStartTime));
const endTime = reactive(parseTime(formData.workEndTime));
const activePicker = ref<string | null>(null);

const openPicker = (type: string) => {
  activePicker.value = type;
};

const closeAllPickers = () => {
  activePicker.value = null;
  isDropdownOpen.value = false;
};

const selectTime = (type: string, field: 'hour' | 'minute', value: string) => {
  if (type === 'start') {
    startTime[field] = value;
  } else {
    endTime[field] = value;
  }
};

const formatTime = (timeObj: { hour: string, minute: string }) => {
  return `${timeObj.hour}:${timeObj.minute}`;
};

const startTimeString = computed(() => formatTime(startTime));
const endTimeString = computed(() => formatTime(endTime));

// formData 변경 시 부모에게 자동 전달
watch(
  [() => formData.workSystemName, applyDate, startTimeString, endTimeString, reason],
  ([newWorkSystemName, newApplyDate, newStartTime, newEndTime, newReason]) => {
    formData.applyDate = newApplyDate;
    formData.workStartTime = newStartTime;
    formData.workEndTime = newEndTime;
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
  gap: 10px;
  flex-wrap: wrap;
}

.mt-16 {
  margin-top: 16px;
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

.group-label-with-icon {
  display: flex;
  align-items: center;
  gap: 6px;
}

.label-text {
  color: #45556c;
  font-size: 14px;
}

.icon-label {
  width: 16px;
  height: 16px;
}

.col-half {
  flex: 1;
  min-width: 200px;
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
}

.dropdown-value {
  display: flex;
  align-items: center;
  flex: 1;
}

.placeholder-text {
  color: #90a1b9;
  font-size: 15px;
}

.text-selected {
  color: #0f172b;
  font-size: 15px;
}

.text-value {
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
  color: #0f172b;
  font-size: 15px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f1f5f9;
}

.date-input-box {
  height: 46px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  background: #fff;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  transition: border-color 0.2s;
}

.date-input-box.pointer {
  cursor: pointer;
}

.date-input-box.active-border {
  border-color: #4f46e5;
}

.native-input {
  border: none;
  outline: none;
  width: 100%;
  height: 100%;
  background: transparent;
  font-family: "Inter-Regular", sans-serif;
  font-size: 14px;
  cursor: pointer;
}

.relative-box {
  position: relative;
}

.time-picker-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  height: 200px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  margin-top: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 50;
  display: flex;
  overflow: hidden;
}

.time-column {
  flex: 1;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: 8px 0;
  scrollbar-width: none;
}

.time-column::-webkit-scrollbar {
  display: none;
}

.border-left {
  border-left: 2px solid #f1f5f9;
}

.time-cell {
  padding: 8px 0;
  text-align: center;
  font-family: "Inter-Regular", sans-serif;
  font-size: 14px;
  color: #9fb3ce;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.time-cell:hover {
  background-color: #b8d0e9;
}

.selected-text {
  color: #4f46e5;
  font-weight: 600;
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