<template>
  <div class="space-y-4">
    <h2 class="text-lg font-semibold">Prescrições</h2>

    <!-- Formulário -->
    <div class="bg-white p-4 rounded shadow space-y-3">
      <div>
        <label class="block text-sm font-medium">Tipo *</label>
        <select v-model="form.type" class="w-full border rounded p-2">
          <option disabled value="">Selecione</option>
          <option value="medication">Medicação</option>
          <option value="conduct">Conduta</option>
          <option value="referral">Encaminhamento</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium">Descrição *</label>
        <textarea v-model="form.description" class="w-full border rounded p-2"></textarea>
      </div>
      <div v-if="form.type === 'medication'" class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label class="block text-sm font-medium">Dosagem</label>
          <input v-model="form.dosage" class="w-full border rounded p-2" />
        </div>
        <div>
          <label class="block text-sm font-medium">Frequência</label>
          <input v-model="form.frequency" class="w-full border rounded p-2" />
        </div>
        <div>
          <label class="block text-sm font-medium">Duração</label>
          <input v-model="form.duration" class="w-full border rounded p-2" />
        </div>
      </div>
      <button
        @click="savePrescription"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Salvar Prescrição
      </button>
    </div>

    <!-- Lista -->
    <div v-if="loading">Carregando prescrições...</div>
    <div v-else-if="prescriptions.length === 0" class="text-gray-600">
      Nenhuma prescrição registrada.
    </div>
    <ul v-else class="space-y-3">
      <li
        v-for="pres in prescriptions"
        :key="pres.id"
        class="bg-white p-4 rounded shadow"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="font-semibold">
              {{ formatType(pres.type) }} - {{ pres.description }}
            </p>
            <p v-if="pres.dosage" class="text-sm text-gray-600">
              {{ pres.dosage }}, {{ pres.frequency }}, {{ pres.duration }}
            </p>
            <p class="text-xs text-gray-500">
              {{ formatDate(pres.createdAt) }} - {{ pres.professional?.name || 'Profissional' }}
            </p>
          </div>
          <div class="flex gap-2">
            <button
              @click="exportPDF(pres)"
              class="text-blue-600 hover:underline text-sm"
            >
              PDF
            </button>
            <button
              @click="removePrescription(pres.id)"
              class="text-red-600 hover:underline text-sm"
            >
              Excluir
            </button>
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
import PrescriptionService from '../../services/PrescriptionService'
import jsPDF from 'jspdf'

const props = defineProps({
  patientId: { type: Number, required: true }
})

const prescriptions = ref([])
const form = ref({
  type: '',
  description: '',
  dosage: '',
  frequency: '',
  duration: ''
})
const loading = ref(false)

function formatDate(date) {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatType(type) {
  switch (type) {
    case 'medication': return 'Medicação'
    case 'conduct': return 'Conduta'
    case 'referral': return 'Encaminhamento'
    default: return 'Outro'
  }
}

async function loadPrescriptions() {
  loading.value = true
  try {
    prescriptions.value = await PrescriptionService.getByPatient(props.patientId)
  } catch {
    prescriptions.value = []
    toast.error('Erro ao carregar prescrições')
  } finally {
    loading.value = false
  }
}

async function savePrescription() {
  if (!form.value.type || !form.value.description.trim()) {
    return toast.error('Preencha os campos obrigatórios')
  }
  try {
    await PrescriptionService.create(props.patientId, form.value)
    toast.success('Prescrição salva com sucesso!')
    form.value = { type: '', description: '', dosage: '', frequency: '', duration: '' }
    await loadPrescriptions()
  } catch {
    toast.error('Erro ao salvar prescrição')
  }
}

async function removePrescription(id) {
  if (!confirm('Deseja realmente excluir esta prescrição?')) return
  try {
    await PrescriptionService.remove(id)
    toast.success('Prescrição removida')
    await loadPrescriptions()
  } catch {
    toast.error('Erro ao remover prescrição')
  }
}

function exportPDF(pres) {
  const doc = new jsPDF()
  doc.setFontSize(14)
  doc.text('Prescrição Médica', 10, 10)
  doc.setFontSize(12)
  doc.text(`Tipo: ${formatType(pres.type)}`, 10, 30)
  doc.text(`Descrição: ${pres.description}`, 10, 40)
  if (pres.type === 'medication') {
    doc.text(`Dosagem: ${pres.dosage || '-'}`, 10, 50)
    doc.text(`Frequência: ${pres.frequency || '-'}`, 10, 60)
    doc.text(`Duração: ${pres.duration || '-'}`, 10, 70)
  }
  doc.text(`Emitido em: ${formatDate(pres.createdAt)}`, 10, 90)
  doc.save(`prescricao_${pres.id}.pdf`)
}

onMounted(loadPrescriptions)
</script>
