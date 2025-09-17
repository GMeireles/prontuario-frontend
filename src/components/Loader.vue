<template>
  <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded shadow-lg">
      <span class="text-gray-700">Carregando...</span>
    </div>
  </div>
</template>

<script setup>
defineProps({ visible: Boolean })
</script>
