<!-- 
  <pre>
  File Name   : EvaluationTemplateList.vue
  Description : 평가 템플릿 목록 페이지
 
  History
  2025/12/09 - 승민 최초 작성
  </pre>
 
  @author 승민
  @version 1.0
-->

<!--template-->
<template>
  <div class="container">
    <div class="inner-wrapper">
      <div class="content-box">
        <div class="header">
          <button class="btn-new">
            <span @click="createTemplate">+ 새 템플릿 작성</span>
          </button>
        </div>

        <div class="table-wrapper">
          <!--표 헤더-->
          <div class="table-header">
            <div class="col">문서번호</div>
            <div class="col">제목</div>
            <div class="col">기안부서</div>
            <div class="col">기안자</div>
            <div class="col">기안일시</div>
          </div>

          <!--표 바디-->
          <div class="table-body">
            <div
                class="row"
                v-for="(item, index) in evaluationTemplates"
                :key="item.evaluationTemplateTemplateId"
                :class="{ alt: index % 2 !== 0 }"
                @click="goToDetail(item.evaluationTemplateTemplateId)"
            >
                <div class="col blue">{{ item.evaluationTemplateTemplateId }}</div>
                <div class="col">{{ item.evaluationTemplateName }}</div>
                <div class="col">{{ item.evaluationTemplateDepartmentName }}</div>
                <div class="col">{{ item.evaluationTemplateEmployeeName }}</div>
                <div class="col">{{ formatDate(item.evaluationTemplateCreatedAt) }}</div>
            </div>
          </div>
        </div>

        <!--페이지 네이션 버튼-->
        <div class="paging">
          <div class="page-btn">이전</div>
          <div class="page-btn active">1</div>
          <div class="page-btn">2</div>
          <div class="page-btn">3</div>
          <div class="page-btn">다음</div>
        </div>
      </div>
    </div>
  </div>
</template>

<!--script-->
<script setup lang="ts">
import axios from 'axios'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router';

// useRouter()를 router변수로 정의 (외부 로직)
const router = useRouter();

//평가 기준 타입
interface CriteriaResponseDTO {
  criteriaCriteriaId: number
  criteriaItemId: number
  criteriaRank: string
  criteriaDescription: string
  criteriaMinScore: number
  criteriaMaxScore: number
}

//평가 항목 타입
interface TemplateItemResponseDTO {
  templateItemItemId: number
  templateItemTemplateId: number
  templateItemItem: string
  templateItemDescription: string
  criterias: CriteriaResponseDTO[]
}

//평가 템플릿 타입
interface EvaluationTemplateResponseDTO {
  evaluationTemplateTemplateId: number
  evaluationTemplateName: string
  evaluationTemplateCreatedAt: string
  evaluationTemplateEmployeeId: number
  evaluationTemplateEmployeeName: string
  evaluationTemplateDepartmentId: number
  evaluationTemplateDepartmentName: string
  evaluationTemplatePosition: number
  evaluationTemplateGrade: string
  evaluationTemplateType: number
  evaluationPeriodEvaluationPeriodId: number
  evaluationPeriodName: string
  evaluationPeriodStart: string
  evaluationPeriodEnd: string
  templateItems: TemplateItemResponseDTO[]
}

// Reactive 데이터
const evaluationTemplates = ref<EvaluationTemplateResponseDTO[]>([])
const loading = ref<boolean>(false)
const errorMessage = ref<string>('')

/**
 * 설명 : 전체 평가 템플릿 조회 메소드
 */
const selectEvaluationTemplateList = async (): Promise<void> => {
  try {
    loading.value = true
    const res = await axios.get<EvaluationTemplateResponseDTO[]>(
      'http://localhost:8080/api/public/evaluation-template/selectall'
    )
    evaluationTemplates.value = res.data
  } catch (error) {
    errorMessage.value = '평가 템플릿 조회에 실패했습니다.'
    console.error(error)
  } finally {
    loading.value = false
  }
}

/**
 * 설명 : String 타입 날짜 Date 타입으로 변화하는 메소드
 * @param {string} dateString - 문자열형식의 날짜 데이터
 * @return {Date} date - Date 타입의 날짜 데이터
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR', { hour12: false })
}

/**
 * 설명 : 평가 템플릿 생성 페이지로 이동하는 메소드
 */
const createTemplate = () => {
    router.push('/createevaluationtemplate')
}

/**
 * 설명 : 평가 템플릿 세부 페이지로 이동하는 메소드
 * @param {number} templateId - 평가 템플릿 pk 
 */
const goToDetail = (templateId: number) => {
  router.push(`/evaluationtemplate/${templateId}`);
};

/**
 * 설명 : 페이지 마운트 시, 전체 평가 템플릿의 데이터를 조회하기 위한 생명주기(onMounted) 훅
 */
onMounted(async () => {
  await selectEvaluationTemplateList()
})
</script>

<!--style-->
<style scoped>
/* 컨테이너 전체 */
.container {
  background: #f5f6fa;
  display: flex;
  flex-direction: column;
}

/* 내부 레이아웃 */
.inner-wrapper {
  padding: 24px;
  display: flex;
}

.content-box {
  background: white;
  border-radius: 14px;
  outline: 2px #E2E8F0 solid;
  gap: 20px;
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* 헤더 */
.header {
  padding: 20px;
}

.btn-new {
  padding: 8px 16px;
  background: linear-gradient(180deg, #1C398E 0%, #162456 100%);
  border-radius: 14px;
  color: #fff;
  font-size: 14px;
  border: none;
  cursor: pointer;
}

/* 테이블 */
.table-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.table-header {
  display: grid;
  grid-template-columns: 1.5fr 2fr 1fr 1fr 1.5fr;
  background: linear-gradient(180deg, #1C398E 0%, #162456 100%);
  color: white;
  font-size: 14px;
  font-weight: bold;
  padding: 11px 16px;
}

.table-body .row {
  display: grid;
  grid-template-columns: 1.5fr 2fr 1fr 1fr 1.5fr;
  padding: 16px;
  border-top: 1px solid #E2E8F0;
  cursor: pointer;
}

.table-body .row.alt {
  background: #F8FAFC;
}

.col {
  font-size: 14px;
  color: #0F172B;
}

.table-header .col {
  color: white;
}

.col.blue {
  color: #155DFC;
}

/* 페이징 */
.paging {
  display: flex;
  gap: 10px;
  justify-content: center;
  padding: 16px;
  background: #F8FAFC;
  border-bottom-left-radius: 14px;
  border-bottom-right-radius: 14px;
}

.page-btn {
  padding: 5px 12px;
  border-radius: 4px;
  border: 1px solid #CAD5E2;
  color: #62748E;
  font-size: 14px;
  cursor: pointer;
}

.page-btn.active {
  background: #155DFC;
  border: none;
  color: #fff;
}
</style>