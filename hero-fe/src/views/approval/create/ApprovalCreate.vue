<!--
 * <pre>
 * Vue Name        : ApprovalCreate.vue
 * Description     : 작성화면
 *
 * 컴포넌트 연계
 * - 문서 상세 조회
 * - ApprovalTemplates.vue: 새 결재 작성 버튼 클릭 시 결재문서서식페이지로 라우팅
 *
 * History
 *   2025/12/14 (민철) 공통 컴포넌트화
 *   2025/12/23 (민철) 파일명 변경 
 *   2025/12/24 (민철) 작성 UI 최종 구현(제목/분류/결재선/참고목록 지정)
 *   2025/12/25 (민철) 서식 목록에서 서식ID 쿼리스트링으로 전달받기
 *   2025/12/26 (민철) Composable 사용 및 타입 안정성 개선, 미리보기 주석처리
 *   2025/12/31 (지윤) 지연 근무 신청/초과 근무 신청에 관한 로직 추가 script 부분에 표시
 * </pre>
 *
 * @module approval
 * @author 민철
 * @version 2.2
-->
<template>
  <div class="page-wrapper">

    <!-- 헤더 영역 -->
    <div class="page-header">
      <div class="header-inner">
        <button class="btn-back" @click="backToList()">
          <img class="icon-arrow" src="/images/arrow.svg" alt="화살표" />
          <div class="back-label-wrap">
            <div class="back-label">목록으로</div>
          </div>
        </button>

        <div class="action-group">
          <button class="btn-secondary" @click="handleSaveDraft()">
            <img class="btn-icon" src="/images/file.svg" />
            <div class="btn-text">임시저장</div>
          </button>
          <!-- <button class="btn-secondary" @click="previewDocument()">
            <img class="btn-icon" src="/images/preview.svg" />
            <div class="btn-text">미리보기</div>
          </button> -->
          <button class="btn-primary" @click="handleSubmit()">
            <img class="btn-icon" src="/images/submit.svg" />
            <div class="btn-text-white">상신</div>
          </button>
        </div>
      </div>
    </div>

    <!-- 메인 컨텐츠 영역 -->
    <div class="page-body">
      <div class="form-wrapper">
        <div class="form-container">
          <ApprovalCreateCommonForm ref="commonFormRef" :templateId="templateId" :templateName="templateName"
            :category="category" :empName="empName" :empDept="empDept" :empGrade="empGrade"
            @saveDraft="handleSaveDraft()" @cancel="backToList()" @submit="handleSubmit()">
            <template #detail-section>
              <!-- v-model로 sectionData와 양방향 바인딩 -->
              <component :is="currentDetailSection" v-model="sectionData" />
            </template>
          </ApprovalCreateCommonForm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted} from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useApprovalDocument } from '@/composables/approval/useApprovalDocument';
import { ApprovalDocumentRequestDTO } from '@/types/approval/approval_request.types';
import ApprovalCreateCommonForm from './ApprovalCreateCommonForm.vue';
import {
  ApprovalVacationForm,
  ApprovalOvertimeForm,
  ApprovalWorkChangeForm,
  ApprovalAttendanceFixForm,
  ApprovalAppointmentForm,
  ApprovalPromotionForm,
  ApprovalResignForm,
  ApprovalPayrollRaiseForm,
  ApprovalPayrollAdjustForm,
} from './forms';
import { useApprovalTemplateStore } from '@/stores/approval/approval.store';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';
import { useAttendanceStore } from '@/stores/attendance/attendanceStore';


const commonFormRef = ref<InstanceType<typeof ApprovalCreateCommonForm>>();
const sectionData = ref<any>({});

/* ========================================== */
/* Router & Composables */
/* ========================================== */

const router = useRouter();
const route = useRoute();
const { saveDraft, submit } = useApprovalDocument();
const approvalStore = useApprovalTemplateStore();
const authStore = useAuthStore();
const { template } = storeToRefs(approvalStore);
const attendanceStore = useAttendanceStore();
const { selectedRow } = storeToRefs(attendanceStore);

/* ========================================== */
/* Props */
/* ========================================== */

const props = defineProps<{
  formName: string;
}>();


/* ========================================== */
/* (지윤) - 지연근무/초과 근무 로직 관련 함수 */
/* ========================================== */
const toHHmm = (t?: string | null) => (t ? String(t).substring(0, 5) : '00:00');

const preloadModifyWorkRecord = (): void => {
  if (props.formName !== 'modifyworkrecord') return;

  const stored = selectedRow.value;
  const attendanceId = stored?.attendanceId ?? Number(route.query.attendanceId);
  if (!attendanceId) return;

  if (stored && stored.attendanceId === attendanceId) {
    sectionData.value = {
      attendanceId,
      targetDate: stored.workDate,
      correctedStart: toHHmm(stored.startTime),
      correctedEnd: toHHmm(stored.endTime),
      reason: '',
    };
  }
};

const preloadOvertime = (): void => {
  if (props.formName !== 'overtime') return;

  const storedWorkDate = selectedRow.value?.workDate;
  const workDate = storedWorkDate ?? String(route.query.workDate ?? '');
  if (!workDate) return;

  sectionData.value = {
    workDate,
    startTime: sectionData.value?.startTime ?? '00:00',
    endTime: sectionData.value?.endTime ?? '00:00',
    reason: sectionData.value?.reason ?? '',
  };
};

const preloadByForm = (): void => {
  preloadModifyWorkRecord();
  preloadOvertime();
};

/* ========================================== */
/* Lifecycle */
/* ========================================== */

onMounted(async () => {
  const idFromQuery = Number(route.query.templateId);

  if (idFromQuery) {
    await approvalStore.fetchTemplate(idFromQuery);
  }

  preloadByForm();
  
});


// 섹션 컴포넌트 매핑
const sectionMap: Record<string, any> = {
  vacation: ApprovalVacationForm,
  changework: ApprovalWorkChangeForm,
  overtime: ApprovalOvertimeForm,
  modifyworkrecord: ApprovalAttendanceFixForm,
  personnelappointment: ApprovalAppointmentForm,
  promotionplan: ApprovalPromotionForm,
  resign: ApprovalResignForm,
  raisepayroll: ApprovalPayrollRaiseForm,
  modifypayroll: ApprovalPayrollAdjustForm,
};

const currentDetailSection = computed(() => {
  return sectionMap[props.formName];
});

const templateId = computed(() => template.value.templateId || 0);
const templateName = computed(() => template.value.templateName || '서식명');
const category = computed(() => template.value.category || '분류명');
const empName = computed(() => authStore.user?.employeeName || '직원이름');
const empDept = computed(() => authStore.user?.departmentName || '부서');
const empGrade = computed(() => authStore.user?.gradeName || '직급');

const currentDate = computed(() => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
});

/* ========================================== */
/* Methods */
/* ========================================== */

/**
 * DTO 생성
 * 타입 명시하여 안정성 확보
 */
const createRequestDTO = (status: 'draft' | 'submitted'): ApprovalDocumentRequestDTO => {
  const commonFormData = commonFormRef.value?.getCommonData();
  const detailsJsonString = JSON.stringify(sectionData.value);

  console.log('details:', detailsJsonString);

  return {
    formType: props.formName,
    documentType: category.value,
    title: commonFormData?.title || '',
    drafter: empName.value,
    department: empDept.value,
    grade: empGrade.value,
    draftDate: currentDate.value,
    status: status,
    submittedAt: status === 'submitted' ? new Date().toISOString() : null,
    lines: commonFormData?.lines || [],
    references: commonFormData?.references || [],
    details: detailsJsonString
  };
};

/**
 * 목록으로 돌아가기
 */
const backToList = () => {
  router.push('/approval/document-templates');
};

/**
 * 임시저장
 * Composable 사용
 */
const handleSaveDraft = async () => {
  try {
    const requestDTO = createRequestDTO('draft');
    const commonFormData = commonFormRef.value?.getCommonData();
    const files = commonFormData?.attachments || [];

    const response = await saveDraft(requestDTO, files);
    console.log('임시저장 완료:', response);
  } catch (error) {
    console.error('임시저장 에러:', error);
  }
};

/**
 * 미리보기 (추후 확장 가능)
 */
// const previewDocument = () => {
//   const requestDTO = createRequestDTO('draft');
//   console.log('미리보기 데이터:', requestDTO);
// };

/**
 * 상신
 * Composable 사용 (유효성 검사 포함)
 */
const handleSubmit = async () => {
  try {
    const requestDTO = createRequestDTO('submitted');
    const commonFormData = commonFormRef.value?.getCommonData();
    const files = commonFormData?.attachments || [];

    const response = await submit(requestDTO, files, props.formName);

    if (response) {
      console.log('상신 완료:', response);
      router.push('/approval/document-templates');
    }
  } catch (error) {
    console.error('상신 에러:', error);
  }
};

</script>

<style scoped>
.page-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.page-header {
  width: 100%;
  background: #ffffff;
  border-style: solid;
  border-color: #e2e8f0;
  border-width: 0px 0px 2px 0px;
  padding: 6px 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
  min-height: 38px;
  justify-content: center;
}

.header-inner {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.btn-back {
  border-style: solid;
  border-color: #bfc2c7;
  border-width: 0px 0px 1px 0px;
  display: flex;
  flex-direction: row;
  gap: 0px;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  position: relative;
  width: fit-content;
  background: none;
  padding: 0;
}

.icon-arrow {
  flex-shrink: 0;
  width: 19px;
  height: 19px;
  position: relative;
  overflow: visible;
}

.back-label-wrap {
  flex-shrink: 0;
  width: 55px;
  height: 24px;
  position: relative;
}

.back-label {
  color: #0f172b;
  text-align: left;
  font-family: "Inter-Regular", sans-serif;
  font-size: 14px;
  line-height: 24px;
  letter-spacing: 0.07px;
  font-weight: 400;
  position: absolute;
  left: 0px;
  top: 0px;
}

.action-group {
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.btn-secondary {
  border-radius: 8px;
  border-style: solid;
  border-color: #e2e8f0;
  border-width: 1px;
  padding: 6px 11px 6px 11px;
  display: flex;
  flex-direction: row;
  gap: 7px;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  position: relative;
  text-align: left;
  background-color: white;
}

.btn-primary {
  background: linear-gradient(180deg,
      rgba(28, 57, 142, 1) 0%,
      rgba(22, 36, 86, 1) 100%);
  border-radius: 8px;
  border: none;
  padding: 6px 18px 6px 18px;
  display: flex;
  flex-direction: row;
  gap: 7px;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  position: relative;
  text-align: left;
}

.btn-icon {
  flex-shrink: 0;
  width: 12px;
  height: 12px;
  position: relative;
  overflow: visible;
}

.btn-text {
  color: #62748e;
  text-align: center;
  font-family: "Inter-Regular", sans-serif;
  font-size: 12px;
  line-height: 18px;
  letter-spacing: -0.31px;
  font-weight: 400;
  position: relative;
}

.btn-text-white {
  color: #ffffff;
  text-align: center;
  font-family: "Inter-Regular", sans-serif;
  font-size: 12px;
  line-height: 18px;
  letter-spacing: -0.31px;
  font-weight: 400;
  position: relative;
}

.page-body {
  display: flex;
  padding: 20px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
  height: 100%;
}

.form-wrapper {
  padding: 0px 100px 0px 100px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
}

.form-container {
  display: flex;
  height: 100%;
  width: 100%;
  padding: 0;
  background-color: #ffff;
  overflow-y: auto;
}
</style>