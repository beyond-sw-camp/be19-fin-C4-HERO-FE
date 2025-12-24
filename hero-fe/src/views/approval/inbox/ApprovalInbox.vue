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
  *   2025/12/17 - 민철 최초 작성
  *   2025/12/23 - 민철 파일명 변경  
  * </pre>
  *
  * @module approval
  * @author 민철
  * @version 2.0
-->
<template>
  <div class="inbox-container">
    <div class="inbox-wrapper">
        <div class="inbox-header">
          <div class="inbox-tabs">
            <button class="tab tab-start" 
                    :class="{ active : activeTab === 'all' }"
                    @click="clickTab('all')">전체</button>
            <button class="tab"
                    :class="{ active : activeTab === 'que' }"
                    @click="clickTab('que')">대기</button>
            <button class="tab"
                    :class="{ active : activeTab === 'request' }"
                    @click="clickTab('request')">요청</button>
            <button class="tab"
                    :class="{ active : activeTab === 'reject' }"
                    @click="clickTab('reject')">반려</button>
            <button class="tab"
                    :class="{ active : activeTab === 'ref' }"
                    @click="clickTab('ref')">참조</button>
            <button class="tab"
                    :class="{ active : activeTab === 'end' }"
                    @click="clickTab('end')">승인</button>
            <button class="tab tab-end"
                    :class="{ active : activeTab === 'draft' }"
                    @click="clickTab('draft')">임시저장</button>
          </div>
        </div>
        <div class="inbox-body">
          <div class="inbox-body-header">
            <div class="top-left">
              <button class="top-first-button"
                      @click="toTemplateList()">
                <img src="/images/plus.svg" alt="plus"/>
                <span class="newdoc-button">새 결재 작성</span>
              </button>
            </div>
            <div class="top-right">
              <div class="top-second">
                <div class="from-cal">조회기간</div>
                <input class="input-box calendar" 
                      type="date"
                      >
                <div class="stream-icon">~</div>
                <input class="input-box calendar" type="date">
              </div>
              <div class="top-third">
                <select class="input-box filter">
                  <option value="all">전체</option>
                  <option value="docNo">문서번호</option>
                  <option value="docType">문서분류</option>
                  <option value="name">문서서식</option>
                  <option value="title">제목</option>
                  <option value="dept">부서</option>
                  <option value="drafter">상신자</option>
                </select>
                <input type="text" placeholder="검색어를 입력하세요" class="input-box">
                <button class="search-button">검색</button>
              </div>
            </div>
          </div>
          <div class="inbox-body-table">
            <table>
              <thead>
                <tr>
                  <td class="cell docNoc">문서번호</td>
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
                  <tr v-for="doc in documents" :key="doc.docId">
                    <td class="cell docNoc">{{ doc.docNo }}</td>
                    <td class="cell docStatus">
                      <div class="status-text">
                        {{ doc.docStatus }}
                      </div>
                    </td>
                    <td class="cell docCategory">{{ doc.category }}</td>
                    <td class="cell docName">{{ doc.name }}</td>
                    <td class="cell docTitle">{{ doc.title }}</td>
                    <td class="cell drafterDept">{{ doc.drafterDept }}</td>
                    <td class="cell drafter">{{ doc.drafter }}</td>
                    <td class="cell drafterDate">{{ doc.draftAt }}</td>
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
              <button class="inbox-button button-seq" 
                      @click="handlePageChange(page - 1)"
                      :disabled="page === 0">이전</button>
              
              <button class="inbox-button button-page active">{{ page + 1 }}</button>
              
              <button class="inbox-button button-seq" 
                      @click="handlePageChange(page + 1)"
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
import { useInboxList } from '@/composables/approval/useApproval';

const router = useRouter();
const { documents, page, totalPages, handlePageChange, loading } = useInboxList();

const activeTab = ref<string>('all');

const clickTab = (tab: string) => {
    activeTab.value = tab;
    if (tab === 'all') {
        console.log('전체');
    } else if (tab === 'que') {
        console.log('대기');
    } else if (tab === 'request') {
        console.log('요청');
    } else if (tab === 'reject') {
        console.log('반려');
    } else if (tab === 'ref') {
        console.log('참조');
    } else if (tab === 'end') {
        console.log('승인');
    } else if (tab === 'draft') {
        console.log('임시저장');
    }
};

const toTemplateList = () => {
  console.log('결재문서서식페이지로 이동');
  router.push('/approval/document-templates');
}

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
  background-color: #155dfc;
}

.inbox-body-table {
  display: flex;
  flex-direction: column;
}

table {
  
  border-collapse: collapse;
  padding: 10px;
}

thead {
  color: #ffff;
  background: linear-gradient(180deg, #1C398E 0%, #162456 100%);
  justify-content: space-around;

}

td {
  padding: 10px 5px 10px 20px;
  border-bottom: 1px solid #e2e8f0;
}

.cell {
  padding: 10px;
}

.status-text {
  
  background-color: aqua;
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

</style>