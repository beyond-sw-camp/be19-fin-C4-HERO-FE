<template>
  <div class="page-content">
    <!-- 검색 -->
    <div class="search-container">
      <input v-model="searchQuery" @keyup.enter="fetchData" type="text" placeholder="사원명 검색" class="search-input" />
      <button @click="fetchData" class="btn-search">검색</button>
    </div>

    <!-- 테이블 -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>사원명 (사번)</th>
            <th>부서</th>
            <th>직급/직책</th>
            <th>권한</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="emp in permissions" :key="emp.employeeId">
            <td class="col-name">{{ emp.employeeName || '이름 없음' }} ({{ emp.employeeNumber || '사번 없음' }})</td>
            <td>{{ emp.department }}</td>
            <td>{{ emp.grade }} / {{ emp.jobTitle }}</td>
            <td>
              <div class="role-badges">
                <span v-for="roleObj in getSortedRoles(emp.role)" :key="roleObj.name" :class="['badge', getBadgeClass(roleObj.name)]">
                  {{ roleObj.name }}
                </span>
              </div>
            </td>
            <td>
              <button 
                @click="openEditModal(emp)" 
                class="btn-edit"
                :disabled="emp.role.includes('SYSTEM_ADMIN')"
              >
                수정
              </button>
            </td>
          </tr>
          <tr v-if="permissions.length === 0">
            <td colspan="5" class="no-data">검색 결과가 없습니다.</td>
          </tr>
        </tbody>
      </table>
      <!-- 페이지네이션 -->
      <div class="pagination">
        <button
          class="page-button"
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          이전
        </button>
        <button
          v-for="p in totalPages"
          :key="p"
          @click="changePage(p)"
          :class="['page-button', { 'page-active': currentPage === p }]"
        >
          {{ p }}
        </button>
        <button
          class="page-button"
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
        >
          다음
        </button>
      </div>
    </div>

    <!-- 권한 수정 모달 -->
    <Teleport to="body">
      <div v-if="editingEmployee" class="modal-overlay" @click.self="editingEmployee = null">
        <div class="modal-content">
          <div class="modal-header">
            <h3>권한 수정 - {{ editingEmployee.employeeName }} ({{ editingEmployee.employeeId }})</h3>
          </div>
          <div class="modal-body">
            <div class="checkbox-group select-all">
              <input 
                type="checkbox" 
                id="role-all" 
                v-model="isAllSelected"
                class="checkbox-input"
              >
              <label for="role-all" class="label-bold">전체 선택</label>
            </div>
            <div v-for="(role, index) in settingsStore.roles" :key="role.roleId || index" class="checkbox-group">
              <input 
                type="checkbox" 
                :id="'role-' + (role.roleId || index)" 
                :value="role.roleId" 
                v-model="selectedRoleIds"
                class="checkbox-input"
                :disabled="isRoleDisabled(role.role)"
                @change="handleRoleChange($event, role)"
              >
              <label :for="'role-' + (role.roleId || index)">{{ role.role }}</label>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="savePermissions" class="btn-save-modal">저장</button>
            <button @click="editingEmployee = null" class="btn-cancel">취소</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import type { SettingsPermissionsResponseDTO, Role } from '@/types/settings';

const settingsStore = useSettingsStore();
const permissions = ref<SettingsPermissionsResponseDTO[]>([]);
const currentPage = ref(1);
const totalPages = ref(1);
const searchQuery = ref('');

const editingEmployee = ref<SettingsPermissionsResponseDTO | null>(null);
const selectedRoleIds = ref<number[]>([]);

const isRoleDisabled = (roleName: string) => {
  return ['EMPLOYEE', 'DEPT_MANAGER', 'SYSTEM_ADMIN'].includes(roleName);
};

const handleRoleChange = (event: Event, role: Role) => {
  const isChecked = (event.target as HTMLInputElement).checked;
  
  if (role.role === 'HR_MANAGER' && isChecked) {
    const hrRoles = settingsStore.roles.filter(r => r.role.startsWith('HR_') && r.role !== 'HR_MANAGER');
    const hrRoleIds = hrRoles.map(r => r.roleId);
    selectedRoleIds.value = [...new Set([...selectedRoleIds.value, ...hrRoleIds])];
  }
};

const isAllSelected = computed({
  get: () => {
    const selectableRoles = settingsStore.roles.filter(r => !isRoleDisabled(r.role));
    if (selectableRoles.length === 0) return false;
    return selectableRoles.every(r => selectedRoleIds.value.includes(r.roleId));
  },
  set: (val) => {
    const disabledRoles = settingsStore.roles.filter(r => isRoleDisabled(r.role));
    const preservedIds = selectedRoleIds.value.filter(id => disabledRoles.some(r => r.roleId === id));

    if (val) {
      const selectableIds = settingsStore.roles.filter(r => !isRoleDisabled(r.role)).map(r => r.roleId);
      selectedRoleIds.value = [...new Set([...preservedIds, ...selectableIds])];
    } else {
      selectedRoleIds.value = preservedIds;
    }
  }
});

const fetchData = async () => {
  // 검색어가 비어있으면 undefined로 설정하여 쿼리 파라미터에서 제외 (백엔드 500 에러 방지)
  const query = searchQuery.value.trim() ? searchQuery.value : undefined;
  const res = await settingsStore.fetchPermissions(currentPage.value - 1, 10, query);
  if (res.success) {
    console.log('Fetched Permissions (After Update):', res.data.content);
    permissions.value = res.data.content;
    totalPages.value = res.data.totalPages;
  }
};

const getSortedRoles = (roleNames: string[]) => {
  if (!roleNames) return [];
  
  return roleNames.map(name => {
    const roleInfo = settingsStore.roles.find(r => r.role === name);
    return {
      name: name,
      id: roleInfo ? roleInfo.roleId : 9999 // 매칭되는 ID가 없으면 맨 뒤로
    };
  }).sort((a, b) => a.id - b.id);
};

const getBadgeClass = (roleName: string) => {
  if (roleName === 'EMPLOYEE') return 'badge-employee';
  if (roleName === 'DEPT_MANAGER') return 'badge-manager';
  return 'badge-admin';
};

const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  fetchData();
};

const openEditModal = (emp: SettingsPermissionsResponseDTO) => {
  if (emp.role.includes('SYSTEM_ADMIN')) {
    alert('시스템 관리자의 권한은 수정할 수 없습니다.');
    return;
  }

  editingEmployee.value = emp;
  console.log('Roles Data:', settingsStore.roles);
  
  // 매칭되는 권한 찾기
  const matchedRoles = settingsStore.roles.filter(r => emp.role.includes(r.role));
  
  let roleIds = matchedRoles.map(r => r.roleId);

  // EMPLOYEE 권한 강제 추가 (기본 권한)
  const employeeRole = settingsStore.roles.find(r => r.role === 'EMPLOYEE');
  if (employeeRole && !roleIds.includes(employeeRole.roleId)) {
    roleIds.push(employeeRole.roleId);
  }

  selectedRoleIds.value = roleIds;
};

const savePermissions = async () => {
  if (!editingEmployee.value) return;

  // Proxy 객체를 일반 배열로 변환하여 전송 (혹시 모를 직렬화 이슈 방지)
  const plainRoleIds = [...selectedRoleIds.value];
  console.log('Saving Permissions (Plain):', { employeeId: editingEmployee.value.employeeId, roleIds: plainRoleIds });

  const res = await settingsStore.modifyPermissions({
    employeeId: editingEmployee.value.employeeId,
    roleIds: plainRoleIds
  });
  if (res.success) {
    alert('권한이 수정되었습니다.');
    editingEmployee.value = null;
    await fetchData();
  }
};

onMounted(async () => {
  await settingsStore.fetchRoles();
  fetchData();
});
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172b;
}

.search-container {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  padding: 24px 24px 0;
  justify-content: flex-end;
}

.search-input {
  width: 300px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #334155;
}

.btn-search {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: white;
  border: none;
  padding: 8px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.page-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.table-container {
  overflow-x: auto;
  overflow-y: auto;
  height: calc(100vh - 300px);
  border: 1px solid #e2e8f0;
  margin-bottom: 20px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th, .data-table td {
  padding: 15px;
  border-bottom: 1px solid #e2e8f0;
  color: #334155;
}

.data-table th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.col-name {
  white-space: nowrap;
}

.role-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-admin {
  background-color: #e0e7ff;
  color: #3730a3;
}

.badge-manager {
  background-color: #dcfce7;
  color: #166534;
}

.badge-employee {
  background-color: #f1f5f9;
  color: #475569;
}

.btn-edit {
  color: #2563eb;
  font-weight: 500;
  cursor: pointer;
  background: none;
  border: none;
}

.btn-edit:disabled {
  color: #cbd5e1;
  cursor: not-allowed;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  gap: 10px;
  background: #f8fafc;
  border-bottom-left-radius: 14px;
  border-bottom-right-radius: 14px;
}

.page-button {
  padding: 5px 12px;
  border: 1px solid #cad5e2;
  background: white;
  border-radius: 4px;
  font-size: 14px;
  color: #62748e;
  cursor: pointer;
}

.page-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.page-button.page-active {
  background: #155dfc;
  border-color: #155dfc;
  color: white;
}

.no-data {
  text-align: center;
  padding: 40px 0;
  color: #94a3b8;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 400px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.modal-header {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  padding: 16px 24px;
  color: white;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.modal-body {
  padding: 24px;
}

.checkbox-group {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.checkbox-group label {
  color: #334155;
  font-size: 0.95rem;
  cursor: pointer;
}

.checkbox-input {
  margin-right: 8px;
}

.select-all {
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.label-bold {
  font-weight: 600;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 0 24px 24px;
}

.btn-cancel {
  background-color: #f1f5f9;
  color: #4b5563;
  border: 1px solid #cbd5e1;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-save-modal {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}
</style>
