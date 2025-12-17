<!--
 * <pre>
 * Vue Name        : BatchPage.vue
 * Description     : 관리자 - 월별 급여 배치 탭 컨테이너 페이지
 *                  (배치 관리 / 급여 계산 / 급여 승인)
 *
 * History
 *   2025/12/15 - 동근 최초 작성
 *   2025/12/15 - 동근 탭 전환 로직 구현
 * </pre>
 *
 * @module payroll-admin-batch-page
 * @author 동근
 * @version 1.1
 -->
<template>
  <div class="batch-page">
    <div class="tab-bar">
      <button class="tab" :class="{ active: activeTab === 'batch' }" @click="activeTab = 'batch'">
        급여 배치
      </button>

      <button
        class="tab"
        :class="{ active: activeTab === 'calculate' }"
        :disabled="!store.selectedBatchId"
        title="배치를 먼저 선택하세요"
        @click="activeTab = 'calculate'"
      >
        급여 계산
      </button>

      <button
        class="tab"
        :class="{ active: activeTab === 'confirm' }"
        :disabled="!store.selectedBatchId"
        title="배치를 먼저 선택하세요"
        @click="activeTab = 'confirm'"
      >
        급여 승인
      </button>
    </div>

    <PayrollBatchTab
      v-if="activeTab === 'batch'"
      @select="onSelectBatch"
      @next="goToCalculate"
    />

    <PayrollCalculateTab
      v-else-if="activeTab === 'calculate'"
      @back="activeTab = 'batch'"
      @next="activeTab = 'confirm'"
    />

    <PayrollConfirmTab
      v-else
      @back="activeTab = 'calculate'"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PayrollBatchTab from './PayrollBatchTab.vue';
import PayrollCalculateTab from './PayrollCalculateTab.vue';
import PayrollConfirmTab from './PayrollConfirmTab.vue';
import { usePayrollAdminStore } from '@/stores/payroll/payrollAdminStore';

type TabKey = 'batch' | 'calculate' | 'confirm';

const store = usePayrollAdminStore();
const activeTab = ref<TabKey>('batch');

const onSelectBatch = async (batchId: number) => {
  await store.selectBatch(batchId);
};

const goToCalculate = () => {
  if (!store.selectedBatchId) return;
  activeTab.value = 'calculate';
};
</script>

<style scoped>
.batch-page {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
  min-height: 0;
  overflow-y: hidden;
   position: relative;
  isolation: isolate;
}

.tab-bar {
  display: inline-flex;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  width: fit-content;
  background: #ffffff;
  position : sticky;
  top:0;
  z-index:9999;
}

.tab {
  border: none;
  background: transparent;
  padding: 10px 14px;
  font-size: 13px;
  cursor: pointer;
  color: #334155;
}

.tab.active {
  background: #162456;
  color: #ffffff;
}

.tab:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
</style>

