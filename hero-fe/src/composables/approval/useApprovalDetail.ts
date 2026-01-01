/**
 * <pre>
 * Composable Name : useApprovalDetail.ts
 * Description     : 결재 문서 상세 조회 비즈니스 로직 composable
 *
 * 주요 함수:
 * - useApprovalDetail: 문서 상세 조회 관련 상태 및 액션 제공
 *
 * History
 *   2025/12/26 (민철) 최초 작성
 * </pre>
 *
 * @author 민철
 * @version 1.0
 */

import { computed, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useApprovalDetailStore } from '@/stores/approval/approval_detail.store';

/**
 * 문서 상세 조회 composable
 * @description 문서 상세 조회 관련 상태 및 액션을 제공함
 * @param {number} docId - 조회할 문서 ID
 */
export const useApprovalDetail = (docId: number) => {
    const detailStore = useApprovalDetailStore();

    // 상태 참조
    const { document, loading, error } = storeToRefs(detailStore);

    // 액션
    const { fetchDocument, resetStore } = detailStore;

    // 문서 상세 데이터 computed
    const documentDetail = computed(() => document.value);

    // details JSON 파싱
    const parsedDetails = computed(() => {
        if (!document.value?.details) return null;
        try {
            return JSON.parse(document.value.details);
        } catch (e) {
            console.error('details 파싱 실패:', e);
            return null;
        }
    });

    // 컴포넌트 마운트 시 문서 조회
    onMounted(() => {
        fetchDocument(docId);
    });

    // 컴포넌트 언마운트 시 스토어 초기화
    onUnmounted(() => {
        resetStore();
    });

    return {
        // 상태
        document: documentDetail,
        parsedDetails,
        loading,
        error,

        // 액션
        fetchDocument,
        resetStore,
    };
};