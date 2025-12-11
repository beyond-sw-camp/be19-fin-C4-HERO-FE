<template>
  <div class="raise-form-wrapper">
    <div class="paper-sheet">
      <div class="paper-padding">
        <div class="paper-content">
          
          <div class="title-section">
            <div class="title-row">
              <h1 class="main-title">급여인상신청서</h1>
            </div>
          </div>

          <div class="top-section">
            
            <div class="info-table">
              <div class="info-row">
                <div class="th-cell">
                  <span class="label-text">기안자</span>
                </div>
                <div class="td-cell">
                  <span class="value-text">김히어로</span>
                </div>
              </div>
              <div class="info-row">
                <div class="th-cell">
                  <span class="label-text">소속</span>
                </div>
                <div class="td-cell">
                  <span class="value-text">애플리케이션 개발1팀</span>
                </div>
              </div>
              <div class="info-row">
                <div class="th-cell">
                  <span class="label-text">기안일</span>
                </div>
                <div class="td-cell">
                  <span class="value-text">2025-12-01</span>
                </div>
              </div>
              <div class="info-row">
                <div class="th-cell">
                  <span class="label-text">문서번호</span>
                </div>
                <div class="td-cell">
                  <span class="value-text">-</span>
                </div>
              </div>
              <div class="info-row last-row">
                <div class="th-cell">
                  <span class="label-text">문서분류</span>
                </div>
                <div class="td-cell">
                  <span class="value-text">급여</span>
                </div>
              </div>
            </div>

            <div class="stamp-area">
              <div class="stamp-group">
                <div class="stamp-box">
                  <div class="stamp-header">
                    <span class="stamp-role-label">기안</span>
                  </div>
                  <div class="stamp-body">
                    <div class="approver-info">
                      <span class="approver-name">김히어로</span>
                      <span class="approver-rank">대리</span>
                    </div>
                    <div class="stamp-signature approved">
                      <div class="signature-text">
                        <span class="status-approved">기안</span>
                      </div>
                    </div>
                  </div>
                  <div class="stamp-footer">
                    <span class="stamp-date">2025-12-01</span>
                  </div>
                </div>

                <div class="stamp-box">
                  <div class="stamp-header">
                    <span class="stamp-role-label">결재</span>
                  </div>
                  <div class="stamp-body">
                    <div class="approver-info">
                      <span class="approver-name">서창호</span>
                      <span class="approver-rank">대리</span>
                    </div>
                    <div class="stamp-signature pending">
                      <div class="signature-text">
                        <span class="status-pending">대기</span>
                      </div>
                    </div>
                  </div>
                  <div class="stamp-footer">
                    <span class="stamp-date">-</span>
                  </div>
                </div>

                <div class="stamp-box">
                  <div class="stamp-header">
                    <span class="stamp-role-label">결재</span>
                  </div>
                  <div class="stamp-body">
                    <div class="approver-info">
                      <span class="approver-name">곽동근</span>
                      <span class="approver-rank">팀장</span>
                    </div>
                    <div class="stamp-signature pending">
                      <div class="signature-text">
                        <span class="status-pending">대기</span>
                      </div>
                    </div>
                  </div>
                  <div class="stamp-footer">
                    <span class="stamp-date">-</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="main-form-section">
            
            <div class="form-row">
              <div class="row-label">
                <span class="label-text">제목</span>
              </div>
              <div class="row-content">
                <div class="input-wrapper">
                  <span class="input-text">급여인상신청서</span>
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="row-label">
                <span class="label-text">결재선</span>
              </div>
              <div class="row-content flow-content">
                <div class="approval-flow">
                  
                  <div class="flow-card">
                    <div class="card-inner">
                      <div class="avatar-circle">
                        <span class="avatar-text">김</span>
                      </div>
                      <div class="card-details">
                        <div class="detail-row">
                          <span class="detail-name">김히어로 대리</span>
                        </div>
                        <div class="detail-row">
                          <span class="detail-dept">애플리케이션 개발3팀</span>
                        </div>
                        <div class="detail-row">
                          <span class="detail-role">기안</span>
                        </div>
                        <div class="detail-row">
                          <span class="detail-time">2025-12-01 14:34</span>
                        </div>
                      </div>
                    </div>
                    <img class="btn-delete" src="/images/deletebutton.svg" alt="delete" />
                  </div>
                  
                  <img class="flow-arrow" src="/images/linearrow.svg" alt="arrow" />

                  <div class="flow-card">
                    <div class="card-inner">
                      <div class="avatar-circle">
                        <span class="avatar-text">서</span>
                      </div>
                      <div class="card-details">
                        <div class="detail-row">
                          <span class="detail-name">서창호 대리</span>
                        </div>
                        <div class="detail-row">
                          <span class="detail-dept">애플리케이션 개발3팀</span>
                        </div>
                        <div class="detail-row">
                          <span class="detail-role">결재</span>
                        </div>
                        <div class="detail-row">
                          <span class="detail-time">2025-12-01 14:34</span>
                        </div>
                      </div>
                    </div>
                    <img class="btn-delete" src="/images/deletebutton.svg" alt="delete" />
                  </div>

                  <img class="flow-arrow" src="/images/linearrow.svg" alt="arrow" />

                  <div class="flow-card">
                    <div class="card-inner">
                      <div class="avatar-circle">
                        <span class="avatar-text">곽</span>
                      </div>
                      <div class="card-details">
                        <div class="detail-row">
                          <span class="detail-name">곽동근 팀장</span>
                        </div>
                        <div class="detail-row">
                          <span class="detail-dept">애플리케이션 개발3팀</span>
                        </div>
                        <div class="detail-row">
                          <span class="detail-role">결재</span>
                        </div>
                        <div class="detail-row">
                          <span class="detail-time">2025-12-01 14:34</span>
                        </div>
                      </div>
                    </div>
                    <img class="btn-delete" src="/images/deletebutton.svg" alt="delete" />
                  </div>

                  <img class="flow-arrow" src="/images/linearrow.svg" alt="arrow" />

                  <div class="flow-card add-card">
                    <div class="add-icon">+</div>
                  </div>

                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="row-label">
                <span class="label-text">첨부파일</span>
              </div>
              <div class="row-content file-content">
                <div class="file-upload-box">
                  <img class="icon-upload" src="/images/fileupload.svg" alt="upload" />
                  <div class="upload-text-wrap">
                    <span class="upload-label">파일 선택</span>
                  </div>
                  <input type="file" class="hidden-file-input" />
                </div>
                <div class="file-desc">
                  <span class="desc-text">최대 10MB, 여러 파일 첨부 가능</span>
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="row-label">
                <span class="label-text">참조</span>
              </div>
              <div class="row-content ref-content">
                <div class="ref-input-area">
                  <div class="ref-chips"></div>
                </div>
                <button class="btn-ref-add">
                  <span class="btn-text-sm">참조자 지정</span>
                </button>
              </div>
            </div>
          </div>

          <div class="detail-form-section">
            <div class="section-header">
              <div class="row-label">
                <span class="label-text">급여 인상 신청 정보</span>
              </div>
            </div>
            
            <div class="section-body">
              
              <div class="input-group-row mb-20">
                <div class="input-group full-width">
                  <div class="group-label">
                    <span class="label-text">인상액 입력 방식을 선택하세요 *</span>
                  </div>
                  <div class="radio-group-box">
                    <div class="radio-item">
                      <div class="radio-circle"></div>
                      <span class="radio-label">직접입력</span>
                    </div>
                    <div class="radio-item">
                      <div class="radio-circle active">
                        <div class="radio-dot"></div>
                      </div>
                      <span class="radio-label">인상률 입력</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="input-group-row">
                
                <div class="input-group col-rate">
                  <div class="group-label">
                    <span class="label-text">인상률</span>
                  </div>
                  <div class="percent-input-box">
                    <span class="percent-value">1.5</span>
                    <span class="percent-unit">%</span>
                  </div>
                </div>

                <div class="input-group col-amount">
                  <div class="group-label">
                    <span class="label-text hidden-md">&nbsp;</span> 
                  </div>
                  <div class="salary-comparison-box">
                    <div class="salary-input-wrapper read-only">
                      <span class="salary-label">기존 기본급</span>
                      <div class="salary-value-row">
                        <span class="salary-amount disabled">2,000,000</span>
                        <span class="currency-unit">원</span>
                      </div>
                    </div>

                    <img class="comparison-arrow" src="/images/linearrow.svg" alt="arrow" />

                    <div class="salary-input-wrapper active">
                      <span class="salary-label highlight">인상 후 기본급</span>
                      <div class="salary-value-row">
                        <span class="salary-amount highlight">0</span>
                        <span class="currency-unit highlight">원</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div class="form-row border-top">
              <div class="row-label">
                <span class="label-text">신청 사유</span>
              </div>
              <div class="row-content reason-content">
                <div class="textarea-box">
                  <div class="text-line">
                    <span class="input-text">안녕하세요, 애플리케이션 개발3팀 김히어로 대리 입니다.</span>
                  </div>
                  <div class="text-line"></div>
                  <div class="text-line">
                    <span class="input-text">'2025년 급여 인상 신청 요청드립니다. 세부 내용은 아래와 같습니다.</span>
                  </div>
                  <div class="text-line"></div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div class="action-buttons">
          <button class="btn-secondary">
            <img class="btn-icon" src="/images/file.svg" alt="save" />
            <span class="btn-text">임시저장</span>
          </button>
          <button class="btn-secondary">
            <img class="btn-icon" src="/images/cancel.svg" alt="cancel" />
            <span class="btn-text">작성취소</span>
          </button>
          <button class="btn-primary">
            <img class="btn-icon" src="/images/submit.svg" alt="submit" />
            <span class="btn-text-white">상신</span>
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Logic here
</script>

<style scoped>
@import "@/assets/styles/vacation.css";

/* -----------------------------------------------------------
   Raise Payroll Specific Styles
   ----------------------------------------------------------- */

.raise-form-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.full-width {
  width: 100%;
}

.mb-20 {
  margin-bottom: 20px;
}

/* Radio Group Styles */
.radio-group-box {
  display: flex;
  gap: 24px;
  align-items: center;
  padding: 8px 0;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.radio-circle {
  width: 20px;
  height: 20px;
  border: 2px solid #cad5e2; /* Default border */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.radio-circle.active {
  border-color: #1c398e;
}

.radio-dot {
  width: 10px;
  height: 10px;
  background-color: #1c398e;
  border-radius: 50%;
}

.radio-label {
  font-family: "Inter-Regular", sans-serif;
  font-size: 14px;
  color: #0f172b;
}

/* Percent Input Styles */
.col-rate {
  width: 150px; /* Fixed width for rate input */
  flex-shrink: 0;
}

.percent-input-box {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 4px;
  height: 55px; /* Match height of salary inputs */
  background: #fff;
}

.percent-value {
  font-size: 14px;
  color: #000;
  flex: 1;
}

.percent-unit {
  font-size: 14px;
  color: #000;
}

/* Salary Comparison Reuse (Similar to ModifyPayroll) */
.col-amount {
  flex: 1;
  min-width: 350px;
}

.salary-comparison-box {
  display: flex;
  align-items: center;
  gap: 20px;
  width: 100%;
}

.salary-input-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column; /* Label on top inside or outside? Design shows inside label but styled differently */
  /* Re-adjusting to match the specific RaisePayroll visual which puts label INSIDE left-aligned */
  gap: 4px; 
  border-radius: 10px;
  padding: 8px 16px;
  height: 55px;
  justify-content: center;
}

.salary-input-wrapper.read-only {
  border: 1px solid #cad5e2;
}

.salary-input-wrapper.active {
  border: 1px solid #155dfc;
  background-color: #ffffff;
}

.salary-input-wrapper .salary-value-row {
  display: flex;
  justify-content: flex-end; /* Values aligned right */
  align-items: center;
  gap: 4px;
}

/* Internal labels for salary inputs */
.salary-input-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.salary-label {
  font-size: 12px;
  color: #62748e;
}

.salary-label.highlight {
  color: #155dfc;
}

.salary-amount {
  font-size: 20px;
  letter-spacing: -0.45px;
  color: #0f172b;
}

.salary-amount.disabled {
  color: rgba(10, 10, 10, 0.5);
}

.salary-amount.highlight {
  color: rgba(10, 10, 10, 0.5); 
}

.currency-unit {
  font-size: 14px;
  color: #62748e;
}
.currency-unit.highlight {
  color: #155dfc;
}

.comparison-arrow {
  width: 24px;
  height: auto;
}

@media (max-width: 768px) {
  .hidden-md {
    display: none;
  }
  .salary-comparison-box {
    flex-direction: column;
    height: auto;
  }
  .comparison-arrow {
    transform: rotate(90deg);
  }
  .salary-input-wrapper {
    width: 100%;
  }
}
</style>