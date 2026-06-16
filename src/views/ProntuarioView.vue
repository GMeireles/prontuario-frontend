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

    <PatientSummaryTab v-if="activeTab === 'resumo'" :patient-id="patientId" />
    <PatientDataTab v-else-if="activeTab === 'dados'" :patient="patient" />
    <AnamneseTab v-else-if="activeTab === 'anamnese'" :patient-id="patientId" />
    <EvolucoesTab v-else-if="activeTab === 'evolucoes'" :patient-id="patientId" />
    <PatientAppointmentsTab v-else-if="activeTab === 'agenda'" :patient-id="patientId" />
    <ArquivosTab v-else-if="activeTab === 'arquivos'" :patient-id="patientId" />
    <PrescricoesTab v-else-if="activeTab === 'prescricoes'" :patient-id="patientId" />
    <PatientAasiTab v-else-if="activeTab === 'aasi'" :patient-id="patientId" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { getPatient } from '../api/patients.js';
import { usePermissions } from '../composables/usePermissions.js';
import PatientSummaryTab from '../components/prontuario/PatientSummaryTab.vue';
import PatientDataTab from '../components/prontuario/PatientDataTab.vue';
import PatientAppointmentsTab from '../components/prontuario/PatientAppointmentsTab.vue';
import PatientAasiTab from '../components/prontuario/PatientAasiTab.vue';
import AnamneseTab from '../components/prontuario/AnamneseTab.vue';
import EvolucoesTab from '../components/prontuario/EvolucoesTab.vue';
import PrescricoesTab from '../components/prontuario/PrescricoesTab.vue';
import ArquivosTab from '../components/prontuario/ArquivosTab.vue';

const route = useRoute();
const { can } = usePermissions();
const patientId = Number(route.params.id);

const patient = ref(null);
const activeTab = ref('resumo');

const allTabs = [
  { key: 'resumo', label: 'Resumo', permission: 'patients.view' },
  { key: 'dados', label: 'Dados', permission: 'patients.view' },
  { key: 'anamnese', label: 'Anamnese', permission: 'anamneses.view' },
  { key: 'evolucoes', label: 'Evoluções', permission: 'evolutions.view' },
  { key: 'agenda', label: 'Agenda', permission: 'appointments.view' },
  { key: 'arquivos', label: 'Arquivos', permission: 'files.view' },
  { key: 'prescricoes', label: 'Prescrições', permission: 'prescriptions.view' },
  { key: 'aasi', label: 'AASI', permission: 'aasis.view' },
];

const tabs = computed(() => allTabs.filter((t) => can(t.permission)));

onMounted(async () => {
  patient.value = await getPatient(patientId);
});
</script>
