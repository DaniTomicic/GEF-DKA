import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useTutoresStore = defineStore('tutores', () => {
  const alumnos = ref([])
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  async function fetchAlumnosTutor(tutorId, tipo = 'tutor', forceRefresh = false) {
    const cacheKey = `tutor_${tutorId}_alumnos_${tipo}`

    // Intentar obtener del cache primero
    if (!forceRefresh) {
      const cached = sessionStorage.getItem(cacheKey)
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          if (parsed?.ts && (Date.now() - parsed.ts) < CACHE_TTL) {
            alumnos.value = parsed.data || []
            return alumnos.value
          }
        } catch (e) {
          // fallthrough
        }
      }
    }

    // Si no hay cache, traer de API
    const endpoint = tipo === 'tutor' 
      ? `/api/tutores/${tutorId}/alumnos`
      : `/api/tutores/${tutorId}/alumnos-clases`
    
    const response = await api.get(endpoint)
    alumnos.value = response.data
    
    // Guardar en cache con timestamp
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: response.data }))
    } catch (e) {}
    
    return alumnos.value
  }

  function invalidateCache(tutorId, tipo = 'tutor') {
    const cacheKey = `tutor_${tutorId}_alumnos_${tipo}`
    sessionStorage.removeItem(cacheKey)
  }

  function invalidateAllCache(tutorId) {
    invalidateCache(tutorId, 'tutor')
    invalidateCache(tutorId, 'clase')
  }

  // Periodic cleanup: remove expired tutor cache entries every CACHE_TTL
  setInterval(() => {
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (!key || !key.startsWith('tutor_')) continue
      try {
        const parsed = JSON.parse(sessionStorage.getItem(key))
        if (!parsed?.ts || (Date.now() - parsed.ts) > CACHE_TTL) {
          sessionStorage.removeItem(key)
        }
      } catch (e) {
        sessionStorage.removeItem(key)
      }
    }
  }, CACHE_TTL)

  return {
    alumnos,
    fetchAlumnosTutor,
    invalidateCache,
    invalidateAllCache
  }
})
