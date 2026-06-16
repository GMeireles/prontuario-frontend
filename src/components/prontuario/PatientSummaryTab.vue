<template>
  <div class="space-y-4">
    <div v-if="loading" class="text-secondary">Carregando resumo...</div>
    <div v-else-if="error" class="text-error text-sm">{{ error }}</div>
    <template v-else-if="summary">
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <div class="p-3 rounded-lg border border-theme bg-secondary">
          <p class="text-xs text-tertiary">Anamneses</p>
          <p class="text-lg font-semibold text-primary">{{ summary.counts?.anamneses ?? 0 }}</p>
        </div>
        <div class="p-3 rounded-lg border border-theme bg-secondary">
          <p class="text-xs text-tertiary">Evoluções</p>
          <p class="text-lg font-semibold text-primary">{{ summary.counts?.evolutions ?? 0 }}</p>
        </div>
        <div class="p-3 rounded-lg border border-theme bg-secondary">
          <p class="text-xs text-tertiary">Consultas</p>
          <p class="text-lg font-semibold text-primary">{{ summary.counts?.appointments ?? 0 }}</p>
        </div>
        <div class="p-3 rounded-lg border border-theme bg-secondary">
          <p class="text-xs text-tertiary">Arquivos</p>
          <p class="text-lg font-semibold text-primary">{{ summary.counts?.files ?? 0 }}</p>
        </div>
        <div class="p-3 rounded-lg border border-theme bg-secondary">
          <p class="text-xs text-tertiary">AASI</p>
          <p class="text-lg font-semibold text-primary">{{ summary.counts?.aasis ?? 0 }}</p>
        </div>
        <div class="p-3 rounded-lg border border-theme bg-secondary">
          <p class="text-xs text-tertiary">Prescrições</p>
          <p class="text-lg font-semibold text-primary">{{ summary.counts?.prescriptions ?? 0 }}</p>
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        <div class="p-4 rounded-lg border border-theme bg-secondary">
          <h3 class="font-semibold text-primary mb-2">Próxima consulta</h3>
          <p v-if="summary.nextAppointment" class="text-sm text-primary">
            {{ formatDateTime(summary.nextAppointment.date_time) }}
            <span class="text-secondary block">
              {{ summary.nextAppointment.professional?.name || 'Profissional' }}
            </span>
          </p>
          <p v-else class="text-sm text-secondary">Nenhuma consulta futura agendada.</p>
        </div>
        <div class="p-4 rounded-lg border border-theme bg-secondary">
          <h3 class="font-semibold text-primary mb-2">Última evolução</h3>
          <p v-if="summary.lastEvolution" class="text-sm text-primary">
            {{ formatDate(summary.lastEvolution.created_at || summary.lastEvolution.createdAt) }}
            <span class="text-secondary block line-clamp-3">
              {{ summary.lastEvolution.note || 'Sem conteúdo' }}
            </span>
          </p>
          <p v-else class="text-sm text-secondary">Nenhuma evolução registrada.</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getPatientSummary } from '../../api/patients.js';

const props = defineProps({
  patientId: { type: Number, required: true },
});

const summary = ref(null);
const loading = ref(true);
const error = ref(null);

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('pt-BR');
}

function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('pt-BR');
}

onMounted(async () => {
  try {
    summary.value = await getPatientSummary(props.patientId);
  } catch (e) {
    error.value = e.message || 'Erro ao carregar resumo';
  } finally {
    loading.value = false;
  }
});
</script>
