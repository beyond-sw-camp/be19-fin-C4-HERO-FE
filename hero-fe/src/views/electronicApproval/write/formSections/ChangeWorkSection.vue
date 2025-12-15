<template>
  <div class="detail-form-section">
    <div class="form-row">
      <div class="row-label">
        <span class="label-text">근무 변경 정보</span>
      </div>
      <div class="row-content">
        <div class="section-body">
          
          <div class="input-group-row">
            
            <div class="input-group col-half">
              <div class="group-label">
                <span class="label-text">변경된 근무제 이름 *</span>
              </div>
              <div class="dropdown-box">
                <div class="dropdown-value">
                  <span class="placeholder-text">선택하세요</span>
                </div>
                <img class="icon-dropdown" src="/images/dropdownarrow.svg" alt="arrow" />
              </div>
            </div>

            <div class="input-group col-half">
              <div class="group-label">
                <span class="label-text">적용 날짜 *</span>
              </div>
              <div class="date-input-box">
                <span class="placeholder-text">YYYY-MM-DD</span>
              </div>
            </div>

          </div>

          <div class="input-group-row mt-20">
            <div class="input-group col-full">
              <div class="group-label">
                <span class="label-text">근무 시간 (적용 시간 ~ 종료 시간)</span>
              </div>
              <div class="date-range-box">
                <div class="date-input">
                  <div class="input-placeholder">
                    <span class="label-text">적용 시간</span>
                  </div>
                </div>
                <div class="tilde">~</div>
                <div class="date-input">
                  <div class="input-placeholder">
                    <span class="label-text">종료 시간</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      
    </div>
    
    <div class="form-row border-top">
      <div class="row-label">
        <span class="label-text">변경 사유</span>
      </div>
      <div class="row-content reason-content">
        <div class="textarea-box">
          <div class="text-line">
            <span class="input-text">안녕하세요, 애플리케이션 개발3팀 김히어로 대리 입니다.</span>
          </div>
          <div class="text-line"></div>
          <div class="text-line">
            <span class="input-text">'2025년 근무 변경 신청 요청드립니다. 세부 내용은 아래와 같습니다.</span>
          </div>
          <div class="text-line"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 필요한 경우 props나 emits 추가
</script>

<style scoped>
/* detail-form-section - 근무 변경 신청 서식 고유 스타일 */
.detail-form-section {
  border: 1px solid #e2e8f0;
  border-bottom: none;
  border-top: none;
  border-radius: 0 0 14px 14px;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.form-row {
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

/* .border-top {
  border-top: 1px solid #e2e8f0;
} */

.row-label {
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
  padding: 16px;
  width: 140px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  align-self: stretch;
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
}

.label-text {
  color: #45556c;
  font-size: 14px;
  line-height: 20px;
  font-family: "Inter-Regular", sans-serif;
  font-weight: 400;
}

/* 근무제 이름 / 적용 날짜 */
.col-half {
  flex: 1;
  min-width: 0;
}

.dropdown-box {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
}

.dropdown-value {
  display: flex;
  align-items: center;
  flex: 1;
}

.placeholder-text {
  color: #90a1b9;
  font-size: 16px;
  font-family: "Inter-Regular", sans-serif;
}

.icon-dropdown {
  width: 18px;
}

.date-input-box {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  background: #fff;
  width: 100%;
}

/* 근무 시간 */
.col-full {
  width: 100%;
  flex-shrink: 0;
}

.mt-20 {
  margin-top: 20px;
}

.date-range-box {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.date-input {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px;
  flex: 1;
  display: flex;
  align-items: center;
  background: #fff;
}

.input-placeholder {
  display: flex;
  align-items: center;
  width: 100%;
}

.tilde {
  color: #90a1b9;
  font-size: 16px;
}

/* 사유 입력 */
.reason-content {
  flex-direction: column;
  padding: 0;
}

.textarea-box {
  padding: 16px;
  height: 200px;
  width: 100%;
}

.text-line {
  min-height: 24px;
}

.input-text {
  color: #0f172b;
  font-size: 14px;
  line-height: 20px;
  font-family: "Inter-Regular", sans-serif;
}
</style>