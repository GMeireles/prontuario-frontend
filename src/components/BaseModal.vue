<template>
  <div
    v-if="show"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
  >
    <div class="bg-white rounded-lg shadow-lg w-full max-w-lg">
      <!-- Header -->
      <div class="p-4 border-b">
        <slot name="header"></slot>
      </div>

      <!-- Body -->
      <div class="p-4">
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
