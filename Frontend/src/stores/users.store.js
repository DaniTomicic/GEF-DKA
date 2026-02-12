import { ref } from 'vue';
import { defineStore } from 'pinia';
import api from '../services/api.js';

export const useUsersStore = defineStore('users', () => {
  const users = ref([]);          
  const currentPage = ref(1);     
  const totalPages = ref(1);      
  const perPage = ref(5);         
  const currentUser = ref(null);  

  // Devuelve la cache key según página y filtros de usrTable
  function getCacheKey(page, filters) {
    const grado = filters.tipo === 'alumno' ? filters.id_grado || '' : '';
    return `users_page_${page}_tipo_${filters.tipo || ''}_grado_${grado}_search_${filters.search || ''}`;
  }

  function initCurrentUser(user = null) {
    currentUser.value = user || {
      nombre: '',
      apellidos: '',
      email: '',
      n_tel: '',
      password: '',
      tipo: '',
      alumno: null,
      id: null
    }
    
    console.log(currentUser.value);
  }

  function removeUserFromCache(userId) {
    // Busca todas las instancias de user por el ID y en caso de encontrar lo borra de cache para que se actualice la view
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (!key || !key.startsWith('users_page_')) continue;

      try {
        const parsed = JSON.parse(sessionStorage.getItem(key));
        const usersList = parsed?.users || parsed || [];
        const filteredUsers = usersList.filter(u => u.id !== userId);
        if (filteredUsers.length !== usersList.length) {
          const newVal = { ...(parsed?.ts ? { ts: parsed.ts } : {}), users: filteredUsers, totalPages: parsed?.totalPages };
          if (filteredUsers.length > 0) {
            sessionStorage.setItem(key, JSON.stringify(newVal));
          } else {
            sessionStorage.removeItem(key);
          }
        }
      } catch {
        // en caso de cualquier error, salta de linea y ya
        continue;
      }
    }
  }

  async function fetchUsers(page = 1, filters = {}) {
    currentPage.value = page;
    const cacheKey = getCacheKey(page, filters);
    const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

    // Busca si existen keys y si no están caducadas úsalas
    if (sessionStorage.getItem(cacheKey)) {
        try {
          const parsed = JSON.parse(sessionStorage.getItem(cacheKey));
          if (parsed?.ts && (Date.now() - parsed.ts) < CACHE_TTL) {
            users.value = parsed.users || [];
            totalPages.value = parsed.totalPages || 1;
            return;
          }
        } catch (e) {
          // fallthrough
        }
    }

    const response = await api.get('/api/users', {
        
        params: {
            page,
            per_page: perPage.value,
            tipo: filters.tipo,
            ...(filters.tipo === 'alumno' && filters.id_grado ? { id_grado: filters.id_grado } : {}),
            search: filters.search
        }
    });

    const userResponse = response.data.data.data || [];
    const lastPage = response.data.data.last_page;

    users.value = userResponse;
    totalPages.value = lastPage;

    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), users: userResponse, totalPages: lastPage }));
    } catch (e) {}
  }

  // Crea o actualiza el user en base a que si en la data hay o no id
  async function guardarUsuario(data, filters = {}) {
    try {
        if (data.id) {
            const response = await api.put(`/api/users/${data.id}`, data);
            // Update in-memory list if the edited user is present
            const idx = users.value.findIndex(u => u.id === data.id);
            if (idx !== -1) {
              users.value[idx] = response.data;
            }
            // Update cached pages where this user appears
            for (let i = 0; i < sessionStorage.length; i++) {
              const key = sessionStorage.key(i);
              if (!key || !key.startsWith('users_page_')) continue;
              try {
                const parsed = JSON.parse(sessionStorage.getItem(key));
                const list = parsed?.users || parsed || [];
                const j = list.findIndex(u => u.id === data.id);
                if (j !== -1) {
                  list[j] = response.data;
                  const newVal = { ...(parsed?.ts ? { ts: parsed.ts } : {}), users: list, totalPages: parsed?.totalPages };
                  sessionStorage.setItem(key, JSON.stringify(newVal));
                }
              } catch (e) {}
            }
        } else {
            await api.post('/api/users', data);
            // for creation, refresh the current page to include the new user
            await fetchUsers(currentPage.value, filters);
        }
    } catch (e) {
        console.error(e);
        throw new Error(e.response?.data?.message || 'Error al guardar usuario');
    }
  }

  async function handleConfirmDelete(confirm, filters = {}) {
    if (!confirm || !currentUser.value) return;

    try {
        await api.delete(`/api/users/${currentUser.value.id}`);
        removeUserFromCache(currentUser.value.id);
        await fetchUsers(currentPage.value, filters);
    } catch (e) {
        console.error(e);
        throw new Error(e.response?.data?.message || 'Error al eliminar usuario');
    } finally {
        currentUser.value = null;
    }
  }

  function getUserById(id) {
    return users.value.find(u => u.id === id) || null;
  }

  // Periodic cleanup for users_page caches (remove expired)
  (function startUsersCacheCleanup(){
    const CACHE_TTL = 5 * 60 * 1000;
    setInterval(() => {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (!key || !key.startsWith('users_page_')) continue;
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

  return { users, currentPage, totalPages, perPage,  currentUser, fetchUsers, getUserById, guardarUsuario, handleConfirmDelete, getCacheKey, removeUserFromCache, initCurrentUser };
});
