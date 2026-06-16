<template>
  <div class="space-y-6">
    <section>
      <h2 class="text-lg font-bold mb-3 text-primary">Atalhos</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          type="button"
          class="p-4 rounded-lg border border-theme bg-secondary hover:bg-hover text-primary text-left transition-colors"
          @click="goTo('/app/pacientes')"
        >
          <span class="font-semibold">+ Novo Paciente</span>
          <p class="text-sm text-secondary mt-1">Cadastrar ou gerenciar pacientes</p>
        </button>
        <button
          type="button"
          class="p-4 rounded-lg border border-theme bg-secondary hover:bg-hover text-primary text-left transition-colors"
          @click="goTo('/app/consultas')"
        >
          <span class="font-semibold">+ Nova Consulta</span>
          <p class="text-sm text-secondary mt-1">Agendar atendimento</p>
        </button>
        <button
          type="button"
          class="p-4 rounded-lg border border-theme bg-secondary hover:bg-hover text-primary text-left transition-colors sm:col-span-2 lg:col-span-1"
          @click="goToRecentProntuario"
        >
          <span class="font-semibold">Acessar Prontuário</span>
          <p class="text-sm text-secondary mt-1">Último paciente cadastrado</p>
        </button>
      </div>
    </section>

    <section>
      <h2 class="text-lg font-bold mb-3 text-primary">Agenda de Hoje</h2>
      <div v-if="loadingAppointments" class="text-secondary">Carregando consultas...</div>
      <div v-else-if="appointments.length === 0" class="text-secondary">
        Nenhuma consulta marcada para hoje.
      </div>
      <ul v-else class="space-y-2">
        <li
          v-for="appt in appointments"
          :key="appt.id"
          class="p-3 rounded-lg border border-theme bg-secondary flex flex-col sm:flex-row sm:justify-between gap-2"
        >
          <div>
            <p class="font-semibold text-primary">{{ appt.patient?.name }}</p>
            <p class="text-sm text-secondary">{{ formatDate(appt.date_time) }}</p>
          </div>
          <span class="text-sm text-primary-color">{{ appt.notes || 'Consulta' }}</span>
        </li>
      </ul>
    </section>

    <section>
      <h2 class="text-lg font-bold mb-3 text-primary">Últimos Pacientes</h2>
      <div v-if="loadingPatients" class="text-secondary">Carregando pacientes...</div>
      <div v-else-if="patients.length === 0" class="text-secondary">
        Nenhum paciente cadastrado ainda.
      </div>
      <ul v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <li
          v-for="p in patients"
          :key="p.id"
          class="p-3 rounded-lg border border-theme bg-secondary hover:bg-hover cursor-pointer transition-colors"
          @click="goTo(`/app/prontuario/${p.id}`)"
        >
          <p class="font-semibold text-primary">{{ p.name }}</p>
          <p class="text-sm text-secondary">{{ p.email || 'Sem e-mail' }}</p>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { listTodayAppointments } from '../api/appointments.js';
import { listRecentPatients } from '../api/patients.js';

const router = useRouter();

const loadingAppointments = ref(true);
const loadingPatients = ref(true);
const appointments = ref([]);
const patients = ref([]);

function goTo(path) {
  router.push(path);
}

function goToRecentProntuario() {
  const first = patients.value[0];
  if (first?.id) {
    router.push(`/app/prontuario/${first.id}`);
  } else {
    router.push('/app/pacientes');
  }
}

function formatDate(date) {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

onMounted(async () => {
  try {
    appointments.value = (await listTodayAppointments()) || [];
  } catch {
    appointments.value = [];
  } finally {
    loadingAppointments.value = false;
  }

  try {
    patients.value = (await listRecentPatients()) || [];
  } catch {
    patients.value = [];
  } finally {
    loadingPatients.value = false;
  }
});
</script>
