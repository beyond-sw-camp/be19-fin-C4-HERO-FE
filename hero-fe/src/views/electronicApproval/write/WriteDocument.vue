<template>
  <div class="page-wrapper">
    <div class="page-header">
        <div class="header-inner">
            <button class="btn-back">
                <img class="icon-arrow" src="/images/arrow.svg" alt="화살표"/>
                <div class="back-label-wrap">
                    <div class="back-label">목록으로</div>
                </div>
            </button>

            <div class="action-group">
                <button class="btn-secondary">
                    <img class="btn-icon" src="/images/file.svg" />
                    <div class="btn-text">임시저장</div>
                </button>
                <button class="btn-secondary">
                    <img class="btn-icon" src="/images/preview.svg" />
                    <div class="btn-text">미리보기</div>
                </button>
                <button class="btn-primary">
                    <img class="btn-icon" src="/images/submit.svg" />
                    <div class="btn-text-white">상신</div>
                </button>
            </div>
        </div>
    </div>

    <div class="page-body">
        <div class="form-wrapper">
            <div class="form-container">
                <!-- <Changework/> -->
                 <Vacation/>
            </div>
        </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import Changework from './Changework.vue';
import Vacation from './Vacation.vue';
</script>

<style scoped>
.page-wrapper {
  display: flex;
    flex-direction: column;
    height: 100vh; /* 화면 전체 높이 사용 (또는 부모 높이에 따라 100%) */
    overflow: hidden; /* 전체 화면 스크롤 방지 */
}

/* 헤더 영역 */
.page-header {
    width: 100%;
    background: #ffffff;
    border-style: solid;
    border-color: #e2e8f0;
    border-width: 0px 0px 2px 0px;
    padding: 6px 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex-shrink: 0;
    min-height: 38px;
    justify-content: center;
}

.header-inner {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
}

/* 뒤로가기 버튼 스타일 */
.btn-back {
    border-style: solid;
    border-color: #bfc2c7;
    border-width: 0px 0px 1px 0px;
    display: flex;
    flex-direction: row;
    gap: 0px;
    align-items: center;
    justify-content: flex-start;
    flex-shrink: 0;
    position: relative;
    width: fit-content;
    background: none; /* 버튼 기본 스타일 제거 필요 시 */
    padding: 0;      /* 버튼 기본 스타일 제거 필요 시 */
}

.icon-arrow {
    flex-shrink: 0;
    width: 19px;
    height: 19px;
    position: relative;
    overflow: visible;
}

.back-label-wrap {
    flex-shrink: 0;
    width: 55px;
    height: 24px;
    position: relative;
}

.back-label {
    color: #0f172b;
    text-align: left;
    font-family: "Inter-Regular", sans-serif;
    font-size: 14px;
    line-height: 24px;
    letter-spacing: 0.07px;
    font-weight: 400;
    position: absolute;
    left: 0px;
    top: 0px;
}

/* 액션 버튼 그룹 */
.action-group {
    display: flex;
    flex-direction: row;
    gap: 8px;
    align-items: center;
    justify-content: flex-start;
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
}

/* 보조 버튼 (임시저장, 미리보기) */
.btn-secondary {
    border-radius: 8px;
    border-style: solid;
    border-color: #e2e8f0;
    border-width: 1px;
    padding: 6px 11px 6px 11px;
    display: flex;
    flex-direction: row;
    gap: 7px;
    align-items: center;
    justify-content: flex-start;
    flex-shrink: 0;
    position: relative;
    text-align: left;
    background-color: white; /* 명시적 추가 */
}

/* 주요 버튼 (상신) */
.btn-primary {
    background: linear-gradient(
        180deg,
        rgba(28, 57, 142, 1) 0%,
        rgba(22, 36, 86, 1) 100%
    );
    border-radius: 8px;
    border: none; /* button2의 기본 border 제거 혹은 명시 */
    padding: 6px 18px 6px 18px;
    display: flex;
    flex-direction: row;
    gap: 7px;
    align-items: center;
    justify-content: flex-start;
    flex-shrink: 0;
    position: relative;
    text-align: left;
}

/* 버튼 내부 공통 아이콘 */
.btn-icon {
    flex-shrink: 0;
    width: 12px;
    height: 12px;
    position: relative;
    overflow: visible;
}

/* 버튼 텍스트 (기본/회색) */
.btn-text {
    color: #62748e;
    text-align: center;
    font-family: "Inter-Regular", sans-serif;
    font-size: 12px;
    line-height: 18px;
    letter-spacing: -0.31px;
    font-weight: 400;
    position: relative;
}

/* 버튼 텍스트 (흰색 - 상신 버튼용) */
.btn-text-white {
    color: #ffffff;
    text-align: center;
    font-family: "Inter-Regular", sans-serif;
    font-size: 12px;
    line-height: 18px;
    letter-spacing: -0.31px;
    font-weight: 400;
    position: relative;
}

/* 메인 컨텐츠 영역 */
.page-body {
    padding: 20px;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow-y: auto;

}

.form-wrapper {
    padding: 0px 100px 0px 100px;
}

.form-container {
    height: 100%;
    width: 100%;
    padding: 0;
    background-color: #ffff;
}
</style>