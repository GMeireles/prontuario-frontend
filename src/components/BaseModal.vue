<template>
  <div
    v-if="show"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    @click.self="$emit('close')"
  >
    <div
      class="bg-white rounded-lg shadow-lg w-full max-w-lg md:max-w-2xl lg:max-w-3xl mx-4 flex flex-col max-h-[90vh]"
    >
      <!-- Header -->
      <div class="p-4 border-b">
        <slot name="header"></slot>
      </div>

      <!-- Body (com rolagem se o conteúdo passar do limite) -->
      <div class="p-4 overflow-y-auto flex-1">
        <slot name="body"></slot>
      </div>

      <!-- Footer -->
      <div class="p-4 border-t flex justify-end space-x-2">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: { type: Boolean, required: true }
})

defineEmits(['close'])
</script>
