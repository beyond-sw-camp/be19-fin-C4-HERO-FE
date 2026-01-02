/**
 * <pre>
 * TypeScript Name: useApproval.ts
 * Description: 결재 관련 Composables
 *
 * History
 * 2025/12/14 (민철) 최초 작성
 * 2025/12/17 (민철) useInboxList 구현
 * 
 * </pre>
 * * @author 민철
 * @version 1.0
*/
import { storeToRefs } from 'pinia';
import { useApprovalDocumentsStore } from "@/stores/approval/approval.store";
import { onMounted } from 'vue';

export const useInboxList = () => {

    const store = useApprovalDocumentsStore();

    // 반응형 상태 추출 (Destructuring 시 반응형 유지를 위해 storeToRefs 사용)
    const {
        documents,
        page,
        size,
        totalPages,
        totalElements,
        loading
    } = storeToRefs(store);

    // 문서 목록 조회 함수
    const fetchList = async () => {
        await store.fetchDocuments();
    };

    // 페이지 변경 핸들러
    const handlePageChange = (newPage: number) => {
        store.changePage(newPage);
    };

    // 검색 조건 변경 핸들러 (필요 시 사용)
    const handleSearch = (condition: any) => {
        store.updateSearch(condition);
    };

    // 컴포넌트 마운트 시 데이터 조회
    onMounted(() => {
        fetchList();
    });

    return {
        documents,
        page,
        size,
        totalPages,
        totalElements,
        loading,
        fetchList,
        handlePageChange,
        handleSearch,
    };
};