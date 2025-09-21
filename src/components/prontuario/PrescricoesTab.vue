<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h2 class="text-lg font-bold">Prescrições</h2>
      <button
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        @click="openCreateModal"
      >
        Nova Prescrição
      </button>
    </div>

    <!-- Filtros -->
    <div class="flex space-x-3">
      <select v-model="filters.type" class="border rounded px-2 py-1">
        <option value="">Todos os tipos</option>
        <option value="medication">Medicação</option>
        <option value="conduct">Conduta</option>
        <option value="referral">Encaminhamento</option>
      </select>
      <button
        class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        @click="fetchPrescriptions"
      >
        Filtrar
      </button>
    </div>

    <!-- Lista -->
    <div v-if="prescriptions.length" class="space-y-4">
      <div
        v-for="p in prescriptions"
        :key="p.id"
        class="border rounded p-4 shadow-sm bg-white"
      >
        <div class="flex justify-between items-center">
          <div>
            <h3 class="font-semibold capitalize">{{ p.type }}</h3>
            <p>{{ p.description }}</p>
            <small class="text-gray-500">
              {{ p.professional?.name }} —
              {{ new Date(p.createdAt).toLocaleDateString() }}
            </small>
          </div>
          <div class="space-x-2">
            <button class="text-blue-600" @click="editPrescription(p)">
              Editar
            </button>
            <button class="text-red-600" @click="deletePrescription(p.id)">
              Excluir
            </button>
          </div>
        </div>

        <!-- Arquivos -->
        <div class="mt-3">
          <h4 class="font-medium mb-2">Arquivos</h4>

          <!-- Seletor de tipo + Upload -->
          <div class="flex items-center space-x-3">

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
                @change="e => handleFileUpload(e, p.id)"
              />
            </label>
          </div>

          <!-- Listagem de arquivos -->
          <ul class="mt-3 space-y-2">
            <li
              v-for="pf in p.prescription_files"
              :key="pf.id"
              class="flex items-center justify-between p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition"
            >
              <div class="flex items-center space-x-3">
                <!-- Ícone dinâmico -->
                <svg
                  v-if="pf.file.type === 'prescription'"
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
                  v-else-if="pf.file.type === 'exam'"
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

                <span
                  class="text-gray-700 font-medium truncate w-48"
                >
                  {{ pf.file.type }} - {{ pf.file.filename }}
                </span>
              </div>

              <div class="flex space-x-3">
                <button
                  class="text-blue-600 hover:text-blue-800 font-medium"
                  @click="downloadFile(pf.file.id, pf.file.filename)"
                >
                  Download
                </button>
                <button
                  class="text-red-600 hover:text-red-800 font-medium"
                  @click="removeFile(p.id, pf.file.id)"
                >
                  Remover
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-else class="text-gray-500">Nenhuma prescrição encontrada.</div>

    <!-- Paginação -->
    <div class="flex justify-between items-center mt-4">
      <button
        :disabled="pagination.page === 1"
        @click="changePage(pagination.page - 1)"
        class="px-3 py-1 border rounded disabled:opacity-50"
      >
        Anterior
      </button>
      <span>Página {{ pagination.page }} de {{ pagination.totalPages }}</span>
      <button
        :disabled="pagination.page === pagination.totalPages"
        @click="changePage(pagination.page + 1)"
        class="px-3 py-1 border rounded disabled:opacity-50"
      >
        Próxima
      </button>
    </div>

    <!-- Modal criar/editar -->
    <div
      v-if="showModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
        <h3 class="text-lg font-bold mb-4">
          {{ editing ? "Editar Prescrição" : "Nova Prescrição" }}
        </h3>

        <form @submit.prevent="savePrescription">
          <div class="space-y-3">
            <select v-model="form.type" required class="border rounded w-full px-2 py-1">
              <option disabled value="">Selecione o tipo</option>
              <option value="medication">Medicação</option>
              <option value="conduct">Conduta</option>
              <option value="referral">Encaminhamento</option>
            </select>

            <textarea
              v-model="form.description"
              placeholder="Descrição"
              required
              class="border rounded w-full px-2 py-1"
            />

            <input
              v-model="form.dosage"
              placeholder="Dosagem"
              class="border rounded w-full px-2 py-1"
            />
            <input
              v-model="form.frequency"
              placeholder="Frequência"
              class="border rounded w-full px-2 py-1"
            />
            <input
              v-model="form.duration"
              placeholder="Duração"
              class="border rounded w-full px-2 py-1"
            />
          </div>

          <div class="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 bg-gray-200 rounded"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PrescriptionService from '@/services/PrescriptionService'
import FileService from '@/services/FileService'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const props = defineProps({
  patientId: { type: Number, required: true }
})

const prescriptions = ref([])
const pagination = ref({ page: 1, totalPages: 1, limit: 10 })
const filters = ref({ type: '' })
const selectedType = ref('') // tipo de documento para upload

const showModal = ref(false)
const editing = ref(false)
const form = ref({
  id: null,
  type: '',
  description: '',
  dosage: '',
  frequency: '',
  duration: ''
})

async function fetchPrescriptions() {
  try {
    const res = await PrescriptionService.getByPatient(props.patientId, {
      page: pagination.value.page,
      limit: pagination.value.limit,
      type: filters.value.type
    })
    prescriptions.value = res.data
    pagination.value = res.pagination
  } catch (e) {
    toast.error('Erro ao carregar prescrições')
  }
}

async function downloadFile(fileId, filename) {
  try {
    await FileService.download(fileId, filename)
  } catch (e) {
    toast.error('Erro ao baixar arquivo')
  }
}

function changePage(page) {
  pagination.value.page = page
  fetchPrescriptions()
}

function openCreateModal() {
  editing.value = false
  form.value = {
    id: null,
    type: '',
    description: '',
    dosage: '',
    frequency: '',
    duration: ''
  }
  showModal.value = true
}

function editPrescription(p) {
  editing.value = true
  form.value = { ...p }
  showModal.value = true
}

async function savePrescription() {
  try {
    if (editing.value) {
      await PrescriptionService.update(form.value.id, form.value)
      toast.success('Prescrição atualizada!')
    } else {
      await PrescriptionService.create({
        ...form.value,
        patient_id: props.patientId
      })
      toast.success('Prescrição criada!')
    }
    showModal.value = false
    fetchPrescriptions()
  } catch (e) {
    toast.error('Erro ao salvar prescrição')
  }
}

async function deletePrescription(id) {
  if (!confirm('Deseja excluir esta prescrição?')) return
  try {
    await PrescriptionService.remove(id)
    toast.success('Prescrição removida!')
    fetchPrescriptions()
  } catch {
    toast.error('Erro ao excluir prescrição')
  }
}

async function handleFileUpload(e, prescriptionId) {
  const file = e.target.files[0]
  if (!file) return

  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('patient_id', props.patientId)
    formData.append('type', 'prescription')

    const uploaded = await FileService.upload(formData)

    await PrescriptionService.addFile(prescriptionId, uploaded.id)
    toast.success('Arquivo anexado!')
    fetchPrescriptions()
  } catch (e) {
    toast.error('Erro ao anexar arquivo')
  }
}

async function removeFile(prescriptionId, fileId) {
  if (!confirm('Deseja remover este arquivo?')) return
  try {
    await PrescriptionService.removeFile(prescriptionId, fileId)
    toast.success('Arquivo removido!')
    fetchPrescriptions()
  } catch {
    toast.error('Erro ao remover arquivo')
  }
}

onMounted(fetchPrescriptions)

function closeModal() {
  showModal.value = false
}
</script>
