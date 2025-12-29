import { defineStore } from 'pinia';
import { ref } from 'vue';
import { fetchOrganizationChart, fetchDepartmentHistory, fetchGradeHistory } from '@/api/organization/organization.api';
import type { OrganizationNode, DepartmentHistoryResponse, GradeHistoryResponse, ApiResponse } from '@/types/organization/organization.types';

export const useOrganizationStore = defineStore('organization', () => {
  // State
  const organizationChart = ref<OrganizationNode[]>([]);
  const deptHistoryList = ref<DepartmentHistoryResponse[]>([]);
  const gradeHistoryList = ref<GradeHistoryResponse[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Actions
  const loadOrganizationChart = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await fetchOrganizationChart();
      // API 응답 구조 대응 (CustomResponse.data 또는 직접 배열)
      const data: any = response.data;
      if (data.success && data.data) {
        organizationChart.value = data.data;
      } else if (Array.isArray(data)) {
        organizationChart.value = data;
      } else {
        organizationChart.value = [];
      }
    } catch (err) {
      error.value = '조직도 정보를 불러오는데 실패했습니다.';
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  };

  const loadDepartmentHistory = async (employeeId: number) => {
    try {
      const response = await fetchDepartmentHistory(employeeId);
      const data = response.data as ApiResponse<DepartmentHistoryResponse[]>;
      
      if (data.success && data.data) {
        deptHistoryList.value = data.data;
      } else {
        deptHistoryList.value = [];
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const loadGradeHistory = async (employeeId: number) => {
    try {
      const response = await fetchGradeHistory(employeeId);
      const data = response.data as ApiResponse<GradeHistoryResponse[]>;

      if (data.success && data.data) {
        gradeHistoryList.value = data.data;
      } else {
        gradeHistoryList.value = [];
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return {
    organizationChart,
    deptHistoryList,
    gradeHistoryList,
    isLoading,
    error,
    loadOrganizationChart,
    loadDepartmentHistory,
    loadGradeHistory,
  };
});