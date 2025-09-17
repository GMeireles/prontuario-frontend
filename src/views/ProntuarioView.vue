<template>
  <BaseLayout>
    <div class="space-y-6">
      <h1 class="text-2xl font-bold">Prontuário de {{ patient?.name }}</h1>

      <!-- Abas -->
      <div class="border-b">
        <nav class="flex space-x-4">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            class="px-4 py-2 font-medium"
            :class="activeTab === tab.key ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-blue-600'"
          >
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- Conteúdo -->
      <div v-if="activeTab === 'dados'">
        <h2 class="text-lg font-semibold mb-2">Dados do Paciente</h2>
        <div class="bg-white p-4 rounded shadow">
          <p><strong>Nome:</strong> {{ patient?.name }}</p>
          <p><strong>Email:</strong> {{ patient?.email || 'Sem e-mail' }}</p>
          <p><strong>Data de Nascimento:</strong> {{ formatDate(patient?.birth_date) }}</p>
        </div>
      </div>

      <div v-else-if="activeTab === 'anamnese'">
        <AnamneseTab :patientId="patientId" />
      </div>

      <div v-else-if="activeTab === 'evolucoes'">
        <EvolucoesTab :patientId="patientId" />
      </div>

      <div v-else-if="activeTab === 'prescricoes'">
        <PrescricoesTab :patientId="patientId" />
      </div>

      <div v-else-if="activeTab === 'arquivos'">
        <ArquivosTab :patientId="patientId" />
      </div>
    </div>
  </BaseLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import BaseLayout from '../layouts/BaseLayout.vue'
import {PatientService} from '../services/PatientService'

// Abas
import AnamneseTab from '../components/prontuario/AnamneseTab.vue'
import EvolucoesTab from '../components/prontuario/EvolucoesTab.vue'
import PrescricoesTab from '../components/prontuario/PrescricoesTab.vue'
import ArquivosTab from '../components/prontuario/ArquivosTab.vue'

const route = useRoute()
const patientId = Number(route.params.id)

const patient = ref(null)
const activeTab = ref('dados')

const tabs = [
  { key: 'dados', label: 'Dados' },
  { key: 'anamnese', label: 'Anamnese' },
  { key: 'evolucoes', label: 'Evoluções' },
  { key: 'prescricoes', label: 'Prescrições' },
  { key: 'arquivos', label: 'Arquivos' }
]

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pt-BR')
}

onMounted(async () => {
  patient.value = await PatientService.get(patientId)
})
</script>
