<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <h2 class="text-lg font-bold text-primary">Prescrições</h2>
      <FormButton v-if="can('prescriptions.create')" variant="primary" @click="openCreateModal">Nova Prescrição</FormButton>
    </div>

    <div class="flex flex-wrap gap-3">
      <FormSelect v-model="filters.type" placeholder="Todos os tipos" class="max-w-xs">
        <option value="">Todos os tipos</option>
        <option value="medication">Medicação</option>
        <option value="conduct">Conduta</option>
        <option value="referral">Encaminhamento</option>
      </FormSelect>
      <FormButton variant="secondary" size="sm" @click="fetchPrescriptions">Filtrar</FormButton>
    </div>

    <div v-if="prescriptions.length" class="space-y-4">
      <div
        v-for="p in prescriptions"
        :key="p.id"
        class="rounded-lg border border-theme bg-secondary p-4"
      >
        <div class="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
          <div class="min-w-0">
            <h3 class="font-semibold capitalize text-primary">{{ p.type }}</h3>
            <p class="text-secondary">{{ p.description }}</p>
            <small class="text-tertiary">
              {{ p.professional?.name }} —
              {{ new Date(p.created_at || p.createdAt).toLocaleDateString() }}
            </small>
          </div>
          <div class="flex flex-wrap gap-2 shrink-0">
            <FormButton v-if="can('prescriptions.update')" size="sm" variant="secondary" @click="editPrescription(p)">Editar</FormButton>
            <FormButton v-if="can('prescriptions.update')" size="sm" variant="danger" @click="deletePrescription(p.id)">Excluir</FormButton>
          </div>
        </div>

        <div class="mt-3 pt-3 border-t border-theme">
          <h4 class="font-medium mb-2 text-primary">Arquivos</h4>
          <label v-if="can('prescriptions.update')" class="inline-flex items-center px-4 py-2 rounded-lg border border-theme bg-tertiary text-primary cursor-pointer hover:bg-hover transition text-sm">
            Enviar Arquivo
            <input type="file" class="hidden" @change="(e) => handleFileUpload(e, p.id)" />
          </label>

          <ul class="mt-3 space-y-2">
            <li
              v-for="pf in (p.prescription_files || [])"
              :key="pf.id"
              class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-lg border border-theme bg-primary"
            >
              <span class="text-secondary truncate">{{ pf.file.type }} - {{ pf.file.filename }}</span>
              <div class="flex gap-3 shrink-0">
                <button type="button" class="text-primary-color hover:underline text-sm" @click="downloadFile(pf.file.id, pf.file.filename)">
                  Download
                </button>
                <button type="button" class="text-error hover:underline text-sm" @click="removeFile(p.id, pf.file.id)">
                  Remover
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-else class="text-secondary">Nenhuma prescrição encontrada.</div>

    <div class="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
      <FormButton
        variant="secondary"
        size="sm"
        :disabled="pagination.page === 1"
        @click="changePage(pagination.page - 1)"
      >
        Anterior
      </FormButton>
      <span class="text-secondary text-sm">Página {{ pagination.page }} de {{ pagination.totalPages }}</span>
      <FormButton
        variant="secondary"
        size="sm"
        :disabled="pagination.page === pagination.totalPages"
        @click="changePage(pagination.page + 1)"
      >
        Próxima
      </FormButton>
    </div>

    <BaseModal
      v-model="showModal"
      :title="editing ? 'Editar Prescrição' : 'Nova Prescrição'"
      size="lg"
    >
      <form @submit.prevent="savePrescription" class="space-y-3">
        <FormSelect v-model="form.type" label="Tipo" placeholder="Selecione o tipo" required>
          <option value="medication">Medicação</option>
          <option value="conduct">Conduta</option>
          <option value="referral">Encaminhamento</option>
        </FormSelect>
        <FormTextarea v-model="form.description" label="Descrição" required :rows="3" />
        <FormInput v-model="form.dosage" label="Dosagem" />
        <FormInput v-model="form.frequency" label="Frequência" />
        <FormInput v-model="form.duration" label="Duração" />
      </form>

      <template #footer>
        <FormButton variant="secondary" @click="closeModal">Cancelar</FormButton>
        <FormButton variant="primary" @click="savePrescription">Salvar</FormButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { toast } from 'vue3-toastify';
import {
  BaseModal,
  FormInput,
  FormSelect,
  FormTextarea,
  FormButton,
} from '../forms/index.js';
import {
  listPrescriptionsByPatient,
  createPrescription,
  updatePrescription,
  deletePrescription as deletePrescriptionAPI,
  addPrescriptionFile,
  removePrescriptionFile,
} from '../../api/prescriptions.js';
import { uploadFile, downloadFile as downloadFileAPI } from '../../api/files.js';
import { usePermissions } from '../../composables/usePermissions.js';

const { can } = usePermissions();
const props = defineProps({
  patientId: { type: Number, required: true },
});

const prescriptions = ref([]);
const pagination = ref({ page: 1, totalPages: 1, limit: 10 });
const filters = ref({ type: '' });

const showModal = ref(false);
const editing = ref(false);
const form = ref({
  id: null,
  type: '',
  description: '',
  dosage: '',
  frequency: '',
  duration: '',
});

async function fetchPrescriptions() {
  try {
    const res = await listPrescriptionsByPatient(props.patientId, {
      page: pagination.value.page,
      limit: pagination.value.limit,
      type: filters.value.type,
    });
    prescriptions.value = res.data || [];
    pagination.value = res.pagination || { page: 1, totalPages: 1, limit: 10 };
  } catch {
    toast.error('Erro ao carregar prescrições');
  }
}

async function downloadFile(fileId, filename) {
  try {
    await downloadFileAPI(fileId, filename);
  } catch {
    toast.error('Erro ao baixar arquivo');
  }
}

function changePage(page) {
  pagination.value.page = page;
  fetchPrescriptions();
}

function openCreateModal() {
  editing.value = false;
  form.value = {
    id: null,
    type: '',
    description: '',
    dosage: '',
    frequency: '',
    duration: '',
  };
  showModal.value = true;
}

function editPrescription(p) {
  editing.value = true;
  form.value = { ...p };
  showModal.value = true;
}

async function savePrescription() {
  try {
    if (editing.value) {
      await updatePrescription(form.value.id, form.value);
      toast.success('Prescrição atualizada!');
    } else {
      await createPrescription({
        ...form.value,
        patient_id: props.patientId,
      });
      toast.success('Prescrição criada!');
    }
    showModal.value = false;
    fetchPrescriptions();
  } catch {
    toast.error('Erro ao salvar prescrição');
  }
}

async function deletePrescription(id) {
  if (!confirm('Deseja excluir esta prescrição?')) return;
  try {
    await deletePrescriptionAPI(id);
    toast.success('Prescrição removida!');
    fetchPrescriptions();
  } catch {
    toast.error('Erro ao excluir prescrição');
  }
}

async function handleFileUpload(e, prescriptionId) {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('patient_id', props.patientId);
    formData.append('type', 'prescription');

    const uploaded = await uploadFile(formData);
    await addPrescriptionFile(prescriptionId, uploaded.id);
    toast.success('Arquivo anexado!');
    fetchPrescriptions();
  } catch {
    toast.error('Erro ao anexar arquivo');
  }
}

async function removeFile(prescriptionId, fileId) {
  if (!confirm('Deseja remover este arquivo?')) return;
  try {
    await removePrescriptionFile(prescriptionId, fileId);
    toast.success('Arquivo removido!');
    fetchPrescriptions();
  } catch {
    toast.error('Erro ao remover arquivo');
  }
}

onMounted(fetchPrescriptions);

function closeModal() {
  showModal.value = false;
}
</script>
