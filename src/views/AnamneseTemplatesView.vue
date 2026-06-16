<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold text-primary">Modelos de Anamnese</h1>
        <p class="text-sm text-secondary">Configure templates e campos para novas anamneses.</p>
      </div>
      <FormButton v-if="canManage" variant="primary" @click="openTemplateModal()">
        Novo modelo
      </FormButton>
    </div>

    <div v-if="!canView" class="text-secondary">Sem permissão para visualizar modelos.</div>
    <div v-else-if="loading" class="text-secondary">Carregando...</div>

    <div v-else class="space-y-4">
      <div
        v-for="tpl in templates"
        :key="tpl.id"
        class="rounded-xl border border-theme bg-secondary p-4 space-y-3"
      >
        <div class="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 class="font-semibold text-primary">{{ tpl.name }}</h2>
            <p v-if="tpl.description" class="text-sm text-secondary">{{ tpl.description }}</p>
            <div class="flex flex-wrap gap-2 mt-2">
              <span
                v-if="tpl.is_default"
                class="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
              >
                Padrão
              </span>
              <span
                class="text-xs px-2 py-0.5 rounded-full border border-theme"
                :class="tpl.active ? 'text-green-700 dark:text-green-400' : 'text-secondary'"
              >
                {{ tpl.active ? 'Ativo' : 'Inativo' }}
              </span>
            </div>
          </div>
          <div v-if="canManage" class="flex flex-wrap gap-2">
            <FormButton size="sm" variant="secondary" @click="openTemplateModal(tpl)">Editar</FormButton>
            <FormButton
              v-if="!tpl.is_default && tpl.active"
              size="sm"
              variant="secondary"
              @click="setDefault(tpl)"
            >
              Marcar padrão
            </FormButton>
            <FormButton size="sm" variant="secondary" @click="openFieldsModal(tpl)">Campos</FormButton>
          </div>
        </div>
      </div>
    </div>

    <BaseModal v-model="showTemplateModal" :title="editingTemplate ? 'Editar modelo' : 'Novo modelo'" size="md">
      <form class="space-y-4" @submit.prevent="saveTemplate">
        <FormInput v-model="templateForm.name" label="Nome" required />
        <FormTextarea v-model="templateForm.description" label="Descrição" :rows="2" />
        <label class="flex items-center gap-2 text-sm text-primary">
          <input v-model="templateForm.is_default" type="checkbox" />
          Modelo padrão
        </label>
        <label class="flex items-center gap-2 text-sm text-primary">
          <input v-model="templateForm.active" type="checkbox" />
          Ativo
        </label>
      </form>
      <template #footer>
        <FormButton variant="secondary" @click="showTemplateModal = false">Cancelar</FormButton>
        <FormButton variant="primary" :disabled="saving" @click="saveTemplate">Salvar</FormButton>
      </template>
    </BaseModal>

    <BaseModal v-model="showFieldsModal" :title="`Campos — ${selectedTemplate?.name || ''}`" size="lg">
      <div class="space-y-4">
        <div v-if="canManage" class="rounded-lg border border-theme p-3 space-y-3">
          <h3 class="font-medium text-primary">{{ editingField ? 'Editar campo' : 'Novo campo' }}</h3>
          <div class="grid sm:grid-cols-2 gap-3">
            <FormInput v-model="fieldForm.label" label="Label" required />
            <FormInput v-model="fieldForm.key" label="Key" required />
            <FormSelect v-model="fieldForm.type" label="Tipo">
              <option value="text">Texto</option>
              <option value="textarea">Texto longo</option>
              <option value="number">Número</option>
              <option value="boolean">Sim/Não</option>
              <option value="select">Seleção</option>
              <option value="date">Data</option>
            </FormSelect>
            <FormInput v-model="fieldForm.order_index" label="Ordem" type="number" />
          </div>
          <FormTextarea
            v-if="fieldForm.type === 'select'"
            v-model="fieldForm.optionsText"
            label="Opções (uma por linha)"
            :rows="3"
          />
          <label class="flex items-center gap-2 text-sm text-primary">
            <input v-model="fieldForm.required" type="checkbox" />
            Obrigatório
          </label>
          <div class="flex gap-2">
            <FormButton size="sm" variant="primary" :disabled="saving" @click="saveField">
              {{ editingField ? 'Atualizar' : 'Adicionar' }}
            </FormButton>
            <FormButton v-if="editingField" size="sm" variant="secondary" @click="resetFieldForm">
              Cancelar edição
            </FormButton>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-secondary border-b border-theme">
                <th class="py-2 pr-2">Label</th>
                <th class="py-2 pr-2">Key</th>
                <th class="py-2 pr-2">Tipo</th>
                <th class="py-2 pr-2">Obr.</th>
                <th class="py-2 pr-2">Ordem</th>
                <th v-if="canManage" class="py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="field in sortedFields"
                :key="field.id"
                class="border-b border-theme/50"
              >
                <td class="py-2 pr-2 text-primary">{{ field.label }}</td>
                <td class="py-2 pr-2 text-secondary">{{ field.key }}</td>
                <td class="py-2 pr-2 text-secondary">{{ field.type }}</td>
                <td class="py-2 pr-2">{{ field.required ? 'Sim' : 'Não' }}</td>
                <td class="py-2 pr-2">{{ field.order_index }}</td>
                <td v-if="canManage" class="py-2">
                  <button class="text-primary hover:underline mr-2" @click="editField(field)">Editar</button>
                  <button
                    v-if="field.active"
                    class="text-red-500 hover:underline"
                    @click="removeField(field)"
                  >
                    Desativar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <template #footer>
        <FormButton variant="secondary" @click="showFieldsModal = false">Fechar</FormButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { toast } from 'vue3-toastify';
import { BaseModal, FormInput, FormTextarea, FormSelect, FormButton } from '../components/forms/index.js';
import {
  listAnamneseTemplates,
  createAnamneseTemplate,
  updateAnamneseTemplate,
  addTemplateField,
  updateTemplateField,
  deleteTemplateField,
} from '../api/anamneseTemplates.js';
import { usePermissions } from '../composables/usePermissions.js';

const { can } = usePermissions();

const canView = computed(() => can('anamnese_templates.view'));
const canManage = computed(() => can('anamnese_templates.create') || can('anamnese_templates.update'));

const templates = ref([]);
const loading = ref(false);
const saving = ref(false);

const showTemplateModal = ref(false);
const editingTemplate = ref(null);
const templateForm = ref({ name: '', description: '', is_default: false, active: true });

const showFieldsModal = ref(false);
const selectedTemplate = ref(null);
const editingField = ref(null);
const fieldForm = ref({
  label: '',
  key: '',
  type: 'textarea',
  required: false,
  order_index: 0,
  optionsText: '',
});

const sortedFields = computed(() => {
  const fields = selectedTemplate.value?.fields || [];
  return [...fields].filter((f) => f.active !== false).sort((a, b) => a.order_index - b.order_index);
});

async function loadTemplates() {
  if (!canView.value) return;
  try {
    loading.value = true;
    templates.value = await listAnamneseTemplates();
  } catch {
    toast.error('Erro ao carregar modelos');
  } finally {
    loading.value = false;
  }
}

function openTemplateModal(tpl = null) {
  editingTemplate.value = tpl;
  templateForm.value = tpl
    ? { name: tpl.name, description: tpl.description || '', is_default: tpl.is_default, active: tpl.active }
    : { name: '', description: '', is_default: false, active: true };
  showTemplateModal.value = true;
}

async function saveTemplate() {
  try {
    saving.value = true;
    if (editingTemplate.value) {
      await updateAnamneseTemplate(editingTemplate.value.id, templateForm.value);
      toast.success('Modelo atualizado');
    } else {
      await createAnamneseTemplate(templateForm.value);
      toast.success('Modelo criado');
    }
    showTemplateModal.value = false;
    await loadTemplates();
  } catch (e) {
    toast.error(e?.response?.data?.message || 'Erro ao salvar modelo');
  } finally {
    saving.value = false;
  }
}

async function setDefault(tpl) {
  try {
    await updateAnamneseTemplate(tpl.id, { is_default: true, active: true });
    toast.success('Modelo definido como padrão');
    await loadTemplates();
  } catch {
    toast.error('Erro ao definir padrão');
  }
}

function openFieldsModal(tpl) {
  selectedTemplate.value = tpl;
  resetFieldForm();
  showFieldsModal.value = true;
}

function resetFieldForm() {
  editingField.value = null;
  fieldForm.value = {
    label: '',
    key: '',
    type: 'textarea',
    required: false,
    order_index: sortedFields.value.length,
    optionsText: '',
  };
}

function editField(field) {
  editingField.value = field;
  fieldForm.value = {
    label: field.label,
    key: field.key,
    type: field.type,
    required: field.required,
    order_index: field.order_index,
    optionsText: Array.isArray(field.options) ? field.options.join('\n') : '',
  };
}

function buildFieldPayload() {
  const payload = {
    label: fieldForm.value.label,
    key: fieldForm.value.key,
    type: fieldForm.value.type,
    required: fieldForm.value.required,
    order_index: Number(fieldForm.value.order_index) || 0,
  };
  if (fieldForm.value.type === 'select') {
    payload.options = fieldForm.value.optionsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return payload;
}

async function saveField() {
  if (!selectedTemplate.value) return;
  try {
    saving.value = true;
    const payload = buildFieldPayload();
    if (editingField.value) {
      await updateTemplateField(selectedTemplate.value.id, editingField.value.id, payload);
      toast.success('Campo atualizado');
    } else {
      await addTemplateField(selectedTemplate.value.id, payload);
      toast.success('Campo adicionado');
    }
    const fresh = await listAnamneseTemplates();
    templates.value = fresh;
    selectedTemplate.value = fresh.find((t) => t.id === selectedTemplate.value.id) || selectedTemplate.value;
    resetFieldForm();
  } catch (e) {
    toast.error(e?.response?.data?.message || 'Erro ao salvar campo');
  } finally {
    saving.value = false;
  }
}

async function removeField(field) {
  if (!selectedTemplate.value) return;
  try {
    await deleteTemplateField(selectedTemplate.value.id, field.id);
    toast.success('Campo desativado');
    const fresh = await listAnamneseTemplates();
    templates.value = fresh;
    selectedTemplate.value = fresh.find((t) => t.id === selectedTemplate.value.id) || selectedTemplate.value;
  } catch {
    toast.error('Erro ao desativar campo');
  }
}

onMounted(loadTemplates);
</script>
