<!--
 * <pre>
 * Vue Name        : ApprovalDetailCommonForm.vue
 * Description     : 문서 조회용 공통 폼 (읽기 전용)
 *
 * 컴포넌트 연계
 * - 부모 컴포넌트: ApprovalDetail.vue
 *
 * History
 *   2025/12/26 (민철) 최초 작성 (ApprovalCreateCommonForm 기반 읽기 전용 버전)
 *   2026/01/01 (혜원) 첨부파일 다운로드 기능 구현
 * </pre>
 *
 * @module approval
 * @author 민철, 혜원
 * @version 1.1
-->
<template>
    <div class="form-wrapper">
        <div class="paper-sheet">
            <div class="paper-padding">
                <div class="paper-content">

                    <!-- 제목 영역 -->
                    <div class="title-section">
                        <div class="title-row">
                            <h1 class="main-title">{{ document.templateName }}</h1>
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
                                    <span class="value-text">{{ document.drafter }}</span>
                                </div>
                            </div>
                            <div class="info-row">
                                <div class="th-cell">
                                    <span class="label-text">소속</span>
                                </div>
                                <div class="td-cell">
                                    <span class="value-text">{{ document.drafterDept }}</span>
                                </div>
                            </div>
                            <div class="info-row">
                                <div class="th-cell">
                                    <span class="label-text">기안일</span>
                                </div>
                                <div class="td-cell">
                                    <span class="value-text">{{ formatDate(document.draftDate) }}</span>
                                </div>
                            </div>
                            <div class="info-row">
                                <div class="th-cell">
                                    <span class="label-text">문서번호</span>
                                </div>
                                <div class="td-cell">
                                    <span class="value-text">{{ document.docNo }}</span>
                                </div>
                            </div>
                            <div class="info-row last-row">
                                <div class="th-cell">
                                    <span class="label-text">문서분류</span>
                                </div>
                                <div class="td-cell">
                                    <span class="value-text">{{ document.category }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- 결재 도장 영역 -->
                        <div class="stamp-area">
                            <div class="stamp-group">

                                <!-- 결재선 도장 (최대 3개) -->
                                <div v-for="(line, index) in displayLines" :key="index" class="stamp-box">
                                    <div class="stamp-header">
                                        <span class="stamp-role-label">{{ index === 0 ? '기안' : '결재' }}</span>
                                    </div>
                                    <div class="stamp-body">
                                        <div class="approver-info-vertical">
                                            <div class="approver-name-row">
                                                <span class="approver-name">{{ line.approverName }}</span>
                                                <span class="approver-rank">{{ line.gradeName }}</span>
                                            </div>
                                            <span class="approver-dept">{{ line.departmentName }}</span>
                                        </div>
                                        <div class="stamp-signature" :class="getStampClass(line.status)">
                                            <div class="signature-text">
                                                <span :class="getStatusTextClass(line.status)">
                                                    {{ getStatusLabel(line.status) }}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="stamp-footer">
                                        <span class="stamp-date">{{ formatDate(line.approvedAt) || '-' }}</span>
                                    </div>
                                </div>

                                <!-- 빈 도장 (3개 미만일 때) -->
                                <div v-for="i in emptyStampCount" :key="`empty-${i}`" class="stamp-box">
                                    <div class="stamp-header">
                                        <span class="stamp-role-label">결재</span>
                                    </div>
                                    <div class="stamp-body">
                                        <div class="approver-info-vertical">
                                            <span class="approver-name empty">미지정</span>
                                        </div>
                                        <div class="stamp-signature empty">
                                            <div class="signature-text">
                                                <span class="status-empty">-</span>
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

                        <!-- 공통 섹션 -->
                        <div class="main-form-section">

                            <!-- 제목 -->
                            <div class="form-row">
                                <div class="row-label-top">
                                    <span class="label-text">제목</span>
                                </div>
                                <div class="row-content">
                                    <div class="readonly-text">{{ document.title }}</div>
                                </div>
                            </div>

                            <!-- 결재선 (읽기 전용) -->
                            <div class="form-row">
                                <div class="row-label">
                                    <span class="label-text">결재선</span>
                                </div>
                                <div class="row-content flow-content">
                                    <div class="approval-flow">
                                        <template v-for="(approver, index) in document.lines" :key="index">
                                            <div class="flow-card">
                                                <div class="card-inner">
                                                    <div class="avatar-circle">
                                                        <span class="avatar-text">{{ approver.approverName?.charAt(0)
                                                            }}</span>
                                                    </div>
                                                    <div class="card-details">
                                                        <div class="detail-row">
                                                            <span class="detail-name">{{ approver.approverName }} {{
                                                                approver.gradeName }}</span>
                                                        </div>
                                                        <div class="detail-row">
                                                            <span class="detail-dept">{{ approver.departmentName
                                                                }}</span>
                                                        </div>
                                                        <div class="detail-row">
                                                            <span class="detail-role"
                                                                :style="{ color: index === 0 ? '#1c398e' : '#62748e', fontWeight: index === 0 ? '600' : '400' }">
                                                                {{ index === 0 ? '기안' : '결재' }}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <img v-if="index < document.lines.length - 1" class="flow-arrow"
                                                src="/images/linearrow.svg" alt="화살표" />
                                        </template>
                                    </div>
                                </div>
                            </div>

                            <!-- 참조 (읽기 전용) -->
                            <div class="form-row" v-if="document.references && document.references.length > 0">
                                <div class="row-label">
                                    <span class="label-text">참조</span>
                                </div>
                                <div class="row-content ref-content">
                                    <div class="reference-wrapper">
                                        <div class="ref-chip-list">
                                            <div v-for="(refMember, index) in document.references" :key="index"
                                                class="ref-chip readonly">
                                                <span class="ref-name">{{ refMember.referencerName }} {{
                                                    refMember.gradeName }} {{
                                                        refMember.departmentName }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="row-label">
                                    <span class="label-text">첨부파일</span>
                                </div>

                                <div class="row-content file-content">
                                    <div v-if="document.attachments && document.attachments.length > 0"
                                        class="file-list-wrapper">
                                        <div v-for="file in document.attachments" :key="file.attachmentId"
                                            class="file-item" @click="onDownload(file)">
                                            <div class="file-info">
                                                <span class="file-icon">📎</span>
                                                <span class="file-name">{{ file.originalFilename }}</span>
                                                <span class="file-size">{{ formatFileSize(file.fileSize) }}</span>
                                            </div>
                                            <button class="btn-download-icon" type="button">
                                                <i class="fas fa-download"></i> </button>
                                        </div>
                                    </div>

                                    <div v-else class="no-file-text">
                                        첨부된 파일이 없습니다.
                                    </div>
                                </div>
                            </div>

                        </div>

                        <!-- 동적 상세 폼 섹션 (슬롯으로 각 서식별 컴포넌트 주입) -->
                        <slot name="detail-section"></slot>

                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ApprovalDocumentDetailResponseDTO, ApprovalAttachmentResponseDTO } from '@/types/approval/approval_detail.types';

const props = defineProps<{
    document: ApprovalDocumentDetailResponseDTO;
    parsedDetails: any;
}>();

/**
 * 도장 표시용 결재선 (최대 3개)
 */
const displayLines = computed(() => {
    return props.document.lines.slice(0, 3);
});

/**
 * 빈 도장 개수 계산
 */
const emptyStampCount = computed(() => {
    const lineCount = props.document.lines.length;
    return lineCount < 3 ? 3 - lineCount : 0;
});

/**
 * 날짜 포맷팅
 */
const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * 결재 상태에 따른 도장 클래스
 */
const getStampClass = (status: string): string => {
    const classMap: Record<string, string> = {
        'APPROVED': 'approved',
        'PENDING': 'pending',
        'REJECTED': 'rejected',
        'DRAFT': 'draft',
    };
    return classMap[status] || 'pending';
};

/**
 * 결재 상태 텍스트 클래스
 */
const getStatusTextClass = (status: string): string => {
    const classMap: Record<string, string> = {
        'APPROVED': 'status-approved',
        'PENDING': 'status-pending',
        'REJECTED': 'status-rejected',
        'DRAFT': 'status-draft',
    };
    return classMap[status] || 'status-pending';
};

/**
 * 결재 상태 라벨
 */
const getStatusLabel = (status: string): string => {
    const labelMap: Record<string, string> = {
        'APPROVED': '승인',
        'PENDING': '대기',
        'REJECTED': '반려',
        'DRAFT': '기안',
    };
    return labelMap[status] || '대기';
};

/**
 * 파일 크기 포맷팅 (Bytes -> KB, MB)
 */
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 파일 다운로드 핸들러
 * S3 Presigned URL을 사용하여 다운로드
 */
const onDownload = (file: ApprovalAttachmentResponseDTO) => {
    // downloadUrl이 있으면 바로 다운로드
    if (file.downloadUrl) {
        window.open(file.downloadUrl, '_blank');
    } else {
        console.error('다운로드 URL이 없습니다:', file);
        alert('파일 다운로드 URL을 찾을 수 없습니다.');
    }
};
</script>

<style scoped src="@/assets/styles/approval/commonform.css"></style>

<style scoped>
.readonly-text {
    padding: 12px 16px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background-color: #f8fafc;
    font-family: "Inter-Regular", sans-serif;
    font-size: 14px;
    color: #334155;
    width: 100%;
}

.ref-chip.readonly {
    background-color: #f1f5f9;
    cursor: default;
}

.ref-chip.readonly .btn-ref-delete {
    display: none;
}

/* 파일 목록 컨테이너 (스크롤 영역) */
.file-list-wrapper {
    /* 파일 항목 하나 높이(약 44px) * 3개 = 약 132px + 여유분 */
    max-height: 140px; 
    overflow-y: auto; /* 내용이 넘치면 세로 스크롤 생성 */
    width: 100%;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background-color: #fff;
}

/* 개별 파일 항목 */
.file-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    border-bottom: 1px solid #f1f5f9;
    cursor: pointer;
    transition: background-color 0.2s;
}

/* 마지막 항목은 밑줄 제거 */
.file-item:last-child {
    border-bottom: none;
}

.file-item:hover {
    background-color: #f8fafc;
}

.file-info {
    display: flex;
    align-items: center;
    
    gap: 8px;
    flex: 1; /* 남은 공간 차지 */
    min-width: 0; /* 텍스트 말줄임 처리를 위해 필수 */
}

.file-icon {
    font-size: 16px;
}

.file-name {
    font-size: 14px;
    color: #334155;
    font-weight: 500;
    
    /* 긴 파일명 말줄임 (...) 처리 */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.file-size {
    font-size: 12px;
    color: #94a3b8;
    margin-left: 4px;
    white-space: nowrap; /* 줄바꿈 방지 */
}

.btn-download-icon {
    border: none;
    background: none;
    color: #64748b;
    cursor: pointer;
    padding: 4px;
}

.btn-download-icon:hover {
    color: #3b82f6;
}

/* 스크롤바 커스텀 (Chrome, Safari, Edge) - 선택사항 */
.file-list-wrapper::-webkit-scrollbar {
    width: 6px;
}
.file-list-wrapper::-webkit-scrollbar-track {
    background: #f1f5f9; 
    border-radius: 4px;
}
.file-list-wrapper::-webkit-scrollbar-thumb {
    background: #cbd5e1; 
    border-radius: 4px;
}
.file-list-wrapper::-webkit-scrollbar-thumb:hover {
    background: #94a3b8; 
}

.no-file-text {
    color: #94a3b8;
    font-size: 14px;
    padding: 12px 0;
}
</style>