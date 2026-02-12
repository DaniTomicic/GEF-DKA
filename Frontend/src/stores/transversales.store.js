import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api.js';

export const useTransversalesStore = defineStore('transversales', () => {
  const lista = ref([]);
  const CACHE_KEY = 'transversales_list_v1';
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  async function fetchAll(force = false) {
    if (!force && sessionStorage.getItem(CACHE_KEY)) {
      try {
        const parsed = JSON.parse(sessionStorage.getItem(CACHE_KEY));
        if (parsed?.ts && (Date.now() - parsed.ts) < CACHE_TTL) {
          lista.value = parsed.data || [];
          return;
        }
      } catch (e) {
        // fallthrough
      }
    }

    const res = await api.get('/api/transversales');
    lista.value = res.data || [];

    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: lista.value }));
    } catch (e) {}
  }

  // Auto-refresh every CACHE_TTL
  setInterval(() => {
    fetchAll(true).catch(() => {});
  }, CACHE_TTL);

  return { lista, fetchAll };
});
