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
// 1. Import 구문
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import WriteDocument from '../write/WriteDocument.vue';

// 2. Types 정의 (내부 사용 타입이므로 별도 파일 분리 전까지 여기서 정의)
interface FormItem {
  id: number;
  title: string;
  name: string; // URL 라우팅용 영문 이름
  category: string;
  bookmarking: boolean;
}

// 3. Composables
const router = useRouter();

// 4. Reactive 데이터
const searchKeyword = ref<string>('');

const rawForms = ref<FormItem[]>([
  { id: 1, title: '인사발령품의서', name: 'personnelappointment', category: '인사', bookmarking: false },
  { id: 2, title: '승진계획서', name: 'promotionplan', category: '인사', bookmarking: false },
  { id: 3, title: '사직서', name: 'resign', category: '인사', bookmarking: false },
  { id: 4, title: '휴가신청서', name: 'vacation', category: '휴가', bookmarking: true },
  { id: 5, title: '근태기록수정신청서', name: 'modifyworkrecord', category: '근태', bookmarking: true },
  { id: 6, title: '근무변경신청서', name: 'changework', category: '근태', bookmarking: true },
  { id: 7, title: '초과근무신청서', name: 'overtime', category: '근태', bookmarking: false },
  { id: 9, title: '급여조정신청서', name: 'modifypayroll', category: '급여', bookmarking: false,},
  { id: 10, title: '급여인상신청서', name: 'raisepayroll', category: '급여', bookmarking: false,},
]);

// 5. Computed 속성
/**
 * 검색어가 적용된 필터링 리스트를 반환합니다.
 * 이름(name) 또는 카테고리(category)에 검색어가 포함된 항목만 필터링합니다.
 */
const filteredList = computed(() => {
  const keyword = searchKeyword.value.trim();
  if (!keyword) return rawForms.value;
  
  return rawForms.value.filter(item => 
    item.name.includes(keyword) || 
    item.category.includes(keyword) ||
    item.title.includes(keyword) // 제목 검색 추가
  );
});

/**
 * 즐겨찾기(bookmarking)된 항목 목록을 반환합니다.
 */
const bookmarkedForms = computed(() => {
  return filteredList.value.filter(item => item.bookmarking);
});

/**
 * 필터링된 목록을 카테고리별로 그룹화하여 반환합니다.
 */
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

// 6. 메소드
/**
 * 카테고리 명에 따른 아이콘 이미지 경로를 반환합니다.
 * @param {string} category - 양식 카테고리 (예: 인사, 휴가, 근태)
 * @returns {string} SVG 이미지 경로
 */
const getCategoryIcon = (category: string): string => {
  switch (category) {
    case '인사':
      return '/images/personnel.svg';
    case '휴가':
      return '/images/vacation.svg';
    case '근태':
      return '/images/attendance.svg';
    case '급여':
      return '/images/payroll.svg';
    default:
      return '/images/default.svg';
  }
};

/**
 * 특정 양식의 즐겨찾기 상태를 토글합니다.
 * @param {number} id - 대상 양식 ID
 */
const toggleBookmark = (id: number) => {
  const target = rawForms.value.find(f => f.id === id);
  if (target) {
    target.bookmarking = !target.bookmarking;
  }
};

/**
 * 양식 카드 클릭 시 해당 작성 페이지로 이동합니다.
 * 라우터 경로는 '/approval/write/:formName' 패턴을 따릅니다.
 * @param {FormItem} form - 선택된 양식 객체
 */
const handleCardClick = (form: FormItem) => {
  console.log('선택된 양식:', form.name);
  router.push({
    name: 'WriteDocument',
    params: {formName: form.name}
  });
};
</script>

<style scoped>
@import "@/assets/styles/templateList.css";

</style>