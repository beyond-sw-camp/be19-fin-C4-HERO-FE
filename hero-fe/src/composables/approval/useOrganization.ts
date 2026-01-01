/**
 * <pre>
 * Composable Name : useOrganization.ts
 * Description     : 조직도 관련 재사용 로직
 *
 * 주요 기능
 *   - 조직도 트리 확장/축소
 *   - 직원 선택/해제 토글
 *   - 아바타 색상 생성
 *   - 검색 디바운싱
 *
 * History
 *   2025/12/26 (민철) 최초 작성
 *
 * </pre>
 *
 * @author 민철
 * @version 1.0
 */

import { ref, Ref } from 'vue';
import { useOrganizationStore } from '@/stores/approval/organization.store';
import { OrganizationEmployeeDTO } from '@/types/approval/organization.types';

export function useOrganization() {
  const orgStore = useOrganizationStore();

  /* ========================================== */
  /* 트리 확장/축소 (store 메서드 사용) */
  /* ========================================== */

  /**
   * 부서 확장/축소 토글
   */
  const toggleDepartment = (departmentId: number) => {
    orgStore.toggleDepartment(departmentId);
  };

  /**
   * 부서가 확장되었는지 확인
   */
  const isDepartmentExpanded = (departmentId: number): boolean => {
    return orgStore.isDepartmentExpanded(departmentId);
  };

  /**
   * 모든 부서 확장
   */
  const expandAll = () => {
    // 조직도 순회하며 모든 부서 ID 추가
    const collectDepartmentIds = (node: any, ids: Set<number>) => {
      if (node.type === 'department' && node.departmentId) {
        ids.add(node.departmentId);
        if (node.children) {
          node.children.forEach((child: any) => {
            collectDepartmentIds(child, ids);
          });
        }
      }
    };

    if (orgStore.organizationTree) {
      const ids = new Set<number>();
      collectDepartmentIds(orgStore.organizationTree, ids);
      // ✅ Store의 expandedDepartments 직접 수정
      orgStore.expandedDepartments = ids;
    }
  };

  /**
   * 모든 부서 축소
   */
  const collapseAll = () => {
    // ✅ Store의 expandedDepartments 초기화
    orgStore.expandedDepartments.clear();
  };

  /* ========================================== */
  /* 직원 선택 */
  /* ========================================== */

  /**
   * 직원 선택/해제 토글
   */
  const toggleEmployeeSelection = (employee: OrganizationEmployeeDTO) => {
    const isSelected = orgStore.isEmployeeSelected(employee.employeeId);

    if (isSelected) {
      orgStore.removeSelectedEmployee(employee.employeeId);
    } else {
      orgStore.addSelectedEmployee(employee);
    }
  };

  /**
   * 직원이 선택되었는지 확인
   */
  const isEmployeeSelected = (employeeId: number): boolean => {
    return orgStore.isEmployeeSelected(employeeId);
  };

  /* ========================================== */
  /* 아바타 색상 */
  /* ========================================== */

  const avatarColors = [
    'bg-blue',
    'bg-purple',
    'bg-green',
    'bg-orange',
    'bg-pink',
    'bg-indigo',
  ];

  /**
   * 이름 기반 아바타 색상 생성
   */
  const getAvatarColor = (name: string): string => {
    const charCode = name.charCodeAt(0);
    const index = charCode % avatarColors.length;
    return avatarColors[index];
  };

  /**
   * 이름의 첫 글자 추출
   */
  const getAvatarInitial = (name: string): string => {
    return name.charAt(0);
  };

  /* ========================================== */
  /* 검색 디바운싱 */
  /* ========================================== */

  let searchTimeout: ReturnType<typeof setTimeout> | null = null;

  /**
   * 디바운싱 검색
   */
  const debouncedSearch = (keyword: string, delay: number = 300) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(() => {
      orgStore.searchEmployees(keyword);
    }, delay);
  };

  /* ========================================== */
  /* 유틸리티 */
  /* ========================================== */

  /**
   * 직책 표시 형식
   */
  const formatJobTitle = (gradeName: string, jobTitleName?: string | null): string => {
    if (jobTitleName) {
      return `${jobTitleName} ${gradeName}`;
    }
    return gradeName;
  };

  /**
   * 부서 카운트 표시
   */
  const formatDepartmentCount = (count: number, type: 'department' | 'employee'): string => {
    if (type === 'department') {
      return `${count}개 팀`;
    }
    return `${count}명`;
  };

  return {
    // 트리 확장/축소
    toggleDepartment,
    isDepartmentExpanded,
    expandAll,
    collapseAll,

    // 직원 선택
    toggleEmployeeSelection,
    isEmployeeSelected,

    // 아바타
    getAvatarColor,
    getAvatarInitial,

    // 검색
    debouncedSearch,

    // 유틸리티
    formatJobTitle,
    formatDepartmentCount,
  };
}
