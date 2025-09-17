<template>
  <BaseLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <h1 class="text-xl font-bold">Pacientes</h1>
        <button
          type="button"
          @click="openModal()"
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Novo Paciente
        </button>
      </div>

      <!-- Busca -->
      <div>
        <input
          v-model="search"
          type="text"
          placeholder="Buscar paciente..."
          class="w-full md:w-1/3 border rounded p-2"
        />
      </div>

      <!-- Lista -->
      <div v-if="loading">Carregando pacientes...</div>
      <div v-else-if="filteredPatients.length === 0" class="text-gray-600">
        Nenhum paciente encontrado.
      </div>
      <ul v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <li
          v-for="patient in filteredPatients"
          :key="patient.id"
          class="p-4 bg-white rounded shadow flex justify-between items-center"
        >
          <div @click="goToProntuario(patient.id)" class="cursor-pointer flex-1">
            <p class="font-semibold">{{ patient.name }}</p>
            <p class="text-sm text-gray-600">
              CPF: {{ patient.cpf || '---' }} | Tel: {{ patient.phone || '---' }}
            </p>
            <p class="text-sm text-gray-600">
              {{ patient.email || 'Sem e-mail' }}
            </p>
          </div>
          <div class="space-x-2">
            <!-- Novo botão de prontuário -->
            <button
              type="button"
              @click="goToProntuario(patient.id)"
              class="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Prontuário
            </button>
            <button
              type="button"
              @click="openModal(patient)"
              class="px-2 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Editar
            </button>
            <button
              type="button"
              @click="removePatient(patient.id)"
              class="px-2 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              Excluir
            </button>
          </div>
        </li>
      </ul>
    </div>

    <!-- Modal -->
    <BaseModal :show="showModal" @close="closeModal">
      <template #header>
        <h2 class="text-lg font-semibold">
          {{ form.id ? 'Editar Paciente' : 'Novo Paciente' }}
        </h2>
      </template>
      <template #body>
        <form class="space-y-4" @submit.prevent>
          <div>
            <label class="block text-sm font-medium">Nome</label>
            <input v-model="form.name" type="text" class="w-full border rounded p-2" />
          </div>
          <div>
            <label class="block text-sm font-medium">CPF</label>
            <input v-model="form.cpf" type="text" maxlength="11" class="w-full border rounded p-2" />
          </div>
          <div>
            <label class="block text-sm font-medium">Sexo</label>
            <select v-model="form.gender" class="w-full border rounded p-2">
              <option value="">Selecione...</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
              <option value="O">Outro</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium">Data de nascimento</label>
            <input v-model="form.birth_date" type="date" class="w-full border rounded p-2" />
          </div>
          <div>
            <label class="block text-sm font-medium">Telefone</label>
            <input v-model="form.phone" type="text" class="w-full border rounded p-2" />
          </div>
          <div>
            <label class="block text-sm font-medium">Email</label>
            <input v-model="form.email" type="email" class="w-full border rounded p-2" />
          </div>
          <div>
            <label class="block text-sm font-medium">Endereço</label>
            <input v-model="form.address" type="text" class="w-full border rounded p-2" />
          </div>
          <div class="grid grid-cols-3 gap-2">
            <div>
              <label class="block text-sm font-medium">Cidade</label>
              <input v-model="form.city" type="text" class="w-full border rounded p-2" />
            </div>
            <div>
              <label class="block text-sm font-medium">Estado</label>
              <input v-model="form.state" type="text" maxlength="2" class="w-full border rounded p-2" />
            </div>
            <div>
              <label class="block text-sm font-medium">CEP</label>
              <input v-model="form.zip_code" type="text" class="w-full border rounded p-2" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium">Responsável (se menor)</label>
            <input v-model="form.responsible_name" type="text" class="w-full border rounded p-2" />
          </div>
        </form>
      </template>
      <template #footer>
        <button
          type="button"
          @click="savePatient"
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Salvar
        </button>
        <button
          type="button"
          @click="closeModal"
          class="ml-2 bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
        >
          Cancelar
        </button>
      </template>
    </BaseModal>
  </BaseLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import dayjs from 'dayjs'

import BaseLayout from '../layouts/BaseLayout.vue'
import BaseModal from '../components/BaseModal.vue'
import { PatientService } from '../services/PatientService'

const router = useRouter()

const patients = ref([])
const loading = ref(true)
const search = ref('')
const showModal = ref(false)
const form = ref({
  id: null,
  name: '',
  cpf: '',
  gender: '',
  birth_date: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  zip_code: '',
  responsible_name: ''
})

onMounted(async () => {
  await fetchPatients()
})

async function fetchPatients() {
  try {
    loading.value = true
    const res = await PatientService.list()
    patients.value = res || []
  } catch {
    toast.error('Erro ao carregar pacientes')
  } finally {
    loading.value = false
  }
}

const filteredPatients = computed(() => {
  return patients.value.filter((p) =>
    p.name.toLowerCase().includes(search.value.toLowerCase())
  )
})

function goToProntuario(id) {
  router.push(`/prontuario/${id}`)
}

function openModal(patient = null) {
  if (patient) {
    form.value = { ...patient }
    if (form.value.birth_date) {
      form.value.birth_date = dayjs(form.value.birth_date).format('YYYY-MM-DD')
    }
  } else {
    form.value = {
      id: null,
      name: '',
      cpf: '',
      gender: '',
      birth_date: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      responsible_name: ''
    }
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function savePatient() {
  try {
    const payload = {
      ...form.value,
      birth_date: form.value.birth_date
        ? dayjs(form.value.birth_date).format('YYYY-MM-DD')
        : null
    }

    if (form.value.id) {
      await PatientService.update(form.value.id, payload)
      toast.success('Paciente atualizado com sucesso')
    } else {
      await PatientService.create(payload)
      toast.success('Paciente criado com sucesso')
    }

    closeModal()
    await fetchPatients()
  } catch (e) {
    const msg =
      e.response?.data?.errors?.[0]?.msg ||
      e.response?.data?.error ||
      'Erro ao salvar paciente'
    toast.error(msg)
  }
}

async function removePatient(id) {
  if (!confirm('Tem certeza que deseja excluir este paciente?')) return
  try {
    await PatientService.remove(id)
    toast.success('Paciente removido com sucesso')
    await fetchPatients()
  } catch {
    toast.error('Erro ao remover paciente')
  }
}
</script>
