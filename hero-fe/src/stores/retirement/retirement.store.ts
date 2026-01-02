import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  getRetirementSummary,
  getExitReasonStats,
  getTenureRetentionStats,
  getNewHireStats,
  getDepartmentTurnoverStats,
} from '@/api/retirement/retirement.api';
import type {
  RetirementSummaryDTO,
  ExitReasonStatDTO,
  TenureRetentionDTO,
  NewHireStatDTO,
  DepartmentTurnoverDTO,
} from '@/types/retirement/retirement.types';

export const useRetirementStore = defineStore('retirement', () => {
  // State
  const summary = ref<RetirementSummaryDTO | null>(null);
  const reasonStats = ref<ExitReasonStatDTO[]>([]);
  const tenureStats = ref<TenureRetentionDTO[]>([]);
  const newHireStats = ref<NewHireStatDTO[]>([]);
  const departmentStats = ref<DepartmentTurnoverDTO[]>([]);
  const loading = ref(false);

  // Actions
  const fetchRetirementData = async () => {
    loading.value = true;
    try {
      const [sumRes, reasonRes, tenureRes, newHireRes, deptRes] = await Promise.all([
        getRetirementSummary(),
        getExitReasonStats(),
        getTenureRetentionStats(),
        getNewHireStats(),
        getDepartmentTurnoverStats(),
      ]);

      summary.value = sumRes.data;
      reasonStats.value = reasonRes.data;
      tenureStats.value = tenureRes.data;
      newHireStats.value = newHireRes.data;
      departmentStats.value = deptRes.data;
    } catch (error) {
      console.error('Failed to fetch retirement data:', error);
    } finally {
      loading.value = false;
    }
  };

  return {
    summary,
    reasonStats,
    tenureStats,
    newHireStats,
    departmentStats,
    loading,
    fetchRetirementData,
  };
});
