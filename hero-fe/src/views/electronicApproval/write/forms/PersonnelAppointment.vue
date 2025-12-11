<template>
  <div class="appointment-form-wrapper">
    <div class="paper-sheet">
      <div class="paper-padding">
        <div class="paper-content">
          
          <div class="title-section">
            <div class="title-row">
              <h1 class="main-title">인사발령품의서</h1>
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
                  <span class="value-text">인사</span>
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
                  <span class="input-text">인사발령품의서</span>
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
                <span class="label-text">인사발령 정보</span>
              </div>
            </div>
            
            <div class="section-body">
              
              <div class="input-group-row">
                <div class="input-group col-half">
                  <div class="group-label">
                    <span class="label-text">발령 유형</span>
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
                    <span class="label-text">발령 시행 일자</span>
                  </div>
                  <div class="date-input-box">
                    <span class="placeholder-text">YYYY-MM-DD</span>
                  </div>
                </div>
              </div>

              <div class="input-group-row mt-20">
                <div class="input-group col-half">
                  <div class="group-label">
                    <span class="label-text">대상 직원 사번</span>
                  </div>
                  <div class="input-wrapper-white">
                    <span class="placeholder-text">사번 입력</span>
                  </div>
                </div>
                <div class="input-group col-half">
                  <div class="group-label">
                    <span class="label-text">대상 직원 이름</span>
                  </div>
                  <div class="input-wrapper-white">
                    <span class="placeholder-text">이름 입력</span>
                  </div>
                </div>
              </div>

              <div class="sub-section-header mt-30">
                <span class="sub-section-title">현재 정보</span>
              </div>
              <div class="input-group-row mt-10">
                <div class="input-group col-third">
                  <div class="group-label">
                    <span class="label-text">현재 부서</span>
                  </div>
                  <div class="input-wrapper-sm">
                    <span class="input-text">애플리케이션 개발1팀</span>
                  </div>
                </div>
                <div class="input-group col-third">
                  <div class="group-label">
                    <span class="label-text">현재 직책</span>
                  </div>
                  <div class="input-wrapper-sm">
                    <span class="input-text">팀원</span>
                  </div>
                </div>
                <div class="input-group col-third">
                  <div class="group-label">
                    <span class="label-text">현재 직급</span>
                  </div>
                  <div class="input-wrapper-sm">
                    <span class="input-text">대리</span>
                  </div>
                </div>
              </div>

              <div class="sub-section-header mt-30">
                <span class="sub-section-title">발령 후 정보</span>
              </div>
              <div class="input-group-row mt-10">
                <div class="input-group col-fourth">
                  <div class="group-label">
                    <span class="label-text">발령 부서</span>
                  </div>
                  <div class="dropdown-box">
                    <div class="dropdown-value">
                      <span class="placeholder-text">선택하세요</span>
                    </div>
                    <img class="icon-dropdown" src="/images/dropdownarrow.svg" alt="arrow" />
                  </div>
                </div>
                <div class="input-group col-fourth">
                  <div class="group-label">
                    <span class="label-text">발령 직책</span>
                  </div>
                  <div class="dropdown-box">
                    <div class="dropdown-value">
                      <span class="placeholder-text">선택하세요</span>
                    </div>
                    <img class="icon-dropdown" src="/images/dropdownarrow.svg" alt="arrow" />
                  </div>
                </div>
                <div class="input-group col-fourth">
                  <div class="group-label">
                    <span class="label-text">발령 직급</span>
                  </div>
                  <div class="dropdown-box">
                    <div class="dropdown-value">
                      <span class="placeholder-text">선택하세요</span>
                    </div>
                    <img class="icon-dropdown" src="/images/dropdownarrow.svg" alt="arrow" />
                  </div>
                </div>
                <div class="input-group col-fourth">
                  <div class="group-label">
                    <span class="label-text">근무 상태</span>
                  </div>
                  <div class="dropdown-box">
                    <div class="dropdown-value">
                      <span class="placeholder-text">선택하세요</span>
                    </div>
                    <img class="icon-dropdown" src="/images/dropdownarrow.svg" alt="arrow" />
                  </div>
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
   Appointment Form Specific Styles
   ----------------------------------------------------------- */

.appointment-form-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mt-10 { margin-top: 10px; }
.mt-20 { margin-top: 20px; }
.mt-30 { margin-top: 30px; }

/* Grid Columns */
.col-half {
  flex: 1;
  min-width: 250px;
}

.col-third {
  flex: 1;
  min-width: 180px;
}

.col-fourth {
  flex: 1;
  min-width: 150px;
}

/* Sub-section Headers */
.sub-section-header {
  width: 100%;
  padding-bottom: 8px;
  border-bottom: 1px dashed #e2e8f0;
}

.sub-section-title {
  color: #0f172b;
  font-family: "Inter-Regular", sans-serif;
  font-size: 14px;
  font-weight: 600; /* Bold to distinguish sub-section */
}

/* Input Styles */
.input-wrapper-sm {
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 8px 12px;
  background: #f8fafc; /* Read-only background */
  height: 40px;
  display: flex;
  align-items: center;
}

.input-wrapper-white {
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 8px 12px;
  background: #fff;
  height: 40px;
  display: flex;
  align-items: center;
}

.date-input-box {
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 8px 12px;
  background: #fff;
  display: flex;
  align-items: center;
  height: 40px;
}

.dropdown-box {
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  height: 40px;
}

.placeholder-text {
  color: #90a1b9;
  font-size: 14px;
}
</style>