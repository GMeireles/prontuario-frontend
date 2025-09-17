<template>
  <BaseLayout>
    <div class="p-6">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">Consultas</h1>
        <button
          @click="openModal()"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Nova Consulta
        </button>
      </div>

      <!-- Tabela -->
      <div class="overflow-x-auto bg-white rounded-lg shadow">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-gray-100 text-gray-600 uppercase text-xs">
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
              class="border-b hover:bg-gray-50"
            >
              <td class="px-4 py-3">{{ appointment.patient?.name }}</td>
              <td class="px-4 py-3">{{ appointment.professional?.name }}</td>
              <td class="px-4 py-3">{{ formatDate(appointment.date_time) }}</td>
              <td class="px-4 py-3">{{ formatTime(appointment.date_time) }}</td>
              <td class="px-4 py-3 text-right space-x-2">
                <button
                  @click="openModal(appointment)"
                  class="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Editar
                </button>
                <button
                  @click="removeAppointment(appointment.id)"
                  class="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Excluir
                </button>
              </td>
            </tr>
            <tr v-if="appointments.length === 0">
              <td colspan="5" class="px-4 py-6 text-center text-gray-500">
                Nenhuma consulta cadastrada.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal -->
      <div
        v-if="showModal"
        class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      >
        <div class="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
          <h2 class="text-xl font-bold mb-4">
            {{ editing ? "Editar Consulta" : "Nova Consulta" }}
          </h2>

          <form @submit.prevent="saveAppointment">
            <div class="space-y-4">
              <!-- Paciente -->
              <div>
                <label class="block text-sm font-medium mb-1">Paciente</label>
                <select
                  v-model="form.patient_id"
                  class="w-full border rounded p-2"
                  required
                >
                  <option disabled value="">Selecione...</option>
                  <option v-for="p in patients" :key="p.id" :value="p.id">
                    {{ p.name }}
                  </option>
                </select>
              </div>
              <!-- Profissional -->
              <div>
                <label class="block text-sm font-medium mb-1">Profissional</label>
                <select
                  v-model="form.professional_id"
                  class="w-full border rounded p-2"
                  required
                >
                  <option disabled value="">Selecione...</option>
                  <option v-for="u in professionals" :key="u.id" :value="u.id">
                    {{ u.name }}
                  </option>
                </select>
              </div>


              <!-- Data -->
              <div>
                <label class="block text-sm font-medium mb-1">Data</label>
                <input
                  type="date"
                  v-model="form.date"
                  class="w-full border rounded p-2"
                  required
                />
              </div>

              <!-- Hora -->
              <div>
                <label class="block text-sm font-medium mb-1">Hora</label>
                <input
                  type="time"
                  v-model="form.time"
                  class="w-full border rounded p-2"
                  required
                />
              </div>

              <!-- Observações -->
              <div>
                <label class="block text-sm font-medium mb-1">Notas</label>
                <textarea
                  v-model="form.notes"
                  class="w-full border rounded p-2"
                  rows="3"
                ></textarea>
              </div>
            </div>

            <div class="flex justify-end gap-2 mt-6">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </BaseLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { AppointmentService } from "../services/AppointmentService";
import { PatientService } from "../services/PatientService";
import { UserService } from "../services/UserService";
import BaseLayout from '../layouts/BaseLayout.vue'

const appointments = ref([]);
const patients = ref([]);
const showModal = ref(false);
const editing = ref(false);
const form = ref({
  id: null,
  patient_id: "",
  date: "",
  time: "",
  notes: "",
});

const professionals = ref([]);

async function loadProfessionals() {
  try {
    professionals.value = await UserService.listProfessionals();
  } catch {
    toast.error("Erro ao carregar profissionais");
  }
}

onMounted(async () => {
  await loadAppointments();
  await loadPatients();
  await loadProfessionals();
});

async function loadAppointments() {
  try {
    appointments.value = await AppointmentService.list();
  } catch (e) {
    toast.error("Erro ao carregar consultas");
  }
}

async function loadPatients() {
  try {
    patients.value = await PatientService.list();
  } catch (e) {
    toast.error("Erro ao carregar pacientes");
  }
}

function openModal(appointment = null) {
  if (appointment) {
    editing.value = true;
    form.value = {
      id: appointment.id,
      patient_id: appointment.patient_id,
      date: appointment.date_time.split("T")[0],
      time: appointment.date_time.split("T")[1].slice(0, 5),
      notes: appointment.notes,
    };
  } else {
    editing.value = false;
    form.value = {
      id: null,
      patient_id: "",
      date: "",
      time: "",
      notes: "",
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
      await AppointmentService.update(form.value.id, payload);
      toast.success("Consulta atualizada!");
    } else {
      await AppointmentService.create(payload);
      toast.success("Consulta criada!");
    }

    await loadAppointments();
    closeModal();
  } catch (e) {
    toast.error("Erro ao salvar consulta");
  }
}

async function removeAppointment(id) {
  if (confirm("Deseja excluir esta consulta?")) {
    try {
      await AppointmentService.remove(id);
      toast.success("Consulta excluída!");
      await loadAppointments();
    } catch (e) {
      toast.error("Erro ao excluir consulta");
    }
  }
}

function formatDate(dateTime) {
  return new Date(dateTime).toLocaleDateString("pt-BR");
}

function formatTime(dateTime) {
  return new Date(dateTime).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
</script>
