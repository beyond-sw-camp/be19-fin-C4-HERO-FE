<template>
  <div class="formtpl-container">
    <div class="formtpl-page">
      <div class="formtpl-panel">
  
        <div class="formtpl-search-bar">
          <input 
            class="formtpl-search-input" 
            type="text" 
            v-model="searchKeyword"
            placeholder="검색..." 
          />
          <button class="formtpl-search-button">검색</button>
        </div>
  
        <div v-if="filteredList.length === 0" class="no-data-msg" style="text-align:center; padding: 20px; color:#666;">
          표시할 서식이 없습니다.
        </div>

        <section 
          v-if="bookmarkedForms.length > 0"
          class="formtpl-section" 
        >
          <div class="formtpl-section-header">
            <h2 class="formtpl-section-title">즐겨찾기</h2>
            <span class="formtpl-section-count">({{ bookmarkedForms.length }})</span>
          </div>
  
          <div class="formtpl-list">
            <button 
              v-for="form in bookmarkedForms" 
              :key="'bm-' + form.id"
              class="formtpl-card is-favorite"
              @click="handleCardClick(form)"
            >
              <div class="formtpl-meta">
                <div class="formtpl-icon">
                  <img :src="getCategoryIcon(form.category)" :alt="form.category">
                </div>
                <div>
                  <div class="formtpl-name">{{ form.title }}</div>
                  <div class="formtpl-category">{{ form.category }}</div>
                </div>
              </div>
              <div class="formtpl-action" @click.stop="toggleBookmark(form.id)">
                ★
              </div>
            </button>
          </div>
        </section>
  
        <section 
          v-for="(forms, category) in groupedForms" 
          :key="category"
          class="formtpl-section" 
        >
          <div class="formtpl-section-header">
            <h2 class="formtpl-section-title">{{ category }}</h2>
            <span class="formtpl-section-count">({{ forms.length }})</span>
          </div>
  
          <div class="formtpl-list">
            <button 
              v-for="form in forms" 
              :key="form.id"
              class="formtpl-card"
              :class="{ 'is-favorite': form.bookmarking }"
              @click="handleCardClick(form)"
            >
              <div class="formtpl-meta">
                <div class="formtpl-icon">
                  <img :src="getCategoryIcon(form.category)" :alt="form.category">
                </div>
                <div>
                  <div class="formtpl-name">{{ form.title }}</div>
                  <div class="formtpl-category">{{ form.category }}</div>
                </div>
              </div>
              <div class="formtpl-action" @click.stop="toggleBookmark(form.id)">
                {{ form.bookmarking ? '★' : '☆' }}
              </div>
            </button>
          </div>
        </section>
  
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTemplateStore } from '@/stores/approval/approval.store';
import apiClient from '@/api/apiClient';

// ✅ 프론트엔드 템플릿 사용을 위해 title로 통일
interface FormItem {
  id: number;
  title: string;       // 백엔드 DTO의 name을 여기에 매핑
  templateKey: string;
  category: string;
  description: string;
  bookmarking: boolean;
}

const router = useRouter();
const approvalStore = useTemplateStore();

const searchKeyword = ref<string>('');
const rawForms = ref<FormItem[]>([]);

// ✅ API 호출 및 데이터 매핑
const fetchTemplates = async () => {
  try {
    const response = await apiClient.get('/approval/templates');
    
    rawForms.value = response.data.map((item: any) => ({
      id: item.id,
      title: item.name,           // 백엔드 'name' -> 프론트 'title'
      templateKey: item.templateKey,
      category: item.category,
      description: item.description,
      bookmarking: item.bookmarking 
    }));
  } catch (error) {
    console.error('서식 목록 조회 실패:', error);
  }
};

// ✅ 즐겨찾기 토글 (API 연동)
const toggleBookmark = async (id: number) => {
  try {
    // 1. 백엔드 요청
    await apiClient.post(`/approval/templates/${id}/bookmark`);

    // 2. 성공 시 로컬 상태 업데이트
    const target = rawForms.value.find(f => f.id === id);
    if (target) {
      target.bookmarking = !target.bookmarking;
    }
  } catch (error) {
    console.error('즐겨찾기 변경 실패:', error);
    alert('즐겨찾기 처리에 실패했습니다.');
  }
};

// ✅ 컴포넌트 마운트 시 데이터 조회
onMounted(() => {
  fetchTemplates();
});

// ✅ 검색 필터링
const filteredList = computed(() => {
  const keyword = searchKeyword.value.trim();
  if (!keyword) return rawForms.value;
  
  return rawForms.value.filter(item => 
    item.templateKey.includes(keyword) || 
    item.category.includes(keyword) ||
    item.title.includes(keyword) // title로 검색
  );
});

// ✅ 즐겨찾기 목록
const bookmarkedForms = computed(() => {
  return filteredList.value.filter(item => item.bookmarking);
});

// ✅ 카테고리 그룹화
const groupedForms = computed(() => {
  const groups: Record<string, FormItem[]> = {};
  filteredList.value.forEach(item => {
    if (!groups[item.category]) {
      groups[item.category] = [];
    }
    groups[item.category].push(item);
  });
  return groups;
});

// ✅ 아이콘 매핑
const getCategoryIcon = (category: string): string => {
  switch (category) {
    case '인사': return '/images/personnel.svg';
    case '휴가': return '/images/vacation.svg';
    case '근태': return '/images/attendance.svg';
    case '급여': return '/images/payroll.svg';
    default: return '/images/payroll.svg';
  }
};

// ✅ 카드 클릭 핸들러
const handleCardClick = (form: FormItem) => {
  console.log('선택된 양식:', form.templateKey);
  approvalStore.setCurrentForm({
    title: form.title, 
    category: form.category
  });
  router.push({
    name: 'WriteDocument',
    params: { formName: form.templateKey }
  });
};
</script>

<style scoped>
@import "@/assets/styles/templateList.css";
</style>