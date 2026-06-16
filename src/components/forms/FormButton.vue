<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="buttonClasses"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'primary', // primary, secondary, danger, ghost
    validator: (v) => ['primary', 'secondary', 'danger', 'ghost'].includes(v)
  },
  type: {
    type: String,
    default: 'button'
  },
  disabled: Boolean,
  size: {
    type: String,
    default: 'md', // sm, md, lg
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  }
});

defineEmits(['click']);

const buttonClasses = computed(() => {
  const base = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-primary-color text-white border border-primary hover:bg-primary-color-hover disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'bg-secondary text-primary border border-theme hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed',
    danger: 'bg-error text-white border border-error hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed',
    ghost: 'bg-transparent text-primary hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  return `${base} ${variants[props.variant]} ${sizes[props.size]}`;
});
</script>

