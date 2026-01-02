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
                    <!-- 임시저장 문서이고 편집 모드가 아닐 때 수정 버튼 표시 -->
                    <template v-if="isDraftDocument && !isEditMode">
                        <button class="btn-edit" @click="goToEdit">
                            <img class="btn-icon" src="/images/approval-white.svg" alt="수정" />
                            <span class="btn-text-white">수정</span>
                        </button>
                        <button class="btn-edit" @click="goToDelete(document.docId)">
                            <img class="btn-icon" src="/images/cancel-white.svg" alt="삭제" />
                            <span class="btn-text-white">삭제</span>
                        </button>
                    </template>
                    <div v-if="document.docStatus === 'INPROGRESS'">
                        <button class="btn-primary-header" @click="handleCancel(document.docId)">
                            <img class="btn-icon" src="/images/cancel-white.svg" alt="회수">
                            <span class="btn-text-white">회수</span>
                        </button>
                    </div>
                    <div v-if="!(document.docStatus === 'DRAFT')" class="status-badge"
                        :class="getStatusClass(document.docStatus)">
                        {{ getStatusText(document.docStatus) }}
                    </div>



                    <!-- 편집 모드일 때 저장/상신 버튼 표시 -->
                    <template v-if="isEditMode && isDraftDocument">
                        <button class="btn-secondary-header" @click="handleSaveEdit">
                            <img class="btn-icon" src="/images/file.svg" alt="저장" />
                            <span class="btn-text">저장</span>
                        </button>
                        <button class="btn-primary-header" @click="handleSubmitEdit">
                            <img class="btn-icon" src="/images/submit.svg" alt="상신" />
                            <span class="btn-text-white">상신</span>
                        </button>
                    </template>

                    <!-- 결재 권한이 있는 경우 승인/반려 버튼 표시 (순차 결재) -->
                    <template v-if="canApprove && !isEditMode">
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

                    <!-- 문서 내용 - 읽기 모드 -->
                    <ApprovalDetailCommonForm v-else-if="document && !isEditMode" :document="document"
                        :parsedDetails="parsedDetails">
                        <template #detail-section>
                            <component :is="currentDetailSection" :modelValue="parsedDetails" :readonly="true" />
                        </template>
                    </ApprovalDetailCommonForm>

                    <!-- 문서 내용 - 편집 모드 -->
                    <ApprovalCreateCommonForm v-else-if="document && isEditMode" ref="commonFormRef"
                        :templateId="document.templateId" :templateName="document.templateName"
                        :category="document.category" :empName="authStore.user?.employeeName || ''"
                        :empDept="authStore.user?.departmentName || ''" :empGrade="authStore.user?.gradeName || ''"
                        :initialTitle="document.title" :initialLines="formattedLines"
                        :initialReferences="formattedReferences" :document="document" :hideActions="true">
                        <template #detail-section>
                            <component :is="currentDetailSection" v-model="sectionData" />
                        </template>
                    </ApprovalCreateCommonForm>

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
import { computed, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useApprovalDetail } from '@/composables/approval/useApprovalDetail';
import { useApprovalDocument } from '@/composables/approval/useApprovalDocument';
import { processApproval } from '@/api/approval/approval_action.api';
import { useAuthStore } from '@/stores/auth';
import ApprovalDetailCommonForm from '@/views/approval/detail/ApprovalDetailCommonForm.vue';
import ApprovalCreateCommonForm from '@/views/approval/create/ApprovalCreateCommonForm.vue';
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
import {
    ApprovalDefaultLineDTO,
    ApprovalDefaultReferenceDTO
} from '@/types/approval/template.types';

/* ========================================== */
/* Router & Route */
/* ========================================== */

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// docId를 route params에서 가져옴
const docId = computed(() => Number(route.params.docId));

// 편집 모드 확인 (쿼리 파라미터 edit=true)
const isEditMode = computed(() => route.query.edit === 'true');

/* ========================================== */
/* Composable */
/* ========================================== */

const { document, parsedDetails, loading, error, fetchDocument } = useApprovalDetail(docId.value);
const { updateDraft, submitDraft, cancelDocument, deleteDocument } = useApprovalDocument();

/* ========================================== */
/* 편집 모드 관련 */
/* ========================================== */

const commonFormRef = ref<InstanceType<typeof ApprovalCreateCommonForm>>();
const sectionData = ref<any>({});

// 편집 모드 진입 시 sectionData 초기화
watch(() => isEditMode.value, (newValue) => {
    if (newValue && parsedDetails.value) {
        sectionData.value = { ...parsedDetails.value };
    }
}, { immediate: true });

watch(() => parsedDetails.value, (newValue) => {
    if (isEditMode.value && newValue) {
        sectionData.value = { ...newValue };
    }
}, { immediate: true });

const currentDate = computed(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
});

/**
 * DTO 생성 (편집 모드용)
 */
const createRequestDTO = (status: 'draft' | 'submitted') => {
    const commonFormData = commonFormRef.value?.getCommonData();
    const detailsJsonString = JSON.stringify(sectionData.value);

    if (!document.value) {
        throw new Error('문서 정보가 없습니다.');
    }

    return {
        formType: document.value.templateKey,
        documentType: document.value.category,
        title: commonFormData?.title || '',
        drafter: authStore.user?.employeeName || '',
        department: authStore.user?.departmentName || '',
        grade: authStore.user?.gradeName || '',
        draftDate: currentDate.value,
        status: status,
        submittedAt: status === 'submitted' ? new Date().toISOString() : null,
        lines: commonFormData?.lines || [],
        references: commonFormData?.references || [],
        details: detailsJsonString
    };
};

/**
 * 저장 (편집 모드)
 */
const handleSaveEdit = async () => {
    try {
        const requestDTO = createRequestDTO('draft');
        const commonFormData = commonFormRef.value?.getCommonData();
        const files = commonFormData?.attachments || [];

        await updateDraft(docId.value, requestDTO, files);

        // 편집 모드 종료
        router.push(`/approval/documents/${docId.value}`);
    } catch (error) {
        console.error('저장 에러:', error);
    }
};

/**
 * 상신 (편집 모드 - 임시저장 문서를 상신으로 변경)
 */
const handleSubmitEdit = async () => {
    try {
        const requestDTO = createRequestDTO('submitted');
        const commonFormData = commonFormRef.value?.getCommonData();
        const files = commonFormData?.attachments || [];

        if (!document.value) {
            throw new Error('문서 정보가 없습니다.');
        }

        // 임시저장 문서를 상신으로 변경 (새 문서 생성 X)
        const response = await submitDraft(docId.value, requestDTO, files, document.value.templateKey);

        if (response) {
            router.push('/approval/inbox');
        }
    } catch (error) {
        console.error('❌ 상신 에러:', error);
    }
};

/* ========================================== */
/* 결재 처리 관련 */
/* ========================================== */

const isRejectModalOpen = ref(false);

/**
 * 임시저장 문서 여부 확인
 */
const isDraftDocument = computed(() => {
    if (!document.value || !authStore.user) return false;

    // DRAFT 상태이면서 본인이 기안자인 경우에만 수정 가능
    return document.value.docStatus === 'DRAFT' &&
        document.value.drafterId === authStore.user.employeeId;
});

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
 * 결재 권한 확인 (순차 결재)
 * 조건:
 * 1. 본인이 결재자(Approver)에 포함되어야 함
 * 2. 본인의 결재 상태가 'PENDING'(대기)여야 함
 * 3. 문서 전체 상태가 'INPROGRESS'(진행중)이어야 함
 * 4. 내 앞 순서(seq가 더 낮은) 결재자들이 모두 'APPROVED'(승인) 상태여야 함
 */
const canApprove = computed(() => {
    // 1. 기본 데이터 유효성 검사
    if (!document.value || !authStore.user || !myLine.value) {
        return false;
    }

    // 2. 문서 및 본인 상태 검사
    if (document.value.docStatus !== 'INPROGRESS' || myLine.value.status !== 'PENDING') {
        return false;
    }

    // 3. 순차 결재 검증 (내 앞 순서 확인)
    // seq > 1 조건은 기안자(보통 seq 1)를 제외하기 위함입니다.
    // 만약 기안자도 승인 상태가 필요하다면 && line.seq > 1 조건을 제거하세요.
    const previousLines = document.value.lines.filter(
        line => line.seq < myLine.value!.seq && line.seq > 1
    );

    // 앞 순서 결재자가 없으면(내가 첫 번째 결재자면) 승인 가능
    if (previousLines.length === 0) {
        return true;
    }

    // 앞 순서 결재자가 모두 승인했는지 확인
    const allPreviousApproved = previousLines.every(
        line => line.status === 'APPROVED'
    );

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

const handleCancel = async (docId: number) => {
    if (!confirm('이 문서를 회수하시겠습니까?')) {
        return;
    }
    try {
        await cancelDocument(docId);

        await fetchDocument(docId);
    } catch (error) {
        console.error('회수 처리 에러:', error);
        alert('회수 처리 중 오류가 발생했습니다.');
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

/**
 * 수정 모드로 전환
 */
const goToEdit = () => {
    router.push(`/approval/documents/${docId.value}?edit=true`);
};

const goToDelete = async (docId: number) => {
    if (!confirm('이 문서를 삭제하시겠습니까?')) {
        return;
    }

    try {
        await deleteDocument(docId);
        router.push('/approval/inbox');
    } catch (error) {
        console.error('삭제 처리 에러:', error);
    }
};

const formattedLines = computed<ApprovalDefaultLineDTO[]>(() => {
    // 데이터가 아직 로드되지 않았으면 빈 배열 반환
    if (!document.value || !document.value.lines) {
        return [];
    }

    // ResponseDTO -> DefaultLineDTO 로 변환
    return document.value.lines.map(line => ({
        seq: line.seq,
        approverId: line.approverId,
        approverName: line.approverName,
        departmentId: 0,
        departmentName: line.departmentName,
        gradeName: line.gradeName,
        jobTitleName: line.jobTitleName
    }));
});

const formattedReferences = computed<ApprovalDefaultReferenceDTO[]>(() => {
    if (!document.value || !document.value.references) {
        return [];
    }

    return document.value.references.map(ref => ({
        referencerId: ref.referencerId,
        referencerName: ref.referencerName,
        departmentId: 0,
        departmentName: ref.departmentName,
        gradeName: ref.gradeName,
        jobTitleName: ref.jobTitleName
    }));
});
</script>

<style scoped>
@import "@/assets/styles/approval/approval-detail.css";
</style>