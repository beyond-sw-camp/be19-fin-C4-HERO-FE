<!--
  * <pre>
  * Vue Name        : ApprovalAppointmentForm.vue
  * Description     : 인사발령품의서
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
      v-if="activeDropdown" 
      class="overlay-backdrop" 
      @click="closeDropdown"
    ></div>

    <div class="form-row">
      <div class="row-label label-bottom">
        <span class="label-text">인사발령 정보</span>
      </div>
      <div class="row-content">
        <div class="section-body">
          
          <div class="input-group-row">
            <div class="input-group col-half">
              <div class="group-label">
                <span class="label-text">발령 유형</span>
              </div>
              <div 
                class="dropdown-box" 
                :class="{ 'is-open': activeDropdown === 'type' }" 
                @click.stop="toggleDropdown('type')"
              >
                <div class="dropdown-value">
                  <span :class="selectedType ? 'text-selected' : 'placeholder-text'">
                    {{ selectedType ? selectedType.label : '선택하세요' }}
                  </span>
                </div>
                <img 
                  class="icon-dropdown" 
                  :class="{ 'rotate': activeDropdown === 'type' }"
                  src="/images/dropdownarrow.svg" 
                  alt="arrow" 
                />
                <ul v-if="activeDropdown === 'type'" class="dropdown-options">
                  <li 
                    v-for="option in typeOptions" 
                    :key="option.value" 
                    class="dropdown-item" 
                    @click.stop="selectOption('type', option)"
                  >
                    {{ option.label }}
                  </li>
                </ul>
              </div>
            </div>

            <div class="input-group col-half">
              <div class="group-label group-label-with-icon">
                <img class="icon-label" src="/images/vacation.svg" alt="date" />
                <span class="label-text">발령시행일자</span>
              </div>
              <div class="date-input-box">
                <input type="date" v-model="effectiveDate" class="native-input" />
              </div>
            </div>
          </div>

          <div class="input-group-row mt-20">
            <div class="input-group col-half">
              <div class="group-label">
                <span class="label-text">대상 직원 사번</span>
              </div>
              <div class="text-input-box">
                <input 
                  type="text" 
                  v-model="employeeId" 
                  class="native-input" 
                  placeholder="사번 입력" 
                />
              </div>
            </div>

            <div class="input-group col-half">
              <div class="group-label">
                <span class="label-text">대상 직원 이름</span>
              </div>
              <div class="text-input-box">
                <input 
                  type="text" 
                  v-model="employeeName" 
                  class="native-input" 
                  placeholder="이름 입력" 
                />
              </div>
            </div>
          </div>

          <div class="section-title mt-30">현재 정보</div>
          <div class="input-group-row">
            <div class="input-group col-quarter">
              <div class="group-label"><span class="label-text">현재 부서</span></div>
              <div class="text-input-box readonly">
                <input type="text" :value="currentInfo.dept" class="native-input" readonly />
              </div>
            </div>
            <div class="input-group col-quarter">
              <div class="group-label"><span class="label-text">현재 직책</span></div>
              <div class="text-input-box readonly">
                <input type="text" :value="currentInfo.duty" class="native-input" readonly />
              </div>
            </div>
            <div class="input-group col-quarter">
              <div class="group-label"><span class="label-text">현재 직급</span></div>
              <div class="text-input-box readonly">
                <input type="text" :value="currentInfo.position" class="native-input" readonly />
              </div>
            </div>
            <div class="input-group col-quarter"></div>
          </div>

          <div class="section-title mt-30">발령 후 정보</div>
          <div class="input-group-row">
            
            <div class="input-group col-quarter">
              <div class="group-label"><span class="label-text">발령 부서</span></div>
              <div 
                class="dropdown-box" 
                :class="{ 'is-open': activeDropdown === 'newDept' }"
                @click.stop="toggleDropdown('newDept')"
              >
                <div class="dropdown-value">
                  <span :class="newInfo.dept ? 'text-selected' : 'placeholder-text'">
                    {{ newInfo.dept ? newInfo.dept.label : '선택하세요' }}
                  </span>
                </div>
                <img 
                  class="icon-dropdown" 
                  :class="{ 'rotate': activeDropdown === 'newDept' }" 
                  src="/images/dropdownarrow.svg" 
                  alt="arrow" 
                />
                <ul v-if="activeDropdown === 'newDept'" class="dropdown-options">
                  <li 
                    v-for="opt in deptOptions" 
                    :key="opt.value" 
                    class="dropdown-item" 
                    @click.stop="selectOption('newDept', opt)"
                  >
                    {{ opt.label }}
                  </li>
                </ul>
              </div>
            </div>

            <div class="input-group col-quarter">
              <div class="group-label"><span class="label-text">발령 직책</span></div>
              <div 
                class="dropdown-box" 
                :class="{ 'is-open': activeDropdown === 'gradeAfter' }" 
                @click.stop="toggleDropdown('gradeAfter')"
              >
                <div class="dropdown-value">
                  <span :class="newInfo.duty ? 'text-selected' : 'placeholder-text'">
                    {{ newInfo.duty ? newInfo.duty.label : '선택하세요' }}
                  </span>
                </div>
                <img 
                  class="icon-dropdown" 
                  :class="{ 'rotate': activeDropdown === 'gradeAfter' }" 
                  src="/images/dropdownarrow.svg" 
                  alt="arrow" 
                />
                <ul v-if="activeDropdown === 'gradeAfter'" class="dropdown-options">
                  <li 
                    v-for="opt in dutyOptions" 
                    :key="opt.value" 
                    class="dropdown-item" 
                    @click.stop="selectOption('gradeAfter', opt)"
                  >
                    {{ opt.label }}
                  </li>
                </ul>
              </div>
            </div>

            <div class="input-group col-quarter">
              <div class="group-label"><span class="label-text">발령 직급</span></div>
              <div 
                class="dropdown-box" 
                :class="{ 'is-open': activeDropdown === 'newPosition' }" 
                @click.stop="toggleDropdown('newPosition')"
              >
                <div class="dropdown-value">
                  <span :class="newInfo.position ? 'text-selected' : 'placeholder-text'">
                    {{ newInfo.position ? newInfo.position.label : '선택하세요' }}
                  </span>
                </div>
                <img 
                  class="icon-dropdown" 
                  :class="{ 'rotate': activeDropdown === 'newPosition' }" 
                  src="/images/dropdownarrow.svg" 
                  alt="arrow" 
                />
                <ul v-if="activeDropdown === 'newPosition'" class="dropdown-options">
                  <li 
                    v-for="opt in positionOptions" 
                    :key="opt.value" 
                    class="dropdown-item" 
                    @click.stop="selectOption('newPosition', opt)"
                  >
                    {{ opt.label }}
                  </li>
                </ul>
              </div>
            </div>

            <div class="input-group col-quarter">
              <div class="group-label"><span class="label-text">근무상태</span></div>
              <div 
                class="dropdown-box" 
                :class="{ 'is-open': activeDropdown === 'status' }" 
                @click.stop="toggleDropdown('status')"
              >
                <div class="dropdown-value">
                  <span :class="newInfo.status ? 'text-selected' : 'placeholder-text'">
                    {{ newInfo.status ? newInfo.status.label : '선택하세요' }}
                  </span>
                </div>
                <img 
                  class="icon-dropdown" 
                  :class="{ 'rotate': activeDropdown === 'status' }" 
                  src="/images/dropdownarrow.svg" 
                  alt="arrow" 
                />
                <ul v-if="activeDropdown === 'status'" class="dropdown-options">
                  <li 
                    v-for="opt in statusOptions" 
                    :key="opt.value" 
                    class="dropdown-item" 
                    @click.stop="selectOption('status', opt)"
                  >
                    {{ opt.label }}
                  </li>
                </ul>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted} from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';

// v-model을 위한 Props와 Emits
const props = defineProps<{
  modelValue?: PersonnelAppointmentFormData;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: PersonnelAppointmentFormData];
}>();

// 타입 정의
export interface PersonnelAppointmentFormData {
  changeType: string;         // 발령 유형
  employeeId: number;         // 대상 사원 ID
  employeeName: string;       // 대상 사원 이름
  effectiveDate: string;      // 발령 효력 발생일
  departmentBefore: string;   // 현재 부서
  gradeBefore: string;        // 현재 직급
  jobTitleBefore: string;     // 현재 직책
  departmentAfter: string;    // 신규 부서
  gradeAfter: string;         // 신규 직급
  jobTitleAfter: string;        // 신규 직책
  status: string;             // 근무상태
  auditDate: string;          // 기안일
}

const userStore = useAuthStore();
const { user } = storeToRefs(userStore);

// 폼 데이터 (reactive로 관리)
const formData = reactive<PersonnelAppointmentFormData>({
  changeType: props.modelValue?.changeType || '',
  effectiveDate: props.modelValue?.effectiveDate || '',
  employeeId: props.modelValue?.employeeId || 0,
  employeeName: props.modelValue?.employeeName || '',
  departmentBefore: props.modelValue?.departmentBefore || user.value?.departmentName || '',
  gradeBefore: props.modelValue?.gradeBefore || user.value?.gradeName || '',
  jobTitleBefore: props.modelValue?.jobTitleBefore || user.value?.jobTitleName || '',
  departmentAfter: props.modelValue?.departmentAfter || '',
  gradeAfter: props.modelValue?.gradeAfter || '',
  jobTitleAfter: props.modelValue?.jobTitleAfter || '',
  status: props.modelValue?.status || '',
  auditDate: props.modelValue?.auditDate || ''
});

const effectiveDate = ref(formData.effectiveDate);
const employeeId = ref(formData.employeeId);
const employeeName = ref(formData.employeeName);
const selectedType = ref<{ label: string, value: string } | null>(null);
const auditDate = computed(() => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
});

const typeOptions = [
  { label: '정기 인사', value: 'regular' },
  { label: '수시 인사', value: 'spot' }
];

const currentInfo = reactive({
  dept: user?.value?.departmentName, 
  duty: user?.value?.gradeName, 
  position: user?.value?.jobTitleName 
});

const newInfo = reactive({
  dept: null as { label: string, value: string } | null,
  duty: null as { label: string, value: string } | null,
  position: null as { label: string, value: string } | null,
  status: null as { label: string, value: string } | null,
});

const deptOptions = [
  { label: '기획팀', value: 'planning' }, 
  { label: '영업팀', value: 'sales' }
];
const dutyOptions = [
  { label: '팀장', value: 'leader' }, 
  { label: '파트장', value: 'part_leader' }
];
const positionOptions = [
  { label: '책임', value: 'senior' }, 
  { label: '수석', value: 'principal' }
];
const statusOptions = [
  { label: '재직', value: 'working' }, 
  { label: '휴직', value: 'leave' }
];

const activeDropdown = ref<string | null>(null);

const toggleDropdown = (key: string) => {
  activeDropdown.value = activeDropdown.value === key ? null : key;
};

const closeDropdown = () => {
  activeDropdown.value = null;
};

const selectOption = (key: string, option: { label: string, value: string }) => {
  if (key === 'type') {
    selectedType.value = option;
    formData.changeType = option.value;
  } else if (key === 'departmentAfter') {
    newInfo.dept = option;
    formData.departmentAfter = option.value;
  } else if (key === 'gradeAfter') {
    newInfo.duty = option;
    formData.gradeAfter = option.value;
  } else if (key === 'jobTitleAfter') {
    newInfo.position = option;
    formData.jobTitleAfter = option.value;
  } else if (key === 'status') {
    newInfo.status = option;
    formData.status = option.value;
  }
  
  closeDropdown();
};

// formData 변경 시 부모에게 자동 전달
watch(
  [
    () => formData.changeType,
    effectiveDate,
    employeeId,
    employeeName,
    () => formData.departmentAfter,
    () => formData.gradeAfter,
    () => formData.jobTitleAfter,
    () => formData.status
  ],
  ([newType, newEffectiveDate, newemployeeId, newTargetEmpName, departmentAfter, gradeAfter, jobTitleAfter, newStatus]) => {
    formData.effectiveDate = newEffectiveDate;
    formData.employeeId = newemployeeId;
    formData.employeeName = newTargetEmpName;
    formData.departmentBefore = user.value?.departmentName || '';
    formData.gradeBefore = user.value?.gradeName || '';
    formData.jobTitleBefore = user.value  ?.jobTitleName || '';
    formData.departmentAfter = departmentAfter;
    formData.gradeAfter = gradeAfter;
    formData.jobTitleAfter = jobTitleAfter;
    formData.status = newStatus;
    formData.auditDate = auditDate.value;
    
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
  height: 20px;
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
  font-weight: 400;
}

.col-half {
  flex: 0 0 calc(50% - 8px);
  min-width: 200px;
}

.col-quarter {
  flex: 0 0 calc(25% - 12px);
  min-width: 150px;
}

.mt-20 {
  margin-top: 20px;
}

.mt-30 {
  margin-top: 30px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #0f172b;
  margin-bottom: 12px;
}

/* 입력 박스 공통 스타일 */
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

.text-input-box.readonly {
  background: #f8fafc;
  cursor: not-allowed;
}

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

.native-input:read-only {
  cursor: not-allowed;
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

.overlay-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: transparent;
  z-index: 40;
}
</style>