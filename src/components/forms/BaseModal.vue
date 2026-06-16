<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] backdrop-blur-[2px]"
      @click.self="props.closeOnClickOutside ? handleClose : undefined"
    >
      <div
        class="flex max-h-[min(90dvh,90vh)] min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-xl border border-theme bg-primary shadow-lg z-[70]"
        :class="sizeClass"
      >
        <div
          v-if="showHeader"
          class="flex shrink-0 flex-wrap items-start justify-between gap-2 border-b border-theme bg-secondary px-4 py-3 sm:items-center sm:gap-3 sm:px-6 sm:py-4"
        >
          <h3 class="m-0 min-w-0 flex-1 pr-2 text-base font-semibold text-primary sm:text-xl">
            <slot name="title">{{ title }}</slot>
          </h3>
          <button
            v-if="showCloseButton"
            type="button"
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-theme bg-secondary text-lg leading-none text-primary transition-colors hover:bg-hover"
            @click="handleClose"
          >
            ✕
          </button>
        </div>

        <div
          class="modal-content min-h-0 min-w-0 flex-1 overflow-y-auto p-4 text-primary [-webkit-overflow-scrolling:touch] sm:p-6"
        >
          <slot />
        </div>

        <div
          v-if="$slots.footer"
          class="flex shrink-0 flex-row flex-wrap justify-end gap-2 border-t border-theme bg-secondary px-4 py-3 sm:gap-3 sm:px-6 sm:py-4"
        >
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: Boolean,
  title: String,
  size: {
    type: String,
    default: 'md', // sm, md, lg, xl, 2xl
    validator: (v) => ['sm', 'md', 'lg', 'xl', '2xl'].includes(v)
  },
  showHeader: { type: Boolean, default: true },
  showCloseButton: { type: Boolean, default: true },
  closeOnClickOutside: { type: Boolean, default: true }
});

const emit = defineEmits(['update:modelValue', 'close']);

const sizeClass = computed(() => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-7xl'
  };
  return sizes[props.size];
});

const handleClose = () => {
  emit('update:modelValue', false);
  emit('close');
};
</script>

