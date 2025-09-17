<template>
  <div class="space-y-4">
    <h2 class="text-lg font-semibold">Arquivos / Exames</h2>

    <!-- Upload -->
    <div
      class="border-2 border-dashed border-gray-400 p-6 rounded text-center cursor-pointer hover:bg-gray-50"
      @click="fileInput.click()"
    >
      <p class="text-gray-600">Clique ou arraste um arquivo para enviar</p>
      <input
        type="file"
        class="hidden"
        ref="fileInput"
        @change="handleUpload"
      />
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
        <div>
          <p class="font-semibold">{{ file.filename }}</p>
          <p class="text-xs text-gray-500">
            {{ formatDate(file.createdAt) }}
          </p>
        </div>
        <div class="flex gap-2">
          <a
            :href="file.url"
            target="_blank"
            class="text-blue-600 hover:underline text-sm"
          >
            Baixar
          </a>
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
import UploadService from '../../services/UploadService'

const props = defineProps({
  patientId: { type: Number, required: true }
})

const files = ref([])
const loading = ref(false)
const fileInput = ref(null)

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
    files.value = await UploadService.listByPatient(props.patientId)
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
  try {
    await UploadService.upload(props.patientId, file)
    toast.success('Arquivo enviado com sucesso!')
    await loadFiles()
  } catch {
    toast.error('Erro ao enviar arquivo')
  }
}

async function removeFile(id) {
  if (!confirm('Tem certeza que deseja excluir este arquivo?')) return
  try {
    await UploadService.remove(id)
    toast.success('Arquivo removido com sucesso!')
    await loadFiles()
  } catch {
    toast.error('Erro ao remover arquivo')
  }
}

onMounted(loadFiles)
</script>
