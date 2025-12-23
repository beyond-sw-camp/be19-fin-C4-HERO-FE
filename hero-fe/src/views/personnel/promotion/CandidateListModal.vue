<!-- 
  File Name   : CandidateListModal.vue
  Description : 승진 계획 상세의 후보자 목록을 보여주는 모달
  
  History
  2025/12/19 - [User] 최초 작성
-->
<template>
  <div v-if="open" class="modal-backdrop" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">승진 후보자 목록</h3>
        <button @click="closeModal" class="close-btn">&times;</button>
      </div>
      <div class="modal-body">
        <div class="table-wrapper">
          <table class="candidate-table">
            <thead>
              <tr>
                <th>사번</th>
                <th>이름</th>
                <th>부서</th>
                <th>직급</th>
                <th>추천인</th>
                <th>추천 사유</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="candidate in candidates" :key="candidate.employeeId">
                <td>{{ candidate.employeeNumber }}</td>
                <td>{{ candidate.employeeName }}</td>
                <td>{{ candidate.department }}</td>
                <td>{{ candidate.grade }}</td>
                <td>{{ candidate.nominatorName || '-' }}</td>
                <td class="reason-cell">{{ candidate.nominationReason || '-' }}</td>
              </tr>
              <tr v-if="!candidates || candidates.length === 0">
                <td colspan="6" class="no-data">등록된 후보자가 없습니다.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PromotionCandidateDTO } from '@/types/personnel/promotion.types';

interface Props {
  open: boolean;
  candidates: PromotionCandidateDTO[] | undefined;
}

defineProps<Props>();
const emit = defineEmits(['update:open']);

const closeModal = () => {
  emit('update:open', false);
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  width: 90%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #1c398e;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #94a3b8;
}

.modal-body {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.candidate-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.candidate-table th, .candidate-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  font-size: 14px;
}

.candidate-table th {
  background-color: #f8fafc;
  font-weight: 600;
  color: #475569;
}

.candidate-table td {
  color: #334155;
}

.reason-cell {
  white-space: pre-wrap;
  word-break: keep-all;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #94a3b8;
}
</style>