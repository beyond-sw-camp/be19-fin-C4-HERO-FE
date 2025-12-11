<template>
  <div class="vacation-form-wrapper">
    <div class="paper-sheet">
      <div class="paper-padding">
        <div class="paper-content">
          
          <div class="title-section">
            <div class="title-row">
              <h1 class="main-title">휴가 신청서</h1>
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
                  <span class="value-text">휴가</span>
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
                  <span class="input-text">휴가 신청서</span>
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
                    <img class="btn-delete" src="/images/deletebutton.svg" />
                  </div>
                  
                  <img class="flow-arrow" src="/images/linearrow.svg" />

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
                    <img class="btn-delete" src="/images/deletebutton.svg" />
                  </div>

                  <img class="flow-arrow" src="/images/linearrow.svg" />

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
                    <img class="btn-delete" src="/images/deletebutton.svg" />
                  </div>

                  <img class="flow-arrow" src="/images/linearrow.svg" />

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
                  <img class="icon-upload" src="/images/fileupload.svg" />
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
                <span class="label-text">휴가 신청 정보</span>
              </div>
            </div>
            
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

        </div>

        <div class="action-buttons">
          <button class="btn-secondary">
            <img class="btn-icon" src="/images/file.svg" />
            <span class="btn-text">임시저장</span>
          </button>
          <button class="btn-secondary">
            <img class="btn-icon" src="/images/cancel.svg" />
            <span class="btn-text">작성취소</span>
          </button>
          <button class="btn-primary">
            <img class="btn-icon" src="/images/submit.svg" />
            <span class="btn-text-white">상신</span>
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
@import "@/assets/styles/vacation.css";
</style>