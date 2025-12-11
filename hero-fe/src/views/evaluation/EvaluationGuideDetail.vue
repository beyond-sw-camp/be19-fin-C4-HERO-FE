<!-- 
  File Name   : EvaluationGuideDetail.vue
  Description : 평가 가이드 세부 페이지
 
  History
  2025/12/10 - 승민 최초 작성
 
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
        <h1 class="title">평가 가이드 상세 페이지</h1>
      </div>

      <button class="btn-remove" @click="deleteGuide">
        <span>삭제</span>
      </button>
    </div>

    <div class="content">
      <div class="form-box">
        <h2 class="section-title">평가 가이드 정보</h2>

        <!-- 가이드 제목 -->
        <div class="form-item">
          <label>가이드 제목</label>
          <div class="view-text">{{ guideName }}</div>
        </div>

        <!-- 작성자 & 적용 부서 -->
        <div class="flex-row">
          <div class="form-item">
            <label>작성자</label>
            <div class="view-text employee-input">{{ creator }}</div>
          </div>

          <div class="form-item">
            <label>적용 부서</label>
            <div class="view-text department-input">{{ departmentName }}</div>
          </div>
        </div>

        <!-- 평가 가이드 본문 (에디터 HTML 그대로 출력) -->
        <div class="form-item">
          <h3 class="sub-title">평가 가이드 내용</h3>

          <div class="guide-view" v-html="guideContent"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<!--script-->
<script setup lang="ts">
//Import 구문
import { ref, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import axios from "axios"
import "@toast-ui/editor/dist/toastui-editor.css"

// 외부 로직
const route = useRoute()
const router = useRouter()

//Reactive 데이터
const guideId = ref<number | null>(null)
const guideName = ref<string>("")
const creator = ref<string>("")
const departmentName = ref<string>("")
const guideContent = ref<string>("")

/**
 * 설명: 이전 페이지로 이동하는 메소드
 */
const goBack = () => {
  router.back()
}

/**
 * 설명 : 평가 템플릿 제거 메소드
 */
const deleteGuide = async (): Promise<void> => {
  if (!guideId.value) {
    alert("삭제할 가이드 ID가 없습니다.")
    return
  }

  const confirmDelete: boolean = confirm("정말 이 평가 가이드 삭제하시겠습니까?")
  if (!confirmDelete) return

  try {
    await axios.delete(
      `http://localhost:8080/api/eval/evaluation-guide/delete/${guideId.value}`
    )

    alert("평가 가이드가 삭제되었습니다.")
    router.back()   // ✅ 삭제 후 이전 페이지 이동

  } catch (error) {
    console.error("삭제 실패:", error)
    alert("삭제에 실패했습니다. 다시 시도해주세요.")
  }
}

/**
 * 설명: 페이지 로드 시 평가 가이드 조회를 위한 생명주기 훅
 */
onMounted(async (): Promise<void> => {
  try {
    const paramId = route.params.id

    if (!paramId || isNaN(Number(paramId))) {
      alert("잘못된 접근입니다.")
      router.back()
      return
    }

    guideId.value = Number(paramId)

    const response = await axios.get(
      `http://localhost:8080/api/eval/evaluation-guide/select/${guideId.value}`
    )

    const data = response.data

    guideName.value = data.evaluationGuideName as string
    creator.value = data.evaluationGuideEmployeeName as string
    departmentName.value = data.evaluationGuideDepartmentName as string
    guideContent.value = data.evaluationGuideContent as string

  } catch (error) {
    console.error("평가 가이드 조회 실패:", error)
    alert("평가 가이드 조회에 실패했습니다.")
  }
})
</script>

<!--style-->
<style scoped>
.container {
  display: flex;
  flex-direction: column;
  width: 100%;
  background: #f5f6fa;
}

.content {
  width: 100%;
  padding: 24px;
  display: flex;
  justify-content: center;
}

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

.header {
  width: 100%;
  height: 50px;
  background: white;
  padding: 20px;
  border-bottom: 2px solid #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.section-title {
  flex: 1;
  margin-left: 16px;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: #1c398e;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.view-text {
  padding: 16px 20px;
  background: #F8FAFC;
  border-radius: 11px;
  border: 1px solid #E2E8F0;
  font-size: 16px;
}

.flex-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.sub-title {
  color: #1C398E;
  font-size: 20px;
  margin-bottom: 12px;
}

/* ✅ 에디터 HTML 출력 영역 */
.guide-view {
  width: 100%;
  min-height: 300px;
  border-radius: 14px;
  border: 1px solid #E2E8F0;
  padding: 20px;
  font-size: 16px;
  background: #fff;
  line-height: 1.7;
}

/* ✅ 에디터에서 작성한 표 스타일 유지 */
:deep(.guide-view table) {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
}

:deep(.guide-view th),
:deep(.guide-view td) {
  border: 1px solid #cbd5e1;
  padding: 10px;
  text-align: center;
}

:deep(.guide-view th) {
  background: #f1f5f9;
  font-weight: 600;
}

.employee-input {
  width: 400px;
}

.department-input {
  width: 420px;
}

.back-icon {
  cursor: pointer;
}

label {
  font-size: 15px;
  font-weight: 600;
  color: #1c398e;
}

.btn-remove {
  background: linear-gradient(180deg, #1C398E 0%, #162456 100%);
  color: white;
  padding: 10px 24px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  
}
</style>