<!--
 * <pre>
 * Vue Name        : ApprovalDetail.vue
 * Description     : 결재 문서 조회 화면 (디버깅 버전)
 *
 * 컴포넌트 연계
 * - 문서 상세 정보 표시
 * - 결재선, 참조자 정보 표시
 * - 결재 권한이 있는 경우 승인/반려 버튼 표시 (순차 결재)
 *
 * History
 *   2025/12/26 (민철) 최초 작성
 *   2025/12/26 (민철) 결재 처리 기능 추가
 *   2025/12/26 (민철) 순차 결재 로직 적용
 *   2025/12/26 (민철) 디버깅 정보 추가
 *   2025/12/29 (민철) 디버깅 정보 삭제, 승인/반려 상태 뱃지 반지름 10px로 변경
 *
 * </pre>
 *
 * @module approval
 * @author 민철
 * @version 3.1
-->
<template>
    <div class="page-wrapper">
        <!-- 헤더 영역 -->
        <div class="page-header">
            <div class="header-inner">
                <button class="btn-back" @click="backToInbox()">
                    <img class="icon-arrow" src="/images/arrow.svg" alt="화살표" />
                    <div class="back-label-wrap">
                        <div class="back-label">목록으로</div>
                    </div>
                </button>

                <div class="action-group" v-if="document">
                    <div class="status-badge" :class="getStatusClass(document.docStatus)">
                        {{ getStatusText(document.docStatus) }}
                    </div>

                    <!-- 결재 권한이 있는 경우 승인/반려 버튼 표시 (순차 결재) -->
                    <template v-if="canApprove">
                        <button class="btn-reject" @click="openRejectModal">
                            <img class="btn-icon" src="/images/cancel-white.svg" alt="반려" />
                            <span class="btn-text-white">반려</span>
                        </button>
                        <button class="btn-approve" @click="handleApprove">
                            <img class="btn-icon" src="/images/submit.svg" alt="승인" />
                            <span class="btn-text-white">승인</span>
                        </button>
                    </template>
                </div>
            </div>
        </div>

        <!-- 메인 컨텐츠 영역 -->
        <div class="page-body">
            <div class="form-wrapper">
                <div class="form-container">

                    <!-- 로딩 중 -->
                    <div v-if="loading" class="loading-container">
                        <div class="loading-text">문서를 불러오는 중...</div>
                    </div>

                    <!-- 에러 -->
                    <div v-else-if="error" class="error-container">
                        <div class="error-text">{{ error }}</div>
                    </div>

                    <!-- 문서 내용 -->
                    <ApprovalDetailCommonForm v-else-if="document" :document="document" :parsedDetails="parsedDetails">
                        <template #detail-section>
                            <component :is="currentDetailSection" :modelValue="parsedDetails" :readonly="true" />
                        </template>
                    </ApprovalDetailCommonForm>

                </div>
            </div>
        </div>

        <!-- 반려 사유 입력 모달 -->
        <Teleport to="body">
            <ApprovalRejectModal v-if="isRejectModalOpen" @close="closeRejectModal" @confirm="handleReject" />
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useApprovalDetail } from '@/composables/approval/useApprovalDetail';
import { processApproval } from '@/api/approval/approval_action.api';
import { useAuthStore } from '@/stores/auth';
import ApprovalDetailCommonForm from './ApprovalDetailCommonForm.vue';
import ApprovalRejectModal from './ApprovalRejectModal.vue';
import {
    ApprovalVacationForm,
    ApprovalOvertimeForm,
    ApprovalWorkChangeForm,
    ApprovalAttendanceFixForm,
    ApprovalAppointmentForm,
    ApprovalPromotionForm,
    ApprovalResignForm,
    ApprovalPayrollRaiseForm,
    ApprovalPayrollAdjustForm,
} from '@/views/approval/create/forms';

/* ========================================== */
/* Router & Route */
/* ========================================== */

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// docId를 route params에서 가져옴
const docId = computed(() => Number(route.params.docId));

/* ========================================== */
/* Composable */
/* ========================================== */

const { document, parsedDetails, loading, error, fetchDocument } = useApprovalDetail(docId.value);

/* ========================================== */
/* 결재 처리 관련 */
/* ========================================== */

const isRejectModalOpen = ref(false);

/**
 * 현재 사용자의 결재선 정보
 */
const myLine = computed(() => {
    if (!document.value || !authStore.user) return null;

    const currentEmployeeId = authStore.user.employeeId;
    return document.value.lines.find(
        line => line.approverId === currentEmployeeId
    );
});

/**
 * 디버깅 정보
 */
const debugInfo = computed(() => {
    if (!document.value || !authStore.user || !myLine.value) return '';

    const previousLines = document.value.lines.filter(
        line => line.seq < myLine.value!.seq && line.seq > 1
    );

    return `앞순서 결재자: ${previousLines.length}명, 승인완료: ${previousLines.filter(l => l.status === 'APPROVED').length}명`;
});

/**
 * 결재 권한 확인 (순차 결재)
 * - 본인이 결재자이고
 * - 결재 상태가 PENDING이고
 * - 문서 상태가 INPROGRESS이고
 * - 내 앞 순서의 결재자들이 모두 승인 완료한 경우
 */
/**
 * 결재 권한 확인 (순차 결재) - 슈퍼 디버깅 버전
 */
const canApprove = computed(() => {
    console.log('========== canApprove 계산 시작 ==========');

    if (!document.value || !authStore.user) {
        console.log('🔍 canApprove = false: document 또는 user 없음');
        console.log('document.value:', document.value);
        console.log('authStore.user:', authStore.user);
        return false;
    }

    console.log('📋 전체 결재선:', document.value.lines);

    const currentEmployeeId = authStore.user.employeeId;
    console.log('👤 현재 사용자 ID:', currentEmployeeId, 'type:', typeof currentEmployeeId);

    // 각 결재선의 approverId 타입 확인
    document.value.lines.forEach((line, idx) => {
        console.log(`결재선[${idx}]:`, {
            lineId: line.lineId,
            approverId: line.approverId,
            approverIdType: typeof line.approverId,
            seq: line.seq,
            status: line.status,
            approverName: line.approverName
        });
    });

    const myLine = document.value.lines.find(
        line => {
            console.log(`비교: ${line.approverId} === ${currentEmployeeId}?`, line.approverId === currentEmployeeId);
            return line.approverId === currentEmployeeId;
        }
    );

    console.log('🎯 내 결재선:', myLine);

    if (!myLine) {
        console.log('🔍 canApprove = false: 내 결재선 없음');
        return false;
    }

    console.log('📊 내 결재선 상세:', {
        lineId: myLine.lineId,
        seq: myLine.seq,
        status: myLine.status,
        statusType: typeof myLine.status,
        statusLength: myLine.status?.length,
        statusEmpty: myLine.status === '',
        statusNull: myLine.status === null,
        statusUndefined: myLine.status === undefined
    });

    // 기본 조건: PENDING 상태
    if (myLine.status !== 'PENDING') {
        console.log('🔍 canApprove = false: 내 상태가 PENDING 아님');
        console.log('실제 상태:', `"${myLine.status}"`, 'PENDING과 비교:', myLine.status === 'PENDING');
        return false;
    }

    // 문서 상태
    if (document.value.docStatus !== 'INPROGRESS') {
        console.log('🔍 canApprove = false: 문서 상태가 INPROGRESS 아님');
        console.log('실제 docStatus:', document.value.docStatus);
        return false;
    }

    // 순차 결재 확인
    console.log('🔍 순차 결재 체크 시작');
    console.log('내 seq:', myLine.seq);

    const previousLines = document.value.lines.filter(
        line => {
            const isPrevious = line.seq < myLine.seq && line.seq > 1;
            console.log(`seq=${line.seq}: 내 앞순서? ${isPrevious} (seq < ${myLine.seq} && seq > 1)`);
            return isPrevious;
        }
    );

    console.log('🔍 앞 순서 결재자:', previousLines);
    console.log('🔍 앞 순서 결재자 수:', previousLines.length);

    previousLines.forEach((line, idx) => {
        console.log(`앞순서[${idx}]:`, {
            seq: line.seq,
            status: line.status,
            isApproved: line.status === 'APPROVED',
            approverName: line.approverName
        });
    });

    const allPreviousApproved = previousLines.every(
        line => line.status === 'APPROVED'
    );

    console.log('🔍 모든 앞 순서 승인 완료?', allPreviousApproved);
    console.log('🔍 최종 canApprove =', allPreviousApproved);
    console.log('========== canApprove 계산 종료 ==========');

    return allPreviousApproved;
});
/**
 * 현재 사용자의 결재선 ID
 */
const myLineId = computed(() => {
    return myLine.value?.lineId || null;
});

/**
 * 승인 처리
 */
const handleApprove = async () => {
    if (!myLineId.value) return;

    if (!confirm('이 문서를 승인하시겠습니까?')) {
        return;
    }

    try {
        const response = await processApproval({
            docId: docId.value,
            lineId: myLineId.value,
            action: 'APPROVE',
        });

        if (response.success) {
            alert('승인 처리되었습니다.');
            // 문서 정보 다시 조회
            await fetchDocument(docId.value);
        } else {
            alert(response.message || '승인 처리에 실패했습니다.');
        }
    } catch (error) {
        console.error('승인 처리 에러:', error);
        alert('승인 처리 중 오류가 발생했습니다.');
    }
};

/**
 * 반려 모달 열기
 */
const openRejectModal = () => {
    isRejectModalOpen.value = true;
};

/**
 * 반려 모달 닫기
 */
const closeRejectModal = () => {
    isRejectModalOpen.value = false;
};

/**
 * 반려 처리
 * @param {string} comment - 반려 사유
 */
const handleReject = async (comment: string) => {
    if (!myLineId.value) return;

    try {
        const response = await processApproval({
            docId: docId.value,
            lineId: myLineId.value,
            action: 'REJECT',
            comment: comment,
        });

        if (response.success) {
            alert('반려 처리되었습니다.');
            closeRejectModal();
            // 문서 정보 다시 조회
            await fetchDocument(docId.value);
        } else {
            alert(response.message || '반려 처리에 실패했습니다.');
        }
    } catch (error) {
        console.error('반려 처리 에러:', error);
        alert('반려 처리 중 오류가 발생했습니다.');
    }
};

/* ========================================== */
/* 섹션 컴포넌트 매핑 */
/* ========================================== */

const sectionMap: Record<string, any> = {
    vacation: ApprovalVacationForm,
    changework: ApprovalWorkChangeForm,
    overtime: ApprovalOvertimeForm,
    modifyworkrecord: ApprovalAttendanceFixForm,
    personnelappointment: ApprovalAppointmentForm,
    promotionplan: ApprovalPromotionForm,
    resign: ApprovalResignForm,
    raisepayroll: ApprovalPayrollRaiseForm,
    modifypayroll: ApprovalPayrollAdjustForm,
};

const currentDetailSection = computed(() => {
    if (!document.value) return null;
    return sectionMap[document.value.templateKey];
});

/* ========================================== */
/* 상태 텍스트 변환 */
/* ========================================== */

const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
        'DRAFT': '임시저장',
        'INPROGRESS': '진행중',
        'APPROVED': '승인',
        'REJECTED': '반려',
    };
    return statusMap[status] || status;
};

const getStatusClass = (status: string): string => {
    const classMap: Record<string, string> = {
        'DRAFT': 'status-draft',
        'INPROGRESS': 'status-inprogress',
        'APPROVED': 'status-approved',
        'REJECTED': 'status-rejected',
    };
    return classMap[status] || '';
};

/* ========================================== */
/* Methods */
/* ========================================== */

/**
 * 문서함으로 돌아가기
 */
const backToInbox = () => {
    router.push('/approval/inbox');
};
</script>

<style scoped>
.page-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
}

.page-header {
    width: 100%;
    background: #ffffff;
    border-style: solid;
    border-color: #e2e8f0;
    border-width: 0px 0px 2px 0px;
    padding: 6px 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex-shrink: 0;
    min-height: 38px;
    justify-content: center;
}

.header-inner {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
}

.btn-back {
    border-style: solid;
    border-color: #bfc2c7;
    border-width: 0px 0px 1px 0px;
    display: flex;
    flex-direction: row;
    gap: 0px;
    align-items: center;
    justify-content: flex-start;
    flex-shrink: 0;
    position: relative;
    width: fit-content;
    background: none;
    padding: 0;
}

.icon-arrow {
    flex-shrink: 0;
    width: 19px;
    height: 19px;
    position: relative;
    overflow: visible;
}

.back-label-wrap {
    flex-shrink: 0;
    width: 55px;
    height: 24px;
    position: relative;
}

.back-label {
    color: #0f172b;
    text-align: left;
    font-family: "Inter-Regular", sans-serif;
    font-size: 14px;
    line-height: 24px;
    letter-spacing: 0.07px;
    font-weight: 400;
    position: absolute;
    left: 0px;
    top: 0px;
}

.action-group {
    display: flex;
    flex-direction: row;
    gap: 8px;
    align-items: center;
    justify-content: flex-start;
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
}

.status-badge {
    padding: 6px 16px;
    border-radius: 10px;
    font-family: "Inter-Regular", sans-serif;
    font-size: 13px;
    font-weight: 500;
}

.status-draft {
    background-color: #f1f5f9;
    color: #64748b;
}

.status-inprogress {
    background-color: #dbeafe;
    color: #1e40af;
}

.status-approved {
    background-color: #d1fae5;
    color: #065f46;
}

.status-rejected {
    background-color: #fee2e2;
    color: #991b1b;
}

.btn-approve,
.btn-reject {
    border-radius: 8px;
    border: none;
    padding: 6px 18px;
    display: flex;
    flex-direction: row;
    gap: 7px;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: opacity 0.2s;
}

.btn-approve {
    background: linear-gradient(180deg, #16a34a 0%, #15803d 100%);
}

.btn-reject {
    background: linear-gradient(180deg, #dc2626 0%, #991b1b 100%);
}

.btn-approve:hover,
.btn-reject:hover {
    opacity: 0.9;
}

.btn-icon {
    flex-shrink: 0;
    width: 12px;
    height: 12px;
}

.btn-text-white {
    color: #ffffff;
    text-align: center;
    font-family: "Inter-Regular", sans-serif;
    font-size: 12px;
    line-height: 18px;
    letter-spacing: -0.31px;
    font-weight: 400;
}

.page-body {
    display: flex;
    padding: 20px;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow-y: auto;
    height: 100%;
}

.form-wrapper {
    padding: 0px 100px 0px 100px;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow-y: auto;
}

.form-container {
    display: flex;
    height: 100%;
    width: 100%;
    padding: 0;
    background-color: #ffff;
    overflow-y: auto;
}

.loading-container,
.error-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
}

.loading-text,
.error-text {
    font-family: "Inter-Regular", sans-serif;
    font-size: 16px;
    color: #64748b;
}

.error-text {
    color: #dc2626;
}

.debug-info {
    max-width: 400px;
    word-break: break-all;
}
</style>