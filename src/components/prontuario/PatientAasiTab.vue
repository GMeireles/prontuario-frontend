<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-2">
      <h2 class="text-lg font-semibold text-primary">AASI / Aparelhos Auditivos</h2>
      <FormButton
        v-if="can('aasis.create')"
        class="ml-auto"
        variant="primary"
        size="sm"
        @click="openModal()"
      >
        + Novo aparelho
      </FormButton>
    </div>

    <div v-if="loading" class="text-secondary">Carregando aparelhos...</div>
    <div v-else-if="items.length === 0" class="text-secondary">
      Nenhum aparelho cadastrado para este paciente.
    </div>
    <ul v-else class="space-y-3">
      <li
        v-for="item in items"
        :key="item.id"
        class="p-4 rounded-lg border border-theme bg-secondary"
        :class="item.active === false ? 'opacity-60' : ''"
      >
        <div class="flex flex-wrap items-start gap-2">
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-primary">
              {{ item.brand || 'Marca não informada' }}
              <span v-if="item.model" class="text-secondary font-normal">— {{ item.model }}</span>
              <span v-if="item.active === false" class="ml-2 text-xs text-warning">(Inativo)</span>
            </p>
            <p class="text-sm text-secondary mt-1">
              Orelha: {{ earLabel(item.ear) }}
              <span v-if="item.serial_number"> | Série: {{ item.serial_number }}</span>
            </p>
            <p class="text-sm text-secondary">
              <span v-if="item.power">Potência: {{ item.power }} </span>
              <span v-if="item.technology">| Tecnologia: {{ item.technology }}</span>
            </p>
            <p class="text-xs text-tertiary mt-1">
              Adaptação: {{ formatDate(item.adaptation_date) }}
              <span v-if="item.warranty_until"> | Garantia: {{ formatDate(item.warranty_until) }}</span>
            </p>
          </div>
          <div class="flex gap-2">
            <FormButton v-if="can('aasis.update')" size="sm" variant="secondary" @click="openModal(item)">
              Editar
            </FormButton>
            <FormButton
              v-if="can('aasis.delete') && item.active !== false"
              size="sm"
              variant="danger"
              @click="deactivate(item)"
            >
              Desativar
            </FormButton>
          </div>
        </div>
      </li>
    </ul>

    <PatientAasiModal
      v-model="showModal"
      :patient-id="patientId"
      :aasi="editing"
      @saved="fetchItems"
      @close="closeModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { toast } from 'vue3-toastify';
import { FormButton } from '../forms/index.js';
import PatientAasiModal from './PatientAasiModal.vue';
import { listPatientAasis, deactivatePatientAasi } from '../../api/patientAasis.js';
import { usePermissions } from '../../composables/usePermissions.js';
import { earLabel, formatDate } from '../../composables/usePatientAasi.js';

const props = defineProps({
  patientId: { type: Number, required: true },
});

const { can } = usePermissions();
const items = ref([]);
const loading = ref(true);
const showModal = ref(false);
const editing = ref(null);

async function fetchItems() {
  loading.value = true;
  try {
    items.value = await listPatientAasis(props.patientId);
  } catch {
    toast.error('Erro ao carregar aparelhos');
  } finally {
    loading.value = false;
  }
}

function openModal(item = null) {
  editing.value = item;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  editing.value = null;
}

async function deactivate(item) {
  if (!confirm('Desativar este aparelho?')) return;
  try {
    await deactivatePatientAasi(props.patientId, item.id);
    toast.success('Aparelho desativado');
    await fetchItems();
  } catch {
    toast.error('Erro ao desativar aparelho');
  }
}

onMounted(fetchItems);
</script>
