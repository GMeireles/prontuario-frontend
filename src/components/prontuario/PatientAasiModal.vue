<template>
  <BaseModal
    v-model="open"
    :title="form.id ? 'Editar Aparelho' : 'Novo Aparelho Auditivo'"
    size="lg"
    @close="$emit('close')"
  >
    <form class="space-y-4" @submit.prevent="submit">
      <FormSelect v-model="form.ear" label="Orelha" required>
        <option v-for="opt in EAR_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </FormSelect>
      <div class="grid sm:grid-cols-2 gap-3">
        <FormInput v-model="form.brand" label="Marca" />
        <FormInput v-model="form.model" label="Modelo" />
      </div>
      <FormInput v-model="form.serial_number" label="Número de série" />
      <div class="grid sm:grid-cols-2 gap-3">
        <FormInput v-model="form.power" label="Potência" />
        <FormInput v-model="form.technology" label="Tecnologia" />
      </div>
      <div class="grid sm:grid-cols-2 gap-3">
        <FormInput v-model="form.color" label="Cor" />
        <FormInput v-model="form.supplier" label="Fornecedor" />
      </div>
      <div class="grid sm:grid-cols-3 gap-3">
        <FormInput v-model="form.acquisition_date" label="Aquisição" type="date" />
        <FormInput v-model="form.adaptation_date" label="Adaptação" type="date" />
        <FormInput v-model="form.warranty_until" label="Garantia até" type="date" />
      </div>
      <FormTextarea v-model="form.notes" label="Observações" :rows="3" />
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
import { BaseModal, FormInput, FormSelect, FormTextarea, FormButton } from '../forms/index.js';
import { createPatientAasi, updatePatientAasi } from '../../api/patientAasis.js';
import { EAR_OPTIONS } from '../../composables/usePatientAasi.js';

const props = defineProps({
  modelValue: Boolean,
  patientId: { type: Number, required: true },
  aasi: { type: Object, default: null },
});

const emit = defineEmits(['update:modelValue', 'close', 'saved']);

const open = ref(props.modelValue);
const saving = ref(false);

const emptyForm = () => ({
  id: null,
  ear: 'unknown',
  brand: '',
  model: '',
  serial_number: '',
  power: '',
  technology: '',
  color: '',
  supplier: '',
  acquisition_date: '',
  adaptation_date: '',
  warranty_until: '',
  notes: '',
});

const form = ref(emptyForm());

function formatDateField(value) {
  return value ? dayjs(value).format('YYYY-MM-DD') : '';
}

watch(
  () => props.modelValue,
  (v) => {
    open.value = v;
    if (v) {
      if (props.aasi) {
        form.value = {
          ...props.aasi,
          acquisition_date: formatDateField(props.aasi.acquisition_date),
          adaptation_date: formatDateField(props.aasi.adaptation_date),
          warranty_until: formatDateField(props.aasi.warranty_until),
        };
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
      acquisition_date: form.value.acquisition_date || null,
      adaptation_date: form.value.adaptation_date || null,
      warranty_until: form.value.warranty_until || null,
    };
    delete payload.id;

    if (form.value.id) {
      await updatePatientAasi(props.patientId, form.value.id, payload);
      toast.success('Aparelho atualizado com sucesso');
    } else {
      await createPatientAasi(props.patientId, payload);
      toast.success('Aparelho cadastrado com sucesso');
    }
    emit('saved');
    open.value = false;
  } catch (e) {
    toast.error(e.response?.data?.message || e.message || 'Erro ao salvar aparelho');
  } finally {
    saving.value = false;
  }
}
</script>
