<!--
  <pre>
  File Name   : SettingsWorkSystemTemplate.vue
  Description : 근태 설정 - 근무제 템플릿(Work System Template) 관리 화면
                - 템플릿 목록 조회
                - 시간/휴게시간 수정 후 일괄 저장

  History
    2025/12/29 (지윤) 근무제 템플릿 조회/저장 화면 최초 작성
  </pre>
-->

<template>
  <div class="page-content">
    <!-- 상단 헤더 영역: 저장 버튼 -->
    <div class="page-header">
      <button
        type="button"
        class="btn-save"
        @click="onSaveTemplates"
      >
        저장
      </button>
    </div>

    <!-- 테이블 영역 -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>근무제명</th>
            <th class="w-140">시작</th>
            <th class="w-140">종료</th>
            <th class="w-160">휴게(분)</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="row in localTemplates"
            :key="row.workSystemTemplateId"
          >
            <!-- 근무제명(사유) -->
            <td>
              <input
                v-model="row.reason"
                type="text"
                class="input-text"
                placeholder="예) 기본 고정 근무제"
              />
            </td>

            <!-- 시작 시간 -->
            <td>
              <input
                v-model="row.startTimeHHmm"
                type="time"
                class="input-time"
              />
            </td>

            <!-- 종료 시간 -->
            <td>
              <input
                v-model="row.endTimeHHmm"
                type="time"
                class="input-time"
              />
            </td>

            <!-- 휴게 시간(분) -->
            <td>
              <input
                v-model.number="row.breakMinMinutes"
                type="number"
                min="0"
                step="5"
                class="input-number"
                placeholder="60"
              />
            </td>
          </tr>

          <!-- 데이터 없음 -->
          <tr v-if="localTemplates.length === 0">
            <td
              colspan="4"
              class="no-data"
            >
              등록된 근무제가 없습니다.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import {
  settingsAttendanceApi,
  type WorkSystemTemplateResponse,
  type WorkSystemTemplateUpsertRequest,
} from '@/api/settings/settings-attendance.api';

/**
 * 화면에서 사용하는 근무제 템플릿 행(Row) 타입
 * - 시간 필드는 "HH:mm" 포맷으로 관리
 */
interface WorkSystemTemplateRow {
  workSystemTemplateId: number; // 음수면 신규, 0 이상이면 기존 템플릿
  workSystemTypeId: number;
  reason: string;
  startTimeHHmm: string; // 예: "09:00"
  endTimeHHmm: string;   // 예: "18:00"
  breakMinMinutes: number;
}

/* =========================
   로컬 상태
   ========================= */
const localTemplates = ref<WorkSystemTemplateRow[]>([]);

/* =========================
   시간 포맷 변환 유틸
   ========================= */

/**
 * "HH:mm:ss" → "HH:mm" 포맷으로 변환
 */
const toHHmm = (time: string): string => {
  if (!time) {
    return '';
  }
  return time.length >= 5 ? time.slice(0, 5) : time;
};

/**
 * "HH:mm" → "HH:mm:ss" 포맷으로 변환
 */
const toHHmmss = (time: string): string => {
  if (!time) {
    return '00:00:00';
  }
  return time.length === 5 ? `${time}:00` : time;
};

/* =========================
   템플릿 조회
   ========================= */

/**
 * 근무제 템플릿 목록 조회
 * - API 응답(초 단위 시간)을 화면용 "HH:mm" 포맷으로 매핑
 */
const fetchTemplates = async (): Promise<void> => {
  try {
    const list: WorkSystemTemplateResponse[] =
      await settingsAttendanceApi.listWorkSystemTemplates();

    localTemplates.value = (list ?? []).map((template) => ({
      workSystemTemplateId: template.workSystemTemplateId,
      workSystemTypeId: template.workSystemTypeId,
      reason: template.reason ?? '',
      startTimeHHmm: toHHmm(template.startTime),
      endTimeHHmm: toHHmm(template.endTime),
      breakMinMinutes: Number.isFinite(template.breakMinMinutes)
        ? template.breakMinMinutes
        : 0,
    }));
  } catch (error) {
    console.error('[fetchTemplates] 근무제 목록 조회 실패:', error);
    localTemplates.value = [];
    window.alert('근무제 목록 조회에 실패했습니다.');
  }
};

onMounted(() => {
  void fetchTemplates();
});

/* =========================
   저장 처리
   ========================= */

/**
 * 근무제 템플릿 저장(업서트)
 * - 간단한 유효성 검증 후 API 호출
 */
const onSaveTemplates = async (): Promise<void> => {
  try {
    // 간단 검증
    for (const row of localTemplates.value) {
      if (!row.reason?.trim()) {
        window.alert('근무제명(사유)을 입력해 주세요.');
        return;
      }
      if (!row.startTimeHHmm || !row.endTimeHHmm) {
        window.alert('시작/종료 시간을 모두 입력해 주세요.');
        return;
      }
      if (row.breakMinMinutes < 0) {
        window.alert('휴게시간은 0분 이상이어야 합니다.');
        return;
      }
    }

    const payload: WorkSystemTemplateUpsertRequest[] = localTemplates.value.map(
      (row) => ({
        workSystemTemplateId:
          row.workSystemTemplateId < 0 ? null : row.workSystemTemplateId,
        workSystemTypeId: row.workSystemTypeId,
        reason: row.reason,
        startTime: toHHmmss(row.startTimeHHmm),
        endTime: toHHmmss(row.endTimeHHmm),
        breakMinMinutes: row.breakMinMinutes,
      }),
    );

    await settingsAttendanceApi.upsertWorkSystemTemplates(payload);

    window.alert('근무제 설정이 저장되었습니다.');
    await fetchTemplates();
  } catch (error) {
    console.error('[onSaveTemplates] 근무제 설정 저장 실패:', error);
    window.alert('근무제 설정 저장에 실패했습니다.');
  }
};
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 24px 24px 0;
  margin-bottom: 20px;
}

.btn-save {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: #ffffff;
  border: none;
  padding: 10px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
}

.btn-save:hover {
  background-color: #162456;
}

.page-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.table-container {
  overflow-x: auto;
  overflow-y: auto;
  height: calc(100vh - 300px);
  border: 1px solid #e2e8f0;
  background: #ffffff;
  margin-bottom: 20px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th,
.data-table td {
  padding: 15px;
  border-bottom: 1px solid #e2e8f0;
}

.data-table th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: #ffffff;
  font-weight: 600;
  font-size: 14px;
}

.input-text,
.input-time,
.input-number {
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.text-center {
  text-align: center;
}

.no-data {
  padding: 40px 0;
  text-align: center;
  color: #94a3b8;
}

.w-100 {
  width: 100px;
}

.w-140 {
  width: 140px;
}

.w-160 {
  width: 160px;
}
</style>
