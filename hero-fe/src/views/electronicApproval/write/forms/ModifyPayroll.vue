<template>
  <div class="payroll-form-wrapper">
    <div class="paper-sheet">
      <div class="paper-padding">
        <div class="paper-content">
          
          <div class="title-section">
            <div class="title-row">
              <h1 class="main-title">급여조정신청서</h1>
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
                  <span class="input-text">급여조정신청서</span>
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
                <span class="label-text">급여 조정 정보</span>
              </div>
            </div>
            
            <div class="section-body">
              <div class="input-group-row">
                
                <div class="input-group col-type">
                  <div class="group-label">
                    <span class="label-text">조정항목타입 *</span>
                  </div>
                  <div class="dropdown-box">
                    <div class="dropdown-value">
                      <span class="placeholder-text">선택하세요</span>
                    </div>
                    <img class="icon-dropdown" src="/images/dropdownarrow.svg" alt="dropdown" />
                  </div>
                </div>

                <div class="input-group col-amount">
                  <div class="group-label">
                    <span class="label-text">조정 금액 *</span>
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
                      <span class="salary-label highlight">조정 후 기본급</span>
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
                <span class="label-text">조정 사유</span>
              </div>
              <div class="row-content reason-content">
                <div class="textarea-box">
                  <div class="text-line">
                    <span class="input-text">안녕하세요, 애플리케이션 개발3팀 김히어로 대리 입니다.</span>
                  </div>
                  <div class="text-line"></div>
                  <div class="text-line">
                    <span class="input-text">'2025년 급여 조정을 요청드립니다. 세부 내용은 아래와 같습니다.</span>
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
/* Imports standard styles from Vacation.vue reference.
  Ideally, this should be in a global SCSS/CSS file.
*/
@import "@/assets/styles/vacation.css";

/* -----------------------------------------------------------
   Payroll Specific Styles (Overrides or Extensions)
   ----------------------------------------------------------- */

/* Wrapper for the specific Payroll layout */
.payroll-form-wrapper {
  /* Inherits basic wrapper properties from vacation.css logic */
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Adjust column width for specific payroll inputs */
.col-amount {
  flex: 1;
  min-width: 400px;
}

/* Salary Comparison Box Container */
.salary-comparison-box {
  display: flex;
  align-items: center;
  gap: 20px;
  width: 100%;
}

/* Individual Salary Input Box (Before/After) */
.salary-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 10px;
  padding: 12px 16px;
}

/* Style for Read-only (Left side) */
.salary-input-wrapper.read-only {
  border: 1px solid #cad5e2;
  background-color: #f8fafc; /* Optional: differentiate read-only */
}

/* Style for Active/New (Right side) */
.salary-input-wrapper.active {
  border: 1px solid #155dfc;
  background-color: #ffffff;
}

.salary-label {
  font-family: "Inter-Regular", sans-serif;
  font-size: 12px;
  color: #62748e;
}

.salary-label.highlight {
  color: #155dfc;
}

.salary-value-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.salary-amount {
  font-family: "Inter-Regular", sans-serif;
  font-size: 20px;
  text-align: right;
  letter-spacing: -0.45px;
}

.salary-amount.disabled {
  color: rgba(10, 10, 10, 0.5);
}

.salary-amount.highlight {
  color: rgba(10, 10, 10, 0.5); /* Matching the design mock even if highlighted box */
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

/* Ensure the detail section body has enough padding/spacing */
.section-body {
  display: flex;
  flex-direction: column;
}

.input-group-row {
  width: 100%;
}

/* Responsive adjustments if needed */
@media (max-width: 768px) {
  .salary-comparison-box {
    flex-direction: column;
    align-items: stretch;
  }
  .comparison-arrow {
    align-self: center;
    transform: rotate(90deg);
  }
}
</style>