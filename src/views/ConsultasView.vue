<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <h1 class="text-xl font-bold text-primary">Consultas</h1>
      <FormButton variant="primary" @click="openModal()">Nova Consulta</FormButton>
    </div>

    <div class="overflow-x-auto rounded-lg border border-theme bg-secondary">
      <table class="table-uniform min-w-full text-left text-sm">
        <thead class="bg-tertiary text-secondary uppercase text-xs">
          <tr>
            <th class="px-4 py-3">Paciente</th>
            <th class="px-4 py-3">Profissional</th>
            <th class="px-4 py-3">Data</th>
            <th class="px-4 py-3">Hora</th>
            <th class="px-4 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="appointment in appointments"
            :key="appointment.id"
            class="table-row-uniform border-t border-theme"
          >
            <td class="px-4 py-3 text-primary">{{ appointment.patient?.name }}</td>
            <td class="px-4 py-3 text-secondary">{{ appointment.professional?.name }}</td>
            <td class="px-4 py-3 text-secondary">{{ formatDate(appointment.date_time) }}</td>
            <td class="px-4 py-3 text-secondary">{{ formatTime(appointment.date_time) }}</td>
            <td class="px-4 py-3 text-right">
              <div class="flex flex-wrap justify-end gap-2">
                <FormButton size="sm" variant="secondary" @click="openModal(appointment)">
                  Editar
                </FormButton>
                <FormButton size="sm" variant="danger" @click="removeAppointment(appointment.id)">
                  Excluir
                </FormButton>
              </div>
            </td>
          </tr>
          <tr v-if="appointments.length === 0">
            <td colspan="5" class="px-4 py-6 text-center text-secondary">
              Nenhuma consulta cadastrada.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <BaseModal
      v-model="showModal"
      :title="editing ? 'Editar Consulta' : 'Nova Consulta'"
      size="lg"
    >
      <form @submit.prevent="saveAppointment" class="space-y-4">
        <FormSelect v-model="form.patient_id" label="Paciente" placeholder="Selecione..." required>
          <option v-for="p in patients" :key="p.id" :value="p.id">{{ p.name }}</option>
        </FormSelect>
        <FormSelect v-model="form.professional_id" label="Profissional" placeholder="Selecione..." required>
          <option v-for="u in professionals" :key="u.id" :value="u.id">{{ u.name }}</option>
        </FormSelect>
        <FormInput v-model="form.date" label="Data" type="date" required />
        <FormInput v-model="form.time" label="Hora" type="time" required />
        <FormTextarea v-model="form.notes" label="Notas" :rows="3" />
      </form>

      <template #footer>
        <FormButton variant="secondary" @click="closeModal">Cancelar</FormButton>
        <FormButton variant="primary" @click="saveAppointment">Salvar</FormButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { toast } from 'vue3-toastify';
import {
  BaseModal,
  FormInput,
  FormSelect,
  FormTextarea,
  FormButton,
} from '../components/forms/index.js';
import {
  listAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from '../api/appointments.js';
import { listPatients } from '../api/patients.js';
import { listProfessionals } from '../api/users.js';

const appointments = ref([]);
const patients = ref([]);
const professionals = ref([]);
const showModal = ref(false);
const editing = ref(false);
const form = ref({
  id: null,
  patient_id: '',
  professional_id: '',
  date: '',
  time: '',
  notes: '',
});

onMounted(async () => {
  await loadAppointments();
  await loadPatients();
  await loadProfessionals();
});

async function loadProfessionals() {
  try {
    professionals.value = await listProfessionals();
  } catch {
    toast.error('Erro ao carregar profissionais');
  }
}

async function loadAppointments() {
  try {
    appointments.value = await listAppointments();
  } catch {
    toast.error('Erro ao carregar consultas');
  }
}

async function loadPatients() {
  try {
    patients.value = await listPatients();
  } catch {
    toast.error('Erro ao carregar pacientes');
  }
}

function openModal(appointment = null) {
  if (appointment) {
    editing.value = true;
    form.value = {
      id: appointment.id,
      patient_id: appointment.patient_id,
      professional_id: appointment.professional_id,
      date: appointment.date_time.split('T')[0],
      time: appointment.date_time.split('T')[1].slice(0, 5),
      notes: appointment.notes,
    };
  } else {
    editing.value = false;
    form.value = {
      id: null,
      patient_id: '',
      professional_id: '',
      date: '',
      time: '',
      notes: '',
    };
  }
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
}

async function saveAppointment() {
  try {
    const payload = {
      patient_id: form.value.patient_id,
      date_time: `${form.value.date}T${form.value.time}:00`,
      notes: form.value.notes,
      professional_id: form.value.professional_id,
    };

    if (editing.value) {
      await updateAppointment(form.value.id, payload);
      toast.success('Consulta atualizada!');
    } else {
      await createAppointment(payload);
      toast.success('Consulta criada!');
    }

    await loadAppointments();
    closeModal();
  } catch {
    toast.error('Erro ao salvar consulta');
  }
}

async function removeAppointment(id) {
  if (confirm('Deseja excluir esta consulta?')) {
    try {
      await deleteAppointment(id);
      toast.success('Consulta excluída!');
      await loadAppointments();
    } catch {
      toast.error('Erro ao excluir consulta');
    }
  }
}

function formatDate(dateTime) {
  return new Date(dateTime).toLocaleDateString('pt-BR');
}

function formatTime(dateTime) {
  return new Date(dateTime).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>
