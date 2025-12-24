<!--
  * <pre>
  * Vue Name        : ApprovalLineModal.vue
  * Description     : 결재자 지정 모달 컴포넌트
  *
  * 컴포넌트 연계: ApprovalCreateCommonForm.vue
  *
  * History
  *   2025/12/24 - 민철 최초 작성
  * </pre>
  *
  * @module approval
  * @author 민철
  * @version 1.0
-->
<template>
    <article class="org-chart-container">
    
    <header class="header">
        <div class="header-title">
            <img src="/images/aaaapeople.svg" alt="" width="24" height="24"/>
            <span>조직도</span>
        </div>
        <button aria-label="닫기" @click="handleClose">
            <img src="/images/deletebutton.svg" alt="닫기" width="20" height="20" />
        </button>
    </header>

    <section class="search-area">
        <label class="search-box">
            <input type="text" placeholder="이름, 부서, 직책으로 검색..." />
        </label>
    </section>

    <section class="tree-content">
        <ul>
            <li>
                <div class="tree-row depth-1">
                    <img class="icon icon-arrow" src="/images/dropdownarrow.svg" alt="" />
                    <img class="icon" src="/images/organization.svg" alt="" />
                    <span class="node-name">개발본부</span>
                    <span class="node-count">2개 팀</span>
                </div>
                
                <ul>
                    <li>
                        <div class="tree-row depth-2">
                            <img class="icon icon-arrow" src="/images/dropdownarrow.svg" alt="" />
                    <img class="icon" src="/images/organization.svg" alt="" />
                            <span class="node-name">애플리케이션 개발팀</span>
                            <span class="node-count">3개 팀</span>
                        </div>

                        <ul>
                            <li>
                                <div class="tree-row depth-3">
                                    <img class="icon icon-arrow" src="/images/dropdownarrow.svg" alt="" />
                    <img class="icon" src="/images/organization.svg" alt="" />
                                    <span class="node-name">애플리케이션 개발1팀</span>
                                    <span class="node-count">3명</span>
                                </div>
                                <ul>
                                    <li class="user-card depth-4">
                                        <div class="avatar bg-blue">김</div>
                                        <div class="user-info">
                                            <span class="user-name">김승민 사원</span>
                                            <span class="user-team">애플리케이션 개발1팀</span>
                                        </div>
                                    </li>
                                    <li class="user-card depth-4">
                                        <div class="avatar bg-purple">서</div>
                                        <div class="user-info">
                                            <span class="user-name">서지윤 대리</span>
                                            <span class="user-team">애플리케이션 개발1팀</span>
                                        </div>
                                    </li>
                                    <li class="user-card depth-4">
                                        <div class="avatar bg-green">남</div>
                                        <div class="user-info">
                                            <span class="user-name">남태우 팀장</span>
                                            <span class="user-team">애플리케이션 개발1팀</span>
                                        </div>
                                    </li>
                                </ul>
                            </li>
                            <li>
                                <div class="tree-row depth-3">
                                    <img class="icon icon-arrow" src="/images/dropdownarrow.svg" alt="" />
                    <img class="icon" src="/images/organization.svg" alt="" />
                                    <span class="node-name">애플리케이션 개발2팀</span>
                                    <span class="node-count">2명</span>
                                </div>
                                <ul>
                                    <li class="user-card depth-4">
                                        <div class="avatar bg-purple">박</div>
                                        <div class="user-info">
                                            <span class="user-name">박지훈 과장</span>
                                            <span class="user-team">애플리케이션 개발2팀</span>
                                        </div>
                                    </li>
                                    <li class="user-card depth-4">
                                        <div class="avatar bg-green">이</div>
                                        <div class="user-info">
                                            <span class="user-name">이민수 차장</span>
                                            <span class="user-team">애플리케이션 개발2팀</span>
                                        </div>
                                    </li>
                                </ul>
                            </li>
                            <li>
                                <div class="tree-row depth-3">
                                    <img class="icon icon-arrow" src="/images/dropdownarrow.svg" alt="" />
                    <img class="icon" src="/images/organization.svg" alt="" />
                                    <span class="node-name">애플리케이션 개발3팀</span>
                                    <span class="node-count">3명</span>
                                </div>
                            </li>
                        </ul>
                    </li>
                    <li>
                        <div class="tree-row depth-2">
                            <img class="icon icon-arrow" src="/images/dropdownarrow.svg" alt="" />
                    <img class="icon" src="/images/organization.svg" alt="" />
                            <span class="node-name">인프라팀</span>
                            <span class="node-count">2명</span>
                        </div>
                    </li>
                </ul>
            </li>

            <li>
                <div class="tree-row depth-1">
                    <img class="icon icon-arrow" src="/images/dropdownarrow.svg" alt="" />
                    <img class="icon" src="/images/organization.svg" alt="" />
                    <span class="node-name">인사팀</span>
                    <span class="node-count">3명</span>
                </div>
            </li>
            <li>
                <div class="tree-row depth-1">
                    <img class="icon icon-arrow" src="/images/dropdownarrow.svg" alt="" />
                    <img class="icon" src="/images/organization.svg" alt="" />
                    <span class="node-name">재무팀</span>
                    <span class="node-count">2명</span>
                </div>
            </li>
            <li>
                <div class="tree-row depth-1">
                    <img class="icon icon-arrow" src="/images/dropdownarrow.svg" alt="" />
                    <img class="icon" src="/images/organization.svg" alt="" />
                    <span class="node-name">마케팅팀</span>
                    <span class="node-count">3명</span>
                </div>
            </li>
        </ul>
    </section>

    <footer class="footer">
        <button class="btn-cancel" @click="handleClose">취소</button>
    </footer>

</article>
</template>

<script setup lang="ts">
const emit = defineEmits(['close']);

const handleClose = () => {
    emit('close');
    console.log('결재자 모달 닫기');
};

const handleAddApprover = () => {
    console.log('결재자의 employeeId/employeeName/employeeDept/employeeGrade/employeeJobTitle 적용');
};
</script>

<style scoped>
* {
    box-sizing: border-box;
}

ul,
li {
    list-style: none;
    margin: 0;
    padding: 0;
}

h1,
h2,
h3,
p {
    margin: 0;
}

button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

input {
    border: none;
    outline: none;
    background: none;
    width: 100%;
    font-size: 16px;
}

.org-chart-container {
    background: #ffffff;
    border-radius: 16px;
    width: 672px;
    height: 820px;
    box-shadow: 0px 25px 50px -12px rgba(0, 0, 0, 0.25);
    display: flex;
    flex-direction: column;
    overflow: hidden;

    transform: scale(0.74);
    transform-origin: center;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
    height: 80px;
    border-bottom: 1px solid #e2e8f0;
}

.header-title {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 20px;
    font-weight: 600;
    color: #0f172b;
}

.search-area {
    padding: 24px;
    border-bottom: 1px solid #e2e8f0;
}

.search-box {
    display: flex;
    align-items: center;
    height: 52px;
    border: 2px solid #e2e8f0;
    border-radius: 14px;
    padding: 0 16px;
    gap: 12px;
}

.search-box:focus-within {
    border-color: #155dfc;
}

.tree-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
}

.tree-row {
    display: flex;
    align-items: center;
    height: 36px;
    padding-right: 16px;
    cursor: pointer;
    border-radius: 6px;
}

.tree-row:hover {
    background-color: #f1f5f9;
}

.icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    margin-right: 8px;
}

.icon-arrow {
    margin-right: 4px;
}

.node-name {
    font-size: 18px;
    color: #0f172b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: 8px;
}

.node-count {
    font-size: 16px;
    color: #90a1b9;
    white-space: nowrap;
    flex-shrink: 0;
}

.depth-1 {
    padding-left: 0px;
}

.depth-2 {
    padding-left: 36px;
}

.depth-3 {
    padding-left: 56px;
}

.depth-4 {
    padding-left: 76px;
}

.user-card {
    display: flex;
    align-items: center;
    height: 52px;
    padding-right: 16px;
    gap: 12px;
}

.avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 17px;
    flex-shrink: 0;
}

.bg-blue {
    background-color: #155dfc;
}

.bg-purple {
    background-color: #8b5cf6;
}

.bg-green {
    background-color: #10b981;
}

.user-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
}

.user-name {
    font-size: 18px;
    color: #0f172b;
    white-space: nowrap;
}

.user-team {
    font-size: 16px;
    color: #62748e;
    white-space: nowrap;
    margin-top: 2px;
}

.footer {
    height: 92px;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: flex-end;
    align-items: flex-start;
    padding: 24px;
}

.btn-cancel {
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    padding: 8px 24px;
    font-size: 16px;
    color: #62748e;
    height: 44px;
}
</style>