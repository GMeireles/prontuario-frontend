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

    <!-- Lista -->
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
        <!-- Editando -->
        <div v-if="editingId === ev.id" class="space-y-2">
          <textarea
            v-model="editNote"
            class="w-full border rounded p-2"
          ></textarea>
          <div class="flex justify-end space-x-2">
            <button
              @click="updateEvolution(ev.id)"
              class="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
            >
              Salvar
            </button>
            <button
              @click="cancelEdit"
              class="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
            >
              Cancelar
            </button>
          </div>
        </div>

        <!-- Exibição normal -->
        <div v-else>
          <p class="text-gray-800 whitespace-pre-line">{{ ev.note }}</p>
          <div
            class="flex justify-between items-center mt-2 text-sm text-gray-500"
          >
            <span>
              {{ formatDate(ev.created_at) }} - {{ ev.professional?.name || 'Profissional' }}
            </span>
            <div class="flex space-x-3">
              <button
                @click="startEdit(ev)"
                class="text-blue-600 hover:underline"
              >
                Editar
              </button>
              <button
                @click="removeEvolution(ev.id)"
                class="text-red-600 hover:underline"
              >
                Excluir
              </button>
            </div>
          </div>
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

// estado edição
const editingId = ref(null)
const editNote = ref('')

function formatDate(date) {
  if (!date) return 'Data inválida'
  try {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return 'Data inválida'
  }
}

async function loadEvolutions() {
  loading.value = true
  try {
    evolutions.value = await EvolutionService.getByPatient(props.patientId)
    console.log("DEBUG evolutions after fix:", evolutions.value)
  } catch (err) {
    console.error("Erro ao carregar evoluções:", err)
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
  } catch (err) {
    console.error('Erro ao adicionar evolução:', err)
    toast.error('Erro ao adicionar evolução')
  }
}

async function removeEvolution(id) {
  if (!confirm('Tem certeza que deseja excluir esta evolução?')) return
  try {
    await EvolutionService.remove(id)
    toast.success('Evolução excluída com sucesso!')
    await loadEvolutions()
  } catch (err) {
    console.error('Erro ao excluir evolução:', err)
    toast.error('Erro ao excluir evolução')
  }
}

function startEdit(ev) {
  editingId.value = ev.id
  editNote.value = ev.note
}

function cancelEdit() {
  editingId.value = null
  editNote.value = ''
}

async function updateEvolution(id) {
  if (!editNote.value.trim()) {
    return toast.error('A evolução não pode estar vazia')
  }
  try {
    await EvolutionService.update(id, { note: editNote.value })
    toast.success('Evolução atualizada com sucesso!')
    editingId.value = null
    editNote.value = ''
    await loadEvolutions()
  } catch (err) {
    console.error('Erro ao atualizar evolução:', err)
    toast.error('Erro ao atualizar evolução')
  }
}

onMounted(loadEvolutions)
</script>
