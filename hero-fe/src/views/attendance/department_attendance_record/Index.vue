<template>
  <div class="worksystem-wrapper">
    <div class="worksystem-page">
      <div class="panel">
        <!-- 검색 영역 -->
        <div class="panel-search">
          <div class="panel-search-inner">
            <input
              v-model="keyword"
              type="text"
              class="search-input"
              placeholder="이름·근무제·직급으로 검색"
            />
            <button class="btn-search" @click="onSearch">검색</button>
            <button class="btn-reset" @click="onReset">초기화</button>
          </div>
        </div>

        <!-- 테이블 영역 -->
        <div class="panel-table-wrapper">
          <div class="panel-table">
            <table class="employee-table">
              <thead>
                <tr>
                  <th class="col-name">이름</th>
                  <th class="col-status">상태</th>
                  <th class="col-position">직급</th>
                  <th class="col-worksystem">근무제</th>
                  <th class="col-worktime">근무시간</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, index) in pagedList"
                  :key="row.id"
                  :class="{ 'row-striped': index % 2 === 1 }"
                >
                  <td class="cell-name">{{ row.name }}</td>

                  <td class="cell-status">
                    <span class="status-pill">
                      {{ row.status }}
                    </span>
                  </td>

                  <td class="cell-position">
                    {{ row.position }}
                  </td>

                  <td class="cell-worksystem">
                    {{ row.workSystem }}
                  </td>

                  <td class="cell-worktime">
                    {{ row.workTime }}
                  </td>
                </tr>

                <tr v-if="pagedList.length === 0">
                  <td colspan="5" class="empty-row">
                    조회된 근무제 현황이 없습니다.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 페이지네이션 -->
          <div class="pagination" v-if="totalPages > 0">
            <button
              class="page-button"
              :disabled="currentPage === 1"
              @click="goPage(currentPage - 1)"
            >
              이전
            </button>

            <button
              v-for="page in totalPages"
              :key="page"
              class="page-button"
              :class="{ 'page-active': page === currentPage }"
              @click="goPage(page)"
            >
              {{ page }}
            </button>

            <button
              class="page-button"
              :disabled="currentPage === totalPages"
              @click="goPage(currentPage + 1)"
            >
              다음
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'

interface EmployeeWorkSystemRow {
  id: number
  name: string
  status: string
  position: string
  workSystem: string
  workTime: string
}

/**
 * 더미 데이터 (Figma 예시 기준)
 */
const allList = ref<EmployeeWorkSystemRow[]>([
  {
    id: 1,
    name: '김철수',
    status: '정상출근',
    position: '선임',
    workSystem: '기본 근무제',
    workTime: '09:00 - 18:00',
  },
  {
    id: 2,
    name: '이영희',
    status: '정상출근',
    position: '주임',
    workSystem: '선택 근무제',
    workTime: '10:00 - 19:00',
  },
  {
    id: 3,
    name: '박민수',
    status: '정상출근',
    position: '사원',
    workSystem: '기본 근무제',
    workTime: '09:00 - 18:00',
  },
  {
    id: 4,
    name: '최수진',
    status: '정상출근',
    position: '대리',
    workSystem: '시차 출퇴근제',
    workTime: '08:00 - 17:00',
  },
  {
    id: 5,
    name: '정현우',
    status: '정상출근',
    position: '사원',
    workSystem: '기본 근무제',
    workTime: '09:00 - 18:00',
  },
  // 필요하면 여기서 더 추가해서 페이지네이션 테스트 가능
])

// 검색 키워드
const keyword = ref('')

// 페이지네이션 상태 (프론트 전용)
const currentPage = ref(1)
const pageSize = ref(5)

// 검색 결과 리스트 (프론트 필터링)
const filteredList = computed(() => {
  if (!keyword.value.trim()) {
    return allList.value
  }

  const lower = keyword.value.trim().toLowerCase()
  return allList.value.filter((row) => {
    return (
      row.name.toLowerCase().includes(lower) ||
      row.position.toLowerCase().includes(lower) ||
      row.workSystem.toLowerCase().includes(lower)
    )
  })
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredList.value.length / pageSize.value)),
)

// 현재 페이지에 보여줄 데이터
const pagedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredList.value.slice(start, end)
})

function onSearch() {
  // 프론트 필터링이 computed로 적용되므로 페이지만 초기화
  currentPage.value = 1
}

function onReset() {
  keyword.value = ''
  currentPage.value = 1
}

function goPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}
</script>

<style scoped>
.worksystem-wrapper {
  width: 100%;
  height: 100%;
  padding: 36px;
  background-color: #f8fafc;
  box-sizing: border-box;
}

.worksystem-page {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

/* 메인 패널 */
.panel {
  width: 100%;
  background-color: #ffffff;
  border-radius: 14px;
  border: 2px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}

/* 검색 영역 */
.panel-search {
  border-bottom: 2px solid #e2e8f0;
  padding: 16px 18px;
}

.panel-search-inner {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
}

.search-input {
  width: 320px;
  height: 40px;
  padding: 0 12px;
  border-radius: 10px;
  border: 2px solid #cad5e2;
  font-size: 14px;
  outline: none;
}

.search-input:focus {
  border-color: #155dfc;
}

/* 버튼 */
.btn-search,
.btn-reset {
  min-width: 60px;
  height: 40px;
  border-radius: 10px;
  border: 2px solid #cad5e2;
  background-color: #ffffff;
  font-size: 14px;
  color: #62748e;
  cursor: pointer;
}

.btn-search {
  background-color: #155dfc;
  border-color: #155dfc;
  color: #ffffff;
}

.btn-search:disabled,
.btn-reset:disabled {
  opacity: 0.5;
  cursor: default;
}

/* 테이블 영역 */
.panel-table-wrapper {
  padding: 0 0 16px;
}

.panel-table {
  width: 100%;
  overflow-x: auto;
}

.employee-table {
  width: 100%;
  border-collapse: collapse;
  /* table-layout: fixed; */
}

/* 헤더 */
.employee-table thead tr {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
}

.employee-table th {
  height: 48px;
  padding: 11px 16px;
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
  text-align: left;
  border: none;
}

.col-name {
  width: 20%;
}
.col-status {
  width: 20%;
}
.col-position {
  width: 15%;
}
.col-worksystem {
  width: 25%;
}
.col-worktime {
  width: 20%;
}

/* 바디 */
.employee-table td {
  height: 60px;
  padding: 0 16px;
  font-size: 14px;
  color: #7b839f;
  border-top: 1px solid #e2e8f0;
  vertical-align: middle;
}

.row-striped {
  background-color: #f8fafc;
}

.cell-name {
  font-weight: 400;
}

.cell-status {
  padding-top: 0;
  padding-bottom: 0;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  height: 24px;
  padding: 0 12px;
  border-radius: 9999px;
  border: 1px solid #cad5e2;
  background-color: #ffffff;
  font-size: 12px;
  color: #030213;
}

/* 근무시간은 살짝 가운데 정렬 */
.cell-worktime {
  text-align: left;
}

/* 빈 데이터 */
.empty-row {
  text-align: center;
  padding: 24px 0;
  color: #94a3b8;
}

/* 페이지네이션 */
.pagination {
  margin-top: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.page-button {
  min-width: 40px;
  height: 30px;
  border-radius: 4px;
  border: 1px solid #cad5e2;
  background-color: #ffffff;
  font-size: 14px;
  color: #62748e;
  cursor: pointer;
}

.page-button:disabled {
  opacity: 0.5;
  cursor: default;
}

.page-active {
  background-color: #155dfc;
  border-color: #155dfc;
  color: #ffffff;
}

.employee-table tbody tr:last-child td {
  border-bottom: 1px solid #e2e8f0;
}
</style>
