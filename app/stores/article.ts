import { defineStore } from 'pinia';
import type { Article } from '~/types/article';

export const useArticleStore = defineStore('article', {
  state: () => ({
    articles: [
      {
        SK: 'ART#123',
        Title: 'PSB Ponpes Babussalam',
        Picture: 'img/dauroh1.jpg',
        Description: '<p>Informasi Penerimaan Samtri Baru (PSB) 2025/2026</p>',
        Status: 'active',
        Created_At: '2026-04-09T10:00:00Z'
      }
    ] as Article[],
    currentArticle: null as Article | null,
    loading: false
  }),
  actions: {
  }
});