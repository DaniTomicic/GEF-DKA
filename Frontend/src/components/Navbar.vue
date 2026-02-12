<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
    <div class="container-fluid">
      <!-- Logo -->
      <RouterLink to="/home">
        <img src="../../public/LOGO-EGIBIDE.png" alt="Logo Egibide" class="logo" />
      </RouterLink>

      <!-- Hamburguesa -->
      <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar"
        aria-controls="offcanvasNavbar">
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Offcanvas -->
      <div class="offcanvas-lg offcanvas-end" tabindex="-1" id="offcanvasNavbar">
        <div class="offcanvas-header">
          <h5 class="offcanvas-title" id="offcanvasDarkNavbarLabel">Menú</h5>

          <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>

        <div class="offcanvas-body">
          <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <a class="nav-link">
                <RouterLink to="/home">Inicio</RouterLink>
              </a>
            </li>
            <li class="nav-item"></li>

            <li class="nav-item dropdown" v-if="usuario.tipo === 'admin'">
              <a class="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Gestión
              </a>
              <ul class="dropdown-menu">
                <li>
                  <a class="dropdown-item">
                    <RouterLink to="/users">Usuarios</RouterLink>
                  </a>
                  <a class="dropdown-item">
                    <RouterLink to="/competenciasXra">Competencias y RAs</RouterLink>
                  </a>
                  <a class="dropdown-item">
                    <RouterLink to="/grados">Grados y Asignaturas</RouterLink>
                  </a>
                  <a class="dropdown-item">
                    <RouterLink to="/empresa">Empresas</RouterLink>
                  </a>
                  <hr class="dropdown-divider">
                  <li class="dropdown-header"><b>Importaciones</b></li>
                  <!-- <button class="dropdown-item" @click="mostrarImportUsuariosModal = true" style="border: none; background: none; text-align: left; cursor: pointer; padding: 0.5rem 1rem;">
                    <i class="bi bi-person-plus me-2"></i> Usuarios
                  </button> -->
                  <button class="dropdown-item" @click="mostrarImportEmpresasModal = true" style="border: none; background: none; text-align: left; cursor: pointer; padding: 0.5rem 1rem;">
                    <i class="bi bi-building me-2"></i> Empresas
                  <!-- </button>
                  <button class="dropdown-item" @click="mostrarImportGradosModal = true" style="border: none; background: none; text-align: left; cursor: pointer; padding: 0.5rem 1rem;">
                    <i class="bi bi-mortarboard me-2"></i> Cursos -->
                  </button>
                  <button class="dropdown-item" @click="mostrarImportAlumnosModal = true" style="border: none; background: none; text-align: left; cursor: pointer; padding: 0.5rem 1rem;">
                    <i class="bi bi-people me-2"></i> Alumnos
                  </button>
                  <button class="dropdown-item" @click="mostrarImportTeachersModal = true" style="border: none; background: none; text-align: left; cursor: pointer; padding: 0.5rem 1rem;">
                    <i class="bi bi-person-badge me-2"></i> Profesorado
                  </button>
                </li>
              </ul>
            </li>

            <li class="nav-item dropdown" v-if="usuario.tipo === 'tutor'">
              <a class="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Gestión
              </a>

              <ul class="dropdown-menu">
                <li>
                  <RouterLink class="dropdown-item" :to="`/tutores/${usuario.id}/alumnos`">
                    Alumnos
                  </RouterLink>
                </li>

                <li>
                  <RouterLink class="dropdown-item" to="/cuadernos-tutor">
                    Cuadernos
                  </RouterLink>
                </li>
                <li v-if="usuario.es_tutor">
                  <hr class="dropdown-divider" />
                  <RouterLink class="dropdown-item fw-bold text-indigo" to="/mi-grado">
                    <i class="bi bi-mortarboard-fill me-1"></i> Mi Grado
                  </RouterLink>
                </li>
              </ul>
            </li>

            <li class="nav-item" v-if="usuario.tipo === 'instructor'">
              <RouterLink class="nav-link" :to="`/instructores/${usuario.id}/alumnos`">
                Alumnos
              </RouterLink>
            </li>
            <li class="nav-item" v-if="usuario.tipo === 'alumno'">
              <RouterLink class="nav-link" :to="`/alumno/${usuario.id}/estancia`">
                Estancia
              </RouterLink>
            </li>

            <li class="nav-item" v-if="usuario.tipo === 'alumno'">
              <RouterLink class="nav-link" to="/cuadernos-alumno">
                Mis Cuadernos
              </RouterLink>
            </li>
            <li v-if="usuario.tipo === 'alumno'">
              <RouterLink class="nav-link" to="/alumno/mis-notas">
                Mis Notas
              </RouterLink>
            </li>
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown"
                aria-expanded="false">
                <i class="bi bi-person-circle me-1"></i> {{ usuario.nombre || 'Mi Cuenta' }}
              </a>
              <ul class="dropdown-menu dropdown-menu-end">

                <li>
                  <RouterLink class="dropdown-item" to="/cambiar-contrasena">
                    <i class="bi bi-key me-2"></i> Cambiar Contraseña
                  </RouterLink>
                </li>

                <li>
                  <hr class="dropdown-divider">
                </li>

                <li>
                  <button class="dropdown-item text-danger" @click="logout">
                    <i class="bi bi-box-arrow-right me-2"></i> Cerrar sesión
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </nav>

  <!-- Modales de importación -->
  <ImportUsuariosModal 
    :show="mostrarImportUsuariosModal"
    @close="mostrarImportUsuariosModal = false"
    @success="mostrarImportUsuariosModal = false"
  />
  <ImportEmpresasModal 
    :show="mostrarImportEmpresasModal"
    @close="mostrarImportEmpresasModal = false"
    @success="mostrarImportEmpresasModal = false"
  />
  <ImportGradosModal 
    :show="mostrarImportGradosModal"
    @close="mostrarImportGradosModal = false"
    @success="mostrarImportGradosModal = false"
  />
  <ImportAlumnosModal 
    :show="mostrarImportAlumnosModal"
    @close="mostrarImportAlumnosModal = false"
    @success="mostrarImportAlumnosModal = false"
  />
  <ImportTeachersModal 
    :show="mostrarImportTeachersModal"
    @close="mostrarImportTeachersModal = false"
    @success="mostrarImportTeachersModal = false"
  />
</template>

<style scoped>
.logo {
  max-height: 45px;
  width: auto;
}

a {
  text-decoration: none;
  color: black;
}
</style>

<script setup>
import { useUserStore } from "@/stores/userStore";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { RouterLink } from "vue-router";
import ImportUsuariosModal from "@/components/ImportUsuariosModal.vue";
import ImportEmpresasModal from "@/components/ImportEmpresasModal.vue";
import ImportGradosModal from "@/components/ImportGradosModal.vue";
import ImportAlumnosModal from "@/components/ImportAlumnosModal.vue";
import ImportTeachersModal from "@/components/ImportTeachersModal.vue";

const router = useRouter();
const userStore = useUserStore();
const mostrarImportUsuariosModal = ref(false);
const mostrarImportEmpresasModal = ref(false);
const mostrarImportGradosModal = ref(false);
const mostrarImportAlumnosModal = ref(false);
const mostrarImportTeachersModal = ref(false);
import api from "@/services/api.js";

let message = ref();
let usuario = userStore.user;
async function logout() {
  try {
    const response = await api.post(
      "/api/logout",
      {}
    );
    if (response.data.status === "success") {
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
      userStore.user.value = null;
      router.push("/");
    }
  } catch (error) {
    console.error(error);
    message.value = "Error cerrando sesión";
  }
}
</script>
