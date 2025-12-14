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
                            
                            <!-- 제목 입력 부분 -->
                            <div class="form-row">
                                <div class="row-label-top">
                                    <span class="label-text">제목</span>
                                </div>
                                <div class="row-content">
                                    <input
                                        v-model="commonData.title"
                                        type="text"
                                        class="input-wrapper"
                                        placeholder="제목을 입력하세요"
                                        />
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
                                
                                <div class="upload-left-section">
                                <div class="file-upload-box" @click="triggerFileUpload">
                                    <img class="icon-upload" src="/images/fileupload.svg" />
                                    <div class="upload-text-wrap">
                                    <span class="upload-label">파일 선택</span>
                                    </div>
                                    <input 
                                    type="file" 
                                    ref="fileInput"
                                    class="hidden-file-input" 
                                    multiple
                                    @click.stop 
                                    @change="handleFileUpload"
                                    />
                                </div>
                                <div class="file-desc">
                                    <span class="desc-text">최대 10MB, 여러 파일 첨부 가능</span>
                                </div>
                                </div>

                                <div v-if="commonData.attachments.length > 0" class="uploaded-file-list">
                                <div 
                                    v-for="(file, index) in commonData.attachments" 
                                    :key="index" 
                                    class="file-item"
                                >
                                    <div class="file-info">
                                    <img class="icon-clip" src="/images/file.svg" alt="file" /> 
                                    <span class="file-name">{{ file.name }}</span>
                                    <span class="file-size">{{ formatFileSize(file.size) }}</span>
                                    </div>
                                    <button class="btn-remove-file" @click.stop="removeFile(index)">
                                    <img src="/images/deletebutton.svg" alt="삭제" width="14" />
                                    </button>
                                </div>
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
                    <button class="btn-secondary" @click="onPreview">
                    <img class="btn-icon" src="/images/file.svg" />
                    <span class="btn-text">임시저장</span>
                    </button>

                    <button class="btn-secondary" @click="onCancel">
                    <img class="btn-icon" src="/images/cancel.svg" />
                    <span class="btn-text">작성취소</span>
                    </button>

                    <button class="btn-primary" @click="onSubmit">
                    <img class="btn-icon" src="/images/submit.svg" />
                    <span class="btn-text-white">상신</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';

const props = defineProps<{
  title: string;
  category: string;
  empName: string;
  empDept: string;
  empGrade: string;
}>();

const emit = defineEmits<{
  (e: 'preview'): void
  (e: 'cancel'): void
  (e: 'submit'): void
}>();

const onPreview = () => {
  emit('preview');
};

const onCancel = () => {
  emit('cancel');
};

const onSubmit = () => {
  emit('submit');
};

// ✅ 공통 데이터 관리
const commonData = reactive({
  title: '',
  approvalLine: [] as any[],
  attachments: [] as File[],
  references: [] as any[]
});

const currentDate = computed(() => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
});

// ✅ 파일 업로드 관련 로직 구현
const fileInput = ref<HTMLInputElement | null>(null);

// 박스 클릭 시 숨겨진 input 클릭
const triggerFileUpload = () => {
  fileInput.value?.click();
};

// 파일 선택 핸들러
const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    // 기존 파일 배열에 새로 선택한 파일들을 추가 (중복 제거 로직 필요 시 추가 가능)
    const newFiles = Array.from(target.files);
    commonData.attachments = [...commonData.attachments, ...newFiles];
  }
  // input 초기화 (동일 파일 다시 선택 가능하게)
  if (target.value) target.value = '';
};

// 파일 삭제 핸들러
const removeFile = (index: number) => {
  commonData.attachments.splice(index, 1);
};

// 파일 사이즈 포맷팅 유틸
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// ✅ 공통 데이터를 WriteDocument에 전달하는 메서드
const getCommonData = () => {
  return {
    title: commonData.title,
    approvalLine: commonData.approvalLine,
    attachments: commonData.attachments,
    references: commonData.references
  };
};

// ✅ 외부에서 호출 가능하도록 expose
defineExpose({
  getCommonData
});
</script>

<style scoped>
@import "@/assets/styles/commonform.css";

/* ✅ 파일 첨부 영역 레이아웃 수정 */

/* 1. 전체 컨테이너를 Flex로 설정하여 좌우 배치 */
.file-content {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 16px; /* 좌측 버튼과 우측 리스트 사이 간격 */
  width: 100%;
}

/* 2. 좌측 업로드 버튼 영역 */
.upload-left-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0; /* 너비 줄어들지 않게 고정 */
}

/* 3. 우측 파일 리스트 박스 */
.uploaded-file-list {
  flex-grow: 1; /* 남은 공간 차지 */
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: #f8fafc;
  padding: 8px;
  
  /* 핵심: 스크롤 및 높이 제한 설정 */
  /* 파일 하나 높이 약 36px * 5개 + 패딩 고려하여 약 190px 설정 */
  max-height: 72px; 
  overflow-y: auto; /* 넘치면 스크롤 생성 */
}

/* 스크롤바 커스텀 (선택사항 - 깔끔하게 보이도록) */
.uploaded-file-list::-webkit-scrollbar {
  width: 6px;
}
.uploaded-file-list::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 3px;
}

/* 개별 파일 아이템 스타일 */
.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 6px 10px;
  margin-bottom: 6px;
  font-size: 13px;
}

.file-item:last-child {
  margin-bottom: 0;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
}

.icon-clip {
  width: 14px;
  height: 14px;
  opacity: 0.6;
}

.file-name {
  color: #334155;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px; /* 이름이 너무 길면 ... 처리 */
}

.file-size {
  color: #94a3b8;
  font-size: 12px;
  white-space: nowrap;
}

.btn-remove-file {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.btn-remove-file:hover {
  opacity: 1;
}

.hidden-file-input {
  display: none;
}
</style>