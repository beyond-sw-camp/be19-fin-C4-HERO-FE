<!--
 * <pre>
 * Vue Name        : ApprovalCreateCommonForm.vue
 * Description     : 공통 서식
 *
 * 컴포넌트 연계
 * - 부모 컴포넌트: ApprovalCreate.vue
 *
 * History
 *   2025/12/10 - 민철 최초작성
 *   2025/12/11 - props 데이터 및 동적컴포넌트 추가
 *   2025/12/14 - 공통 컴포넌트화
 *   2025/12/23 - 민철 파일명 변경
 *   2025/12/24 - 민철 작성 UI 최종 구현(제목/분류/결재선/참고목록 지정)
 * </pre>
 *
 * @module approval
 * @author 민철
 * @version 2.1
 -->
<template>
  <div class="form-wrapper">
    <div class="paper-sheet">
      <div class="paper-padding">
        <div class="paper-content">

          <!-- 제목 영역 -->
          <div class="title-section">
            <div class="title-row">
              <h1 class="main-title">{{ props.templateName }}</h1>
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

                <!-- ✅ 1. 기안자 도장 -->
                <div class="stamp-box">
                  <div class="stamp-header">
                    <span class="stamp-role-label">기안</span>
                  </div>
                  <div class="stamp-body">
                    <div class="approver-info-vertical">
                      <div class="approver-name-row">
                        <span class="approver-name">{{ commonData.lines[0]?.approverName || authStore.user?.employeeName
                          }}</span>
                        <span class="approver-rank">{{ commonData.lines[0]?.gradeName || authStore.user?.gradeName
                          }}</span>
                      </div>
                      <span class="approver-dept">{{ commonData.lines[0]?.departmentName ||
                        authStore.user?.departmentName }}</span>
                    </div>
                    <div class="stamp-signature approved">
                      <div class="signature-text">
                        <span class="status-approved">기안</span>
                      </div>
                    </div>
                  </div>
                  <div class="stamp-footer">
                    <span class="stamp-date">{{ currentDate || '-' }}</span>
                  </div>
                </div>

                <!-- ✅ 2. 1차 결재자 도장 -->
                <div class="stamp-box">
                  <div class="stamp-header">
                    <span class="stamp-role-label">결재</span>
                  </div>
                  <div class="stamp-body">
                    <template v-if="commonData.lines[1]">
                      <div class="approver-info-vertical">
                        <div class="approver-name-row">
                          <span class="approver-name">{{ commonData.lines[1].approverName }}</span>
                          <span class="approver-rank">{{ commonData.lines[1].gradeName }}</span>
                        </div>
                        <span class="approver-dept">{{ commonData.lines[1].departmentName }}</span>
                      </div>
                      <div class="stamp-signature pending">
                        <div class="signature-text">
                          <span class="status-pending">대기</span>
                        </div>
                      </div>
                    </template>
                    <template v-else>
                      <div class="approver-info-vertical">
                        <span class="approver-name empty">미지정</span>
                      </div>
                      <div class="stamp-signature empty">
                        <div class="signature-text">
                          <span class="status-empty">-</span>
                        </div>
                      </div>
                    </template>
                  </div>
                  <div class="stamp-footer">
                    <span class="stamp-date">{{ commonData.lines[1] ? '-' : '' }} -</span>
                  </div>
                </div>

                <!-- ✅ 3. 2차 결재자 도장 -->
                <div class="stamp-box">
                  <div class="stamp-header">
                    <span class="stamp-role-label">결재</span>
                  </div>
                  <div class="stamp-body">
                    <template v-if="commonData.lines[2]">
                      <div class="approver-info-vertical">
                        <div class="approver-name-row">
                          <span class="approver-name">{{ commonData.lines[2].approverName }}</span>
                          <span class="approver-rank">{{ commonData.lines[2].gradeName }}</span>
                        </div>
                        <span class="approver-dept">{{ commonData.lines[2].departmentName }}</span>
                      </div>
                      <div class="stamp-signature pending">
                        <div class="signature-text">
                          <span class="status-pending">대기</span>
                        </div>
                      </div>
                    </template>
                    <template v-else>
                      <div class="approver-info-vertical">
                        <span class="approver-name empty">미지정</span>
                      </div>
                      <div class="stamp-signature empty">
                        <div class="signature-text">
                          <span class="status-empty">-</span>
                        </div>
                      </div>
                    </template>
                  </div>
                  <div class="stamp-footer">
                    <span class="stamp-date">{{ commonData.lines[2] ? '-' : '' }} -</span>
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
                  <input v-model="commonData.title" type="text" class="input-wrapper" placeholder="제목을 입력하세요" />
                </div>
              </div>

              <!-- 결재선 -->
              <div class="form-row">
                <div class="row-label">
                  <span class="label-text">결재선</span>
                </div>
                <div class="row-content flow-content">
                  <div class="approval-flow">

                    <!-- ✅ 기존 template v-for 구조 그대로 유지하며 동적 데이터 사용 -->
                    <template v-for="(approver, index) in commonData.lines" :key="index">
                      <div class="flow-card">
                        <div class="card-inner">
                          <div class="avatar-circle">
                            <span class="avatar-text">{{ approver.approverName?.charAt(0) }}</span>
                          </div>
                          <div class="card-details">
                            <div class="detail-row">
                              <span class="detail-name">{{ approver.approverName }} {{ approver.gradeName }}</span>
                            </div>
                            <div class="detail-row">
                              <span class="detail-dept">{{ approver.departmentName }}</span>
                            </div>
                            <div class="detail-row">
                              <span class="detail-role"
                                :style="{ color: index === 0 ? '#1c398e' : '#62748e', fontWeight: index === 0 ? '600' : '400' }">
                                {{ index === 0 ? '기안' : '결재' }}
                              </span>
                            </div>
                          </div>
                        </div>

                        <img v-if="index !== 0" class="btn-delete" src="/images/deletebutton.svg"
                          @click="removeApprover(index)" alt="삭제" />
                      </div>

                      <img v-if="index < commonData.lines.length - 1 || commonData.lines.length < 3" class="flow-arrow"
                        src="/images/linearrow.svg" alt="화살표" />
                    </template>

                    <button v-if="commonData.lines.length < 3" class="flow-card add-card" @click="openModal('LINE')"
                      type="button">
                      <div class="add-icon">
                        <img src="/images/plus-dark.svg" alt="결재자추가">
                      </div>
                    </button>

                  </div>
                </div>
              </div>

              <!-- 참조 -->
              <div class="form-row">
                <div class="row-label">
                  <span class="label-text">참조</span>
                </div>
                <div class="row-content ref-content">
                  <div class="reference-wrapper">

                    <!-- ✅ 기존 v-if, v-for 구조 그대로 유지하며 동적 데이터 사용 -->
                    <div v-if="commonData.references.length > 0" class="ref-chip-list">
                      <div v-for="(refMember, index) in commonData.references" :key="index" class="ref-chip">
                        <span class="ref-name">{{ refMember.referencerName }} {{ refMember.gradeName }} {{
                          refMember.departmentName
                        }}</span>
                        <button class="btn-ref-delete" @click="removeReference(index)" type="button">
                          <img src="/images/deletebutton.svg" alt="삭제" width="10" height="10" />
                        </button>
                      </div>
                    </div>

                    <button class="btn-add-ref" @click="openModal('REF')" type="button">
                      <img src="/images/plus-dark.svg" alt="추가" width="12" height="12" />
                      <span class="btn-text-sm">참조 추가</span>
                    </button>

                  </div>
                </div>
              </div>

              <Teleport to="body">
                <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
                  <ApprovalLineModal :type="modalType" @close="closeModal" @save="handleModalSave" />
                </div>
              </Teleport>

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
                      <input type="file" ref="fileInput" class="hidden-file-input" multiple @click.stop
                        @change="handleFileUpload" />
                    </div>
                    <div class="file-desc">
                      <span class="desc-text">최대 10MB, 여러 파일 첨부 가능</span>
                    </div>
                  </div>

                  <div v-if="commonData.attachments.length > 0" class="uploaded-file-list">
                    <div v-for="(file, index) in commonData.attachments" :key="index" class="file-item">
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
import { useApprovalTemplateStore } from '@/stores/approval/approval.store';
import { useAuthStore } from '@/stores/auth';
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import {
  ApprovalDefaultLineDTO,
  ApprovalDefaultReferenceDTO
} from '@/types/approval/template.types';
import ApprovalLineModal from '@/views/approval/create/forms/ApprovalLineModal.vue';

const templateStore = useApprovalTemplateStore();
const authStore = useAuthStore();
const { template } = storeToRefs(templateStore);

const props = defineProps<{
  templateId: number;
  templateName: string;
  category: string;
  empName: string;
  empDept: string;
  empGrade: string;
}>();

// emit
const emit = defineEmits<{
  (e: 'preview'): void
  (e: 'cancel'): void
  (e: 'submit'): void
}>();

// 공통 데이터 직접 입력하는 제목/결재선/참조/첨부파일
const commonData = reactive({
  title: '',
  lines: [] as ApprovalDefaultLineDTO[],
  references: [] as ApprovalDefaultReferenceDTO[],
  attachments: [] as File[]
});

onMounted(async () => {
  await initializeData();
});

// ✅ watch로 template 변경 감지
watch(
  () => template.value,
  (newTemplate) => {
    if (newTemplate && newTemplate.templateId) {
      console.log('📋 template 로드 완료, 재초기화');
      initializeData();
    }
  }
);

/**
 * 기본결재선 및 참조자 초기화
 * - 기안자 정보를 첫 번째 결재선으로 설정
 * - API에서 받은 기본결재선을 2차 결재선부터 추가
 * - API에서 받은 참조자 목록 설정
 */
const initializeData = async () => {
  try {
    // 1. 기안자 정보 설정 (첫 번째 결재선)
    const currentUser = authStore.user || {
      employeeId: 0,
      employeeName: props.empName,
      departmentId: 0,
      departmentName: props.empDept,
      gradeName: props.empGrade,
      jobTitleName: ''
    };

    const drafterLine: ApprovalDefaultLineDTO = {
      seq: 1,
      approverId: currentUser.employeeId,
      approverName: currentUser.employeeName,
      departmentId: currentUser.departmentId,
      departmentName: currentUser.departmentName,
      gradeName: currentUser.gradeName,
      jobTitleName: currentUser.jobTitleName,
    };

    // 2. API 응답 데이터 확인
    if (!template.value || !template.value.lines) {
      console.warn('⚠️ 기본결재선 정보가 없음. 빈 결재선으로 초기화.');
      commonData.lines = [drafterLine];
      commonData.references = [];
      return;
    }

    // 3. API에서 받은 기본결재선 데이터 사용
    // template.value는 ApprovalCreate.vue의 onMounted에서 
    // fetchTemplate(templateId)로 이미 조회된 상태
    const defaultLines = template.value.lines;

    // 4. 기안자 + API 기본결재선 병합
    commonData.lines = [drafterLine, ...defaultLines];

    // 5. API에서 받은 참조자 목록 설정
    commonData.references = template.value.references || [];

    console.log('✅ 결재선 초기화 완료:', {
      총결재선: commonData.lines.length,
      결재자: commonData.lines.map(l => l.approverName),
      참조자: commonData.references.map(r => r.referencerName)
    });

  } catch (error) {
    console.error('❌ 결재선 초기화 중 오류:', error);

    // 최소한 기안자만이라도 설정
    const currentUser = authStore.user || {
      employeeId: 0,
      employeeName: props.empName,
      departmentId: 0,
      departmentName: props.empDept,
      gradeName: props.empGrade,
      jobTitleName: ''
    };

    commonData.lines = [{
      seq: 1,
      approverId: currentUser.employeeId,
      approverName: currentUser.employeeName,
      departmentId: currentUser.departmentId,
      departmentName: currentUser.departmentName,
      gradeName: currentUser.gradeName,
      jobTitleName: currentUser.jobTitleName,
    }];
    commonData.references = [];
  }
};


const removeApprover = (index: number) => {
  if (index === 0) {
    alert("기안자(본인)는 결재선에서 제외할 수 없습니다.");
    return;
  }

  commonData.lines.splice(index, 1);

  commonData.lines.forEach((line, idx) => {
    line.seq = idx + 3;
  });
};

const isModalOpen = ref(false);
const modalType = ref<'LINE' | 'REF'>('LINE');

const openModal = (type: 'LINE' | 'REF') => {
  modalType.value = type;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const handleModalSave = (selectedUsers: any[]) => {
  if (modalType.value === 'LINE') {

    const currentCount = commonData.lines.length;
    const addCount = selectedUsers.length;

    if (currentCount + addCount > 3) {
      alert("결재선은 본인 포함 최대 3단계까지만 지정 가능합니다.");
      return;
    }

    const startSeq = currentCount + 1;

    const newLines: ApprovalDefaultLineDTO[] = selectedUsers.map((user, idx) => ({
      templateId: props.templateId,
      approverId: user.employeeId,
      approverName: user.employeeName,
      departmentId: user.departmentId,
      departmentName: user.departmentName,
      gradeName: user.gradeName,
      jobTitleName: user.jobTitleName || '',
      seq: startSeq + idx,
    }));

    commonData.lines.push(...newLines);

  } else {

    const newRefs: ApprovalDefaultReferenceDTO[] = selectedUsers.map(user => ({
      templateId: props.templateId,
      referencerId: user.employeeId,
      referencerName: user.employeeName,
      departmentId: user.departmentId,
      departmentName: user.departmentName,
      gradeName: user.gradeName,
      jobTitleName: user.jobTitleName || '',
    }));

    newRefs.forEach(newRef => {
      const exists = commonData.references.some(r => r.referencerId === newRef.referencerId);
      if (!exists) {
        commonData.references.push(newRef);
      }
    });
  }
  closeModal();
};

const removeReference = (index: number) => {
  commonData.references.splice(index, 1);
};

const currentDate = computed(() => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
});

const fileInput = ref<HTMLInputElement | null>(null);

const triggerFileUpload = () => fileInput.value?.click();

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    commonData.attachments = [
      ...commonData.attachments,
      ...Array.from(target.files)
    ];
  }

  if (target.value) target.value = '';
};
const removeFile = (index: number) => commonData.attachments.splice(index, 1);
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const getCommonData = () => ({
  title: commonData.title,
  lines: commonData.lines,
  attachments: commonData.attachments,
  references: commonData.references
});

const onPreview = () => emit('preview');
const onCancel = () => emit('cancel');
const onSubmit = () => emit('submit');

defineExpose({ getCommonData });
</script>

<style scoped>
@import "@/assets/styles/approval/commonform.css";

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.file-content {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 16px;
  width: 100%;
}

.upload-left-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.uploaded-file-list {
  flex-grow: 1;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: #f8fafc;
  padding: 8px;
  max-height: 72px;
  overflow-y: auto;
}

.uploaded-file-list::-webkit-scrollbar {
  width: 6px;
}

.uploaded-file-list::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 3px;
}

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
  max-width: 200px;
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

/* Bounce Animation */
.dialog-bounce-enter-active,
.dialog-bounce-leave-active,
.dialog-bounce-enter-active .el-dialog,
.dialog-bounce-leave-active .el-dialog {
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.dialog-bounce-enter-from,
.dialog-bounce-leave-to {
  opacity: 0;
}

.dialog-bounce-enter-from .el-dialog,
.dialog-bounce-leave-to .el-dialog {
  transform: scale(0.3) translateY(-50px);
  opacity: 0;
}
</style>