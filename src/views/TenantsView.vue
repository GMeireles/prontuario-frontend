<template>
  <BaseLayout>
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">Clínicas</h1>
        <button
          type="button"
          @click="openModal()"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Nova Clínica
        </button>
      </div>

      <!-- Lista -->
      <div class="overflow-x-auto bg-white rounded-lg shadow">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th class="px-4 py-3">Nome</th>
              <th class="px-4 py-3">CNPJ</th>
              <th class="px-4 py-3">Telefone</th>
              <th class="px-4 py-3">Plano</th>
              <th class="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="t in tenants"
              :key="t.id"
              class="border-b hover:bg-gray-50"
            >
              <td class="px-4 py-3">{{ t.name }}</td>
              <td class="px-4 py-3">{{ t.cnpj || '-' }}</td>
              <td class="px-4 py-3">{{ t.phone || '-' }}</td>
              <td class="px-4 py-3">{{ t.plan || '-' }}</td>
              <td class="px-4 py-3 text-right space-x-2">
                <button
                  @click="openModal(t)"
                  class="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Editar
                </button>
                <button
                  @click="removeTenant(t.id)"
                  class="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Excluir
                </button>
              </td>
            </tr>
            <tr v-if="tenants.length === 0">
              <td colspan="5" class="px-4 py-6 text-center text-gray-500">
                Nenhuma clínica cadastrada.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal -->
      <div
        v-if="showModal"
        class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      >
        <div class="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
          <h2 class="text-xl font-bold mb-4">
            {{ editing ? "Editar Clínica" : "Nova Clínica" }}
          </h2>

          <form @submit.prevent="saveTenant" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1">Nome</label>
              <input
                v-model="form.name"
                type="text"
                class="w-full border rounded p-2"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">CNPJ</label>
              <input
                v-model="form.cnpj"
                type="text"
                class="w-full border rounded p-2"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Telefone</label>
              <input
                v-model="form.phone"
                type="text"
                class="w-full border rounded p-2"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Plano</label>
              <input
                v-model="form.plan"
                type="text"
                class="w-full border rounded p-2"
              />
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
  </BaseLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { TenantService } from "../services/TenantService";
import BaseLayout from "../layouts/BaseLayout.vue";

const tenants = ref([]);
const showModal = ref(false);
const editing = ref(false);
const form = ref({
  id: null,
  name: "",
  cnpj: "",
  phone: "",
  plan: "",
});

async function loadTenants() {
  try {
    tenants.value = await TenantService.list();
  } catch {
    toast.error("Erro ao carregar clínicas");
  }
}

function openModal(tenant = null) {
  if (tenant) {
    editing.value = true;
    form.value = { ...tenant };
  } else {
    editing.value = false;
    form.value = { id: null, name: "", cnpj: "", phone: "", plan: "" };
  }
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
}

async function saveTenant() {
  try {
    if (editing.value) {
      await TenantService.update(form.value.id, form.value);
      toast.success("Clínica atualizada!");
    } else {
      await TenantService.create(form.value);
      toast.success("Clínica criada!");
    }
    await loadTenants();
    closeModal();
  } catch {
    toast.error("Erro ao salvar clínica");
  }
}

async function removeTenant(id) {
  if (confirm("Deseja excluir esta clínica?")) {
    try {
      await TenantService.remove(id);
      toast.success("Clínica excluída!");
      await loadTenants();
    } catch {
      toast.error("Erro ao excluir clínica");
    }
  }
}

onMounted(loadTenants);
</script>
