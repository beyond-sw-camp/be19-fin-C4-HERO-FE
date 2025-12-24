<!--
  <pre>
  Vue Name   : NotificationSettings
  Description : 관리자 알림 발송 및 관리 페이지
  
  History
  2025/12/22 (혜원) 최초 작성
  </pre>
 
  @author 혜원
  @version 1.0
-->
<template>
  <div class="page">
    <div class="notification-container">
      <!-- 왼쪽 사이드바 네비게이션 -->
      <div class="side-nav">
        <div
          v-for="tab in innerTabs"
          :key="tab.id"
          :class="['nav-item', { active: activeInnerTab === tab.id }]"
          @click="changeInnerTab(tab.id)"
        >
          {{ tab.label }}
        </div>
      </div>

      <!-- 오른쪽 컨텐츠 영역 -->
      <div class="content-area">
      <!-- 1. 알림 발송 탭 -->
      <div v-show="activeInnerTab === 'send'" class="tab-panel form-panel">
        <form @submit.prevent="handleSendNotification" class="notification-form">
          <h3 class="form-section-title">발송 대상</h3>
          <div class="target-selection">
            <label v-for="target in targetOptions" :key="target.value" class="radio-label">
              <input type="radio" name="targetType" :value="target.value" v-model="sendForm.targetType" />
              <span>{{ target.label }}</span>
            </label>
          </div>

          <!-- 그룹 선택 (UI 구현 예정) -->
          <div v-if="sendForm.targetType === 'GROUP'" class="target-details">
            <button type="button" class="select-btn" @click="openModal('GROUP')">부서/직급 선택</button>
            <div class="tags-container">
              <div v-for="dept in sendForm.targetDepartments" :key="'d'+dept.id" class="tag">
                {{ dept.name }}
                <span class="remove-tag" @click="removeDepartment(dept.id)">×</span>
              </div>
              <div v-for="grade in sendForm.targetGrades" :key="'g'+grade.id" class="tag">
                {{ grade.name }}
                <span class="remove-tag" @click="removeGrade(grade.id)">×</span>
              </div>
            </div>
          </div>

          <!-- 개인 선택 (UI 구현 예정) -->
          <div v-if="sendForm.targetType === 'INDIVIDUAL'" class="target-details">
            <button type="button" class="select-btn" @click="openModal('INDIVIDUAL')">사원 검색 및 선택</button>
            <div class="tags-container">
              <div v-for="emp in sendForm.targetEmployees" :key="emp.id" class="tag">
                {{ emp.name }}
                <span class="remove-tag" @click="removeEmployee(emp.id)">×</span>
              </div>
            </div>
          </div>

          <h3 class="form-section-title">알림 내용</h3>
          <div class="form-group">
            <label for="title">제목</label>
            <input id="title" v-model="sendForm.title" type="text" required placeholder="알림 제목을 입력하세요." />
          </div>
          <div class="form-group">
            <label for="message">메시지</label>
            <textarea id="message" v-model="sendForm.message" rows="4" required placeholder="알림 메시지를 입력하세요."></textarea>
          </div>
          <div class="form-group">
            <label for="link">링크 (선택)</label>
            <input id="link" v-model="sendForm.link" type="text" placeholder="예: /approval/documents/123" />
          </div>
          <div class="form-group">
            <label for="type">알림 타입</label>
            <select id="type" v-model="sendForm.type" required>
              <option value="system">시스템</option>
              <option value="attendance">근태</option>
              <option value="payroll">급여</option>
              <option value="approval">결재</option>
              <option value="evaluation">평가</option>
            </select>
          </div>

          <button type="submit" class="send-button" :disabled="store.isLoading">
            {{ store.isLoading ? '발송 중...' : '알림 발송' }}
          </button>
        </form>
      </div>

      <!-- 2. 발송 이력 탭 -->
      <div v-show="activeInnerTab === 'history'" class="tab-panel history-panel">
        <!-- TODO: 날짜 필터 등 컨트롤 추가 -->
        <div class="history-table-wrapper">
          <table class="dashboard-table">
            <thead>
              <tr>
                <th>제목</th>
                <th>타입</th>
                <th>대상</th>
                <th>수신자 수</th>
                <th>발신자</th>
                <th>발송일시</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="store.isLoading">
                <td colspan="6" class="text-center">이력을 불러오는 중...</td>
              </tr>
              <tr v-else-if="store.historyList.length === 0">
                <td colspan="6" class="text-center">발송 이력이 없습니다.</td>
              </tr>
              <tr v-for="item in store.historyList" :key="item.historyId" v-else @click="openDetailModal(item)" class="clickable-row">
                <td>{{ item.title }}</td>
                <td>{{ item.type }}</td>
                <td>{{ getScopeLabel(item.scope) }}</td>
                <td>{{ item.targetCount }} 명</td>
                <td>{{ item.senderName || '관리자' }}</td>
                <td>{{ new Date(item.sentAt).toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- 페이지네이션 -->
        <div class="pagination" v-if="store.totalCount > 0">
          <button 
            class="page-button" 
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >
            이전
          </button>
          <button 
            class="page-button" 
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
          >
            다음
          </button>
        </div>
      </div>

      <!-- 3. 통계 탭 -->
      <div v-show="activeInnerTab === 'stats'" class="tab-panel stats-panel">
        <div v-if="store.isLoading" class="text-center">통계를 불러오는 중...</div>
        <div v-else-if="store.statistics" class="statistics-container">
          <div class="statistics-view">
            <div class="stat-item">
              <span class="stat-label">총 발송 건수</span>
              <span class="stat-value">{{ store.statistics.totalCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">평균 성공률</span>
              <span class="stat-value">{{ (store.statistics.averageSuccessRate || 0).toFixed(1) }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">활성 연결 수</span>
              <span class="stat-value">{{ store.statistics.activeConnections }}</span>
            </div>
          </div>
          
          <div class="chart-wrapper">
            <Bar v-if="chartData.datasets.length" :data="chartData" :options="chartOptions" />
          </div>
        </div>
        <div v-else class="text-center">통계 정보가 없습니다.</div>
      </div>
    </div>
    </div>

    <NotificationTargetModal 
      :visible="showModal" 
      :type="modalType"
      :initial-data="modalInitialData"
      @close="showModal = false"
      @confirm="handleModalConfirm"
    />

    <!-- 상세 보기 모달 -->
    <div v-if="showDetailModal" class="modal-overlay" @click.self="closeDetailModal">
      <div class="modal-container detail-modal">
        <div class="modal-header">
          <h3>알림 상세 정보</h3>
          <button type="button" class="close-btn" @click="closeDetailModal">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-row"><span class="label">제목:</span> {{ selectedHistory?.title }}</div>
          <div class="detail-row"><span class="label">내용:</span> <pre>{{ selectedHistory?.message }}</pre></div>
          <div class="detail-row"><span class="label">발송일시:</span> {{ selectedHistory ? new Date(selectedHistory.sentAt).toLocaleString() : '' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useSettingsNotificationStore } from '@/stores/settings/settings-notification.store';
import NotificationTargetModal from './NotificationSettingsTargetModal.vue';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js';
import { Bar } from 'vue-chartjs';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const store = useSettingsNotificationStore();

const activeInnerTab = ref('send');

const innerTabs = [
  { id: 'send', label: '알림 발송' },
  { id: 'history', label: '발송 이력' },
  { id: 'stats', label: '통계' },
];

const targetOptions = [
  { label: '전체', value: 'BROADCAST' },
  { label: '그룹', value: 'GROUP' },
  { label: '개인', value: 'INDIVIDUAL' },
];

const sendForm = reactive({
  targetType: 'BROADCAST',
  title: '',
  message: '',
  link: '',
  type: 'system',
  targetDepartments: [] as any[],
  targetGrades: [] as any[],
  targetEmployees: [] as any[],
});

const showModal = ref(false);
const modalType = ref<'GROUP' | 'INDIVIDUAL'>('GROUP');

// 상세 모달 상태
const showDetailModal = ref(false);
const selectedHistory = ref<any>(null);

const openDetailModal = (item: any) => {
  selectedHistory.value = item;
  showDetailModal.value = true;
};
const closeDetailModal = () => {
  showDetailModal.value = false;
  selectedHistory.value = null;
};

const openModal = (type: 'GROUP' | 'INDIVIDUAL') => {
  modalType.value = type;
  showModal.value = true;
};

const modalInitialData = computed(() => {
  if (modalType.value === 'GROUP') {
    return {
      departments: sendForm.targetDepartments,
      grades: sendForm.targetGrades
    };
  } else {
    return {
      employees: sendForm.targetEmployees
    };
  }
});

const handleModalConfirm = (data: any) => {
  if (modalType.value === 'GROUP') {
    sendForm.targetDepartments = data.departments;
    sendForm.targetGrades = data.grades;
  } else {
    sendForm.targetEmployees = data.employees;
  }
  showModal.value = false;
};

const removeDepartment = (id: number) => {
  sendForm.targetDepartments = sendForm.targetDepartments.filter(d => d.id !== id);
};
const removeGrade = (id: number) => {
  sendForm.targetGrades = sendForm.targetGrades.filter(g => g.id !== id);
};
const removeEmployee = (id: number) => {
  sendForm.targetEmployees = sendForm.targetEmployees.filter(e => e.id !== id);
};

const getScopeLabel = (scope: string) => {
  const map: Record<string, string> = {
    'ALL': '전체',
    'BROADCAST': '전체',
    'GROUP': '그룹',
    'INDIVIDUAL': '개인'
  };
  return map[scope] || scope;
};

// --- Pagination ---
const currentPage = ref(1);
const pageSize = 10;

const totalPages = computed(() => Math.ceil(store.totalCount / pageSize));

const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  store.fetchHistory(page - 1, pageSize);
};

const changeInnerTab = (tabId: string) => {
  activeInnerTab.value = tabId;
  if (tabId === 'history') {
    if (store.historyList.length === 0) {
      currentPage.value = 1;
      store.fetchHistory(0, pageSize);
    }
  } else if (tabId === 'stats' && !store.statistics) {
    store.fetchStatistics();
  }
};

const handleSendNotification = async () => {
  // 유효성 검사
  if (!sendForm.title.trim()) return alert('제목을 입력해주세요.');
  if (!sendForm.message.trim()) return alert('메시지를 입력해주세요.');
  
  if (sendForm.targetType === 'GROUP' && 
      sendForm.targetDepartments.length === 0 && 
      sendForm.targetGrades.length === 0) {
    return alert('발송 대상 그룹(부서 또는 직급)을 선택해주세요.');
  }
  
  if (sendForm.targetType === 'INDIVIDUAL' && sendForm.targetEmployees.length === 0) {
    return alert('발송 대상 사원을 선택해주세요.');
  }

  if (!confirm(`'${sendForm.title}' 알림을 발송하시겠습니까?`)) return;

  try {
    switch (sendForm.targetType) {
      case 'BROADCAST':
        await store.sendBroadcast({ title: sendForm.title, message: sendForm.message, link: sendForm.link, type: sendForm.type });
        break;
      case 'GROUP':
        await store.sendGroup({
          title: sendForm.title,
          message: sendForm.message,
          type: sendForm.type,
          link: sendForm.link,
          departmentIds: sendForm.targetDepartments.map(d => d.id),
          gradeIds: sendForm.targetGrades.map(g => g.id),
          jobTitleIds: [] // 직책 선택 기능이 추가되면 연동, 현재는 빈 배열 전송
        });
        break;
      case 'INDIVIDUAL':
        await store.sendIndividual({
          title: sendForm.title,
          message: sendForm.message,
          type: sendForm.type,
          link: sendForm.link || undefined, // 빈 문자열이면 undefined로 전송 (500 에러 방지)
          employeeIds: [...sendForm.targetEmployees.map(e => e.id)] // Proxy 해제 및 순수 배열로 변환
        });
        break;
    }
    alert('알림이 성공적으로 발송되었습니다.');
    // 폼 초기화
    Object.assign(sendForm, {
      targetType: 'BROADCAST', title: '', message: '', link: '', type: 'system',
      targetDepartments: [], targetGrades: [], targetEmployees: [],
    });
    // 이력 탭으로 이동 및 갱신
    currentPage.value = 1;
    store.fetchHistory(0, pageSize);
    activeInnerTab.value = 'history';
    
  } catch (error) {
    alert('알림 발송에 실패했습니다.');
    console.error('Notification send failed:', error);
  }
};

const chartData = computed(() => {
  const stats = store.statistics;
  if (!stats) return { labels: [], datasets: [] };
  
  return {
    labels: ['오늘', '이번 주', '이번 달'],
    datasets: [
      {
        label: '발송 건수',
        backgroundColor: '#1c398e',
        data: [stats.todayCount, stats.weekCount, stats.monthCount]
      }
    ]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: '기간별 알림 발송 현황'
    }
  }
};

onMounted(() => {
  changeInnerTab(activeInnerTab.value);
});
</script>

<style scoped>
.page { height: 100%; background: white; }
.notification-container { display: flex; flex-direction: row; height: 100%; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; }

/* Side Nav */
.side-nav { width: 200px; background: #f8fafc; border-right: 1px solid #e2e8f0; display: flex; flex-direction: column; flex-shrink: 0; }
.nav-item { padding: 16px 20px; cursor: pointer; font-size: 14px; color: #64748b; border-bottom: 1px solid #f1f5f9; transition: all 0.2s; font-weight: 500; }
.nav-item:hover { background: #f1f5f9; color: #1c398e; }
.nav-item.active { background: white; color: #1c398e; font-weight: 700; border-right: 3px solid #1c398e; margin-right: -1px; }

/* Content Area */
.content-area { flex: 1; overflow-y: auto; background: white; display: flex; flex-direction: column; }
.tab-panel { width: 100%; }
.form-panel, .stats-panel { padding: 30px; max-width: 1000px; }
.history-panel { padding: 24px; }

/* Form Styles */
.notification-form { display: flex; flex-direction: column; gap: 20px; max-width: 700px; }
.form-section-title { font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: -10px; }
.target-selection { display: flex; gap: 24px; align-items: center; }
.radio-label { display: flex; align-items: center; gap: 6px; cursor: pointer; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-group label { font-size: 14px; font-weight: 500; color: #475569; }
.form-group input, .form-group textarea, .form-group select { padding: 10px 14px; border: 2px solid #cad5e2; border-radius: 10px; font-size: 14px; font-family: inherit; color: #1f2933; }
.form-group input:focus, .form-group textarea:focus, .form-group select:focus { outline: none; border-color: #155dfc; }
.send-button { align-self: flex-start; padding: 12px 24px; background-color: #1c398e; color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; transition: background-color 0.2s; }
.send-button:hover:not(:disabled) { background-color: #1e40af; }
.send-button:disabled { background-color: #94a3b8; cursor: not-allowed; }
.select-btn { padding: 10px 16px; background: white; border: 2px solid #cad5e2; border-radius: 10px; color: #475569; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.select-btn:hover { border-color: #1c398e; color: #1c398e; }
.target-details { display: flex; flex-direction: column; align-items: flex-start; gap: 12px; }
.selected-summary { font-size: 14px; color: #1c398e; font-weight: 600; }

.tags-container { display: flex; flex-wrap: wrap; gap: 8px; }
.tag { display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: #f1f5f9; border-radius: 20px; font-size: 13px; color: #334155; border: 1px solid #e2e8f0; }
.remove-tag { cursor: pointer; color: #94a3b8; font-weight: bold; font-size: 16px; line-height: 1; }
.remove-tag:hover { color: #ef4444; }

/* Table Styles (Matching AttendanceDashboard) */
.history-table-wrapper { width: 100%; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; }
.dashboard-table { width: 100%; border-collapse: collapse; text-align: left; }
.dashboard-table thead tr { background: linear-gradient(180deg, #1c398e 0%, #162456 100%); }
.dashboard-table th { padding: 12px 16px; font-weight: 600; color: white; font-size: 14px; }
.dashboard-table td { padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #334155; vertical-align: middle; }
.dashboard-table tr:last-child td { border-bottom: none; }
.dashboard-table tr:hover td { background-color: #f8fafc; }

/* Pagination */
.pagination { display: flex; justify-content: center; align-items: center; gap: 10px; margin-top: 20px; }
.page-button {
  min-width: 34px; height: 29px; padding: 4px 10px; border-radius: 4px;
  border: 1px solid #cad5e2; background: #ffffff; font-size: 14px; color: #62748e; cursor: pointer;
}
.page-button:disabled { opacity: 0.5; cursor: default; }
.page-button:hover:not(:disabled) { background: #f1f5f9; }
.page-active { background: #155dfc; color: #ffffff; border-color: #155dfc; }

/* Stats Styles */
.text-center { text-align: center; color: #94a3b8; padding: 40px 0; }
.statistics-container { display: flex; flex-direction: column; gap: 30px; }
.statistics-view { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
.stat-item { background-color: #f8fafc; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center; }
.stat-label { display: block; font-size: 14px; color: #64748b; margin-bottom: 8px; }
.stat-value { display: block; font-size: 28px; font-weight: 700; color: #1c398e; }

.chart-wrapper { height: 400px; background: white; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; }

/* Detail Modal */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-container { background: white; border-radius: 14px; width: 500px; max-width: 90%; box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
.modal-header { padding: 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { margin: 0; font-size: 18px; font-weight: 700; }
.close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #64748b; }
.modal-body { padding: 24px; }
.detail-row { margin-bottom: 16px; font-size: 14px; }
.detail-row .label { font-weight: 600; color: #475569; display: inline-block; width: 80px; vertical-align: top; }
.detail-row pre { margin: 0; display: inline-block; white-space: pre-wrap; font-family: inherit; color: #1f2933; max-width: calc(100% - 90px); }
.clickable-row { cursor: pointer; }
</style>