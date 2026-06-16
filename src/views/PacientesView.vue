<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <h1 class="text-xl font-bold text-primary">Pacientes</h1>
      <FormButton variant="primary" @click="openModal()">+ Novo Paciente</FormButton>
    </div>

    <FormInput
      v-model="search"
      placeholder="Buscar paciente..."
      class="max-w-md"
    />

    <div v-if="loading" class="text-secondary">Carregando pacientes...</div>
    <div v-else-if="filteredPatients.length === 0" class="text-secondary">
      Nenhum paciente encontrado.
    </div>
    <ul v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <li
        v-for="patient in filteredPatients"
        :key="patient.id"
        class="p-4 rounded-lg border border-theme bg-secondary flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
      >
        <div @click="goToProntuario(patient.id)" class="cursor-pointer flex-1 min-w-0">
          <p class="font-semibold text-primary truncate">{{ patient.name }}</p>
          <p class="text-sm text-secondary">
            CPF: {{ patient.cpf || '---' }} | Tel: {{ patient.phone || '---' }}
          </p>
          <p class="text-sm text-secondary truncate">
            {{ patient.email || 'Sem e-mail' }}
          </p>
        </div>
        <div class="flex flex-wrap gap-2 shrink-0">
          <FormButton size="sm" variant="primary" @click="goToProntuario(patient.id)">
            Prontuário
          </FormButton>
          <FormButton size="sm" variant="secondary" @click="openModal(patient)">
            Editar
          </FormButton>
          <FormButton size="sm" variant="danger" @click="removePatient(patient.id)">
            Excluir
          </FormButton>
        </div>
      </li>
    </ul>

    <PatientModal
      v-model="showModal"
      :patient="editingPatient"
      @saved="fetchPatients"
      @close="closeModal"
    />

    <ConfirmModal
      v-model="confirmDelete"
      title="Excluir paciente"
      message="Tem certeza que deseja excluir este paciente?"
      confirm-type="danger"
      confirm-text="Excluir"
      @confirm="confirmRemovePatient"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { toast } from 'vue3-toastify';
import { FormInput, FormButton } from '../components/forms/index.js';
import PatientModal from '../components/PatientModal.vue';
import ConfirmModal from '../components/ConfirmModal.vue';
import { listPatients, deletePatient } from '../api/patients.js';

const router = useRouter();

const patients = ref([]);
const loading = ref(true);
const search = ref('');
const showModal = ref(false);
const editingPatient = ref(null);
const confirmDelete = ref(false);
const patientToDelete = ref(null);

onMounted(fetchPatients);

async function fetchPatients() {
  try {
    loading.value = true;
    patients.value = (await listPatients()) || [];
  } catch {
    toast.error('Erro ao carregar pacientes');
  } finally {
    loading.value = false;
  }
}

const filteredPatients = computed(() =>
  patients.value.filter((p) =>
    p.name.toLowerCase().includes(search.value.toLowerCase())
  )
);

function goToProntuario(id) {
  router.push(`/app/prontuario/${id}`);
}

function openModal(patient = null) {
  editingPatient.value = patient;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  editingPatient.value = null;
}

function removePatient(id) {
  patientToDelete.value = id;
  confirmDelete.value = true;
}

async function confirmRemovePatient() {
  try {
    await deletePatient(patientToDelete.value);
    toast.success('Paciente removido com sucesso');
    confirmDelete.value = false;
    patientToDelete.value = null;
    await fetchPatients();
  } catch {
    toast.error('Erro ao remover paciente');
  }
}
</script>
