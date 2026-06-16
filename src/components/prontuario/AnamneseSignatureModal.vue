<template>
  <BaseModal v-model="open" title="Assinar anamnese" size="md">
    <form class="space-y-4" @submit.prevent="submit">
      <p class="text-sm text-secondary">
        Ao assinar, o conteúdo da anamnese será bloqueado para edição.
      </p>
      <FormInput
        v-model="form.typedName"
        label="Nome completo para assinatura"
        required
        :disabled="saving"
      />
      <FormInput
        v-model="form.signerDocument"
        label="Documento (opcional)"
        :disabled="saving"
      />
      <FormTextarea
        v-model="form.confirmationText"
        label="Confirmação"
        :hint="confirmationHint"
        required
        :rows="2"
        :disabled="saving"
      />
    </form>

    <template #footer>
      <FormButton variant="secondary" :disabled="saving" @click="open = false">Cancelar</FormButton>
      <FormButton variant="primary" :disabled="saving" @click="submit">
        {{ saving ? 'Assinando...' : 'Confirmar assinatura' }}
      </FormButton>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { toast } from 'vue3-toastify';
import { BaseModal, FormInput, FormTextarea, FormButton } from '../forms/index.js';
import { signAnamnese } from '../../api/anamneses.js';

const CONFIRMATION_TEXT = 'Eu confirmo a veracidade das informações';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  anamneseId: { type: Number, default: null }
});

const emit = defineEmits(['update:modelValue', 'signed']);

const open = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
});

const saving = ref(false);
const form = ref({
  typedName: '',
  signerDocument: '',
  confirmationText: ''
});

const confirmationHint = `Digite exatamente: "${CONFIRMATION_TEXT}"`;

watch(() => props.modelValue, (visible) => {
  if (visible) {
    form.value = { typedName: '', signerDocument: '', confirmationText: '' };
  }
});

async function submit() {
  if (!props.anamneseId) return;
  try {
    saving.value = true;
    const result = await signAnamnese(props.anamneseId, form.value);
    toast.success('Anamnese assinada com sucesso!');
    open.value = false;
    emit('signed', result);
  } catch (e) {
    toast.error(e?.response?.data?.message || 'Erro ao assinar anamnese');
  } finally {
    saving.value = false;
  }
}
</script>
