<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <h3>{{ type === 'GROUP' ? '발송 대상 그룹 선택' : '발송 대상 사원 선택' }}</h3>
        <button type="button" class="close-btn" @click="close">×</button>
      </div>

      <div class="modal-body">
        <!-- 그룹 선택 모드 (부서/직급) -->
        <div v-if="type === 'GROUP'" class="group-selection">
          <div class="selection-column">
            <h4>부서</h4>
            <div class="checkbox-list">
              <label v-for="dept in departments" :key="dept.id" class="checkbox-item">
                <input type="checkbox" :value="dept.id" v-model="selectedDepartments" />
                <span>{{ dept.name }}</span>
              </label>
            </div>
          </div>
          <div class="selection-column">
            <h4>직급</h4>
            <div class="checkbox-list">
              <label v-for="grade in grades" :key="grade.id" class="checkbox-item">
                <input type="checkbox" :value="grade.id" v-model="selectedGrades" />
                <span>{{ grade.name }}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- 개인 선택 모드 (사원 검색) -->
        <div v-if="type === 'INDIVIDUAL'" class="individual-selection">
          <div class="search-box">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="사원명 또는 부서명 검색" 
              @keyup.enter="handleSearch"
            />
            <button type="button" @click="handleSearch">검색</button>
          </div>
          <div class="employee-list">
            <div v-if="employees.length === 0" class="empty-list">
              검색 결과가 없습니다.
            </div>
            <label v-for="emp in employees" :key="emp.id" class="checkbox-item">
              <input type="checkbox" :value="emp.id" v-model="selectedEmployees" />
              <span class="emp-info">
                <span class="emp-name">{{ emp.name }}</span>
                <span class="emp-meta">{{ emp.department }} / {{ emp.grade }}</span>
              </span>
            </label>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <div class="selected-count">
          <span v-if="type === 'GROUP'">
            부서 {{ selectedDepartments.length }}개, 직급 {{ selectedGrades.length }}개 선택됨
          </span>
          <span v-else>
            총 {{ selectedEmployees.length }}명 선택됨
          </span>
        </div>
        <div class="button-group">
          <button type="button" class="btn-cancel" @click="close">취소</button>
          <button type="button" class="btn-confirm" @click="confirm">확인</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { getDepartments, getGrades } from '@/api/settings';
import { fetchEmployees } from '@/api/personnel/personnel';

const props = defineProps<{
  visible: boolean;
  type: 'GROUP' | 'INDIVIDUAL';
  initialData?: any;
}>();

const emit = defineEmits(['close', 'confirm']);

// --- 상태 관리 ---
const selectedDepartments = ref<number[]>([]);
const selectedGrades = ref<number[]>([]);
const selectedEmployees = ref<number[]>([]);
const searchQuery = ref('');
const departments = ref<any[]>([]);
const grades = ref<any[]>([]);
const employees = ref<any[]>([]);

// --- Methods ---
const fetchDepartments = async () => {
  try {
    const response = await getDepartments();
    if (response.success) {
      // 트리 구조를 평탄화하여 리스트로 변환
      const flatList: any[] = [];
      const traverse = (nodes: any[]) => {
        nodes.forEach(node => {
          flatList.push({ id: node.departmentId, name: node.departmentName });
          if (node.children && node.children.length > 0) {
            traverse(node.children);
          }
        });
      };
      traverse(response.data);
      departments.value = flatList;
    }
  } catch (error) {
    console.error('부서 목록 조회 실패:', error);
  }
};

const fetchGrades = async () => {
  try {
    const response = await getGrades();
    if (response.success) {
      grades.value = response.data.map((g: any) => ({
        id: g.gradeId,
        name: g.gradeName
      }));
    }
  } catch (error) {
    console.error('직급 목록 조회 실패:', error);
  }
};

const handleSearch = async () => {
  try {
    // personnel.ts의 fetchEmployees 사용 (/employee/search)
    const response = await fetchEmployees({
      departmentName: '',
      jobTitleName: '',
      gradeName: '',
      employeeName: searchQuery.value || '',
      resigningExpected: 0, // 0: 재직자 전원 (필수 파라미터)
      page: 1,
      size: 100
    });

    if (response.data.success) {
      const list = response.data.data.content; // PageResponse 구조
      employees.value = list
        .map((e: any) => ({
        id: e.employeeId,
        name: e.employeeName, // API 응답 필드명 확인 필요 (employeeName)
        department: e.departmentName,
        grade: e.gradeName
      }));
    }
  } catch (error) {
    console.error('사원 검색 실패:', error);
  }
};

const close = () => {
  emit('close');
};

const confirm = () => {
  if (props.type === 'GROUP') {
    // ID 목록을 기반으로 선택된 객체(이름 포함)를 찾아서 전달
    const selectedDeptObjects = departments.value.filter(d => selectedDepartments.value.includes(d.id));
    const selectedGradeObjects = grades.value.filter(g => selectedGrades.value.includes(g.id));

    emit('confirm', {
      departments: selectedDeptObjects,
      grades: selectedGradeObjects
    });
  } else {
    const selectedEmpObjects = employees.value.filter(e => selectedEmployees.value.includes(e.id));
    
    emit('confirm', {
      employees: selectedEmpObjects
    });
  }
};

// 모달이 열릴 때 초기값 설정
watch(() => props.visible, (newVal) => {
  if (newVal && props.initialData) {
    if (props.type === 'GROUP') {
      if (departments.value.length === 0) fetchDepartments();
      if (grades.value.length === 0) fetchGrades();
    } else {
      // 개인 선택 모드일 때 초기 사원 목록 로드 (선택 사항)
      if (employees.value.length === 0) handleSearch();
    }
    
    if (props.type === 'GROUP') {
      selectedDepartments.value = [...(props.initialData.targetDepartmentIds || [])];
      selectedGrades.value = [...(props.initialData.targetGradeIds || [])];
    } else {
      selectedEmployees.value = [...(props.initialData.targetEmployeeIds || [])];
    }
  }
});
</script>

<style scoped>
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;
}
.modal-container {
  background: white; width: 600px; height: 80vh; border-radius: 14px;
  display: flex; flex-direction: column; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}
.modal-header {
  padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;
}
.modal-header h3 { font-size: 18px; font-weight: 700; color: #1f2937; margin: 0; }
.close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #64748b; }

.modal-body { padding: 24px; overflow-y: auto; flex: 1; }

/* Group Selection Styles */
.group-selection { display: flex; gap: 24px; }
.selection-column { flex: 1; display: flex; flex-direction: column; gap: 12px; }
.selection-column h4 { font-size: 15px; font-weight: 600; color: #475569; margin: 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
.checkbox-list { display: flex; flex-direction: column; gap: 8px; max-height: 300px; overflow-y: auto; }
.checkbox-item { display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 6px 0; font-size: 14px; color: #334155; }
.checkbox-item:hover { color: #1c398e; }

/* Individual Selection Styles */
.search-box { display: flex; gap: 10px; margin-bottom: 16px; }
.search-box input { flex: 1; padding: 10px 14px; border: 2px solid #cad5e2; border-radius: 8px; font-size: 14px; }
.search-box input:focus { outline: none; border-color: #155dfc; }
.search-box button { padding: 0 20px; background: #155dfc; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }

.employee-list { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; max-height: 300px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; }
.empty-list { text-align: center; color: #94a3b8; padding: 20px; }
.emp-info { display: flex; flex-direction: column; }
.emp-name { font-weight: 600; color: #1f2937; }
.emp-meta { font-size: 12px; color: #64748b; }

.modal-footer {
  padding: 20px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;
}
.selected-count { font-size: 14px; color: #1c398e; font-weight: 600; }
.button-group { display: flex; gap: 12px; }
.btn-cancel { padding: 10px 20px; border: 1px solid #cbd5e1; background: white; border-radius: 8px; cursor: pointer; font-weight: 600; color: #475569; }
.btn-confirm { padding: 10px 20px; background: #1c398e; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
.btn-confirm:hover { background: #162456; }
</style>