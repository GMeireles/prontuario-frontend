<template>
  <div class="space-y-4">
    <h2 class="text-lg font-semibold text-primary">Agenda do paciente</h2>
    <div v-if="loading" class="text-secondary">Carregando consultas...</div>
    <div v-else-if="items.length === 0" class="text-secondary">Nenhuma consulta encontrada.</div>
    <ul v-else class="space-y-2">
      <li
        v-for="appt in items"
        :key="appt.id"
        class="p-3 rounded-lg border border-theme bg-secondary flex flex-col sm:flex-row sm:justify-between gap-2"
      >
        <div>
          <p class="font-medium text-primary">{{ formatDateTime(appt.date_time) }}</p>
          <p class="text-sm text-secondary">{{ appt.professional?.name || 'Profissional' }}</p>
        </div>
        <span class="text-sm text-secondary">{{ appt.notes || appt.status || 'Consulta' }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { listAppointments } from '../../api/appointments.js';

const props = defineProps({
  patientId: { type: Number, required: true },
});

const items = ref([]);
const loading = ref(true);

function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('pt-BR');
}

onMounted(async () => {
  try {
    const all = await listAppointments();
    items.value = (all || [])
      .filter((a) => Number(a.patient_id) === props.patientId)
      .sort((a, b) => new Date(a.date_time) - new Date(b.date_time));
  } finally {
    loading.value = false;
  }
});
</script>
