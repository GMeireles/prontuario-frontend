<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="handleCancel">
      <div class="bg-primary rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-theme">
        <div class="px-6 py-4 border-b border-theme flex justify-between items-center bg-secondary">
          <h3 class="text-lg font-bold text-primary">{{ title }}</h3>
          <button @click="handleCancel" class="text-tertiary hover:text-error transition">&times;</button>
        </div>

        <div class="p-6">
          <p class="text-secondary mb-2">{{ message }}</p>
          <p v-if="details" class="text-sm text-tertiary">{{ details }}</p>
        </div>

        <div class="px-6 py-4 bg-secondary flex justify-end gap-3 border-t border-theme">
          <FormButton variant="secondary" @click="handleCancel">
            {{ cancelText }}
          </FormButton>
          <FormButton
            :variant="confirmType === 'danger' ? 'danger' : 'primary'"
            :disabled="loading"
            @click="handleConfirm"
          >
            {{ loading ? 'Processando...' : confirmText }}
          </FormButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import FormButton from './forms/FormButton.vue';

const props = defineProps({
  modelValue: Boolean,
  title: { type: String, default: 'Confirmar ação' },
  message: { type: String, required: true },
  details: { type: String, default: '' },
  confirmText: { type: String, default: 'Confirmar' },
  cancelText: { type: String, default: 'Cancelar' },
  confirmType: { type: String, default: 'primary', validator: (v) => ['primary', 'danger'].includes(v) },
  loading: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);

const handleConfirm = () => {
  emit('confirm');
};

const handleCancel = () => {
  emit('cancel');
  emit('update:modelValue', false);
};
</script>

<style scoped>
/* Estilos já estão usando classes do tema */
</style>
