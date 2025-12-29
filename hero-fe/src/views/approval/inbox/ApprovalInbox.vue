<!--
  * <pre>
  * Vue Name        : ApprovalInbox.vue
  * Description     : 결재문서함
  *
  * 컴포넌트 연계
  * - 문서 상세 조회
  * - ApprovalTemplates.vue: 새 결재 작성 버튼 클릭 시 결재문서서식페이지로 라우팅
  *
  * History
  *   2025/12/17 (민철) 최초 작성
  *   2025/12/23 (민철) 파일명 변경
  *   2025/12/26 (민철) 탭별 문서 조회 기능 구현
  *   2025/12/26 (민철) 문서 클릭 시 상세 화면 이동 기능 추가
  *   2025/12/29 (민철) 결재 상태별 뱃지 색상 구분 및 고정 크기 적용
  *   2025/12/29 (민철) 테이블 열 너비 조정 및 좌우 균형 배치
  *   2025/12/29 (민철) 전체 검색 기능 개선 (모든 필드에서 검색)
  * </pre>
  *
  * @module approval
  * @author 민철
  * @version 3.4
-->
<template>
  <div class="inbox-container">
    <div class="inbox-wrapper">
      <div class="inbox-header">
        <div class="inbox-tabs">
          <button class="tab tab-start" :class="{ active: activeTab === 'all' }"
            @click="handleTabClick('all')">전체</button>
          <button class="tab" :class="{ active: activeTab === 'que' }"
            @click="handleTabClick('que')">대기</button>
          <button class="tab" :class="{ active: activeTab === 'request' }"
            @click="handleTabClick('request')">요청</button>
          <button class="tab" :class="{ active: activeTab === 'reject' }"
            @click="handleTabClick('reject')">반려</button>
          <button class="tab" :class="{ active: activeTab === 'ref' }"
            @click="handleTabClick('ref')">참조</button>
          <button class="tab" :class="{ active: activeTab === 'end' }"
            @click="handleTabClick('end')">승인</button>
          <button class="tab tab-end" :class="{ active: activeTab === 'draft' }"
            @click="handleTabClick('draft')">임시저장</button>
        </div>
      </div>
      <div class="inbox-body">
        <div class="inbox-body-header">
          <div class="top-left">
            <button class="top-first-button" @click="toTemplateList()">
              <img src="/images/plus.svg" alt="plus" />
              <span class="newdoc-button">새 결재 작성</span>
            </button>
          </div>
          <div class="top-right">
            <div class="top-second">
              <div class="from-cal">조회기간</div>
              <input class="input-box calendar" type="date" v-model="fromDate" @change="onSearchChange">
              <div class="stream-icon">~</div>
              <input class="input-box calendar" type="date" v-model="toDate" @change="onSearchChange">
            </div>
            <div class="top-third">
              <select class="input-box filter" v-model="sortBy" @change="onSearchChange">
                <option value="all">전체</option>
                <option value="docNo">문서번호</option>
                <option value="docType">문서분류</option>
                <option value="name">문서서식</option>
                <option value="title">제목</option>
                <option value="dept">부서</option>
                <option value="drafter">상신자</option>
              </select>
              <input type="text" placeholder="검색어를 입력하세요" class="input-box" v-model="searchKeyword"
                @keyup.enter="onSearchChange">
              <button class="search-button" @click="onSearchChange">검색</button>
            </div>
          </div>
        </div>
        <div class="inbox-body-table">
          <table>
            <thead>
              <tr>
                <td class="cell docNo">문서번호</td>
                <td class="cell docStatus">결재상태</td>
                <td class="cell docCategory">문서분류</td>
                <td class="cell docName">문서서식</td>
                <td class="cell docTitle">문서제목</td>
                <td class="cell drafterDept">부서</td>
                <td class="cell drafter">상신자</td>
                <td class="cell drafterDate">상신일시</td>
              </tr>
            </thead>
            <tbody>
              <template v-if="!loading && documents.length > 0">
                <tr v-for="doc in documents" :key="doc.docId" class="clickable-row"
                  @click="toDocumentDetail(doc.docId)">
                  <td class="cell docNo">{{ doc.docNo }}</td>
                  <td class="cell docStatus">
                    <div class="status-badge" :class="getStatusClass(doc.docStatus)">
                      {{ getStatusText(doc.docStatus) }}
                    </div>
                  </td>
                  <td class="cell docCategory">{{ doc.category }}</td>
                  <td class="cell docName">{{ doc.name }}</td>
                  <td class="cell docTitle">{{ doc.title }}</td>
                  <td class="cell drafterDept">{{ doc.drafterDept }}</td>
                  <td class="cell drafter">{{ doc.drafter }}</td>
                  <td class="cell drafterDate">{{ doc.drafterAt }}</td>
                </tr>
              </template>

              <tr v-else-if="!loading && documents.length === 0">
                <td colspan="8" style="text-align: center; padding: 20px;">
                  조회된 문서가 없습니다.
                </td>
              </tr>

              <tr v-if="loading">
                <td colspan="8" style="text-align: center; padding: 20px;">
                  로딩 중...
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="inbox-body-bottom">
          <div class="inbox-body-buttons">
            <button class="inbox-button button-seq" @click="handlePageChange(page - 1)"
              :disabled="page === 0">이전</button>

            <button class="inbox-button button-page active">{{ page + 1 }}</button>

            <button class="inbox-button button-seq" @click="handlePageChange(page + 1)"
              :disabled="page >= totalPages - 1">다음</button>
          </div>
        </div>
      </div>
    </div>

  </div>

</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useInbox } from '@/composables/approval/useInbox';

const router = useRouter();

// composable 사용
const {
  documents,
  page,
  totalPages,
  activeTab,
  loading,
  handleTabClick,
  handlePageChange,
  handleSearch,
} = useInbox();

// 검색 조건 로컬 상태
const fromDate = ref('');
const toDate = ref('');
const sortBy = ref('all');
const searchKeyword = ref('');

/**
 * 검색 조건 변경 핸들러
 */
const onSearchChange = () => {
  handleSearch({
    fromDate: fromDate.value,
    toDate: toDate.value,
    sortBy: sortBy.value,
    condition: searchKeyword.value,
  });
};

/**
 * 결재 서식 목록 페이지로 이동
 */
const toTemplateList = () => {
  router.push('/approval/document-templates');
};

/**
 * 문서 상세 페이지로 이동
 * @param {number} docId - 문서 ID
 */
const toDocumentDetail = (docId: number) => {
  router.push({
    name: 'ApprovalDetail',
    params: { docId: docId.toString() }
  });
};

/**
 * 결재 상태에 따른 CSS 클래스 반환
 * @param {string} status - 결재 상태값
 * @returns {string} CSS 클래스명
 */
const getStatusClass = (status: string): string => {
  const statusMap: Record<string, string> = {
    '진행중': 'status-inprogress',
    '승인완료': 'status-approved',
    '반려': 'status-rejected'
  };
  return statusMap[status] || 'status-inprogress';
};

/**
 * 결재 상태 텍스트 반환 (필요시 변환)
 * @param {string} status - 결재 상태값
 * @returns {string} 표시할 상태 텍스트
 */
const getStatusText = (status: string): string => {
  return status;
};

</script>

<style scoped>
* {
  font-size: 14px;
  font-family: "Inter-Regular", sans-serif;
}

.inbox-container {
  padding: 20px;
  overflow: auto;
}

.inbox-wrapper {
  display: flex;
  flex-direction: column;
}

.inbox-header {
  display: flex;
  flex-direction: row;

}

.inbox-tabs {
  display: inline-flex;
  flex-direction: row;
}

.tab {
  padding: 10px;
  width: 95px;
  display: flex;
  text-align: center;
  justify-content: center;
  align-items: center;
  border-top: 1px solid #e2e8f0;
  border-left: 1px solid #e2e8f0;
  border-right: 1px solid #e2e8f0;
  background-color: #ffff;
}

.tab.active {
  color: #ffff;
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
}

.tab-start {
  border-top-left-radius: 14px;
}

.tab-end {
  border-top-right-radius: 14px;
}

.inbox-body {
  background-color: #ffff;
  border: 1px solid #e2e8f0;
  border-top-right-radius: 14px;
  border-bottom-left-radius: 14px;
  border-bottom-left-radius: 14px;
}

.inbox-body-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 10px 20px;
  border-bottom: 1px solid #e2e8f0;
}

.top-first-button {
  padding: 10px;
  display: flex;
  flex-direction: row;
  background: linear-gradient(180deg, #1C398E 0%, #162456 100%);
  border-radius: 10px;
}

.newdoc-button {
  color: #ffff;
}

.top-right {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 30px;
}

.top-second {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.top-third {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.filter {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.input-box {
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  display: flex;
}

.calendar {
  height: 100%;
}

.search-button {
  color: #ffff;
  padding: 10px 15px 10px 15px;
  border-radius: 10px;
  background: linear-gradient(180deg, #1C398E 0%, #162456 100%);
}

.inbox-body-table {
  display: flex;
  flex-direction: column;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

thead {
  color: #ffff;
  background: linear-gradient(180deg, #1C398E 0%, #162456 100%);
}

td {
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell {
  text-align: left;
}

/* 테이블 열 너비 설정 */
.docNo {
  width: 200px;
}

.docStatus {
  width: 150px;
}

.docCategory {
  width: 120px;
}

.docName {
  width: 160px;
}

.docTitle {
  /* width: auto; */
  min-width: 200px;
  white-space: normal;
  word-break: break-word;
}

.drafterDept {
  width: 120px;
}

.drafter {
  width: 120px;
}

.drafterDate {
  width: 190px;
}

/* 결재 상태 뱃지 공통 스타일 - 고정 크기 */
.status-badge {
  display: inline-flex;
  padding: 4px 12px;
  min-width: 70px;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
}

/* 진행중 상태 */
.status-inprogress {
  background-color: #dbeafe;
  color: #1e40af;
}

/* 승인완료 상태 */
.status-approved {
  background-color: #d1fae5;
  color: #065f46;
}

/* 반려 상태 */
.status-rejected {
  background-color: #fee2e2;
  color: #991b1b;
}

.inbox-body-bottom {
  padding: 15px;
  display: flex;
  justify-content: center;
  flex-direction: row
}

.inbox-body-buttons {
  display: flex;
  gap: 10px;
}

.inbox-button {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.button-seq {
  padding: 8px 15px;
}

.button-page {
  padding: 7px 10px;
}

.button-page.active {
  color: #ffff;
  background-color: #155dfc;
}

/* 클릭 가능한 행 스타일 */
.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.clickable-row:hover {
  background-color: #f8fafc;
}
</style>