<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <h1 class="text-xl font-bold text-primary">Clínicas</h1>
      <FormButton variant="primary" @click="openModal()">Nova Clínica</FormButton>
    </div>

    <div class="overflow-x-auto rounded-lg border border-theme bg-secondary">
      <table class="table-uniform min-w-full text-left text-sm">
        <thead class="bg-tertiary text-secondary uppercase text-xs">
          <tr>
            <th class="px-4 py-3">Nome</th>
            <th class="px-4 py-3">CNPJ</th>
            <th class="px-4 py-3">Telefone</th>
            <th class="px-4 py-3">Plano</th>
            <th class="px-4 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in tenants" :key="t.id" class="table-row-uniform border-t border-theme">
            <td class="px-4 py-3 text-primary">{{ t.name }}</td>
            <td class="px-4 py-3 text-secondary">{{ t.cnpj || '-' }}</td>
            <td class="px-4 py-3 text-secondary">{{ t.phone || '-' }}</td>
            <td class="px-4 py-3 text-secondary">{{ t.plan || '-' }}</td>
            <td class="px-4 py-3 text-right">
              <div class="flex flex-wrap justify-end gap-2">
                <FormButton size="sm" variant="secondary" @click="openModal(t)">Editar</FormButton>
                <FormButton size="sm" variant="danger" @click="removeTenant(t.id)">Excluir</FormButton>
              </div>
            </td>
          </tr>
          <tr v-if="tenants.length === 0">
            <td colspan="5" class="px-4 py-6 text-center text-secondary">
              Nenhuma clínica cadastrada.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <BaseModal
      v-model="showModal"
      :title="editing ? 'Editar Clínica' : 'Nova Clínica'"
      size="md"
    >
      <form @submit.prevent="saveTenant" class="space-y-4">
        <FormInput v-model="form.name" label="Nome" required />
        <FormInput v-model="form.cnpj" label="CNPJ" />
        <FormInput v-model="form.phone" label="Telefone" />
        <FormInput v-model="form.plan" label="Plano" />
      </form>

      <template #footer>
        <FormButton variant="secondary" @click="closeModal">Cancelar</FormButton>
        <FormButton variant="primary" @click="saveTenant">Salvar</FormButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { toast } from 'vue3-toastify';
import { BaseModal, FormInput, FormButton } from '../components/forms/index.js';
import { listTenants, createTenant, updateTenant, deleteTenant } from '../api/tenants.js';

const tenants = ref([]);
const showModal = ref(false);
const editing = ref(false);
const form = ref({
  id: null,
  name: '',
  cnpj: '',
  phone: '',
  plan: '',
});

async function loadTenants() {
  try {
    tenants.value = await listTenants();
  } catch {
    toast.error('Erro ao carregar clínicas');
  }
}

function openModal(tenant = null) {
  if (tenant) {
    editing.value = true;
    form.value = { ...tenant };
  } else {
    editing.value = false;
    form.value = { id: null, name: '', cnpj: '', phone: '', plan: '' };
  }
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
}

async function saveTenant() {
  try {
    if (editing.value) {
      await updateTenant(form.value.id, form.value);
      toast.success('Clínica atualizada!');
    } else {
      await createTenant(form.value);
      toast.success('Clínica criada!');
    }
    await loadTenants();
    closeModal();
  } catch {
    toast.error('Erro ao salvar clínica');
  }
}

async function removeTenant(id) {
  if (confirm('Deseja excluir esta clínica?')) {
    try {
      await deleteTenant(id);
      toast.success('Clínica excluída!');
      await loadTenants();
    } catch {
      toast.error('Erro ao excluir clínica');
    }
  }
}

onMounted(loadTenants);
</script>
