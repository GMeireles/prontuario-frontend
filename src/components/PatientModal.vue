<template>
  <BaseModal
    v-model="open"
    :title="form.id ? 'Editar Paciente' : 'Novo Paciente'"
    size="lg"
    @close="$emit('close')"
  >
    <form class="space-y-4" @submit.prevent="submit">
      <FormInput v-model="form.name" label="Nome" required />
      <FormInput v-model="form.cpf" label="CPF" maxlength="11" />
      <FormSelect v-model="form.gender" label="Sexo" placeholder="Selecione...">
        <option value="M">Masculino</option>
        <option value="F">Feminino</option>
        <option value="O">Outro</option>
      </FormSelect>
      <FormInput v-model="form.birth_date" label="Data de nascimento" type="date" />
      <FormInput v-model="form.phone" label="Telefone" />
      <FormInput v-model="form.email" label="E-mail" type="email" />
      <FormInput v-model="form.address" label="Endereço" />
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <FormInput v-model="form.city" label="Cidade" />
        <FormInput v-model="form.state" label="Estado" maxlength="2" />
        <FormInput v-model="form.zip_code" label="CEP" />
      </div>
      <FormInput v-model="form.responsible_name" label="Responsável (se menor)" />
    </form>

    <template #footer>
      <FormButton variant="secondary" @click="$emit('close')">Cancelar</FormButton>
      <FormButton variant="primary" :disabled="saving" @click="submit">
        {{ saving ? 'Salvando...' : 'Salvar' }}
      </FormButton>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, watch } from 'vue';
import dayjs from 'dayjs';
import { toast } from 'vue3-toastify';
import { BaseModal, FormInput, FormSelect, FormButton } from './forms/index.js';
import { createPatient, updatePatient } from '../api/patients.js';

const props = defineProps({
  modelValue: Boolean,
  patient: { type: Object, default: null },
});

const emit = defineEmits(['update:modelValue', 'close', 'saved']);

const open = ref(props.modelValue);
const saving = ref(false);

const emptyForm = () => ({
  id: null,
  name: '',
  cpf: '',
  gender: '',
  birth_date: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  zip_code: '',
  responsible_name: '',
});

const form = ref(emptyForm());

watch(
  () => props.modelValue,
  (v) => {
    open.value = v;
    if (v) {
      if (props.patient) {
        form.value = { ...props.patient };
        if (form.value.birth_date) {
          form.value.birth_date = dayjs(form.value.birth_date).format('YYYY-MM-DD');
        }
      } else {
        form.value = emptyForm();
      }
    }
  }
);

watch(open, (v) => emit('update:modelValue', v));

async function submit() {
  try {
    saving.value = true;
    const payload = {
      ...form.value,
      birth_date: form.value.birth_date
        ? dayjs(form.value.birth_date).format('YYYY-MM-DD')
        : null,
    };

    if (form.value.id) {
      await updatePatient(form.value.id, payload);
      toast.success('Paciente atualizado com sucesso');
    } else {
      await createPatient(payload);
      toast.success('Paciente criado com sucesso');
    }

    emit('saved');
    open.value = false;
  } catch (e) {
    const msg =
      e.response?.data?.errors?.[0]?.msg ||
      e.response?.data?.error ||
      'Erro ao salvar paciente';
    toast.error(msg);
  } finally {
    saving.value = false;
  }
}
</script>
