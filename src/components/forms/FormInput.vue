<template>
  <div class="form-field">
    <label v-if="label" class="form-label" :for="inputId">
      {{ label }}
      <span v-if="required" class="text-error">*</span>
    </label>
    <input
      :id="inputId"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :step="step"
      :min="min"
      :maxlength="maxLength"
      class="form-input"
      @input="handleInput($event)"
      @blur="$emit('blur', $event)"
      @focus="$emit('focus', $event)"
    />
    <div v-if="maxLength" class="flex justify-between items-center mt-1">
      <p v-if="hint" class="form-hint flex-1">{{ hint }}</p>
      <p class="form-hint text-right" :class="{ 'text-yellow-500': remainingChars < 50 && remainingChars >= 0, 'text-red-500': remainingChars < 0 }">
        {{ remainingChars >= 0 ? `${remainingChars} caracteres restantes` : `${Math.abs(remainingChars)} caracteres excedidos` }}
      </p>
    </div>
    <p v-else-if="hint" class="form-hint">{{ hint }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: [String, Number],
  label: String,
  type: { type: String, default: 'text' },
  placeholder: String,
  required: Boolean,
  disabled: Boolean,
  hint: String,
  step: [String, Number],
  min: [String, Number],
  maxLength: Number,
  id: String
});

const emit = defineEmits(['update:modelValue', 'blur', 'focus', 'change']);

const handleInput = (event) => {
  let value;
  if (props.type === 'number') {
    const numValue = parseFloat(event.target.value);
    value = isNaN(numValue) ? (event.target.value === '' ? null : 0) : numValue;
  } else {
    value = event.target.value;
    // Limita o valor se maxLength estiver definido
    if (props.maxLength && value.length > props.maxLength) {
      value = value.substring(0, props.maxLength);
    }
  }
  emit('update:modelValue', value);
  emit('change', value);
};

const inputId = computed(() => props.id || `input-${Math.random().toString(36).substr(2, 9)}`);

const remainingChars = computed(() => {
  if (!props.maxLength || props.type === 'number') return null;
  const currentLength = String(props.modelValue || '').length;
  return props.maxLength - currentLength;
});
</script>

<style scoped>
.form-field {
  @apply w-full;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--color-text-primary);
}

.form-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  border: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary);
}

.form-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: var(--color-bg-tertiary);
}

.form-input::placeholder {
  color: var(--color-text-tertiary);
}

.form-hint {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
}
</style>

