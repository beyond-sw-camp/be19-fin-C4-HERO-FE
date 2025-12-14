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
          <button class="btn-secondary" @click="saveDraft()">
            <img class="btn-icon" src="/images/file.svg" />
            <div class="btn-text">임시저장</div>
          </button>
          <button class="btn-secondary" @click="previewDocument()">
            <img class="btn-icon" src="/images/preview.svg" />
            <div class="btn-text">미리보기</div>
          </button>
          <button class="btn-primary" @click="submitDocument()">
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
          <!-- CommonForm과 동적 섹션 컴포넌트 -->
          <CommonForm
            :title="title"
            :category="category"
            :empName="empName"
            :empDept="empDept"
            :empGrade="empGrade"
            @save-draft="saveDraft"
            @cancel="backToList"
            @submit="submitDocument"
          >
            <template #detail-section>
              <component :is="currentDetailSection" />
            </template>
          </CommonForm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
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

const title = computed(() => {
  return approvalStore.title || '서식명';
});

const category = computed(() => {
  return approvalStore.category || '분류명';
});

const empName = computed(() => {
  return authStore.user?.employeeName || '직원이름';
});

const empDept = computed(() => {
  return authStore.user?.departmentName || '부서';
});

const empGrade = computed(() => {
  return authStore.user?.gradeName || '직급';
});

const backToList = () => {
  router.push('/approval/document-templates');
};

const saveDraft = () => {
  console.log('임시저장 버튼 클릭');
  // 임시저장을 위한 API 호출
};

const previewDocument = () => {
  console.log('미리보기 버튼 클릭');
  // 미리보기를 위한 API 호출
};

const submitDocument = () => {
  console.log('상신 버튼 클릭');
  // 상신을 위한 API 호출
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