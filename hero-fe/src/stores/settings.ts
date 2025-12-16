import { defineStore } from 'pinia';
import { ref } from 'vue';
import { 
  getDepartments, getGrades, getJobTitles, getRoles,
  saveOrUpdateDepartments, getPermissions, updatePermissions 
} from '@/api/settings';
import type { 
  SettingsDepartmentResponseDTO, Grade, JobTitle, Role,
  SettingsDepartmentRequestDTO, SettingsPermissionsRequestDTO 
} from '@/types/settings';

export const useSettingsStore = defineStore('settings', () => {
  // State
  const departments = ref<SettingsDepartmentResponseDTO[]>([]);
  const grades = ref<Grade[]>([]);
  const jobTitles = ref<JobTitle[]>([]);
  const roles = ref<Role[]>([]);
  const isLoading = ref(false);

  // Actions
  const fetchDepartments = async () => {
    try {
      const res = await getDepartments();
      console.log("fetchDepartments:", res);
      if (res.success) {
        departments.value = res.data;
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const fetchGrades = async () => {
    const res = await getGrades();
    if (res.success) {
      grades.value = res.data;
    }
  };

  const fetchJobTitles = async () => {
    const res = await getJobTitles();
    if (res.success) {
      jobTitles.value = res.data;
    }
  };

  const fetchRoles = async () => {
    const res = await getRoles();
    if (res.success) {
      roles.value = res.data;
    }
  };

  // API Wrapper Actions (컴포넌트에서 직접 API 호출 대신 사용)
  const saveDepartments = async (data: SettingsDepartmentRequestDTO[]) => {
    return await saveOrUpdateDepartments(data);
  };

  const fetchPermissions = async (page: number, size: number, query?: string) => {
    return await getPermissions(page, size, query);
  };

  const modifyPermissions = async (dto: SettingsPermissionsRequestDTO) => {
    return await updatePermissions(dto);
  };

  const loadAllSettings = async () => {
    isLoading.value = true;
    await Promise.all([fetchDepartments(), fetchGrades(), fetchJobTitles(), fetchRoles()]);
    isLoading.value = false;
  };

  return {
    departments,
    grades,
    jobTitles,
    roles,
    isLoading,
    fetchDepartments,
    fetchGrades,
    fetchJobTitles,
    fetchRoles,
    saveDepartments,
    fetchPermissions,
    modifyPermissions,
    loadAllSettings,
  };
});
