<template>
  <div class="form-field">
    <label v-if="label" class="form-label" :for="inputId">
      {{ label }}
      <span v-if="required" class="text-error">*</span>
    </label>
    <input
      :id="inputId"
      type="text"
      inputmode="decimal"
      autocomplete="off"
      :value="text"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :class="['form-input', inputClass]"
      @focus="onFocus"
      @blur="onBlur"
      @input="onInput"
    />
    <p v-if="hint" class="form-hint">{{ hint }}</p>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { formatBrlMoneyInput, parseBrlMoneyInput } from '../../utils/brlMoneyInput.js';

const props = defineProps({
  modelValue: { type: [Number, String], default: null },
  label: String,
  required: Boolean,
  disabled: Boolean,
  hint: String,
  /** Dica visual; o símbolo R$ só aparece após digitar ou ao sair do campo. */
  placeholder: { type: String, default: '0,00' },
  id: String,
  /** Classes extras no input (ex.: text-right) */
  inputClass: { type: String, default: '' },
  min: { type: [Number, String], default: null },
  max: { type: [Number, String], default: null },
  /** No blur, valor vazio vira 0 (útil para preço unitário / custos no orçamento). */
  emptyAsZero: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue', 'blur', 'focus', 'change']);

const text = ref('');
const focused = ref(false);

const inputId = computed(() => props.id || `money-input-${Math.random().toString(36).slice(2, 11)}`);

function normalizeModel(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function syncFromModel() {
  const n = normalizeModel(props.modelValue);
  if (n === null) {
    text.value = '';
    return;
  }
  // Com emptyAsZero, zero não precisa aparecer como "R$ 0,00" até o usuário sair do campo.
  if (n === 0 && props.emptyAsZero) {
    text.value = '';
    return;
  }
  text.value = formatBrlMoneyInput(n);
}

watch(
  () => props.modelValue,
  () => {
    if (!focused.value) syncFromModel();
  },
  { immediate: true },
);

function onFocus(e) {
  focused.value = true;
  const n = normalizeModel(props.modelValue);
  // Evita "R$ 0,00" fixo ao entrar no campo: campo vazio para digitar de imediato.
  if (n === null || n === 0) {
    text.value = '';
  }
  emit('focus', e);
}

function onInput(e) {
  if (props.disabled) return;
  text.value = e.target.value;
  const parsed = parseBrlMoneyInput(e.target.value);
  emit('update:modelValue', parsed);
  emit('change', parsed);
}

function clamp(n) {
  if (n == null) return null;
  let out = n;
  if (props.min != null && props.min !== '') {
    const lo = Number(props.min);
    if (Number.isFinite(lo) && out < lo) out = lo;
  }
  if (props.max != null && props.max !== '') {
    const hi = Number(props.max);
    if (Number.isFinite(hi) && out > hi) out = hi;
  }
  return out;
}

function onBlur(e) {
  focused.value = false;
  let parsed = parseBrlMoneyInput(text.value);
  if (parsed === null && props.emptyAsZero) parsed = 0;
  parsed = clamp(parsed);
  if (parsed !== normalizeModel(props.modelValue)) {
    emit('update:modelValue', parsed);
    emit('change', parsed);
  }
  if (parsed === null) {
    text.value = '';
  } else if (parsed === 0 && props.emptyAsZero) {
    text.value = '';
  } else {
    text.value = formatBrlMoneyInput(parsed);
  }
  emit('blur', e);
}
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
.form-hint {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
}
</style>
