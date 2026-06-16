<template>
  <div class="space-y-4">
    <div v-for="field in sortedFields" :key="field.id || field.key" class="w-full">
      <FormTextarea
        v-if="field.type === 'textarea'"
        :model-value="String(modelValue[field.key] ?? '')"
        :label="field.label"
        :placeholder="field.placeholder || ''"
        :required="field.required"
        :disabled="disabled"
        :hint="field.help_text || undefined"
        :rows="3"
        @update:model-value="updateField(field.key, $event)"
      />

      <FormInput
        v-else-if="field.type === 'text' || field.type === 'date' || field.type === 'number'"
        :model-value="modelValue[field.key] ?? ''"
        :label="field.label"
        :type="field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'"
        :placeholder="field.placeholder || ''"
        :required="field.required"
        :disabled="disabled"
        :hint="field.help_text || undefined"
        @update:model-value="updateField(field.key, $event)"
      />

      <FormSelect
        v-else-if="field.type === 'boolean'"
        :model-value="boolSelectValue(field.key)"
        :label="field.label"
        :required="field.required"
        :disabled="disabled"
        :hint="field.help_text || undefined"
        placeholder="Selecione"
        @update:model-value="updateBoolField(field.key, $event)"
      >
        <option value="true">Sim</option>
        <option value="false">Não</option>
      </FormSelect>

      <FormSelect
        v-else-if="field.type === 'select'"
        :model-value="modelValue[field.key] ?? ''"
        :label="field.label"
        :required="field.required"
        :disabled="disabled"
        :hint="field.help_text || undefined"
        :placeholder="field.placeholder || 'Selecione'"
        @update:model-value="updateField(field.key, $event)"
      >
        <option v-for="opt in selectOptions(field)" :key="opt" :value="opt">{{ opt }}</option>
      </FormSelect>

      <FormTextarea
        v-else
        :model-value="String(modelValue[field.key] ?? '')"
        :label="field.label"
        :placeholder="field.placeholder || ''"
        :required="field.required"
        :disabled="disabled"
        :rows="3"
        @update:model-value="updateField(field.key, $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { FormInput, FormSelect, FormTextarea } from './index.js';

const props = defineProps({
  fields: { type: Array, default: () => [] },
  modelValue: { type: Object, default: () => ({}) },
  disabled: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue']);

const sortedFields = computed(() =>
  [...props.fields].filter((f) => f.active !== false).sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
);

function updateField(key, value) {
  emit('update:modelValue', { ...props.modelValue, [key]: value });
}

function boolSelectValue(key) {
  const v = props.modelValue[key];
  if (v === true || v === 'true') return 'true';
  if (v === false || v === 'false') return 'false';
  return '';
}

function updateBoolField(key, value) {
  if (value === '') {
    const next = { ...props.modelValue };
    delete next[key];
    emit('update:modelValue', next);
    return;
  }
  updateField(key, value === 'true');
}

function selectOptions(field) {
  if (!field.options) return [];
  if (Array.isArray(field.options)) return field.options;
  if (typeof field.options === 'string') {
    return field.options.split('\n').map((s) => s.trim()).filter(Boolean);
  }
  return [];
}
</script>
