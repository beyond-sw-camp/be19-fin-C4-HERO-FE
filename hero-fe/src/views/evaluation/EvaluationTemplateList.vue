<template>
  <div class="container">
    <div class="inner-wrapper">
      <div class="content-box">
        <div class="header">
          <button class="btn-new">
            <span>새 결재 작성</span>
          </button>
        </div>

        <div class="table-wrapper">
          <!-- Table Header -->
          <div class="table-header">
            <div class="col">문서번호</div>
            <div class="col">제목</div>
            <div class="col">기안부서</div>
            <div class="col">기안자</div>
            <div class="col">기안일시</div>
          </div>

          <!-- Table Body -->
          <div class="table-body">
            <div class="row">
              <div class="col blue">2306-서비스사업팀</div>
              <div class="col">2025년 상반기 직원 성과 평가</div>
              <div class="col">인사팀</div>
              <div class="col">김철수</div>
              <div class="col">2025-12-01 13:56</div>
            </div>

            <div class="row alt">
              <div class="col blue">2305-IT서비스팀</div>
              <div class="col">리더십 역량 평가</div>
              <div class="col">인사팀</div>
              <div class="col">박영희</div>
              <div class="col">2025-11-30 11:23</div>
            </div>

            <div class="row">
              <div class="col blue">2301-IT서비스팀</div>
              <div class="col">신입사원 적응도 평가</div>
              <div class="col">인사팀</div>
              <div class="col">이민수</div>
              <div class="col">2025-11-29 14:54</div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
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

<style scoped>
/* 컨테이너 전체 */
.container {
  background: #F9FAFB;
  display: flex;
  flex-direction: column;
}

/* 내부 레이아웃 */
.inner-wrapper {
  padding: 36px;
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
}

.table-body .row.alt {
  background: #F8FAFC;
}

.col {
  font-size: 14px;
  color: #0F172B;
}

.col.blue {
  color: #155DFC;
}

/* 페이징 */
.paging {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
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