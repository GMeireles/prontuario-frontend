<template>
  <BaseLayout>
    <div class="space-y-6">
      <!-- Atalhos rápidos -->
      <section>
        <h2 class="text-lg font-bold mb-3">Atalhos</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            @click="goTo('/patients')"
            class="bg-blue-600 text-white p-4 rounded-lg shadow hover:bg-blue-700"
          >
            + Novo Paciente
          </button>
          <button
            @click="goTo('/consultas')"
            class="bg-green-600 text-white p-4 rounded-lg shadow hover:bg-green-700"
          >
            + Nova Consulta
          </button>
          <button
            @click="goTo('/prontuario/1')"
            class="bg-purple-600 text-white p-4 rounded-lg shadow hover:bg-purple-700"
          >
            Acessar Prontuário
          </button>
        </div>
      </section>

      <!-- Agenda do dia -->
      <section>
        <h2 class="text-lg font-bold mb-3">Agenda de Hoje</h2>
        <div v-if="loadingAppointments">Carregando consultas...</div>
        <div v-else-if="appointments.length === 0" class="text-gray-600">
          Nenhuma consulta marcada para hoje.
        </div>
        <ul v-else class="space-y-2">
          <li
            v-for="appt in appointments"
            :key="appt.id"
            class="p-3 bg-white rounded shadow flex justify-between"
          >
            <div>
              <p class="font-semibold">{{ appt.patient?.name }}</p>
              <p class="text-sm text-gray-600">
                {{ formatDate(appt.date_time) }}
              </p>
            </div>
            <span class="text-sm text-blue-600">{{ appt.notes || 'Consulta' }}</span>
          </li>
        </ul>
      </section>

      <!-- Últimos pacientes -->
      <section>
        <h2 class="text-lg font-bold mb-3">Últimos Pacientes</h2>
        <div v-if="loadingPatients">Carregando pacientes...</div>
        <div v-else-if="patients.length === 0" class="text-gray-600">
          Nenhum paciente cadastrado ainda.
        </div>
        <ul v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <li
            v-for="p in patients"
            :key="p.id"
            class="p-3 bg-white rounded shadow hover:bg-gray-50 cursor-pointer"
            @click="goTo(`/prontuario/${p.id}`)"
          >
            <p class="font-semibold">{{ p.name }}</p>
            <p class="text-sm text-gray-600">{{ p.email || 'Sem e-mail' }}</p>
          </li>
        </ul>
      </section>
    </div>
  </BaseLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { AppointmentService } from '../services/AppointmentService'
import {PatientService} from '../services/PatientService'
import BaseLayout from '../layouts/BaseLayout.vue'

const router = useRouter()

const loadingAppointments = ref(true)
const loadingPatients = ref(true)
const appointments = ref([])
const patients = ref([])

function goTo(path) {
  router.push(path)
}

function formatDate(date) {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  try {
    // Carregar consultas do dia
    const resAppointments = await AppointmentService.listToday()
    appointments.value = resAppointments || []
  } catch {
    appointments.value = []
  } finally {
    loadingAppointments.value = false
  }

  try {
    // Carregar últimos pacientes
    const resPatients = await PatientService.listRecent()
    patients.value = resPatients || []
  } catch {
    patients.value = []
  } finally {
    loadingPatients.value = false
  }
})
</script>
