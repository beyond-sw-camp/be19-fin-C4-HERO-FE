/**
 * <pre>
 * Composable Name : useInbox.ts
 * Description     : 결재 문서함 비즈니스 로직 composable
 *
 * 주요 함수:
 * - useInbox: 문서함 관련 상태 및 액션 제공
 *
 * History
 *   2025/12/26 (민철) 최초 작성
 *   2025/12/29 (민철) 검색 기능 개선
 * </pre>
 *
 * @author 민철
 * @version 2.0
 */

import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useInboxStore } from '@/stores/approval/inbox.store';
import type { InboxTab } from '@/types/approval/inbox.types';

/**
 * 문서함 composable
 * @description 문서함 관련 상태 및 액션을 제공함
 */
export const useInbox = () => {
    const inboxStore = useInboxStore();

    // 상태 참조
    const {
        documents,
        page,
        size,
        totalPages,
        totalElements,
        activeTab,
        searchParams,
        loading,
    } = storeToRefs(inboxStore);

    // 액션
    const {
        fetchDocuments,
        changeTab,
        changePage,
        updateSearchParams,
        resetStore
    } = inboxStore;

    // 페이지 변경 핸들러
    const handlePageChange = (newPage: number) => {
        if (newPage < 0 || newPage >= totalPages.value) {
            return;
        }
        changePage(newPage);
    };

    // 탭 클릭 핸들러
    const handleTabClick = (tab: InboxTab) => {
        changeTab(tab);
    };

    // 검색 핸들러
    const handleSearch = (params: {
        fromDate?: string;
        toDate?: string;
        sortBy?: string;
        condition?: string;
    }) => {
        updateSearchParams(params);
    };

    // 컴포넌트 마운트 시 문서 조회
    onMounted(() => {
        fetchDocuments();
    });

    return {
        // 상태
        documents,
        page,
        size,
        totalPages,
        totalElements,
        activeTab,
        searchParams,
        loading,

        // 액션
        fetchDocuments,
        handleTabClick,
        handlePageChange,
        handleSearch,
        resetStore,
    };
};