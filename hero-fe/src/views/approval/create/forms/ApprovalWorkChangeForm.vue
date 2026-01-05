<!--
  * <pre>
  * Vue Name        : ApprovalWorkChangeForm.vue
  * Description     : 근무변경신청서
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
  * 2026/01/06 (민철) 주석 제거
  * </pre>
  *
  * @module approval
  * @author 민철
  * @version 3.2
-->
<template>
  <div class="detail-form-section">
    <div v-if="activePicker || isDropdownOpen" class="overlay-backdrop" @click="closeAllPickers"></div>

    <div class="form-row">
      <div class="row-label">
        <span class="label-text">근무 변경 정보</span>
      </div>
      <div class="row-content">
        <div class="section-body">

          <div class="input-group-row">
            <div class="input-group col-half">
              <div class="group-label group-label-with-icon">
                <img class="icon-label" src="/images/vacation.svg" alt="date" />
                <span class="label-text">근무 유형 {{ readonly ? '' : '*' }}</span>
              </div>

              <div v-if="readonly" class="readonly-value">
                <span class="value-text">{{ formData.workSystemTemplate || '-' }}</span>
              </div>

              <div v-else class="dropdown-box" :class="{ 'is-open': isDropdownOpen }" @click.stop="toggleDropdown">
                <div class="dropdown-value">
                  <span :class="formData.workSystemTemplate ? 'text-selected' : 'placeholder-text'">
                    {{ currentWorkSystemName || '선택하세요' }}
                  </span>
                </div>
                <img class="icon-dropdown" :class="{ 'rotate': isDropdownOpen }" src="/images/dropdownarrow.svg"
                  alt="dropdown" />

                <ul v-if="isDropdownOpen" class="dropdown-options">
                  <li v-for="option in workSystemTypes" :key="option.workSystemTypeId" class="dropdown-item"
                    @click.stop="selectWorkSystemType(option)">
                    {{ option.workSystemTypeName }}
                  </li>
                </ul>
              </div>
            </div>

            <div class="input-group col-half">
              <div class="group-label group-label-with-icon">
                <img class="icon-label" src="/images/vacation.svg" alt="date" />
                <span class="label-text">적용일 {{ readonly ? '' : '*' }}</span>
              </div>

              <div v-if="readonly" class="readonly-value">
                <span class="value-text">{{ formatReadOnlyDate(formData.applyDate) }}</span>
              </div>
              <div v-else class="date-input-box">
                <input type="date" v-model="formData.applyDate" class="native-input" />
              </div>
            </div>
          </div>

          <div class="input-group-row mt-16">
            <div class="input-group col-half relative-box">
              <div class="group-label group-label-with-icon">
                <img class="icon-label" src="/images/clock.svg" alt="time" />
                <span class="label-text">근무 시작 {{ readonly ? '' : '*' }}</span>
              </div>

              <div v-if="readonly" class="readonly-value">
                <span class="value-text">{{ formatReadOnlyTime(formData.startTime) || '-' }}</span>
              </div>

              <div v-else class="date-input-box pointer" :class="{ 'active-border': activePicker === 'start' }"
                @click="openPicker('start')">
                <span :class="formData.startTime ? 'text-value' : 'placeholder-text'">
                  {{ formData.startTime || '09:00' }}
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
                <span class="label-text">근무 종료 {{ readonly ? '' : '*' }}</span>
              </div>

              <div v-if="readonly" class="readonly-value">
                <span class="value-text">{{ formatReadOnlyTime(formData.endTime) || '-' }}</span>
              </div>

              <div v-else class="date-input-box pointer" :class="{ 'active-border': activePicker === 'end' }"
                @click="openPicker('end')">
                <span :class="formData.endTime ? 'text-value' : 'placeholder-text'">
                  {{ formData.endTime || '18:00' }}
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
        <span class="label-text">사유</span>
      </div>
      <div class="row-content reason-content">
        <div v-if="readonly" class="readonly-textarea">
          <span class="value-text">{{ formData.reason || '-' }}</span>
        </div>
        <textarea v-else v-model="formData.reason" class="input-textarea" placeholder="사유를 입력하세요"></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted } from 'vue';
import { useApprovalDataStore } from '@/stores/approval/approval_data.store';
import { storeToRefs } from 'pinia';
import type { WorkSystemTypeResponseDTO } from '@/types/approval/approval_data.types';

// Props & Emits
const props = defineProps<{
  modelValue?: ChangeWorkFormData;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: ChangeWorkFormData];
}>();

export interface ChangeWorkFormData {
  workSystemTemplate: number;
  applyDate: string;
  startTime: string;
  endTime: string;
  reason: string;
}

// Store
const approvalDataStore = useApprovalDataStore();
const { workSystemTypes } = storeToRefs(approvalDataStore);

onMounted(async () => {
  if (!workSystemTypes.value || workSystemTypes.value.length === 0) {
    await approvalDataStore.fetchWorkSystemTypes();
  }
});

// --- State Management ---

// formData 초기화 (props가 없으면 기본값)
const formData = reactive<ChangeWorkFormData>({
  workSystemTemplate: props.modelValue?.workSystemTemplate || 0,
  applyDate: props.modelValue?.applyDate || '',
  startTime: props.modelValue?.startTime || '09:00',
  endTime: props.modelValue?.endTime || '18:00',
  reason: props.modelValue?.reason || ''
});

// [동기화 1] 부모 -> 자식 (API 조회 데이터 등)
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    Object.assign(formData, newVal);
  }
}, { deep: true });

// [동기화 2] 자식 -> 부모 (폼 변경 시 자동 emit)
watch(formData, (newVal) => {
  emit('update:modelValue', { ...newVal });
}, { deep: true });


const isDropdownOpen = ref(false);

const toggleDropdown = () => {
  if (props.readonly) return;
  isDropdownOpen.value = !isDropdownOpen.value;
};

const currentWorkSystemName = computed(() => {
  const workSystemTemplateId = formData.workSystemTemplate;

  if (!workSystemTemplateId) return null;

  if (!workSystemTypes.value) return workSystemTemplateId;

  const matched = workSystemTypes.value.find(w => w.workSystemTypeId === workSystemTemplateId);

  return matched ? matched.workSystemTypeName : workSystemTemplateId;

});

const selectWorkSystemType = (option: WorkSystemTypeResponseDTO) => {
  if (props.readonly) return;
  formData.workSystemTemplate = option.workSystemTypeId;
  isDropdownOpen.value = false;
};


const activePicker = ref<'start' | 'end' | null>(null);
const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

const openPicker = (type: 'start' | 'end') => {
  if (props.readonly) return;
  activePicker.value = type;
};

const closeAllPickers = () => {
  activePicker.value = null;
  isDropdownOpen.value = false;
};

const getHour = (timeStr: string) => timeStr ? timeStr.split(':')[0] : '09';
const getMinute = (timeStr: string) => timeStr ? timeStr.split(':')[1] : '00';

const updateTime = (type: 'start' | 'end', field: 'hour' | 'minute', value: string) => {
  const targetKey = type === 'start' ? 'startTime' : 'endTime';
  const currentVal = formData[targetKey] || (type === 'start' ? '09:00' : '18:00');

  let [h, m] = currentVal.split(':');

  if (field === 'hour') h = value;
  else m = value;

  formData[targetKey] = `${h}:${m}`;
};


/// --- Readonly Formatters ---
const formatReadOnlyDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) return dateStr;
  return `${year}년 ${month}월 ${day}일`;
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