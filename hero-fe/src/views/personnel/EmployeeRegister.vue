<template>
  <div class="page-container">
    <div class="header">
      <div class="title-wrapper">
        <img class="back-icon" src="/images/backArrow.svg" @click="goBack" />
        <h1 class="title">신규 사원 등록</h1>
      </div>
      <div class="button-group">
        <button class="btn-cancel" @click="goBack">취소</button>
        <button class="btn-save" @click="handleSave">등록</button>
      </div>
    </div>

    <div class="content">
      <div class="form-box">
        <div class="registration-type-selector">
          <button
            :class="['type-button', { active: registrationType === 'single' }]"
            @click="registrationType = 'single'"
          >
            단일 등록
          </button>
          <button class="type-button" disabled>단체 등록 (준비중)</button>
        </div>

        <!-- 단일 등록 폼 -->
        <div v-if="registrationType === 'single'" class="form-content">
          <h2 class="section-title">기본 정보</h2>
          <div class="form-grid">
            <div class="form-item">
              <label class="required">이름</label>
              <input type="text" v-model="formData.employeeName" placeholder="이름 입력" />
            </div>
            <div class="form-item">
              <label class="required">사번</label>
              <input type="text" v-model="formData.employeeNumber" placeholder="사번 입력" />
            </div>
            <div class="form-item">
              <label class="required">이메일</label>
              <input type="email" v-model="formData.email" placeholder="example@company.com" />
            </div>
            <div class="form-item">
              <label class="required">전화번호</label>
              <input type="tel" v-model="formData.phone" placeholder="010-0000-0000" />
            </div>
            <div class="form-item">
              <label class="required">성별</label>
              <div class="radio-group">
                <label><input type="radio" v-model="formData.gender" value="M" /> 남성</label>
                <label><input type="radio" v-model="formData.gender" value="F" /> 여성</label>
              </div>
            </div>
            <div class="form-item">
              <label>생년월일</label>
              <input type="date" v-model="formData.birthDate" />
            </div>
            <div class="form-item full-width">
              <label>주소</label>
              <input type="text" v-model="formData.address" placeholder="주소 입력" />
            </div>
              <div class="form-item full-width">
              <label class="required">프로필 사진</label>
              <input type="file" disabled />
            </div>
          </div>

          <h2 class="section-title">인사 정보</h2>
          <div class="form-grid">
            <div class="form-item">
              <label class="required">입사일</label>
              <input type="date" v-model="formData.hireDate" />
            </div>
            <div class="form-item">
              <label class="required">고용 형태</label>
              <select v-model="formData.contractType">
                <option value="">선택</option>
                <option value="정규직">정규직</option>
                <option value="계약직">계약직</option>
                <option value="인턴">인턴</option>
                <option value="일일근로자">일일근로자</option>
              </select>
            </div>
            <div class="form-item">
              <label>부서</label>
              <select v-model="formData.departmentName">
                <option disabled value="">부서를 선택하세요</option>
                <option v-for="dept in departmentOptions" :key="dept" :value="dept">{{ dept }}</option>
              </select>
            </div>
            <div class="form-item">
              <label>직급</label>
              <select v-model="formData.gradeName">
                <option disabled value="">직급을 선택하세요</option>
                <option v-for="grade in gradeOptions" :key="grade" :value="grade">{{ grade }}</option>
              </select>
            </div>
            <div class="form-item">
              <label>직책</label>
              <select v-model="formData.jobTitleName">
                <option disabled value="">직책을 선택하세요</option>
                <option v-for="title in jobTitleOptions" :key="title" :value="title">{{ title }}</option>
              </select>
            </div>
            <div class="form-item">
              <label class="required">기본급</label>
              <input 
                type="text" 
                :value="formData.baseSalary > 0 ? formData.baseSalary.toLocaleString() : ''" 
                @input="handleSalaryInput" 
                placeholder="기본급 입력 (원)" 
              />
            </div>
          </div>
        </div>
        <div v-else class="form-placeholder">
          <p>등록 방식을 선택해주세요.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { createEmployee, fetchEmployeeSearchOptions } from '@/api/personnel';
import type { EmployeeRegisterParams } from '@/types/personnel';

const router = useRouter();

const goBack = () => {
  router.push('/personnel/list');
};

const registrationType = ref<'single' | null>(null);

const departmentOptions = ref<string[]>([]);
const gradeOptions = ref<string[]>([]);
const jobTitleOptions = ref<string[]>([]);

const formData = reactive<EmployeeRegisterParams>({
  employeeName: '',
  employeeNumber: '',
  email: '',
  phone: '',
  contractType: '',
  gender: 'M',
  hireDate: '',
  imagePath: '/images/default-profile.png', // 기본값 설정
  baseSalary: 0,
  birthDate: '',
  address: '',
  departmentName: '',
  gradeName: '',
  jobTitleName: '',
});

onMounted(async () => {
  try {
    const response = await fetchEmployeeSearchOptions();
    if (response.data.success) {
      departmentOptions.value = response.data.data.department;
      gradeOptions.value = response.data.data.grade;
      jobTitleOptions.value = response.data.data.jobTitle;
    }
  } catch (error) {
    console.error('옵션 정보를 불러오는데 실패했습니다.', error);
  }
});

const handleSalaryInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  // 숫자 이외의 문자 제거
  const rawValue = target.value.replace(/[^0-9]/g, '');
  
  if (rawValue) {
    // 실제 데이터에는 숫자로 저장
    formData.baseSalary = parseInt(rawValue, 10);
    // 화면에는 천 단위 콤마를 붙여서 표시
    target.value = formData.baseSalary.toLocaleString();
  } else {
    formData.baseSalary = 0;
    target.value = '';
  }
};

const handleSave = async () => {
  if (registrationType.value !== 'single') return;

  // 필수값 체크
  if (!formData.employeeName || !formData.employeeNumber || !formData.email || !formData.phone || !formData.contractType || !formData.hireDate || !formData.baseSalary) {
    alert('필수 항목을 모두 입력해주세요.');
    return;
  }

  // 선택 항목이 빈 문자열일 경우 전송 데이터에서 제외 (백엔드에서 null로 처리되도록 함)
  const submitData = { ...formData };
  if (!submitData.birthDate) delete submitData.birthDate;
  if (!submitData.address) delete submitData.address;
  if (!submitData.departmentName) delete submitData.departmentName;
  if (!submitData.gradeName) delete submitData.gradeName;
  if (!submitData.jobTitleName) delete submitData.jobTitleName;

  try {
    const response = await createEmployee(submitData);
    if (response.data.success) {
      alert('사원이 성공적으로 등록되었습니다.');
      router.push('/personnel/list');
    }
  } catch (error) {
    console.error('사원 등록 오류:', error);
    alert('사원 등록 중 오류가 발생했습니다.');
  }
};
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #f8fafc;
  overflow: hidden;
}

.header {
  width: 100%;
  height: 50px;
  background: white;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.back-icon {
  cursor: pointer;
}

.title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172b;
}

.button-group {
  display: flex;
  gap: 10px;
}

.btn-save {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: white;
  padding: 10px 24px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.btn-cancel {
  background-color: #f1f5f9;
  color: #334155;
  padding: 10px 24px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.content {
  width: 100%;
  padding: 24px;
  flex: 1;
  overflow-y: auto;
}

.form-box {
  width: 100%;
  max-width: 1200px;
  background: white;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  padding: 36px;
  margin: 0 auto;
  height: auto;
}

.registration-type-selector {
  display: flex;
  gap: 10px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 20px;
}

.type-button {
  flex: 1;
  padding: 16px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background-color: #f8fafc;
  color: #64748b;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.type-button:hover:not(:disabled) {
  background-color: #eff6ff;
  border-color: #1c398e;
  color: #1c398e;
}

.type-button.active {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: white;
  border-color: #1c398e;
}

.type-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.form-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: #94a3b8;
  font-size: 16px;
}

.form-content {
  display: flex;
  flex-direction: column;
  margin-top: 30px; /* 선택기와 폼 내용 사이의 간격 */
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  border-left: 4px solid #1c398e;
  padding-left: 10px;
  margin-bottom: 15px; /* 제목과 그리드 사이의 간격 */
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

/* 인사 정보 섹션의 상단에만 추가적인 여백을 주어 구분을 명확히 합니다. */
.section-title + .form-grid + .section-title {
  margin-top: 40px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item.full-width {
  grid-column: span 2;
}

label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #475569;
}

.required::after {
  content: '*';
  color: #ef4444;
  margin-left: 4px;
}

input[type="text"],
input[type="email"],
input[type="tel"],
input[type="date"],
input[type="number"],
input[type="file"],
select {
  width: 100%;
  box-sizing: border-box;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}

input:focus,
select:focus {
  border-color: #1c398e;
}

.input[type="file"]:disabled {
  background-color: #f8fafc;
  cursor: not-allowed;
}

.radio-group {
  display: flex;
  gap: 20px;
  padding: 10px 0;
}

.radio-group label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-weight: normal;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .form-item.full-width {
    grid-column: span 1;
  }
}
</style>
