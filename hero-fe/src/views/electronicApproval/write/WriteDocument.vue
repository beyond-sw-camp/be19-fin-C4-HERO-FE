<template>
  <div class="page-wrapper">
    <!-- 헤더 영역 -->
    <div class="page-header">
      <div class="header-inner">
        <button class="btn-back" @click="backToList()">
          <img class="icon-arrow" src="/images/arrow.svg" alt="화살표"/>
          <div class="back-label-wrap">
            <div class="back-label">목록으로</div>
          </div>
        </button>

        <div class="action-group">
          <button class="btn-secondary" @click="handleSaveDraft()">
            <img class="btn-icon" src="/images/file.svg" />
            <div class="btn-text">임시저장</div>
          </button>
          <button class="btn-secondary" @click="previewDocument()">
            <img class="btn-icon" src="/images/preview.svg" />
            <div class="btn-text">미리보기</div>
          </button>
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
          <CommonForm
            ref="commonFormRef"
            :title="title"
            :category="category"
            :empName="empName"
            :empDept="empDept"
            :empGrade="empGrade"
            @preview="previewDocument()"
            @cancel="backToList()"
            @submit="handleSubmit()"
          >
            <template #detail-section>
              <!-- v-model로 sectionData와 양방향 바인딩 -->
              <component 
                :is="currentDetailSection"
                v-model="sectionData"
              />
            </template>
          </CommonForm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/api/apiClient';
import CommonForm from './CommonForm.vue';
import { 
  VacationSection,
  OvertimeSection,
  ChangeWorkSection,
  ModifyWorkRecordSection,
  PersonnelAppointmentSection,
  PromotionPlanSection,
  ResignSection,
  RaisePayrollSection,
  ModifyPayrollSection,
} from './formSections';
import { useTemplateStore } from '@/stores/approval/approval';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const approvalStore = useTemplateStore();
const authStore = useAuthStore();

const props = defineProps<{
  formName: string;
}>();

// CommonForm 참조
const commonFormRef = ref<InstanceType<typeof CommonForm>>();

// 섹션 컴포넌트 매핑
const sectionMap: Record<string, any> = {
  vacation: VacationSection,
  changework: ChangeWorkSection,
  overtime: OvertimeSection,
  modifyworkrecord: ModifyWorkRecordSection,
  personnelappointment: PersonnelAppointmentSection,
  promotionplan: PromotionPlanSection,
  resign: ResignSection,
  raisepayroll: RaisePayrollSection,
  modifypayroll: ModifyPayrollSection,
};

const currentDetailSection = computed(() => {
  return sectionMap[props.formName];
});

const title = computed(() => approvalStore.title || '서식명');
const category = computed(() => approvalStore.category || '분류명');
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

// 핵심: Section 데이터를 저장하는 ref (v-model로 자동 업데이트됨)
const sectionData = ref<any>({});

// ✅ FormData 생성 함수 (JSON + File)
const createFormData = (status: 'draft' | 'submitted') => {
  const commonFormData = commonFormRef.value?.getCommonData();
  
  // sectionData를 JSON 문자열로 변환
  const detailsJsonString = JSON.stringify(sectionData.value);
  
  // ✅ [LOG] 여기서 변환된 JSON 문자열 확인 가능
  console.log('details (JSON String):', detailsJsonString);
  
  // 1. FormData 객체 생성
  const formData = new FormData();

  // 2. DTO 데이터 생성 (파일 제외)
  const requestDto = {
    formType: props.formName,
    documentType: category.value,
    title: commonFormData?.title || '',
    drafter: empName.value,
    department: empDept.value,
    grade: empGrade.value,
    draftDate: currentDate.value,
    status: status,
    submittedAt: status === 'submitted' ? new Date().toISOString() : null,
    approvalLine: commonFormData?.approvalLine || [],
    references: commonFormData?.references || [],
    details: detailsJsonString
  };

  // 3. DTO를 'data' 파트에 JSON Blob으로 추가
  formData.append('data', new Blob([JSON.stringify(requestDto)], { type: 'application/json' }));

  // 4. 파일들을 'files' 파트에 추가
  if (commonFormData?.attachments) {
    commonFormData.attachments.forEach((file: File) => {
      formData.append('files', file);
    });
  }
  
  return formData;
};

const backToList = () => {
  router.push('/approval/document-templates');
};

// 임시저장
const handleSaveDraft = async () => {
  try {
    const formData = createFormData('draft');
    
    const response = await apiClient.post('/approval/draft', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    alert('임시저장되었습니다.');
    console.log('저장 결과:', response.data);
  } catch (error) {
    console.error('임시저장 실패:', error);
    alert('임시저장에 실패했습니다.');
  }
};

// 미리보기
const previewDocument = () => {
  const formData = createFormData('draft');
  console.log('🔍 미리보기 (FormData 생성됨)');
  
  // (formData as any)를 사용하여 타입 에러 우회
  for (const pair of (formData as any).entries()) {
    console.log(`${pair[0]}:`, pair[1]);
  }
};

// 상신
const handleSubmit = async () => {
  try {
    if (!validateForm()) {
      return;
    }

    const formData = createFormData('submitted');

    const response = await apiClient.post('/approval/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    alert('상신되었습니다.');
    console.log('상신 결과:', response.data);
    
    router.push('/approval/document-templates');
  } catch (error) {
    console.error('상신 실패:', error);
    alert('상신에 실패했습니다.');
  }
};

// 폼 유효성 검사
const validateForm = (): boolean => {
  const commonFormData = commonFormRef.value?.getCommonData();
  
  if (!commonFormData?.title) {
    alert('제목을 입력하세요.');
    return false;
  }

  if (props.formName === 'vacation') {
    if (!sectionData.value.vacationType) {
      alert('휴가 종류를 선택하세요.');
      return false;
    }
    if (!sectionData.value.startDate || !sectionData.value.endDate) {
      alert('휴가 기간을 선택하세요.');
      return false;
    }
  } else if (props.formName === 'overtime') {
    if (!sectionData.value.workDate) {
      alert('근무 날짜를 선택하세요.');
      return false;
    }
    if (!sectionData.value.startTime || !sectionData.value.endTime) {
      alert('근무 시간을 입력하세요.');
      return false;
    }
  }

  return true;
};
</script>

<style scoped>
.page-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh; 
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
  background: linear-gradient(
    180deg,
    rgba(28, 57, 142, 1) 0%,
    rgba(22, 36, 86, 1) 100%
  );
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
  padding: 20px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
}

.form-wrapper {
  padding: 0px 100px 0px 100px;
}

.form-container {
  height: 100%;
  width: 100%;
  padding: 0;
  background-color: #ffff;
}
</style>