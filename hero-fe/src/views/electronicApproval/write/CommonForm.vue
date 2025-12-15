<template>
    <div class="form-wrapper">
        <div class="paper-sheet">
            <div class="paper-padding">
                <div class="paper-content">

                    <!-- 제목 영역 -->
                    <div class="title-section">
                    <div class="title-row">
                        <h1 class="main-title">{{ props.title }}</h1>
                    </div>
                    </div>

                    <!-- 상단 정보 + 결재선 -->
                    <div class="top-section">
                    <div class="info-table">
                        <div class="info-row">
                        <div class="th-cell">
                            <span class="label-text">기안자</span>
                        </div>
                        <div class="td-cell">
                            <span class="value-text">{{ props.empName }}</span>
                        </div>
                        </div>
                        <div class="info-row">
                        <div class="th-cell">
                            <span class="label-text">소속</span>
                        </div>
                        <div class="td-cell">
                            <span class="value-text">{{ props.empDept }}</span>
                        </div>
                        </div>
                        <div class="info-row">
                        <div class="th-cell">
                            <span class="label-text">기안일</span>
                        </div>
                        <div class="td-cell">
                            <span class="value-text">{{ currentDate }}</span>
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
                            <span class="value-text">{{ props.category }}</span>
                        </div>
                        </div>
                    </div>

                    <!-- 결재 도장 영역 -->
                    <div class="stamp-area">
                        <div class="stamp-group">
                        <div class="stamp-box">
                            <div class="stamp-header">
                            <span class="stamp-role-label">기안</span>
                            </div>
                            <div class="stamp-body">
                            <div class="approver-info">
                                <span class="approver-name">{{ props.empName }}</span>
                                <span class="approver-rank">{{ props.empGrade }}</span>
                            </div>
                            <div class="stamp-signature approved">
                                <div class="signature-text">
                                <span class="status-approved">기안</span>
                                </div>
                            </div>
                            </div>
                            <div class="stamp-footer">
                            <span class="stamp-date">{{ currentDate }}</span>
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

                    <!-- 메인 폼 영역 -->
                    <div class="form-section">
                    
                        <!-- 공통 입력 섹션 -->
                        <div class="main-form-section">
                            
                            <!-- 제목 -->
                            <div class="form-row">
                            <div class="row-label">
                                <span class="label-text">제목</span>
                            </div>
                            <div class="row-content">
                                <div class="input-wrapper">
                                <span class="input-text">{{ props.title }}</span>
                                </div>
                            </div>
                            </div>
    
                            <!-- 결재선 -->
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
    
                            <!-- 첨부파일 -->
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
    
                            <!-- 참조 -->
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
    
                        <!-- 동적 상세 폼 섹션 (슬롯으로 각 서식별 컴포넌트 주입) -->
                        <slot name="detail-section"></slot>

                    </div>

                </div>

                <!-- 하단 버튼 -->
                <div class="action-buttons">
                    <button class="btn-secondary" @click="emit('save-draft')">
                    <img class="btn-icon" src="/images/file.svg" />
                    <span class="btn-text">임시저장</span>
                    </button>

                    <button class="btn-secondary" @click="emit('cancel')">
                    <img class="btn-icon" src="/images/cancel.svg" />
                    <span class="btn-text">작성취소</span>
                    </button>

                    <button class="btn-primary" @click="emit('submit')">
                    <img class="btn-icon" src="/images/submit.svg" />
                    <span class="btn-text-white">상신</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  title: string;
  category: string;
  empName: string;
  empDept: string;
  empGrade: string;
}>();

const emit = defineEmits<{
  'save-draft': [];
  'cancel': [];
  'submit': [];
}>();

const currentDate = computed(() => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  return `${year}-${month}-${day}`;
});
</script>

<style scoped>
@import "@/assets/styles/commonform.css";
</style>