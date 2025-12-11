<template>
  <div class="work-record-form-wrapper">
    <div class="paper-sheet">
      <div class="paper-padding">
        <div class="paper-content">
          
          <div class="title-section">
            <div class="title-row">
              <h1 class="main-title">근태기록수정신청서</h1>
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
                  <span class="value-text">근태</span>
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
                  <span class="input-text">근태기록수정신청서</span>
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
                <span class="label-text">근태 기록 수정 정보</span>
              </div>
            </div>
            
            <div class="section-body">
              
              <div class="input-group-row">
                <div class="input-group col-full">
                  <div class="group-label group-label-with-icon">
                    <img class="icon-label" src="/images/calendar.svg" alt="calendar" />
                    <span class="label-text">근태 기록 수정 날짜</span>
                  </div>
                  <div class="date-input-box">
                    <span class="placeholder-text">날짜를 선택하세요</span>
                  </div>
                </div>
              </div>

              <div class="input-group-row mt-20">
                <div class="input-group col-half">
                  <div class="group-label group-label-with-icon">
                    <img class="icon-label" src="/images/clock.svg" alt="clock" />
                    <span class="label-text">수정 출근 시간</span>
                  </div>
                  <div class="date-input-box">
                    <span class="placeholder-text">00:00</span>
                  </div>
                </div>
                <div class="input-group col-half">
                  <div class="group-label group-label-with-icon">
                    <img class="icon-label" src="/images/clock.svg" alt="clock" />
                    <span class="label-text">수정 퇴근 시간</span>
                  </div>
                  <div class="date-input-box">
                    <span class="placeholder-text">00:00</span>
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
                  <div class="text-line">
                    <span class="input-text">안녕하세요, 애플리케이션 개발3팀 김히어로 대리 입니다.</span>
                  </div>
                  <div class="text-line"></div>
                  <div class="text-line">
                    <span class="input-text">'2025년 근태 기록 수정 요청드립니다. 세부 내용은 아래와 같습니다.</span>
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
   Work Record Modification Specific Styles
   ----------------------------------------------------------- */

.work-record-form-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mt-20 {
  margin-top: 20px;
}

/* Custom layout columns for grid layout */
.col-full {
  width: 100%;
  flex: 1;
}

.col-half {
  flex: 1;
  min-width: 250px;
}

/* Label with Icon styling */
.group-label-with-icon {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-label {
  width: 16px;
  height: 16px;
}

/* Specific Input Box Styling */
.date-input-box {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 12px;
  background: #fff;
  display: flex;
  align-items: center;
  height: 48px;
}

.placeholder-text {
  color: #90a1b9;
  font-size: 14px;
}
</style>