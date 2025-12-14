<template>
  <div class="detail-form-section">
    <div class="form-row">
      <div class="row-label">
        <span class="label-text">휴가 신청 정보</span>
      </div>
      <div class="row-content">
        <div class="section-body">
          <div class="input-group-row">
            <div class="input-group col-type">
              <div class="group-label">
                <span class="label-text">휴가 종류 *</span>
              </div>
              <div class="dropdown-box">
                <div class="dropdown-value">
                  <span class="placeholder-text">선택하세요</span>
                </div>
                <img class="icon-dropdown" src="/images/dropdownarrow.svg" />
              </div>
            </div>

            <div class="input-group col-period">
              <div class="group-label">
                <span class="label-text">휴가 기간 *</span>
              </div>
              <div class="date-range-box">
                <div class="date-input">
                  <div class="input-placeholder">
                    <span class="label-text">휴가 시작일</span>
                  </div>
                </div>
                <div class="tilde">~</div>
                <div class="date-input">
                  <div class="input-placeholder">
                    <span class="label-text">휴가 종료일</span>
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
        <span class="label-text">사유</span>
      </div>
      <div class="row-content reason-content">
        <div class="textarea-box">
          <div class="text-line">
            <span class="input-text">개인 일정으로 인한 휴가</span>
          </div>
          <div class="text-line"></div>
          <div class="text-line"></div>
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
/* detail-form-section - 휴가 신청 서식 고유 스타일 */
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

/* 휴가 종류 드롭다운 */
.col-type {
  width: 208px;
  flex-shrink: 0;
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

/* 휴가 기간 */
.col-period {
  flex: 1;
  min-width: 300px;
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