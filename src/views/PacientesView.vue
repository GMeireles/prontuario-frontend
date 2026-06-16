<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <h1 class="text-xl font-bold text-primary">Pacientes</h1>
      <FormButton v-if="can('patients.create')" variant="primary" @click="openModal()">+ Novo Paciente</FormButton>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
      <FormInput v-model="filters.q" placeholder="Buscar por nome..." @keyup.enter="applyFilters" />
      <FormInput v-model="filters.cpf" placeholder="CPF" @keyup.enter="applyFilters" />
      <FormInput v-model="filters.phone" placeholder="Telefone" @keyup.enter="applyFilters" />
      <FormSelect v-model="filters.active" label="Status" @change="applyFilters">
        <option value="all">Todos</option>
        <option value="true">Ativos</option>
        <option value="false">Inativos</option>
      </FormSelect>
    </div>

    <div class="flex gap-2">
      <FormButton variant="secondary" size="sm" @click="applyFilters">Buscar</FormButton>
      <FormButton variant="secondary" size="sm" @click="clearFilters">Limpar</FormButton>
    </div>

    <div v-if="loading" class="text-secondary">Carregando pacientes...</div>
    <div v-else-if="patients.length === 0" class="text-secondary">
      Nenhum paciente encontrado.
    </div>
    <ul v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <li
        v-for="patient in patients"
        :key="patient.id"
        class="p-4 rounded-lg border border-theme bg-secondary flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
        :class="patient.active === false ? 'opacity-70' : ''"
      >
        <div @click="goToProntuario(patient.id)" class="cursor-pointer flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <p class="font-semibold text-primary truncate">{{ patient.name }}</p>
            <span v-if="patient.active === false" class="text-xs px-2 py-0.5 rounded bg-warning/20 text-warning">Inativo</span>
          </div>
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
          <FormButton size="sm" variant="secondary" v-if="can('patients.update')" @click="openModal(patient)">
            Editar
          </FormButton>
          <FormButton size="sm" variant="danger" v-if="can('patients.delete')" @click="removePatient(patient.id)">
            Arquivar
          </FormButton>
        </div>
      </li>
    </ul>

    <div v-if="pagination.totalPages > 1" class="flex items-center gap-3 text-sm">
      <FormButton size="sm" variant="secondary" :disabled="pagination.page <= 1" @click="goPage(pagination.page - 1)">
        Anterior
      </FormButton>
      <span class="text-secondary">
        Página {{ pagination.page }} de {{ pagination.totalPages }} ({{ pagination.total }} pacientes)
      </span>
      <FormButton
        size="sm"
        variant="secondary"
        :disabled="pagination.page >= pagination.totalPages"
        @click="goPage(pagination.page + 1)"
      >
        Próxima
      </FormButton>
    </div>

    <PatientModal
      v-model="showModal"
      :patient="editingPatient"
      @saved="fetchPatients"
      @close="closeModal"
    />

    <ConfirmModal
      v-model="confirmDelete"
      title="Arquivar paciente"
      message="Pacientes com histórico clínico serão arquivados. Deseja continuar?"
      confirm-type="danger"
      confirm-text="Arquivar"
      @confirm="confirmRemovePatient"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { toast } from 'vue3-toastify';
import { FormInput, FormSelect, FormButton } from '../components/forms/index.js';
import PatientModal from '../components/PatientModal.vue';
import ConfirmModal from '../components/ConfirmModal.vue';
import { listPatients, archivePatient } from '../api/patients.js';
import { usePermissions } from '../composables/usePermissions.js';

const router = useRouter();
const { can } = usePermissions();

const patients = ref([]);
const loading = ref(true);
const showModal = ref(false);
const editingPatient = ref(null);
const confirmDelete = ref(false);
const patientToDelete = ref(null);
const pagination = ref({ page: 1, limit: 15, total: 0, totalPages: 0 });

const filters = ref({
  q: '',
  cpf: '',
  phone: '',
  active: 'all',
});

onMounted(fetchPatients);

async function fetchPatients(page = pagination.value.page) {
  try {
    loading.value = true;
    const params = {
      page,
      limit: pagination.value.limit,
      sort: 'name',
      order: 'asc',
    };
    if (filters.value.q) params.q = filters.value.q;
    if (filters.value.cpf) params.cpf = filters.value.cpf;
    if (filters.value.phone) params.phone = filters.value.phone;
    if (filters.value.active !== 'all') params.active = filters.value.active;

    const result = await listPatients(params);
    patients.value = result.data || [];
    pagination.value = result.pagination;
  } catch {
    toast.error('Erro ao carregar pacientes');
  } finally {
    loading.value = false;
  }
}

function applyFilters() {
  fetchPatients(1);
}

function clearFilters() {
  filters.value = { q: '', cpf: '', phone: '', active: 'all' };
  fetchPatients(1);
}

function goPage(page) {
  fetchPatients(page);
}

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
    await archivePatient(patientToDelete.value);
    toast.success('Paciente arquivado/removido com sucesso');
    confirmDelete.value = false;
    patientToDelete.value = null;
    await fetchPatients();
  } catch (e) {
    toast.error(e.response?.data?.message || 'Erro ao arquivar paciente');
  }
}
</script>
