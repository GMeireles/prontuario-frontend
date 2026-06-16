<template>
  <div class="space-y-4">
    <h2 class="text-lg font-semibold text-primary">Evoluções Clínicas</h2>

    <div class="rounded-lg border border-theme bg-secondary p-4 space-y-3">
      <FormTextarea
        v-model="newNote"
        placeholder="Escreva a evolução clínica..."
        :rows="4"
      />
      <FormButton variant="primary" :disabled="loading" @click="addEvolution">
        Salvar Evolução
      </FormButton>
    </div>

    <div v-if="loading" class="text-secondary">Carregando evoluções...</div>
    <div v-else-if="evolutions.length === 0" class="text-secondary">
      Nenhuma evolução registrada ainda.
    </div>
    <ul v-else class="space-y-3">
      <li
        v-for="ev in evolutions"
        :key="ev.id"
        class="rounded-lg border border-theme bg-secondary p-4"
      >
        <div v-if="editingId === ev.id" class="space-y-2">
          <FormTextarea v-model="editNote" :rows="4" />
          <div class="flex justify-end gap-2">
            <FormButton size="sm" variant="primary" @click="updateEvolution(ev.id)">Salvar</FormButton>
            <FormButton size="sm" variant="secondary" @click="cancelEdit">Cancelar</FormButton>
          </div>
        </div>
        <div v-else>
          <p class="text-primary whitespace-pre-line">{{ ev.note }}</p>
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mt-2 text-sm text-secondary">
            <span>{{ formatDate(ev.created_at) }} — {{ ev.professional?.name || 'Profissional' }}</span>
            <div class="flex gap-3">
              <button type="button" class="text-primary-color hover:underline" @click="startEdit(ev)">
                Editar
              </button>
              <button type="button" class="text-error hover:underline" @click="removeEvolution(ev.id)">
                Excluir
              </button>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { toast } from 'vue3-toastify';
import { FormTextarea, FormButton } from '../forms/index.js';
import {
  listEvolutionsByPatient,
  createEvolution,
  updateEvolution as updateEvolutionAPI,
  deleteEvolution,
} from '../../api/evolutions.js';

const props = defineProps({
  patientId: { type: Number, required: true },
});

const evolutions = ref([]);
const newNote = ref('');
const loading = ref(false);
const editingId = ref(null);
const editNote = ref('');

function formatDate(date) {
  if (!date) return 'Data inválida';
  try {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Data inválida';
  }
}

async function loadEvolutions() {
  loading.value = true;
  try {
    evolutions.value = (await listEvolutionsByPatient(props.patientId)) || [];
  } catch {
    evolutions.value = [];
    toast.error('Erro ao carregar evoluções');
  } finally {
    loading.value = false;
  }
}

async function addEvolution() {
  if (!newNote.value.trim()) {
    return toast.error('A evolução não pode estar vazia');
  }
  try {
    await createEvolution(props.patientId, { note: newNote.value });
    toast.success('Evolução adicionada com sucesso!');
    newNote.value = '';
    await loadEvolutions();
  } catch {
    toast.error('Erro ao adicionar evolução');
  }
}

async function removeEvolution(id) {
  if (!confirm('Tem certeza que deseja excluir esta evolução?')) return;
  try {
    await deleteEvolution(id);
    toast.success('Evolução excluída com sucesso!');
    await loadEvolutions();
  } catch {
    toast.error('Erro ao excluir evolução');
  }
}

function startEdit(ev) {
  editingId.value = ev.id;
  editNote.value = ev.note;
}

function cancelEdit() {
  editingId.value = null;
  editNote.value = '';
}

async function updateEvolution(id) {
  if (!editNote.value.trim()) {
    return toast.error('A evolução não pode estar vazia');
  }
  try {
    await updateEvolutionAPI(id, { note: editNote.value });
    toast.success('Evolução atualizada com sucesso!');
    editingId.value = null;
    editNote.value = '';
    await loadEvolutions();
  } catch {
    toast.error('Erro ao atualizar evolução');
  }
}

onMounted(loadEvolutions);
</script>
