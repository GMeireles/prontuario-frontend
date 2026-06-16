<template>
  <div class="space-y-4">
    <h2 class="text-lg font-semibold text-primary">Dados cadastrais</h2>
    <div v-if="patient" class="rounded-lg border border-theme bg-secondary p-4 grid sm:grid-cols-2 gap-3 text-sm">
      <p class="text-primary"><strong>Nome:</strong> {{ patient.name }}</p>
      <p class="text-primary"><strong>CPF:</strong> {{ patient.cpf || '—' }}</p>
      <p class="text-primary"><strong>RG:</strong> {{ patient.rg || '—' }}</p>
      <p class="text-primary"><strong>E-mail:</strong> {{ patient.email || '—' }}</p>
      <p class="text-primary"><strong>Telefone:</strong> {{ patient.phone || '—' }}</p>
      <p class="text-primary"><strong>Nascimento:</strong> {{ formatDate(patient.birth_date) }}</p>
      <p class="text-primary"><strong>Sexo:</strong> {{ genderLabel(patient.gender) }}</p>
      <p class="text-primary"><strong>Status:</strong> {{ patient.active === false ? 'Inativo' : 'Ativo' }}</p>
      <p class="text-primary sm:col-span-2"><strong>Endereço:</strong> {{ fullAddress }}</p>
      <p v-if="patient.notes" class="text-primary sm:col-span-2"><strong>Observações:</strong> {{ patient.notes }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  patient: { type: Object, default: null },
});

const fullAddress = computed(() => {
  const p = props.patient;
  if (!p) return '—';
  const parts = [p.address, p.city, p.state, p.zip_code].filter(Boolean);
  return parts.length ? parts.join(', ') : '—';
});

function formatDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('pt-BR');
}

function genderLabel(g) {
  return { M: 'Masculino', F: 'Feminino', O: 'Outro' }[g] || g || '—';
}
</script>
