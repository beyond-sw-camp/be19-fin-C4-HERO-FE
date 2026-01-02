<!--
  * <pre>
  * Vue Name        : ApprovalPromotionForm.vue
  * Description     : 승진계획서
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
  * 2025/12/30 (민철) Watch 최적화, Computed 적용, 서식명 변경 근태기록수정신청서 -> 지연출근신청서
  * </pre>
  *
  * @module approval
  * @author 민철
  * @version 3.1
-->
<template>
  <div class="detail-form-section">
    <div v-if="activeTableDropdown" class="overlay-backdrop" @click="closeDropdown"></div>

    <div class="form-row">
      <div class="row-label">
        <span class="label-text">승진 일정</span>
      </div>
      <div class="row-content">
        <div class="section-body">
          <div class="input-group-row">
            <div class="input-group col-half">
              <div class="group-label">
                <span class="label-text">추천 마감일 {{ readonly ? '' : '*' }}</span>
              </div>
              <div v-if="readonly" class="readonly-value">
                <span class="value-text">{{ formData.nominationDeadlineAt || '-' }}</span>
              </div>
              <div v-else class="date-input-box">
                <input type="date" v-model="formData.nominationDeadlineAt" class="native-input" />
              </div>
            </div>
            <div class="input-group col-half">
              <div class="group-label">
                <span class="label-text">발령 예정일 {{ readonly ? '' : '*' }}</span>
              </div>
              <div v-if="readonly" class="readonly-value">
                <span class="value-text">{{ formData.appointmentAt || '-' }}</span>
              </div>
              <div v-else class="date-input-box">
                <input type="date" v-model="formData.appointmentAt" class="native-input" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="form-row border-top">
      <div class="row-label">
        <span class="label-text">부서별 승진 TO</span>
      </div>
      <div class="row-content table-content">
        <div class="section-body">

          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 60px;">번호</th>
                  <th>대상 부서</th>
                  <th>승진 후 직급</th>
                  <th style="width: 100px;">대상 수</th>
                  <th v-if="!readonly" style="width: 60px;">삭제</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in formData.detailPlan" :key="index">
                  <td class="text-center">{{ index + 1 }}</td>

                  <td>
                    <div v-if="readonly" class="cell-text text-center">
                      {{ getLabel('dept', item.departmentId) }}
                    </div>

                    <div v-else class="cell-dropdown-wrapper">
                      <div class="dropdown-box table-dropdown"
                        :class="{ 'is-open': activeTableDropdown === `${index}-dept` }"
                        @click.stop="toggleTableDropdown(index, 'dept')">
                        <div class="dropdown-value">
                          <span :class="item.departmentId ? 'text-selected' : 'placeholder-text'">
                            {{ getLabel('dept', item.departmentId) === '-' ? '선택' : getLabel('dept', item.departmentId)
                            }}
                          </span>
                        </div>
                        <img class="icon-dropdown" :class="{ 'rotate': activeTableDropdown === `${index}-dept` }"
                          src="/images/dropdownarrow.svg" alt="arrow" />

                        <ul v-if="activeTableDropdown === `${index}-dept`" class="dropdown-options">
                          <li v-for="dept in personnelTypes?.departments" :key="dept.departmentId" class="dropdown-item"
                            @click.stop="selectItem(index, 'departmentId', dept.departmentId)">
                            {{ dept.departmentName }}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div v-if="readonly" class="cell-text text-center">
                      {{ getLabel('grade', item.gradeId) }}
                    </div>

                    <div v-else class="cell-dropdown-wrapper">
                      <div class="dropdown-box table-dropdown"
                        :class="{ 'is-open': activeTableDropdown === `${index}-grade` }"
                        @click.stop="toggleTableDropdown(index, 'grade')">
                        <div class="dropdown-value">
                          <span :class="item.gradeId ? 'text-selected' : 'placeholder-text'">
                            {{ getLabel('grade', item.gradeId) === '-' ? '선택' : getLabel('grade', item.gradeId) }}
                          </span>
                        </div>
                        <img class="icon-dropdown" :class="{ 'rotate': activeTableDropdown === `${index}-grade` }"
                          src="/images/dropdownarrow.svg" alt="arrow" />

                        <ul v-if="activeTableDropdown === `${index}-grade`" class="dropdown-options">
                          <li v-for="grade in personnelTypes?.grades" :key="grade.gradeId" class="dropdown-item"
                            @click.stop="selectItem(index, 'gradeId', grade.gradeId)">
                            {{ grade.grade }}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div v-if="readonly" class="cell-text text-center">
                      {{ item.quotaCount }} 명
                    </div>
                    <input v-else type="number" v-model.number="item.quotaCount" class="table-input text-center" min="0"
                      placeholder="0" />
                  </td>

                  <td v-if="!readonly" class="text-center">
                    <button type="button" class="btn-delete" @click="removeRow(index)">✕</button>
                  </td>
                </tr>

                <tr v-if="formData.detailPlan.length === 0">
                  <td :colspan="readonly ? 4 : 5" class="empty-text">
                    {{ readonly ? '등록된 승진 계획이 없습니다.' : '승진 계획을 추가해주세요.' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="!readonly" class="button-area">
            <button type="button" class="btn-add" @click="addRow">+ 행 추가</button>
          </div>

        </div>
      </div>
    </div>

    <div class="form-row border-top">
      <div class="row-label label-bottom">
        <span class="label-text">계획 상세 내용</span>
      </div>
      <div class="row-content reason-content">
        <div v-if="readonly" class="readonly-textarea">
          <span class="value-text">{{ formData.planContent || '-' }}</span>
        </div>
        <textarea v-else v-model="formData.planContent" class="input-textarea"
          placeholder="승진 계획에 대한 상세 내용을 입력해주세요."></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, ref, onMounted } from 'vue';
import { useApprovalDataStore } from '@/stores/approval/approval_data.store';
import { storeToRefs } from 'pinia';

// --- Store ---
const approvalDataStore = useApprovalDataStore();
const { personnelTypes } = storeToRefs(approvalDataStore); // departments, grades 등이 들어있음

onMounted(async () => {
  // 데이터가 없으면 로드 (중복 호출 방지)
  if (!personnelTypes.value?.departments ||
    (personnelTypes.value.departments.length === 0 &&
      personnelTypes.value.grades.length === 0)
  ) {
    await approvalDataStore.fetchPersonnelTypes();
  }
});

// --- Types ---
interface DetailPlanItem {
  departmentId: number;
  gradeId: number;
  quotaCount: number;
}

export interface PromotionPlanFormData {
  nominationDeadlineAt: string;
  appointmentAt: string;
  planContent: string;
  detailPlan: DetailPlanItem[];
}

// --- Props & Emits ---
const props = defineProps<{
  modelValue?: PromotionPlanFormData;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: PromotionPlanFormData];
}>();

// --- State Management ---
const formData = reactive<PromotionPlanFormData>({
  nominationDeadlineAt: props.modelValue?.nominationDeadlineAt || '',
  appointmentAt: props.modelValue?.appointmentAt || '',
  planContent: props.modelValue?.planContent || '',
  detailPlan: props.modelValue?.detailPlan || (props.readonly ? [] : [
    { departmentId: 0, gradeId: 0, quotaCount: 0 }
  ])
});

// [동기화]
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    Object.assign(formData, newVal);
    // 배열 딥카피
    if (newVal.detailPlan) {
      formData.detailPlan = newVal.detailPlan.map(item => ({ ...item }));
    }
  }
}, { deep: true });

watch(formData, (newVal) => {
  if (!props.readonly) {
    emit('update:modelValue', { ...newVal });
  }
}, { deep: true });


// --- Actions ---
const addRow = () => {
  formData.detailPlan.push({
    departmentId: 0,
    gradeId: 0,
    quotaCount: 0
  });
};

const removeRow = (index: number) => {
  formData.detailPlan.splice(index, 1);
};


// --- Table Dropdown Logic ---
const activeTableDropdown = ref<string | null>(null);

const toggleTableDropdown = (index: number, type: 'dept' | 'grade') => {
  if (props.readonly) return;
  const key = `${index}-${type}`;
  activeTableDropdown.value = activeTableDropdown.value === key ? null : key;
};

const closeDropdown = () => {
  activeTableDropdown.value = null;
};

const selectItem = (index: number, field: keyof DetailPlanItem, value: number) => {
  if (props.readonly) return;
  const row = formData.detailPlan[index];
  if (row) {
    // @ts-ignore
    row[field] = value;
  }
  closeDropdown();
};


// --- Helper: ID -> Label 변환 (Store 데이터 사용) ---
const getLabel = (type: 'dept' | 'grade', id: number) => {
  if (!id || !personnelTypes.value) return '-';

  if (type === 'dept' && personnelTypes.value.departments) {
    const found = personnelTypes.value.departments.find(d => d.departmentId === id);
    return found ? found.departmentName : '-';
  }

  if (type === 'grade' && personnelTypes.value.grades) {
    const found = personnelTypes.value.grades.find(g => g.gradeId === id);
    return found ? found.grade : '-';
  }

  return '-';
};

</script>

<style scoped>
/* 공통 레이아웃 */
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

.label-text {
  color: #45556c;
  font-size: 14px;
  font-weight: 400;
}

.col-half {
  flex: 1;
  min-width: 200px;
}

/* 날짜 입력 박스 & Readonly 박스 */
.date-input-box,
.readonly-value {
  height: 40px;
  /* 테이블 입력 높이와 맞춤 */
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  /* 테이블 스타일과 유사하게 */
  padding: 0 12px;
  display: flex;
  align-items: center;
  background: #fff;
  width: 100%;
}

.readonly-value {
  background: #f8fafc;
  border-color: #e2e8f0;
}

.value-text {
  font-size: 14px;
  color: #334155;
}

.native-input {
  border: none;
  outline: none;
  width: 100%;
  background: transparent;
  font-size: 14px;
  color: #0f172b;
  font-family: "Inter-Regular", sans-serif;
}

/* --- 테이블 스타일 --- */
.table-wrapper {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 10px;
  /* overflow: hidden 제거: 드롭다운 메뉴가 테이블 밖으로 나올 수 있게 함 */
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table th {
  background-color: #f8fafc;
  color: #45556c;
  font-weight: 600;
  padding: 10px;
  border-bottom: 1px solid #e2e8f0;
  text-align: center;
}

.data-table td {
  padding: 4px;
  /* 드롭다운 여백 확보를 위해 약간의 패딩 */
  border-bottom: 1px solid #e2e8f0;
  background-color: #fff;
  vertical-align: middle;
}

.data-table tr:last-child td {
  border-bottom: none;
}


/* --- 커스텀 드롭다운 스타일 (테이블용 수정) --- */
.cell-dropdown-wrapper {
  width: 100%;
  position: relative;
}

.dropdown-box.table-dropdown {
  height: 36px;
  /* 테이블 셀에 맞게 높이 조정 */
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  cursor: pointer;
  width: 100%;
  border: 1px solid #e2e8f0;
  /* 테두리 추가 */
}

.dropdown-box.table-dropdown:hover,
.dropdown-box.is-open {
  border-color: #cbd5e1;
  z-index: 50;
}

.dropdown-value {
  flex: 1;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.placeholder-text {
  color: #90a1b9;
  font-size: 14px;
}

.text-selected {
  color: #0f172b;
  font-size: 14px;
}

.icon-dropdown {
  width: 14px;
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
  border-radius: 8px;
  margin-top: 4px;
  padding: 0;
  list-style: none;
  z-index: 100;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
}

.dropdown-options::-webkit-scrollbar {
  width: 6px;
}

.dropdown-options::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 3px;
}

.dropdown-options::-webkit-scrollbar-track {
  background-color: transparent;
}

.dropdown-item {
  padding: 8px 10px;
  font-size: 13px;
  color: #0f172b;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #f1f5f9;
}

.table-input {
  width: 100%;
  height: 36px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  outline: none;
  padding: 0 10px;
  font-size: 14px;
  color: #0f172b;
}

.table-input:focus {
  border-color: #cbd5e1;
}

.cell-text {
  padding: 8px;
  font-size: 14px;
  color: #334155;
  background-color: #fcfcfc;
  border-radius: 6px;
}

.text-center {
  text-align: center;
}


.btn-delete {
  background: transparent;
  border: none;
  color: #ef4444;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.btn-delete:hover {
  color: #dc2626;
}

.empty-text {
  padding: 20px;
  text-align: center;
  color: #90a1b9;
}

.button-area {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.btn-add {
  width: 100%;
  padding: 8px;
  background-color: #fff;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  color: #64748b;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background-color: #eff6ff;
}

.reason-content {
  flex-direction: column;
}

.input-textarea,
.readonly-textarea {
  width: 100%;
  height: 150px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  resize: none;
  font-family: "Inter-Regular", sans-serif;
  font-size: 14px;
  color: #0f172b;
  outline: none;
}

.readonly-textarea {
  background-color: #f8fafc;
  overflow-y: auto;
  white-space: pre-wrap;
}

.input-textarea:focus {
  border-color: #cbd5e1;
}

.input-textarea::placeholder {
  color: #90a1b9;
}

.overlay-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 40;
}
</style>