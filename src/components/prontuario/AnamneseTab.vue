<template>
  <div class="space-y-4">
    <h2 class="text-lg font-semibold text-primary">Anamnese</h2>

    <div v-if="loading" class="text-secondary">Carregando...</div>
    <div v-else-if="!anamnese">
      <p class="text-secondary mb-4">Nenhuma anamnese cadastrada.</p>
      <FormButton v-if="can('anamneses.create')" variant="primary" @click="openModal()">Adicionar Anamnese</FormButton>
    </div>
    <div v-else class="rounded-lg border border-theme bg-secondary p-4 space-y-2">
      <p class="text-primary"><strong>Queixa principal:</strong> {{ anamnese.main_complaint }}</p>
      <p class="text-primary"><strong>Histórico médico:</strong> {{ anamnese.medical_history }}</p>
      <p class="text-primary"><strong>Histórico familiar:</strong> {{ anamnese.family_history }}</p>
      <p class="text-primary"><strong>Estilo de vida:</strong> {{ anamnese.lifestyle }}</p>
      <p class="text-primary"><strong>Alergias:</strong> {{ anamnese.allergies }}</p>
      <div class="mt-4">
        <FormButton v-if="can('anamneses.update')" variant="secondary" size="sm" @click="openModal(anamnese)">Editar</FormButton>
      </div>
    </div>

    <BaseModal
      v-model="showModal"
      :title="editing ? 'Editar Anamnese' : 'Nova Anamnese'"
      size="lg"
    >
      <form @submit.prevent="saveAnamnese" class="space-y-4">
        <FormTextarea v-model="form.main_complaint" label="Queixa principal" required :rows="3" />
        <FormTextarea v-model="form.medical_history" label="Histórico médico" :rows="3" />
        <FormTextarea v-model="form.family_history" label="Histórico familiar" :rows="3" />
        <FormTextarea v-model="form.lifestyle" label="Estilo de vida" :rows="3" />
        <FormTextarea v-model="form.allergies" label="Alergias" :rows="2" />
      </form>

      <template #footer>
        <FormButton variant="secondary" @click="closeModal">Cancelar</FormButton>
        <FormButton variant="primary" @click="saveAnamnese">Salvar</FormButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { toast } from 'vue3-toastify';
import { BaseModal, FormTextarea, FormButton } from '../forms/index.js';
import {
  getAnamneseByPatient,
  createAnamnese,
  updateAnamnese,
} from '../../api/anamneses.js';
import { usePermissions } from '../../composables/usePermissions.js';

const { can } = usePermissions();
const props = defineProps({
  patientId: { type: Number, required: true },
});

const anamnese = ref(null);
const loading = ref(false);
const showModal = ref(false);
const editing = ref(false);
const form = ref({
  main_complaint: '',
  medical_history: '',
  family_history: '',
  lifestyle: '',
  allergies: '',
});

async function loadAnamnese() {
  try {
    loading.value = true;
    anamnese.value = await getAnamneseByPatient(props.patientId);
  } catch {
    anamnese.value = null;
  } finally {
    loading.value = false;
  }
}

function openModal(data = null) {
  if (data) {
    editing.value = true;
    form.value = { ...data };
  } else {
    editing.value = false;
    form.value = {
      main_complaint: '',
      medical_history: '',
      family_history: '',
      lifestyle: '',
      allergies: '',
    };
  }
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
}

async function saveAnamnese() {
  try {
    if (editing.value) {
      await updateAnamnese(form.value.id, form.value);
      toast.success('Anamnese atualizada!');
    } else {
      await createAnamnese(props.patientId, form.value);
      toast.success('Anamnese criada!');
    }
    await loadAnamnese();
    closeModal();
  } catch {
    toast.error('Erro ao salvar anamnese');
  }
}

onMounted(loadAnamnese);
</script>
