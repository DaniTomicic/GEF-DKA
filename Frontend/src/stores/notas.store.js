import { defineStore } from "pinia";
import { ref } from "vue";
import api from '@/services/api.js';

export const useNotasStore = defineStore("notas", () => {
  const alumnos = ref([]);       // array de alumnos
  const asignaturas = ref([]);
  const gradoNombre = ref("");
  const totalPages = ref(1);

  function getCacheKey(page, perPage) {
    return `grado_page_${page}_per_${perPage}`;
  }

  const setDatosGrado = ({ alumnosData, asignaturasData, grado, last_page }) => {
    alumnos.value = alumnosData;          
    asignaturas.value = asignaturasData;
    gradoNombre.value = grado?.nombre || '';
    totalPages.value = last_page || 1;
  };

  const getNotasAlumno = (idAlumno) => {
    return alumnos.value.find(a => a.id === idAlumno)?.notas_calculadas ?? null;
  };

  const setNotasAlumno = (idAlumno, nuevasNotas) => {
    const alumno = alumnos.value.find(a => a.id === idAlumno);
    if (alumno) alumno.notas_calculadas = nuevasNotas;
  };

  async function fetchGrado(page = 1, perPage = 5, forceRefresh = false) {
    const cacheKey = getCacheKey(page, perPage);
    const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

    // Si not forceRefresh, intenta usar cache y comprobar TTL
    if (!forceRefresh && sessionStorage.getItem(cacheKey)) {
      try {
        const parsed = JSON.parse(sessionStorage.getItem(cacheKey));
        if (parsed?.ts && (Date.now() - parsed.ts) < CACHE_TTL) {
          setDatosGrado({ alumnosData: parsed.alumnos, asignaturasData: parsed.asignaturas, grado: parsed.grado, last_page: parsed.last_page });
          return;
        }
      } catch (e) {
        // continue to fetch
      }
    }

    const res = await api.get('/api/mi-grado/gestion', {
      params: { page, per_page: perPage }
    });

    const data = res.data;
    // Compatibilidad con estructura previa
    const alumnosData = data.alumnos?.data || data.alumnos || [];
    const asignaturasData = data.asignaturas || [];
    const grado = data.grado || {};
    const last_page = data.alumnos?.last_page || 1;

    setDatosGrado({ alumnosData, asignaturasData, grado, last_page });

    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), alumnos: alumnosData, asignaturas: asignaturasData, grado, last_page }));
    } catch (e) {
      // ignore storage errors
    }
  }

  function invalidateGradoCache(page = 1, perPage = 5) {
    const cacheKey = getCacheKey(page, perPage);
    try {
      sessionStorage.removeItem(cacheKey);
    } catch (e) {}
  }

  // Periodic cleanup for grado caches
  (function startNotasCacheCleanup(){
    const CACHE_TTL = 5 * 60 * 1000;
    setInterval(() => {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (!key || !key.startsWith('grado_page_')) continue;
        try {
          const parsed = JSON.parse(sessionStorage.getItem(key));
          if (!parsed?.ts || (Date.now() - parsed.ts) > CACHE_TTL) {
            sessionStorage.removeItem(key);
          }
        } catch (e) {
          sessionStorage.removeItem(key);
        }
      }
    }, CACHE_TTL);
  })();

  return {
    alumnos,
    asignaturas,
    gradoNombre,
    totalPages,
    setDatosGrado,
    getNotasAlumno,
    setNotasAlumno,
    fetchGrado,
    invalidateGradoCache,
  };
});
