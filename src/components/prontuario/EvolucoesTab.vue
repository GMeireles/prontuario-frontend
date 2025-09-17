<template>
  <div class="space-y-4">
    <h2 class="text-lg font-semibold">Evoluções Clínicas</h2>

    <!-- Formulário -->
    <div class="bg-white p-4 rounded shadow space-y-3">
      <textarea
        v-model="newNote"
        placeholder="Escreva a evolução clínica..."
        class="w-full border rounded p-2"
      ></textarea>
      <button
        @click="addEvolution"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        :disabled="loading"
      >
        Salvar Evolução
      </button>
    </div>

    <!-- Lista de evoluções -->
    <div v-if="loading">Carregando evoluções...</div>
    <div v-else-if="evolutions.length === 0" class="text-gray-600">
      Nenhuma evolução registrada ainda.
    </div>
    <ul v-else class="space-y-3">
      <li
        v-for="ev in evolutions"
        :key="ev.id"
        class="bg-white p-4 rounded shadow"
      >
        <p class="text-gray-800 whitespace-pre-line">{{ ev.note }}</p>
        <div class="flex justify-between items-center mt-2 text-sm text-gray-500">
          <span>
            {{ formatDate(ev.createdAt) }} - {{ ev.professional?.name || 'Profissional' }}
          </span>
          <button
            @click="removeEvolution(ev.id)"
            class="text-red-600 hover:underline"
          >
            Excluir
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import EvolutionService from '../../services/EvolutionService'

const props = defineProps({
  patientId: { type: Number, required: true }
})

const evolutions = ref([])
const newNote = ref('')
const loading = ref(false)

function formatDate(date) {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function loadEvolutions() {
  loading.value = true
  try {
    evolutions.value = await EvolutionService.getByPatient(props.patientId)
  } catch {
    evolutions.value = []
    toast.error('Erro ao carregar evoluções')
  } finally {
    loading.value = false
  }
}

async function addEvolution() {
  if (!newNote.value.trim()) {
    return toast.error('A evolução não pode estar vazia')
  }
  try {
    await EvolutionService.create(props.patientId, { note: newNote.value })
    toast.success('Evolução adicionada com sucesso!')
    newNote.value = ''
    await loadEvolutions()
  } catch {
    toast.error('Erro ao adicionar evolução')
  }
}

async function removeEvolution(id) {
  if (!confirm('Tem certeza que deseja excluir esta evolução?')) return
  try {
    await EvolutionService.remove(id)
    toast.success('Evolução excluída com sucesso!')
    await loadEvolutions()
  } catch {
    toast.error('Erro ao excluir evolução')
  }
}

onMounted(loadEvolutions)
</script>
