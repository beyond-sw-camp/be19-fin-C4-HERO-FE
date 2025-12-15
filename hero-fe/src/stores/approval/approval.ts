import { defineStore } from 'pinia';

export const useTemplateStore = defineStore('approval', {
    state: () => ({
        title: '',
        category: ''
    }),

    actions: {
        setCurrentForm(payload: {
            title: string;
            category: string;
        }) {
            this.title = payload.title;
            this.category = payload.category;
        }
    }
})