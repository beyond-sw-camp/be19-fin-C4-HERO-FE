<template>
  <div class="review-page-container">
    <!-- 헤더 영역 -->
    <div class="header-section">
      <div class="header-inner">
        <div class="header-left">
          <button v-if="step > 1" class="btn-back-icon" @click="step--">←</button>
          <h1 class="page-title">승진 심사</h1>
        </div>
        
        <!-- 단계 표시 (Breadcrumbs) -->
        <div class="breadcrumbs" v-if="step > 1">
          <span class="crumb" :class="{ active: step === 1 }" @click="step = 1">계획 선택</span>
          <span class="separator">›</span>
          <span class="crumb" :class="{ active: step === 2 }" @click="step > 2 ? step = 2 : null">심사 대상</span>
          <span class="separator">›</span>
          <span class="crumb" :class="{ active: step === 3 }">후보자 심사</span>
        </div>
      </div>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="reviewStore.loading" class="loading-state">
      <div class="spinner"></div>
      <p>데이터를 불러오는 중입니다...</p>
    </div>

    <!-- 메인 컨텐츠 영역 -->
    <div v-else class="content-area">

      <!-- STEP 1: 심사 대상 계획 목록 -->
      <div v-if="step === 1" class="step-wrapper fade-in">
        <div class="section-header">
          <h2>심사 대상 계획</h2>
          <p class="sub-desc">심사를 진행할 승진 계획을 선택해주세요.</p>
        </div>

        <div v-if="!reviewStore.reviewPlans.length" class="no-data">
          <p>진행중인 계획이 없습니다.</p>
        </div>

        <div class="card-grid">
          <div
            v-for="plan in reviewStore.reviewPlans"
            :key="plan.promotionId"
            class="plan-card"
            @click="handleSelectPlan(plan.promotionId!)"
          >
             <div class="card-top">
              <span class="status-badge">진행중</span>
              <span class="date-label">{{ formatDate(plan.createdAt) }} 등록</span>
            </div>
            <h3 class="card-title">{{ plan.planName }}</h3>
            <div class="card-info">
              <div class="info-row">
                <span class="label">추천 마감</span>
                <span class="value">{{ formatDate(plan.nominationDeadlineAt) }}</span>
              </div>
              <div class="info-row">
                <span class="label">발령 예정</span>
                <span class="value">{{ formatDate(plan.appointmentAt) }}</span>
              </div>
            </div>
            <div class="card-action">
              <span>심사하기</span>
              <span class="arrow">→</span>
            </div>
          </div>
        </div>
      </div>

      <!-- STEP 2: 계획 상세 및 심사 대상 그룹 선택 -->
      <div v-if="step === 2 && reviewStore.reviewDetail" class="step-wrapper fade-in">
        <div class="section-header">
          <div>
            <h2>{{ reviewStore.reviewDetail.planName }}</h2>
            <p class="sub-desc">심사를 진행할 대상 그룹(부서/직급)을 선택해주세요.</p>
          </div>
        </div>

        <div class="plan-content-box">
           {{ reviewStore.reviewDetail.planContent || '상세 내용이 없습니다.' }}
        </div>

        <div class="card-grid detail-grid">
          <div
            v-for="detail in reviewStore.reviewDetail.detailPlan"
            :key="detail.promotionDetailId"
            class="detail-card"
            @click="handleSelectDetailPlan(detail)"
          >
            <div class="detail-icon">
              <span>T/O</span>
            </div>
            <div class="detail-info">
              <h3 class="dept-name">{{ detail.department }}</h3>
              <p class="grade-target">{{ detail.grade }} 승진 심사</p>
              <div class="stats">
                <span class="stat-item">TO: <strong>{{ detail.approvedCount }} / {{ detail.quotaCount }}</strong></span>
                <span class="divider">|</span>
                <span class="stat-item">후보자 {{ detail.candidateList.length }}명</span>
              </div>
            </div>
            <div class="hover-arrow">→</div>
          </div>
        </div>
      </div>

      <!-- STEP 3: 후보자 심사 -->
      <div v-if="step === 3 && selectedDetailPlan" class="step-wrapper fade-in">
        <div class="section-header">
          <div>
            <h2>{{ selectedDetailPlan.department }} - {{ selectedDetailPlan.grade }} 심사 후보자</h2>
            <p class="sub-desc">승진 적격 여부를 심사해주세요.</p>
          </div>
        </div>

        <div v-if="!selectedDetailPlan.candidateList.length" class="no-data">
            후보자가 없습니다.
        </div>

        <div class="member-list-grid">
          <div v-for="candidate in selectedDetailPlan.candidateList" :key="candidate.candidateId" class="member-card" :class="getStatusClass(candidate.status)">
            <template v-if="editingId !== candidate.candidateId">
            <div class="member-header">
              <div class="avatar">{{ candidate.employeeName?.charAt(0) || '?' }}</div>
              <div class="member-id">
                <span class="name">{{ candidate.employeeName }} ({{ candidate.employeeNumber }})</span>
                <span class="pos">{{ candidate.grade }}</span>
              </div>
              <div class="status-badge-small" :class="getStatusClass(candidate.status)">
                {{ getStatusText(candidate.status) }}
              </div>
            </div>

            <div class="member-stats">
               <div class="stat-row">
                <span class="label">부서</span>
                <span class="val">{{ candidate.department }}</span>
              </div>
              <div class="stat-row" v-if="candidate.evaluationPoint !== undefined">
                <span class="label">평가점수</span>
                <span class="val">{{ candidate.evaluationPoint }}점</span>
              </div>
               <div class="stat-row" v-if="candidate.nominatorName">
                <span class="label">추천자</span>
                <span class="val">{{ candidate.nominatorName }}</span>
              </div>
              <div class="stat-row" v-if="candidate.nominationReason">
                <span class="label">추천사유</span>
                <span class="val">{{ candidate.nominationReason }}</span>
              </div>
               <div class="stat-row" v-if="candidate.rejectionReason">
                <span class="label">{{ getReasonLabel(candidate) }}</span>
                <span class="val">{{ candidate.rejectionReason }}</span>
              </div>
            </div>

            <div class="extra-actions">
              <button class="btn-extra" disabled title="기능 준비중입니다.">평가 상세</button>
              <button class="btn-extra" disabled title="기능 준비중입니다.">근태 상세</button>
            </div>

            <div class="member-action" v-if="!isReviewed(candidate)">
              <button @click="startReview(candidate, 'APPROVED')" class="btn-approve">승인</button>
              <button @click="startReview(candidate, 'REJECTED')" class="btn-reject">반려</button>
            </div>
            </template>

            <!-- 수정 모드 (코멘트 입력) -->
            <template v-else>
              <div class="member-header">
                <div class="avatar">{{ candidate.employeeName?.charAt(0) || '?' }}</div>
                <div class="member-id">
                  <span class="name">{{ candidate.employeeName }}</span>
                  <span class="pos">{{ editAction === 'APPROVED' ? '승인 심사' : '반려 심사' }}</span>
                </div>
              </div>
              <div class="edit-box">
                <p class="edit-guide">{{ editAction === 'APPROVED' ? '승인 코멘트(선택)' : '반려 사유(필수)' }}를 입력하세요.</p>
                <textarea v-model="editComment" class="review-input" rows="3" placeholder="내용을 입력해주세요."></textarea>
                <div class="edit-actions">
                  <button @click="confirmReview" class="btn-confirm">확인</button>
                  <button @click="cancelReview" class="btn-cancel">취소</button>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- 전자 결재 상신 버튼 영역 -->
        <div class="step-footer">
          <div class="footer-info">
            <p>심사가 완료되었나요?</p>
            <span>전자 결재를 상신하여 최종 승인 절차를 진행하세요.</span>
          </div>
          <button class="btn-electronic-approval" @click="handleElectronicApproval" disabled title="기능 준비중입니다.">
            📑 전자 결재 상신 (준비중)
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePromotionReviewStore } from '@/stores/personnel/promotionReview.store';
import type { PromotionDetailForReviewResponseDTO, PromotionCandidateDTO, PromotionReviewRequestDTO } from '@/types/personnel/promotion.types';

const router = useRouter();
const reviewStore = usePromotionReviewStore();

// 심사 입력 상태 관리
const editingId = ref<number | null>(null);
const editAction = ref<'APPROVED' | 'REJECTED' | null>(null);
const editComment = ref('');

const step = ref(1);
const selectedPlanId = ref<number | null>(null);
const selectedDetailPlan = ref<PromotionDetailForReviewResponseDTO | null>(null);

onMounted(() => {
  // 심사 가능한 계획 목록 조회
  reviewStore.getReviewPlans();
});

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-';
  return dateStr.split('T')[0];
};

const handleSelectPlan = async (planId: number) => {
  selectedPlanId.value = planId;
  await reviewStore.getReviewDetail(planId);
  step.value = 2;
};

const handleSelectDetailPlan = (detailPlan: PromotionDetailForReviewResponseDTO) => {
  selectedDetailPlan.value = detailPlan;
  step.value = 3;
};

// 상태값 매핑 (CandidateListModal.vue 와 동일한 로직)
const getStatusText = (status?: string) => {
  if (!status) return '대기';
  switch (status) {
    case '0': case 'WAITING': return '대기';
    case '1': case 'APPROVED': case 'REVIEW_PASSED': return '승인';
    case '2': case 'REJECTED': case 'REVIEW_REJECTED': return '반려';
    case 'FINAL_APPROVED': return '최종 승인';
    default: return status;
  }
};

const getStatusClass = (status?: string) => {
  switch (status) {
    case '1': case 'APPROVED': case 'REVIEW_PASSED': return 'status-approved';
    case '2': case 'REJECTED': case 'REVIEW_REJECTED': return 'status-rejected';
    case 'FINAL_APPROVED': return 'status-final-approved';
    default: return 'status-pending';
  }
};

const startReview = (candidate: PromotionCandidateDTO, action: 'APPROVED' | 'REJECTED') => {
  if (!candidate.candidateId) return;

  // 승인 시 TO(정원) 체크
  if (action === 'APPROVED' && selectedDetailPlan.value) {
    const { approvedCount, quotaCount } = selectedDetailPlan.value;
    if (approvedCount >= quotaCount) {
      alert(`해당 그룹의 승진 T/O(${quotaCount}명)가 모두 찼습니다.\n더 이상 승인할 수 없습니다.`);
      return;
    }
  }

  editingId.value = candidate.candidateId;
  editAction.value = action;
  editComment.value = '';
};

const cancelReview = () => {
  editingId.value = null;
  editAction.value = null;
  editComment.value = '';
};

const confirmReview = async () => {
  if (!editingId.value || !editAction.value) return;

  const payload: PromotionReviewRequestDTO = {
    candidateId: editingId.value,
    isPassed: editAction.value === 'APPROVED',
    comment: editComment.value
  };

  const success = await reviewStore.submitReview(payload);
  if (success) {
    cancelReview();
  } else {
    // 에러 처리는 스토어에서 로깅함. 필요시 토스트 메시지 추가
    alert('처리 중 오류가 발생했습니다.');
  }
};

const isReviewed = (candidate: PromotionCandidateDTO) => {
  return ['APPROVED', 'REJECTED', '1', '2', 'REVIEW_PASSED', 'REVIEW_REJECTED', 'FINAL_APPROVED'].includes(candidate.status || '');
};

const getReasonLabel = (candidate: PromotionCandidateDTO) => {
  const status = candidate.status || '';
  return (status === 'APPROVED' || status === '1' || status === 'REVIEW_PASSED' || status === 'FINAL_APPROVED') ? '승인코멘트' : '반려사유';
};

const handleElectronicApproval = () => {
  if (!selectedDetailPlan.value) return;

  // 미심사 인원 체크 (안내용)
  const unreviewedCount = selectedDetailPlan.value.candidateList.filter(c => !c.status || c.status === 'WAITING' || c.status === '0').length;
  
  let message = '전자 결재를 상신하시겠습니까?';
  if (unreviewedCount > 0) {
    message = `아직 심사하지 않은 후보자가 ${unreviewedCount}명 있습니다.\n그래도 결재를 진행하시겠습니까?`;
  }

  if (confirm(message)) {
    router.push({
      path: '/approval/create/personnelappointment',
      query: {
        promotionId: selectedPlanId.value?.toString(),
        detailId: selectedDetailPlan.value.promotionDetailId.toString()
      }
    });
  }
};

</script>

<style scoped>
.review-page-container  {
  width: 100%;
  min-height: 100vh;
  background-color: #f8fafc;
}

/* Header */
.header-section {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 20px;
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content-area {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #94a3b8;
}

.crumb {
  cursor: pointer;
}

.crumb.active {
  color: #3b82f6;
  font-weight: 600;
}

.separator {
  color: #cbd5e1;
  font-size: 12px;
}

.btn-back-icon {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  font-size: 20px;
  padding: 4px;
  transition: all 0.2s;
}

.btn-back-icon:hover {
  color: #334155;
}

/* Section Header */
.section-header {
  margin-bottom: 24px;
}

.section-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 4px;
}

.sub-desc {
  color: #64748b;
  font-size: 14px;
}

/* Card Grid System */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

/* Plan Card (Step 1) */
.plan-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border-color: #3b82f6;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.status-badge {
  background: #dbeafe;
  color: #2563eb;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.date-label {
  font-size: 12px;
  color: #94a3b8;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 20px;
  line-height: 1.4;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.info-row .label {
  color: #64748b;
}

.info-row .value {
  color: #334155;
  font-weight: 500;
}

.card-action {
  border-top: 1px solid #f1f5f9;
  padding-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #3b82f6;
  font-weight: 600;
  font-size: 14px;
}

/* Detail Card (Step 2) */
.plan-content-box {
  background: #f8fafc;
  padding: 20px;
  border-radius: 8px;
  color: #475569;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 30px;
  border: 1px solid #e2e8f0;
}

.detail-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.detail-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.detail-icon {
  width: 48px;
  height: 48px;
  background: #eff6ff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  font-weight: 700;
  font-size: 14px;
}

.detail-info {
  flex: 1;
}

.dept-name {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.grade-target {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 8px;
}

.stats {
  font-size: 13px;
  color: #475569;
}

.stats strong {
  color: #2563eb;
}

.divider {
  margin: 0 8px;
  color: #cbd5e1;
}

.hover-arrow {
  color: #cbd5e1;
  font-weight: bold;
  transition: transform 0.2s;
}

.detail-card:hover .hover-arrow {
  color: #3b82f6;
  transform: translateX(4px);
}

/* Member Card (Step 3) */
.member-list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.member-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: all 0.2s;
}

.member-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  background: #e2e8f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #64748b;
}

.member-id {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.member-id .name {
  font-weight: 500;
  color: #1e293b;
}

.member-id .pos {
  font-size: 12px;
  color: #64748b;
}

.status-badge-small {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

/* 상태 배지 스타일 */
.status-badge-small.status-pending { background-color: #f1f5f9; color: #64748b; }
.status-badge-small.status-approved { background-color: #dcfce7; color: #166534; }
.status-badge-small.status-rejected { background-color: #fee2e2; color: #991b1b; }
.status-badge-small.status-final-approved { background: linear-gradient(180deg, #1c398e 0%, #162456 100%); color: white; }

/* 카드 상태별 스타일 */
.member-card.status-pending { border-left: 4px solid #cbd5e1; }
.member-card.status-approved { background-color: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #22c55e; }
.member-card.status-rejected { background-color: #fef2f2; border: 1px solid #fecaca; border-left: 4px solid #ef4444; }

/* 최종 승인 카드 스타일 개선 (가독성 확보) */
.member-card.status-final-approved {
  background-color: #eff6ff; /* 아주 연한 파란색 */
  border: 1px solid #bfdbfe;
  border-left: 4px solid #1c398e; /* 진한 남색 포인트 */
  box-shadow: 0 4px 6px -1px rgba(28, 57, 142, 0.1);
}

.member-stats {
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.member-card.status-final-approved .member-stats {
  background-color: rgba(255, 255, 255, 0.6);
  border: 1px solid #dbeafe;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  font-size: 13px;
  gap: 8px;
}

.stat-row .label {
  color: #94a3b8;
  flex-shrink: 0;
  white-space: nowrap;
}

.stat-row .val {
  color: #475569;
  font-weight: 500;
  text-align: right;
  word-break: break-word;
  white-space: pre-wrap;
}

.extra-actions {
  display: flex;
  gap: 8px;
}

.btn-extra {
  flex: 1;
  padding: 8px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #64748b;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-extra:disabled {
  background-color: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
  border-color: #e2e8f0;
}

.member-action {
  display: flex;
  gap: 10px;
}

.btn-approve, .btn-reject {
  flex: 1;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
}

.btn-approve {
  background-color: #dbeafe;
  color: #1e40af;
}

.btn-reject {
  background-color: #fee2e2;
  color: #991b1b;
}

.no-data {
  text-align: center;
  padding: 60px;
  color: #94a3b8;
  background: #f8fafc;
  border-radius: 12px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #64748b;
  gap: 16px;
  max-width: 1200px;
  margin: 0 auto;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Edit Mode Styles */
.edit-box {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #e2e8f0;
  animation: fadeIn 0.2s ease-out;
}

.edit-guide {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 8px;
  font-weight: 500;
}

.review-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  background-color: #f8fafc;
  border-radius: 8px;
  margin-bottom: 12px;
  resize: none;
  font-size: 14px;
  color: #334155;
  font-family: inherit;
  transition: all 0.2s ease;
}

.review-input:focus {
  outline: none;
  background-color: #ffffff;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.edit-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.btn-confirm {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: background-color 0.2s;
}

.btn-confirm:hover {
  background: #2563eb;
}

.btn-cancel {
  background: white;
  border: 1px solid #e2e8f0;
  color: #64748b;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #f8fafc;
  color: #334155;
  border-color: #cbd5e1;
}

/* Step Footer (Electronic Approval) */
.step-footer {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  animation: fadeIn 0.3s ease-in-out;
}

.footer-info p {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}

.footer-info span {
  font-size: 14px;
  color: #64748b;
}

.btn-electronic-approval {
  background-color: #1e293b;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.btn-electronic-approval:hover {
  background-color: #0f172a;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.btn-electronic-approval:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
</style>