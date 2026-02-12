import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useInstructoresStore = defineStore('instructores', () => {
  const alumnos = ref([])
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  async function fetchAlumnosInstructor(instructorId, forceRefresh = false) {
    const cacheKey = `instructor_${instructorId}_alumnos`

    // Intentar obtener del cache primero
    if (!forceRefresh) {
      const cached = sessionStorage.getItem(cacheKey)
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          if (parsed?.ts && (Date.now() - parsed.ts) < CACHE_TTL) {
            console.log('📦 Cache hit para instructor', instructorId)
            alumnos.value = parsed.data || []
            return alumnos.value
          }
        } catch (e) {
          // fallthrough
        }
      }
    }

    // Si no hay cache válido, traer de API
    console.log('🔄 Fetching alumnos desde API para instructor', instructorId)
    const response = await api.get(`/api/instructores/${instructorId}/alumnos`)
    alumnos.value = response.data

    // Guardar en cache con timestamp
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: response.data }))
      console.log('💾 Cache guardado para instructor', instructorId)
    } catch (e) {}

    return alumnos.value
  }

  function invalidateCache(instructorId) {
    const cacheKey = `instructor_${instructorId}_alumnos`
    sessionStorage.removeItem(cacheKey)
    console.log('🗑️ Cache invalidado para instructor', instructorId)
  }

  // Periodic cleanup: remove expired instructor cache entries every CACHE_TTL
  setInterval(() => {
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (!key || !key.startsWith('instructor_')) continue
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
    fetchAlumnosInstructor,
    invalidateCache
  }
})
