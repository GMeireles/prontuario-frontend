<template>
  <div class="space-y-2 text-primary">
    <p><strong>Queixa principal:</strong> {{ anamnese.main_complaint || '—' }}</p>
    <p><strong>Histórico médico:</strong> {{ anamnese.medical_history || '—' }}</p>
    <p><strong>Histórico familiar:</strong> {{ anamnese.family_history || '—' }}</p>
    <p><strong>Estilo de vida:</strong> {{ anamnese.lifestyle || '—' }}</p>
    <p><strong>Alergias:</strong> {{ anamnese.allergies || '—' }}</p>
  </div>
</template>

<script setup>
defineProps({
  anamnese: { type: Object, required: true }
});
</script>
