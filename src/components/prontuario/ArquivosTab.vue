<template>
  <div class="space-y-4">
    <h2 class="text-lg font-semibold text-primary">Arquivos / Exames</h2>

    <div class="flex flex-col sm:flex-row sm:items-center gap-3">
      <FormSelect v-model="selectedType" placeholder="Selecione o tipo" class="max-w-xs">
        <option value="exam">Exame</option>
        <option value="image">Imagem / Raio-X / Ultrassom</option>
        <option value="document">Documento / Atestado / Encaminhamento</option>
        <option value="other">Outro</option>
      </FormSelect>

      <label class="inline-flex items-center px-4 py-2 rounded-lg border border-theme bg-tertiary text-primary cursor-pointer hover:bg-hover transition text-sm">
        Enviar Arquivo
        <input type="file" class="hidden" ref="fileInput" @change="handleUpload" />
      </label>
    </div>

    <div v-if="loading" class="text-secondary">Carregando arquivos...</div>
    <div v-else-if="files.length === 0" class="text-secondary">
      Nenhum arquivo enviado ainda.
    </div>
    <ul v-else class="space-y-3">
      <li
        v-for="file in files"
        :key="file.id"
        class="rounded-lg border border-theme bg-secondary p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
      >
        <div class="min-w-0">
          <p class="font-semibold capitalize text-primary">{{ file.type }}</p>
          <p class="text-xs text-secondary">{{ formatDate(file.created_at || file.createdAt) }}</p>
        </div>
        <div class="flex gap-3 shrink-0">
          <button type="button" class="text-primary-color hover:underline text-sm" @click="downloadFile(file.id, file.filename)">
            Baixar
          </button>
          <button type="button" class="text-error hover:underline text-sm" @click="removeFile(file.id)">
            Excluir
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { toast } from 'vue3-toastify';
import { FormSelect } from '../forms/index.js';
import {
  listFilesByPatient,
  uploadFile,
  downloadFile as downloadFileAPI,
  deleteFile,
} from '../../api/files.js';

const props = defineProps({
  patientId: { type: Number, required: true },
});

const files = ref([]);
const loading = ref(false);
const fileInput = ref(null);
const selectedType = ref('');

function formatDate(date) {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function loadFiles() {
  loading.value = true;
  try {
    const res = await listFilesByPatient(props.patientId);
    files.value = Array.isArray(res) ? res : res?.data || [];
  } catch {
    files.value = [];
    toast.error('Erro ao carregar arquivos');
  } finally {
    loading.value = false;
  }
}

async function handleUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (!selectedType.value) {
    toast.error('Selecione o tipo de arquivo');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('patient_id', props.patientId);
    formData.append('type', selectedType.value);

    await uploadFile(formData);
    toast.success('Arquivo enviado com sucesso!');
    await loadFiles();
  } catch {
    toast.error('Erro ao enviar arquivo');
  }
}

async function downloadFile(id, filename) {
  try {
    await downloadFileAPI(id, filename);
  } catch {
    toast.error('Erro ao baixar arquivo');
  }
}

async function removeFile(id) {
  if (!confirm('Tem certeza que deseja excluir este arquivo?')) return;
  try {
    await deleteFile(id);
    toast.success('Arquivo removido com sucesso!');
    await loadFiles();
  } catch {
    toast.error('Erro ao remover arquivo');
  }
}

onMounted(loadFiles);
</script>
