/**
 * <pre>
 * File Name: approval.store.ts
 * Description: 결재관련 스토어 모음
 *
 * 주요 composable 객체:
 * - useTemplateStore: templateList에서 문서서식/문서분류를 저장하고 작성화면에 넘겨줌.
 * - useApprovalDocumentsStore: 문서함 내 조회될 데이터를 저장하고 fetch하여 promise객체를 통해 상태를 저장할 스토어
 * 
 * History
 * 2025/12/14 (민철) 최초 작성
 * 2025/12/17 (민철) store 파일명 정정 및 스토어 추가
 * </pre>
 *
 * @author 민철
 * @version 2.0
 */

import { defineStore } from 'pinia';
import { approvalDocumentApi } from '@/api/approval/approval.api';
import type { DocumentsResponseDTO } from '@/types/approval/inbox.types';
import type { SearchCondition } from '@/types/common/pagination.types';

export const useTemplateStore = defineStore('approval', {
    state: () => ({
        title: '',
        category: ''
    }),

    actions: {
        setCurrentForm(payload: {
            title: string;
            category: string;
        }) {
            this.title = payload.title;
            this.category = payload.category;
        }
    }
})

export const useApprovalDocumentsStore = defineStore('approvalDocuments', {
    state: () => ({
        documents: [] as DocumentsResponseDTO[],
        page: 0,
        size: 10,
        totalPages: 0,
        totalElements: 0,

        search: {
            condition: '',
            sortBy: '',
            fromDate: '',
            toDate: '',
        } as SearchCondition,

        loading: false,
    }),

    actions: {
        async fetchDocuments() {
            this.loading = true;

            try {
                const { data } = await approvalDocumentApi.getList({
                    page: this.page,
                    size: this.size,
                    ...this.search,
                });

                this.documents = data.content;
                this.totalPages = data.totalPages;
                this.totalElements = data.totalElements ?? 0;
            } finally {
                this.loading = false;
            }
        },

        changePage(page: number) {
            this.page = page;
            this.fetchDocuments();
        },

        updateSearch(search: SearchCondition) {
            this.search = { ...this.search, ...search };
            this.page = 0;
            this.fetchDocuments();
        },
    },
});

