<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-primary">Prontuário de {{ patient?.name }}</h1>

    <div class="border-b border-theme overflow-x-auto">
      <nav class="flex gap-1 min-w-max">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="px-4 py-2 font-medium text-sm whitespace-nowrap transition-colors"
          :class="
            activeTab === tab.key
              ? 'border-b-2 border-primary text-primary-color'
              : 'text-secondary hover:text-primary'
          "
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <div v-if="activeTab === 'dados'">
      <h2 class="text-lg font-semibold mb-2 text-primary">Dados do Paciente</h2>
      <div class="rounded-lg border border-theme bg-secondary p-4 space-y-2">
        <p class="text-primary"><strong>Nome:</strong> {{ patient?.name }}</p>
        <p class="text-primary"><strong>Email:</strong> {{ patient?.email || 'Sem e-mail' }}</p>
        <p class="text-primary"><strong>Data de Nascimento:</strong> {{ formatDate(patient?.birth_date) }}</p>
      </div>
    </div>

    <AnamneseTab v-else-if="activeTab === 'anamnese'" :patient-id="patientId" />
    <EvolucoesTab v-else-if="activeTab === 'evolucoes'" :patient-id="patientId" />
    <PrescricoesTab v-else-if="activeTab === 'prescricoes'" :patient-id="patientId" />
    <ArquivosTab v-else-if="activeTab === 'arquivos'" :patient-id="patientId" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { getPatient } from '../api/patients.js';
import { usePermissions } from '../composables/usePermissions.js';
import AnamneseTab from '../components/prontuario/AnamneseTab.vue';
import EvolucoesTab from '../components/prontuario/EvolucoesTab.vue';
import PrescricoesTab from '../components/prontuario/PrescricoesTab.vue';
import ArquivosTab from '../components/prontuario/ArquivosTab.vue';

const route = useRoute();
const { can } = usePermissions();
const patientId = Number(route.params.id);

const patient = ref(null);
const activeTab = ref('dados');

const allTabs = [
  { key: 'dados', label: 'Dados', permission: 'patients.view' },
  { key: 'anamnese', label: 'Anamnese', permission: 'anamneses.view' },
  { key: 'evolucoes', label: 'Evoluções', permission: 'evolutions.view' },
  { key: 'prescricoes', label: 'Prescrições', permission: 'prescriptions.view' },
  { key: 'arquivos', label: 'Arquivos', permission: 'files.view' },
];

const tabs = computed(() => allTabs.filter((t) => can(t.permission)));

function formatDate(date) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR');
}

onMounted(async () => {
  patient.value = await getPatient(patientId);
});
</script>
