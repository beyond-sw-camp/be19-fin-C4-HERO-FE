import { defineStore } from 'pinia'
import axios from 'axios'

export interface PersonalDTO {
  attendanceId: number
  workDate: string
  state: string
  startTime: string
  endTime: string
  workDuration: number
  workSystemName: string
}

export interface PersonalPageResponse {
  items: PersonalDTO[]
  page: number
  size: number
  totalCount: number
  totalPages: number
}

export const useAttendanceStore = defineStore('attendanceStore', {
  state: () => ({
    personalList: [] as PersonalDTO[],
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
    totalCount: 0,
    loading: false,
  }),

  actions: {
    async fetchPersonal(page = 1) {
      this.loading = true
      try {
        const res = await axios.get<PersonalPageResponse>(
          '/api/attendance/personal',
          {
            params: {
              page,
              size: this.pageSize,
            },
          },
        )

        this.personalList = res.data.items
        this.currentPage = res.data.page
        this.pageSize = res.data.size
        this.totalCount = res.data.totalCount
        this.totalPages = res.data.totalPages
      } finally {
        this.loading = false
      }
    },
  },
})
