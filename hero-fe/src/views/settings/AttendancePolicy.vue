<template>
  <div class="page-content">
    <div class="page-header">
      <button @click="saveTemplates" class="btn-save">
        저장
      </button>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>근무제명</th>
            <th class="w-140">시작</th>
            <th class="w-140">종료</th>
            <th class="w-160">휴게(분)</th>
            <!-- ✅ 삭제 버튼 제거하므로 관리 컬럼 제거 -->
            <!-- <th class="w-100 text-center">관리</th> -->
          </tr>
        </thead>

        <tbody>
          <tr v-for="(row, index) in localTemplates" :key="row.workSystemTemplateId">
            <td>
              <input
                v-model="row.reason"
                type="text"
                class="input-text"
                placeholder="예) 기본 고정 근무제"
              />
            </td>

            <td>
              <input
                v-model="row.startTimeHHmm"
                type="time"
                class="input-time"
              />
            </td>

            <td>
              <input
                v-model="row.endTimeHHmm"
                type="time"
                class="input-time"
              />
            </td>

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

            <!-- ✅ removeRow가 없으니 삭제 버튼/컬럼 제거 -->
            <!--
            <td class="text-center">
              <button @click="removeRow(index)" class="btn-delete">
                삭제
              </button>
            </td>
            -->
          </tr>

          <tr v-if="localTemplates.length === 0">
            <!-- ✅ 컬럼 수 변경: 5 -> 4 -->
            <td colspan="4" class="no-data">
              등록된 근무제가 없습니다.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ✅ addRow가 없으니 추가 버튼 제거 -->
    <!--
    <button @click="addRow" class="btn-add">
      + 근무제 추가
    </button>
    -->
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  settingsAttendanceApi,
  type WorkSystemTemplateResponse,
  type WorkSystemTemplateUpsertRequest,
} from '@/api/settings/settings-attendance.api';

interface WorkSystemTemplateRow {
  workSystemTemplateId: number; // 음수면 신규
  workSystemTypeId: number;
  reason: string;
  startTimeHHmm: string; // "09:00"
  endTimeHHmm: string;   // "18:00"
  breakMinMinutes: number;
}

const localTemplates = ref<WorkSystemTemplateRow[]>([]);

/* =========================
   time 변환 유틸
   ========================= */
function toHHmm(time: string): string {
  // "09:00:00" -> "09:00"
  if (!time) return '';
  return time.length >= 5 ? time.slice(0, 5) : time;
}

function toHHmmss(time: string): string {
  // "09:00" -> "09:00:00"
  if (!time) return '00:00:00';
  return time.length === 5 ? `${time}:00` : time;
}

/* =========================
   조회
   ========================= */
async function fetchTemplates() {
  try {
    const list: WorkSystemTemplateResponse[] =
      await settingsAttendanceApi.listWorkSystemTemplates();

    localTemplates.value = (list ?? []).map((t) => ({
      workSystemTemplateId: t.workSystemTemplateId,
      workSystemTypeId: t.workSystemTypeId,
      reason: t.reason ?? '',
      startTimeHHmm: toHHmm(t.startTime),
      endTimeHHmm: toHHmm(t.endTime),
      breakMinMinutes: Number.isFinite(t.breakMinMinutes) ? t.breakMinMinutes : 0,
    }));
  } catch (e) {
    console.error('[fetchTemplates] failed:', e);
    localTemplates.value = [];
    alert('근무제 목록 조회 실패');
  }
}

onMounted(fetchTemplates);

/* =========================
   행 추가/삭제
   ========================= */
function addRow() {
  // 신규 row는 음수 ID로 관리
  const minId = localTemplates.value.reduce(
    (min, item) => Math.min(min, item.workSystemTemplateId),
    0
  );

  localTemplates.value.push({
    workSystemTemplateId: minId - 1,
    workSystemTypeId: 1, // 기본값(필요 시 변경)
    reason: '',
    startTimeHHmm: '09:00',
    endTimeHHmm: '18:00',
    breakMinMinutes: 60,
  });
}

function removeRow(index: number) {
  localTemplates.value.splice(index, 1);
}

/* =========================
   저장
   ========================= */
async function saveTemplates() {
  try {
    // 간단 검증
    for (const row of localTemplates.value) {
      if (!row.reason?.trim()) {
        alert('근무제명(사유)을 입력해주세요.');
        return;
      }
      if (!row.startTimeHHmm || !row.endTimeHHmm) {
        alert('시작/종료 시간을 입력해주세요.');
        return;
      }
      if (row.breakMinMinutes < 0) {
        alert('휴게시간은 0 이상이어야 합니다.');
        return;
      }
    }

    const payload: WorkSystemTemplateUpsertRequest[] = localTemplates.value.map((row) => ({
      workSystemTemplateId: row.workSystemTemplateId < 0 ? null : row.workSystemTemplateId,
      workSystemTypeId: row.workSystemTypeId,
      reason: row.reason,
      startTime: toHHmmss(row.startTimeHHmm),
      endTime: toHHmmss(row.endTimeHHmm),
      breakMinMinutes: row.breakMinMinutes,
    }));

    await settingsAttendanceApi.upsertWorkSystemTemplates(payload);

    alert('근무제 설정이 저장되었습니다.');
    await fetchTemplates();
  } catch (e) {
    console.error('[saveTemplates] failed:', e);
    alert('저장 실패');
  }
}
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
  color: white;
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
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
  background: white;
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
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.input-text {
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.input-time {
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

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

.btn-delete {
  color: #ef4444;
  font-weight: 500;
  font-size: 0.875rem;
  background: none;
  border: none;
  cursor: pointer;
}

.no-data {
  padding: 40px 0;
  text-align: center;
  color: #94a3b8;
}

.btn-add {
  width: calc(100% - 48px);
  margin: 0 24px 24px;
  padding: 12px;
  border: 2px dashed #e2e8f0;
  color: #64748b;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.2s;
  background: white;
}

.btn-add:hover {
  background-color: #f8fafc;
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
