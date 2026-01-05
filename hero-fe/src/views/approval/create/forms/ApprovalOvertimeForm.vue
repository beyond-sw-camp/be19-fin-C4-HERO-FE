<!--
  * <pre>
  * Vue Name        : ApprovalOvertimeForm.vue
  * Description     : 초과근무신청서
  *
  * 컴포넌트 연계
  *  - 부모 컴포넌트: ApprovalCreateCommonForm.vue
  *
  * History
  *   2025/12/10 - 민철 최초 작성
  *   2025/12/14 - 민철 공통 컴포넌트화
  *   2025/12/23 - 민철 파일명 변경
  *   2025/12/30 - 지윤 초과 근무 로직을 위한 함수(watch) 추가 및 수정
  *   2026/01/06 - 민철 주석 제거
  * </pre>
  *
  * @module approval
  * @author 민철
  * @version 3.2
-->
<template>
  <div class="detail-form-section">
    <div v-if="activePicker" class="overlay-backdrop" @click="closePicker"></div>

    <div class="form-row">
      <div class="row-label">
        <span class="label-text">초과근무신청정보</span>
      </div>
      <div class="row-content">
        <div class="section-body">

          <div class="input-group-row mt-20">
            <div class="input-group col-half">
              <div class="group-label group-label-with-icon">
                <img class="icon-label" src="/images/vacation.svg" alt="date" />
                <span class="label-text">근무 날짜 {{ readonly ? '' : '*' }}</span>
              </div>

              <div v-if="readonly" class="readonly-value">
                <span class="value-text">{{ formatReadOnlyDate(formData.workDate) }}</span>
              </div>

              <div v-else class="date-input-box">
                <input type="date" v-model="formData.workDate" class="native-input" required />
              </div>
            </div>

            <div class="input-group col-half relative-box">
              <div class="group-label group-label-with-icon">
                <img class="icon-label" src="/images/clock.svg" alt="time" />
                <span class="label-text">시작 시간 {{ readonly ? '' : '*' }}</span>
              </div>

              <div v-if="readonly" class="readonly-value">
                <span class="value-text">{{ formatReadOnlyTime(formData.startTime) }}</span>
              </div>

              <div v-else class="date-input-box pointer" :class="{ 'active-border': activePicker === 'start' }"
                @click="openPicker('start')">
                <span :class="formData.startTime ? 'text-value' : 'placeholder-text'">
                  {{ formData.startTime || '18:00' }}
                </span>
              </div>

              <div v-if="activePicker === 'start'" class="time-picker-dropdown">
                <div class="time-column">
                  <div v-for="h in hours" :key="h" class="time-cell" @click.stop="updateTime('start', 'hour', h)">
                    <span :class="{ 'selected-text': getHour(formData.startTime) === h }">{{ h }}</span>
                  </div>
                </div>
                <div class="time-column border-left">
                  <div v-for="m in minutes" :key="m" class="time-cell" @click.stop="updateTime('start', 'minute', m)">
                    <span :class="{ 'selected-text': getMinute(formData.startTime) === m }">{{ m }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="input-group col-half relative-box">
              <div class="group-label group-label-with-icon">
                <img class="icon-label" src="/images/clock.svg" alt="time" />
                <span class="label-text">종료 시간 {{ readonly ? '' : '*' }}</span>
              </div>

              <div v-if="readonly" class="readonly-value">
                <span class="value-text">{{ formatReadOnlyTime(formData.endTime) }}</span>
              </div>

              <div v-else class="date-input-box pointer" :class="{ 'active-border': activePicker === 'end' }"
                @click="openPicker('end')">
                <span :class="formData.endTime ? 'text-value' : 'placeholder-text'">
                  {{ formData.endTime || '21:00' }}
                </span>
              </div>

              <div v-if="activePicker === 'end'" class="time-picker-dropdown">
                <div class="time-column">
                  <div v-for="h in hours" :key="h" class="time-cell" @click.stop="updateTime('end', 'hour', h)">
                    <span :class="{ 'selected-text': getHour(formData.endTime) === h }">{{ h }}</span>
                  </div>
                </div>
                <div class="time-column border-left">
                  <div v-for="m in minutes" :key="m" class="time-cell" @click.stop="updateTime('end', 'minute', m)">
                    <span :class="{ 'selected-text': getMinute(formData.endTime) === m }">{{ m }}</span>
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
        <span class="label-text">신청사유</span>
      </div>
      <div class="row-content reason-content">
        <div v-if="readonly" class="readonly-textarea">
          <span class="value-text">{{ formData.reason || '-' }}</span>
        </div>
        <textarea v-else v-model="formData.reason" class="input-textarea" placeholder="초과근무 신청사유를 입력해 주세요."></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';

const props = defineProps<{
  modelValue?: OvertimeFormData;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: OvertimeFormData];
}>();

export interface OvertimeFormData {
  workDate: string;
  startTime: string;
  endTime: string;
  reason: string;
}

const formData = reactive<OvertimeFormData>({
  workDate: props.modelValue?.workDate || '',
  startTime: props.modelValue?.startTime || '18:00',
  endTime: props.modelValue?.endTime || '21:00',
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


const activePicker = ref<'start' | 'end' | null>(null);
const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

const openPicker = (type: 'start' | 'end') => {
  if (props.readonly) return;
  activePicker.value = type;
};

const closePicker = () => {
  activePicker.value = null;
};

const getHour = (timeStr: string) => timeStr ? timeStr.split(':')[0] : '18';
const getMinute = (timeStr: string) => timeStr ? timeStr.split(':')[1] : '00';

const updateTime = (type: 'start' | 'end', unit: 'hour' | 'minute', value: string) => {
  const targetKey = type === 'start' ? 'startTime' : 'endTime';
  const currentVal = formData[targetKey] || (type === 'start' ? '18:00' : '21:00');

  let [h, m] = currentVal.split(':');

  if (unit === 'hour') h = value;
  else m = value;

  formData[targetKey] = `${h}:${m}`;
};


// --- Readonly Formatters ---
const formatReadOnlyDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
};

const formatReadOnlyTime = (time: string) => {
  if (!time) return '-';
  const [hour, minute] = time.split(':');
  return `${hour}시 ${minute}분`;
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
  gap: 10px;
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
  min-width: 0;
}

.mt-20 {
  margin-top: 0px;
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

.placeholder-text {
  color: #90a1b9;
  font-size: 15px;
}

.text-value {
  color: #0f172b;
  font-size: 15px;
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

.time-cell span.selected-text {
  color: #4f46e5;
  font-weight: bold;
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