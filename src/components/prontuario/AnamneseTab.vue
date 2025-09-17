<template>
  <div class="space-y-4">
    <h2 class="text-lg font-semibold">Anamnese</h2>

    <div v-if="loading">Carregando...</div>
    <div v-else-if="!anamnese">
      <p class="text-gray-600">Nenhuma anamnese cadastrada.</p>
      <button
        @click="openModal()"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Adicionar Anamnese
      </button>
    </div>
    <div v-else class="bg-white p-4 rounded shadow">
      <p><strong>Queixa principal:</strong> {{ anamnese.main_complaint }}</p>
      <p><strong>Histórico médico:</strong> {{ anamnese.medical_history }}</p>
      <p><strong>Histórico familiar:</strong> {{ anamnese.family_history }}</p>
      <p><strong>Estilo de vida:</strong> {{ anamnese.lifestyle }}</p>
      <p><strong>Alergias:</strong> {{ anamnese.allergies }}</p>
      <div class="mt-4">
        <button
          @click="openModal(anamnese)"
          class="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Editar
        </button>
      </div>
    </div>

    <!-- Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    >
      <div class="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        <h2 class="text-xl font-bold mb-4">
          {{ editing ? "Editar Anamnese" : "Nova Anamnese" }}
        </h2>

        <form @submit.prevent="saveAnamnese" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Queixa principal</label>
            <textarea v-model="form.main_complaint" class="w-full border rounded p-2" required></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Histórico médico</label>
            <textarea v-model="form.medical_history" class="w-full border rounded p-2"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Histórico familiar</label>
            <textarea v-model="form.family_history" class="w-full border rounded p-2"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Estilo de vida</label>
            <textarea v-model="form.lifestyle" class="w-full border rounded p-2"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Alergias</label>
            <textarea v-model="form.allergies" class="w-full border rounded p-2"></textarea>
          </div>

          <div class="flex justify-end gap-2 mt-6">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import  AnamneseService  from "../../services/AnamneseService";

const props = defineProps({
  patientId: { type: Number, required: true },
});

const anamnese = ref(null);
const loading = ref(false);
const showModal = ref(false);
const editing = ref(false);
const form = ref({
  main_complaint: "",
  medical_history: "",
  family_history: "",
  lifestyle: "",
  allergies: "",
});

async function loadAnamnese() {
  try {
    loading.value = true;
    anamnese.value = await AnamneseService.getByPatient(props.patientId);
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
      main_complaint: "",
      medical_history: "",
      family_history: "",
      lifestyle: "",
      allergies: "",
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
      await AnamneseService.update(form.value.id, form.value);
      toast.success("Anamnese atualizada!");
    } else {
      await AnamneseService.create(props.patientId, form.value);
      toast.success("Anamnese criada!");
    }
    await loadAnamnese();
    closeModal();
  } catch {
    toast.error("Erro ao salvar anamnese");
  }
}

onMounted(loadAnamnese);
</script>
