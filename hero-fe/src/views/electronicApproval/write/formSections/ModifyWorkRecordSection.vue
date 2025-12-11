<template>
  <div class="detail-form-section">
    <div class="form-row">
      <div class="row-label">
        <span class="label-text">근무기록 수정 정보</span>
      </div>
      <div class="row-content">
        <div class="section-body">
          <!-- 근무기록 수정에 맞는 입력 필드 추가 -->
          <div class="input-group-row">
            <div class="input-group col-full">
              <div class="group-label">
                <span class="label-text">수정할 날짜 *</span>
              </div>
              <div class="date-input-box">
                <span class="placeholder-text">날짜를 선택하세요</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="form-row border-top">
      <div class="row-label">
        <span class="label-text">수정 사유</span>
      </div>
      <div class="row-content reason-content">
        <div class="textarea-box">
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
/* detail-form-section - 근무기록 수정 서식 고유 스타일 */
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

.col-full {
  width: 100%;
  flex-shrink: 0;
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

.placeholder-text {
  color: #90a1b9;
  font-size: 16px;
  font-family: "Inter-Regular", sans-serif;
}

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