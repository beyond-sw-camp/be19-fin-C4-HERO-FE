<!-- 
  File Name   : EditEvaluationTemplate.vue
  Description : 평가 템플릿 수정 페이지
 
  History
  2025/12/11 - 승민 최초 작성
 
  @author 승민
  @version 1.0
-->

<!--template-->
<template>
  <div class="container">
    <!-- 헤더 -->
    <div class="header">
      <div class="title-wrapper">
        <img class="back-icon" src="/images/backArrow.svg" @click="goBack" />
        <h1 class="title">평가 템플릿 수정</h1>
      </div>

      <button class="btn-save" @click="updateTemplate">
        저장
      </button>
    </div>

    <!-- 내용 -->
    <div class="content">
      <div class="form-box">
        <h2 class="section-title">평가 템플릿 수정</h2>

        <!-- 템플릿명 -->
        <div class="form-item">
          <label>평가서 이름</label>
          <input class="input name-input" type="text" v-model="templateName" />
        </div>

        <!-- 생성자 & 생성부서 (readonly) -->
        <div class="flex-row">
          <div class="form-item">
            <label>작성자</label>
            <input class="input employee-input" type="text" v-model="creator" readonly />
          </div>

          <div class="form-item">
            <label>생성부서</label>
            <input class="input department-input" type="text" v-model="departmentName" readonly />
          </div>
        </div>

        <!-- 평가 기간 -->
        <div class="section-group">
          <h3 class="sub-title">평가 기간 정보</h3>

          <div class="flex-row">
            <div class="form-item">
              <label>평가 기간명</label>
              <input class="input period-input" type="text" v-model="periodName" />
            </div>

            <div class="form-item">
              <label>평가 시작일</label>
              <input class="input start-input" type="date" v-model="startDate" />
            </div>

            <div class="form-item">
              <label>평가 종료일</label>
              <input class="input end-input" type="date" v-model="endDate" />
            </div>
          </div>
        </div>

        <!-- 평가 유형 -->
        <div class="form-item">
          <label>평가 유형</label>
          <select class="input type-input" v-model="evaluationType">
            <option :value="1">성과평가</option>
            <option :value="2">능력평가</option>
            <option :value="3">행동평가</option>
          </select>
        </div>

        <!-- 평가 항목 -->
        <h3 class="sub-title">평가 항목</h3>

        <div class="evaluation-container" v-for="(item, index) in templateItems" :key="index">
          <!-- 헤더 -->
          <header class="section-header">
            <div class="number-badge">{{ index + 1 }}</div>
            <h2 class="section-title">평가 항목</h2>
            <button class="icon-button" @click="removeItem(index)">
              <img class="icon" src="/images/trashcan.svg" />
            </button>
          </header>

          <!-- 항목 제목 -->
          <section class="field-group">
            <label>항목 제목</label>
            <input class="input-field" type="text" v-model="item.title" />
          </section>

          <!-- 항목 설명 -->
          <section class="field-group">
            <label>항목 설명</label>
            <textarea class="textarea-field" v-model="item.description"></textarea>
          </section>

          <!-- 평가 기준 -->
          <section class="criteria-section">
            <label>항목별 평가 기준</label>

            <div class="criteria-item" v-for="(criteria, cIdx) in item.criteria" :key="cIdx">
              <div class="criteria-col">
                <label>등급</label>
                <input class="criteria-input" v-model="criteria.grade" />
              </div>

              <div class="criteria-col">
                <label>최소 점수</label>
                <input type="number" class="criteria-input" v-model="criteria.minScore" />
              </div>

              <div class="criteria-col">
                <label>최대 점수</label>
                <input type="number" class="criteria-input" v-model="criteria.maxScore" />
              </div>

              <div class="criteria-col flex-2">
                <label>설명</label>
                <input class="criteria-input" v-model="criteria.description" />
              </div>

              <button class="icon-button small" @click="removeCriteria(index, cIdx)">
                <img class="icon" src="/images/trashcan.svg" />
              </button>
            </div>

            <button class="add-criteria-btn" @click="addCriteria(index)">
              + 항목별 기준 추가
            </button>
          </section>
        </div>

        <!-- 평가 항목 추가 버튼 -->
        <button class="add-box" @click="addItem">
          <div class="add-button">+ 평가 항목 추가</div>
        </button>
      </div>
    </div>
  </div>
</template>

<!--script-->
<script setup lang="ts">

//Import 구문
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

//외부 로직
const route = useRoute();
const router = useRouter();

// URL 파라미터 추출
const templateId = route.params.id;

// 평가 템플릿 수정 데이터 변수
const templateName = ref("");
const creator = ref("");
const departmentName = ref("");
const employeeId = ref<number | null>(null);
const departmentId = ref<number | null>(null);
const periodId = ref<number | null>(null);
const periodName = ref("");
const startDate = ref("");
const endDate = ref("");
const evaluationType = ref<number | null>(null);

const deletedItemIds = ref<number[]>([]);
const deletedCriteriaIds = ref<number[]>([]);

const templateItems = ref<TemplateItem[]>([]);

// 평가 항목 타입
interface Criteria {
  id?: number | null;
  grade: string;
  minScore: number;
  maxScore: number;
  description: string;
}

// 평가 기준 타입
interface TemplateItem {
  id?: number | null;
  title: string;
  description: string;
  criteria: Criteria[];
}

/**
 * 설명: 마운트 시, 평가 가이드 데이터 조회 및 수정 데이터 변수 초기화
 */
onMounted(async () => {
  const res = await axios.get(
    `http://localhost:8080/api/evaluation/evaluation-template/select/${templateId}`
  );

  const data = res.data;

  templateName.value = data.evaluationTemplateName;
  creator.value = data.evaluationTemplateEmployeeName;
  departmentName.value = data.evaluationTemplateDepartmentName;

  employeeId.value = data.evaluationTemplateEmployeeId;
  departmentId.value = data.evaluationTemplateDepartmentId;

  periodId.value = data.evaluationPeriodEvaluationPeriodId;
  periodName.value = data.evaluationPeriodName;
  startDate.value = data.evaluationPeriodStart?.split("T")[0] || "";
  endDate.value = data.evaluationPeriodEnd?.split("T")[0] || "";

  evaluationType.value = data.evaluationTemplateType;

  // 항목 리스트 채우기
  templateItems.value = data.templateItems.map((item: any) => ({
    id: item.templateItemItemId,
    title: item.templateItemItem,
    description: item.templateItemDescription,
    criteria: item.criterias.map((c: any) => ({
      id: c.criteriaCriteriaId,
      grade: c.criteriaRank,
      minScore: c.criteriaMinScore,
      maxScore: c.criteriaMaxScore,
      description: c.criteriaDescription
    }))
  }));
});

/**
 * 설명: 항목 추가 메소드
 */
const addItem = () => {
  templateItems.value.push({
    id: null,
    title: "",
    description: "",
    criteria: []
  });
};

/**
 * 설명: 항목 삭제 메소드
 * @param {number} index - 평가 항목 배열 인덱스
 */
const removeItem = (index: number) => {
  const item = templateItems.value[index];

  // 기존 항목이라면 삭제 목록에 추가
  if (item.id != null) {
    deletedItemIds.value.push(item.id);
  }

  // 항목 안에 있는 기준들도 모두 삭제 목록에 추가
  item.criteria.forEach(criteria => {
    if (criteria.id != null) {
      deletedCriteriaIds.value.push(criteria.id);
    }
  });

  templateItems.value.splice(index, 1);
};

/**
 * 설명: 기준 추가 메소드
 * @param {number} itemIndex - 평가 기준 배열 인덱스 
 */
const addCriteria = (itemIndex: number) => {
  templateItems.value[itemIndex].criteria.push({
    id: null,
    grade: "",
    minScore: 0,
    maxScore: 100,
    description: ""
  });
};

/**
 * 설명: 평가 기준 삭제 메소드
 * @param {number} itemIndex - 평가 기준이 있는 항목 배열의 인덱스
 * @param {number} cIndex - 평가 기준 배열 인덱스
 */
const removeCriteria = (itemIndex: number, cIndex: number) => {
  const criteria = templateItems.value[itemIndex].criteria[cIndex];

  if (criteria.id != null) {
    deletedCriteriaIds.value.push(criteria.id);
  }

  templateItems.value[itemIndex].criteria.splice(cIndex, 1);
};

/**
 * 설명: 템플릿 수정 메소드
 */
const updateTemplate = async () => {
  if (
    !templateName.value.trim() ||
    !periodName.value.trim() ||
    !startDate.value ||
    !endDate.value
  ) {
    alert("평가 템플릿명, 기간명, 시작일, 종료일은 필수입니다.");
    return;
  }


  try {
    const payload = {
      evaluationTemplateTemplateId: templateId,
      evaluationTemplateName: templateName.value,
      evaluationTemplateCreatedAt: new Date(),
      evaluationTemplateEmployeeId: employeeId.value,
      evaluationTemplateDepartmentId: departmentId.value,
      evaluationTemplateType: evaluationType.value,

      templateItems: templateItems.value.map((item) => ({
        templateItemItemId: item.id,
        templateItemItem: item.title,
        templateItemDescription: item.description,
        criterias: item.criteria.map((c) => ({
          criteriaCriteriaId: c.id,
          criteriaRank: c.grade,
          criteriaMinScore: c.minScore,
          criteriaMaxScore: c.maxScore,
          criteriaDescription: c.description
        }))
      })),

      evaluationPeriodEvaluationPeriodId: periodId.value,
      evaluationPeriodName: periodName.value,
      evaluationPeriodStart: startDate.value + "T00:00:00",
      evaluationPeriodEnd: endDate.value + "T00:00:00",

      deletedItemIds: deletedItemIds.value,
      deletedCriteriaIds: deletedCriteriaIds.value
    };

    await axios.put(
      "http://localhost:8080/api/evaluation/evaluation-template/update",
      payload
    );

    alert("수정 완료되었습니다.");
    router.back();
  } catch (e) {
    console.error(e);
    alert("수정 실패");
  }
};

/**
 * 설명: 이전 페이지로 이동 메소드
 */
const goBack = () => router.back();
</script>

<!--style-->
<style scoped>
.container {
  display: flex;
  flex-direction: column;
  width: 100%;
  background: #f5f6fa;
  min-height: 0;
  flex: 1;       
  height: 100%;
}

/* 헤더 */
.header {
  width: 100%;
  height: 50px;
  background: white;
  padding: 20px;
  border-bottom: 2px solid #E2E8F0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title {
  font-size: 14px;
  font-weight: 600;
  color: #0F172B;
}

.btn-save {
  background: linear-gradient(180deg, #1C398E 0%, #162456 100%);
  color: white;
  padding: 10px 24px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
}

/* 내용 영역 */
.content {
  width: 100%;
  padding: 24px;
  display: block;
  justify-content: center;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

/* form 박스 */
.form-box {
  width: 100%;
  max-width: 1200px; 
  background: white;
  border-radius: 14px;
  outline: 2px #E2E8F0 solid;
  padding: 36px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
}

/* input 기본 스타일 */
.input {
  padding: 16px 20px;
  background: #F8FAFC;
  border-radius: 11px;
  border: 1px solid #E2E8F0;
}

/* row flex 구조 */
.flex-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

/* 소제목 */
.sub-title {
  color: #1C398E;
  font-size: 20px;
  margin-bottom: 12px;
}

/* 평가 항목 컨테이너 */
.evaluation-container {
  width: 100%;
  background: #f8fafc;
  border-radius: 11px;
  padding: 24px;
  border: 1px solid #e2e8f0;
}

/* 평가 항목 제목 라인 */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

/* 번호 박스 */
.number-badge {
  width: 40px;
  height: 40px;
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: #fff;
  font-weight: 700;
  font-size: 16px;
  border-radius: 11px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 평가 항목 안의 제목 */
.section-title {
  flex: 1;
  margin-left: 16px;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: #1c398e;
}

/* 쓰레기통 버튼 - 평가 항목 삭제용 */
.icon-button {
  width: 40px;
  height: 40px;
  background: transparent;
  cursor: pointer;
  border: none;
  padding: 0;
}

/* 쓰레기통 버튼 - 평가 기준 삭제용 */
.icon-button.small {
  width: 32px;
  height: 32px;
  background: transparent;
  cursor: pointer;
  border: none;
  padding: 0;
}

/* 아이콘 크기 */
.icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

/* 평가 항목 내부 입력 */
.field-group {
  margin-bottom: 28px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-size: 15px;
  font-weight: 600;
  color: #1c398e;
}

.input-field,
.textarea-field {
  background: white;
  border-radius: 11px;
  border: 1px solid #e2e8f0;
  padding: 14px 20px;
}

.textarea-field {
  height: 100px;
  resize: none;
}

/* 평가 기준 */
.criteria-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.criteria-item {
  background: #fff;
  border-radius: 11px;
  border: 1px solid #e2e8f0;
  padding: 16px;
  display: flex;
  gap: 12px;
}

.criteria-col {
  display: flex;
  flex-direction: column;
  width: 180px;
}

.criteria-col.flex-2 {
  width: 100%;
}

.criteria-col label {
  font-size: 13px;
  color: #62748e;
  margin-bottom: 6px;
}

.criteria-input {
  background: #f8fafc;
  border-radius: 11px;
  border: 1px solid #e2e8f0;
  padding: 12px;
  font-size: 15px;
}

/* 평가 기준 추가 버튼 */
.add-criteria-btn {
  background: #fff;
  color: #1c398e;
  font-weight: 600;
  border-radius: 11px;
  padding: 12px;
  border: 1.5px solid #1c398e;
  cursor: pointer;
}

/* 항목 추가 박스 */
.add-box {
  width: 100%;
  height: 64px;
  background: linear-gradient(180deg, #1C398E 0%, #162456 100%);
  box-shadow: 0px 4px 6px -4px rgba(0, 0, 0, 0.10);
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
}

.add-button {
  color: white;
  font-size: 16px;
  font-weight: 600;
}

.employee-input { 
  width: 550px; 
}

.department-input { 
  width: 555px; 
}

.period-input { 
  width: 400px; 
}

.start-input { 
  width: 340px; 
}

.end-input { 
  width: 340px; 
}

.back-icon {
  cursor: pointer;
}
</style>