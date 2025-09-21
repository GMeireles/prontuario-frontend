<template>
  <div class="space-y-4">
    <h2 class="text-lg font-semibold">Arquivos / Exames</h2>

    <!-- Upload -->
    <div class="flex items-center gap-3">
      <!-- Seleção do tipo -->
      <select v-model="selectedType" class="border rounded px-2 py-1">
        <option disabled value="">Selecione o tipo</option>
        <option value="exam">Exame</option>
        <option value="atestado">Atestado</option>
        <option value="encaminhamento">Encaminhamento</option>
        <option value="raiox">Raio-X</option>
        <option value="ultrassom">Ultrassom</option>
        <option value="document">Outro Documento</option>
      </select>


      <!-- Botão de upload -->
      <label
        class="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-200 transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 8l-3-3m3 3l3-3"
          />
        </svg>
        Enviar Arquivo
        <input
          type="file"
          class="hidden"
          ref="fileInput"
          @change="handleUpload"
        />
      </label>
    </div>

    <!-- Lista -->
    <div v-if="loading">Carregando arquivos...</div>
    <div v-else-if="files.length === 0" class="text-gray-600">
      Nenhum arquivo enviado ainda.
    </div>
    <ul v-else class="space-y-3">
      <li
        v-for="file in files"
        :key="file.id"
        class="bg-white p-4 rounded shadow flex justify-between items-center"
      >
        <div class="flex items-center gap-3">
          <!-- Ícone por tipo -->
          <svg
            v-if="file.type === 'exam'"
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v8m-4-4h8m-6 8h4a2 2 0 002-2V6a2 2 0 00-2-2h-4a2 2 0 00-2 2v12z"
            />
          </svg>
          <svg
            v-else-if="file.type === 'atestado'"
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 21h10a2 2 0 002-2V7l-6-6H7a2 2 0 00-2 2v16a2 2 0 002 2z"
            />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 21h10a2 2 0 002-2V7l-6-6H7a2 2 0 00-2 2v16a2 2 0 002 2z"
            />
          </svg>

          <div>
            <p class="font-semibold capitalize">{{ file.type }}</p>
            <p class="text-xs text-gray-500">
              {{ formatDate(file.createdAt) }}
            </p>
          </div>
        </div>

        <div class="flex gap-2">
          <button
            @click="downloadFile(file.id, file.filename)"
            class="text-blue-600 hover:underline text-sm"
          >
            Baixar
          </button>
          <button
            @click="removeFile(file.id)"
            class="text-red-600 hover:underline text-sm"
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
import FileService from '@/services/FileService'

const props = defineProps({
  patientId: { type: Number, required: true }
})

const files = ref([])
const loading = ref(false)
const fileInput = ref(null)
const selectedType = ref('')

function formatDate(date) {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function loadFiles() {
  loading.value = true
  try {
    const res = await FileService.listByPatient(props.patientId)
    files.value = res.data || res // depende do formato do back
  } catch {
    files.value = []
    toast.error('Erro ao carregar arquivos')
  } finally {
    loading.value = false
  }
}

async function handleUpload(e) {
  const file = e.target.files[0]
  if (!file) return

  if (!selectedType.value) {
    toast.error('Selecione o tipo de arquivo')
    return
  }

  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('patient_id', props.patientId)
    formData.append('type', selectedType.value)

    await FileService.upload(formData)

    toast.success('Arquivo enviado com sucesso!')
    await loadFiles()
  } catch {
    toast.error('Erro ao enviar arquivo')
  }
}

async function downloadFile(id, filename) {
  try {
    await FileService.download(id, filename)
  } catch {
    toast.error('Erro ao baixar arquivo')
  }
}

async function removeFile(id) {
  if (!confirm('Tem certeza que deseja excluir este arquivo?')) return
  try {
    await FileService.remove(id)
    toast.success('Arquivo removido com sucesso!')
    await loadFiles()
  } catch {
    toast.error('Erro ao remover arquivo')
  }
}

onMounted(loadFiles)
</script>
