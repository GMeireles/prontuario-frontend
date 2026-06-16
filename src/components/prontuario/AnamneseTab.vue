<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-2">
      <h2 class="text-lg font-semibold text-primary">Anamnese</h2>
      <span
        v-if="anamnese?.isLegacy"
        class="text-xs px-2 py-0.5 rounded-full border border-theme bg-tertiary text-secondary"
      >
        Modelo legado
      </span>
      <span
        v-if="anamnese?.locked_at"
        class="text-xs px-2 py-0.5 rounded-full border border-green-600/30 bg-green-500/10 text-green-700 dark:text-green-400"
      >
        Assinada
      </span>
    </div>

    <div v-if="loading" class="text-secondary">Carregando...</div>

    <div v-else-if="!anamnese">
      <p class="text-secondary mb-4">Nenhuma anamnese cadastrada.</p>
      <FormButton v-if="can('anamneses.create')" variant="primary" @click="startCreate">
        Adicionar Anamnese
      </FormButton>
    </div>

    <div v-else>
      <div v-if="anamnese.locked_at" class="text-sm text-secondary mb-3">
        Assinada em {{ formatDate(anamnese.signed_at) }}
        <span v-if="anamnese.signer?.name"> por {{ anamnese.signer.name }}</span>
        <span v-else-if="anamnese.professional?.name"> por {{ anamnese.professional.name }}</span>
      </div>

      <div v-if="editing && !isLocked" class="space-y-4">
        <template v-if="anamnese.isLegacy">
          <FormTextarea v-model="form.main_complaint" label="Queixa principal" required :rows="3" />
          <FormTextarea v-model="form.medical_history" label="Histórico médico" :rows="3" />
          <FormTextarea v-model="form.family_history" label="Histórico familiar" :rows="3" />
          <FormTextarea v-model="form.lifestyle" label="Estilo de vida" :rows="3" />
          <FormTextarea v-model="form.allergies" label="Alergias" :rows="2" />
        </template>
        <template v-else>
          <p v-if="anamnese.template?.name" class="text-sm text-secondary">
            Modelo: {{ anamnese.template.name }}
          </p>
          <DynamicFormRenderer
            v-model="flexAnswers"
            :fields="templateFields"
          />
        </template>

        <div class="flex flex-wrap gap-2">
          <FormButton variant="primary" :disabled="saving" @click="saveAnamnese">
            {{ saving ? 'Salvando...' : 'Salvar' }}
          </FormButton>
          <FormButton variant="secondary" @click="cancelEdit">Cancelar</FormButton>
        </div>
      </div>

      <div v-else class="rounded-lg border border-theme bg-secondary p-4 space-y-3">
        <AnamneseLegacyView v-if="anamnese.isLegacy" :anamnese="anamnese" />

        <div v-else class="space-y-2">
          <p v-if="anamnese.template?.name" class="text-sm text-secondary mb-2">
            Modelo: {{ anamnese.template.name }}
          </p>
          <div
            v-for="field in templateFields"
            :key="field.key"
            class="text-primary"
          >
            <strong>{{ field.label }}:</strong>
            {{ displayAnswer(field.key) }}
          </div>
        </div>

        <div class="flex flex-wrap gap-2 mt-4">
          <FormButton
            v-if="can('anamneses.update') && !isLocked"
            variant="secondary"
            size="sm"
            @click="startEdit"
          >
            Editar
          </FormButton>
          <FormButton
            v-if="can('signatures.create') && !isLocked"
            variant="primary"
            size="sm"
            @click="showSignModal = true"
          >
            Assinar
          </FormButton>
        </div>
      </div>
    </div>

    <BaseModal
      v-model="showCreateModal"
      title="Nova Anamnese"
      size="lg"
    >
      <div v-if="createMode === 'legacy'" class="space-y-4">
        <FormTextarea v-model="form.main_complaint" label="Queixa principal" required :rows="3" />
        <FormTextarea v-model="form.medical_history" label="Histórico médico" :rows="3" />
        <FormTextarea v-model="form.family_history" label="Histórico familiar" :rows="3" />
        <FormTextarea v-model="form.lifestyle" label="Estilo de vida" :rows="3" />
        <FormTextarea v-model="form.allergies" label="Alergias" :rows="2" />
      </div>
      <div v-else class="space-y-4">
        <p v-if="defaultTemplate?.name" class="text-sm text-secondary">
          Modelo: {{ defaultTemplate.name }}
        </p>
        <DynamicFormRenderer
          v-model="flexAnswers"
          :fields="defaultTemplate?.fields || []"
        />
      </div>

      <template #footer>
        <FormButton variant="secondary" @click="showCreateModal = false">Cancelar</FormButton>
        <FormButton variant="primary" :disabled="saving" @click="saveNewAnamnese">
          {{ saving ? 'Salvando...' : 'Salvar' }}
        </FormButton>
      </template>
    </BaseModal>

    <AnamneseSignatureModal
      v-model="showSignModal"
      :anamnese-id="anamnese?.id"
      @signed="onSigned"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { toast } from 'vue3-toastify';
import { BaseModal, FormTextarea, FormButton } from '../forms/index.js';
import DynamicFormRenderer from '../forms/DynamicFormRenderer.vue';
import AnamneseLegacyView from './AnamneseLegacyView.vue';
import AnamneseSignatureModal from './AnamneseSignatureModal.vue';
import {
  getAnamneseByPatient,
  createAnamnese,
  updateAnamnese,
} from '../../api/anamneses.js';
import { listAnamneseTemplates } from '../../api/anamneseTemplates.js';
import { usePermissions } from '../../composables/usePermissions.js';

const { can } = usePermissions();
const props = defineProps({
  patientId: { type: Number, required: true },
});

const anamnese = ref(null);
const loading = ref(false);
const saving = ref(false);
const editing = ref(false);
const showCreateModal = ref(false);
const showSignModal = ref(false);
const createMode = ref('flex');
const defaultTemplate = ref(null);

const form = ref({
  main_complaint: '',
  medical_history: '',
  family_history: '',
  lifestyle: '',
  allergies: '',
});

const flexAnswers = ref({});

const isLocked = computed(() => !!anamnese.value?.locked_at);

const templateFields = computed(() => {
  const fields = anamnese.value?.template?.fields || [];
  return [...fields].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
});

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('pt-BR');
}

function displayAnswer(key) {
  const map = anamnese.value?.answersMap || {};
  const val = map[key];
  if (val === true) return 'Sim';
  if (val === false) return 'Não';
  if (val === null || val === undefined || val === '') return '—';
  return String(val);
}

function initFlexAnswers(data) {
  flexAnswers.value = { ...(data?.answersMap || {}) };
}

async function loadDefaultTemplate() {
  try {
    const templates = await listAnamneseTemplates({ active: 'true' });
    defaultTemplate.value = templates.find((t) => t.is_default) || templates[0] || null;
    createMode.value = defaultTemplate.value ? 'flex' : 'legacy';
  } catch {
    defaultTemplate.value = null;
    createMode.value = 'legacy';
  }
}

async function loadAnamnese() {
  try {
    loading.value = true;
    anamnese.value = await getAnamneseByPatient(props.patientId);
    if (anamnese.value) {
      form.value = {
        id: anamnese.value.id,
        main_complaint: anamnese.value.main_complaint || '',
        medical_history: anamnese.value.medical_history || '',
        family_history: anamnese.value.family_history || '',
        lifestyle: anamnese.value.lifestyle || '',
        allergies: anamnese.value.allergies || '',
      };
      initFlexAnswers(anamnese.value);
    }
  } catch {
    anamnese.value = null;
  } finally {
    loading.value = false;
  }
}

function startCreate() {
  form.value = {
    main_complaint: '',
    medical_history: '',
    family_history: '',
    lifestyle: '',
    allergies: '',
  };
  flexAnswers.value = {};
  showCreateModal.value = true;
}

function startEdit() {
  editing.value = true;
  if (anamnese.value?.isLegacy) {
    form.value = {
      id: anamnese.value.id,
      main_complaint: anamnese.value.main_complaint || '',
      medical_history: anamnese.value.medical_history || '',
      family_history: anamnese.value.family_history || '',
      lifestyle: anamnese.value.lifestyle || '',
      allergies: anamnese.value.allergies || '',
    };
  } else {
    initFlexAnswers(anamnese.value);
  }
}

function cancelEdit() {
  editing.value = false;
}

async function saveAnamnese() {
  if (!anamnese.value?.id) return;
  try {
    saving.value = true;
    if (anamnese.value.isLegacy) {
      await updateAnamnese(anamnese.value.id, form.value);
    } else {
      await updateAnamnese(anamnese.value.id, { answers: flexAnswers.value });
    }
    toast.success('Anamnese atualizada!');
    editing.value = false;
    await loadAnamnese();
  } catch (e) {
    toast.error(e?.response?.data?.message || 'Erro ao salvar anamnese');
  } finally {
    saving.value = false;
  }
}

async function saveNewAnamnese() {
  try {
    saving.value = true;
    if (createMode.value === 'legacy') {
      await createAnamnese(props.patientId, form.value);
    } else {
      await createAnamnese(props.patientId, {
        templateId: defaultTemplate.value?.id,
        answers: flexAnswers.value,
      });
    }
    toast.success('Anamnese criada!');
    showCreateModal.value = false;
    await loadAnamnese();
  } catch (e) {
    toast.error(e?.response?.data?.message || 'Erro ao criar anamnese');
  } finally {
    saving.value = false;
  }
}

function onSigned(result) {
  anamnese.value = result;
  editing.value = false;
}

onMounted(async () => {
  await Promise.all([loadAnamnese(), loadDefaultTemplate()]);
});
</script>
