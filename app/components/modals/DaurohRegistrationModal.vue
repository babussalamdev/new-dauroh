<template>
  <div v-if="show" class="modal fade show d-block" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Form Pendaftaran: {{ dauroh?.title }}</h5>
          <button type="button" class="btn-close" @click="close"></button>
        </div>
        <div class="modal-body">
          <p class="text-muted">
            Silakan isi data untuk setiap peserta. Anda dapat menambahkan lebih dari satu peserta.
          </p>
          <hr>
          
          <form ref="form" @submit.prevent="handleSubmit">
            <div v-for="(participant, index) in participants" :key="index" class="participant-form border rounded p-3 mb-3">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="mb-0">Peserta {{ index + 1 }}</h6>
                <button 
                  v-if="participants.length > 1" 
                  class="btn btn-sm btn-outline-danger" 
                  type="button" 
                  @click="removeParticipant(index)"
                >
                  Hapus
                </button>
              </div>
              <div class="row g-2">
                <div class="col-md-6 mb-2">
                  <label :for="'name-' + index" class="form-label small">Nama Lengkap</label>
                  <input 
                    :id="'name-' + index"
                    type="text" 
                    class="form-control" 
                    placeholder="Nama Lengkap Peserta" 
                    v-model="participant.name"
                    required >
                </div>
                <div class="col-md-6 mb-2">
                  <label :for="'email-' + index" class="form-label small">Email</label>
                  <input 
                    :id="'email-' + index"
                    type="email" 
                    class="form-control" 
                    placeholder="email@contoh.com" 
                    v-model="participant.email"
                    required >
                </div>
                <div class="col-md-12 mb-2">
                   <label :for="'gender-' + index" class="form-label small">Jenis Kelamin</label>
                  <select :id="'gender-' + index" class="form-select" v-model="participant.gender" required> <option value="" disabled>Pilih Ikhwan/Akhwat</option>
                    <option value="ikhwan">Ikhwan (Laki-laki)</option>
                    <option value="akhwat">Akhwat (Perempuan)</option>
                  </select>
                </div>
              </div>
            </div>

            <button class="btn btn-outline-primary btn-sm mt-2" type="button" @click="addParticipant">
              + Tambah Peserta Lain
            </button>
            
            <button type="submit" ref="submitButton" style="display: none;"></button>
          </form>

          <div class="alert alert-info mt-4">
            <strong>Total Tiket:</strong> {{ participants.length }}
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="close">Batal</button>
          <button type="button" class="btn btn-primary" @click="triggerSubmit">Lanjutkan</button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  show: { type: Boolean, required: true },
  dauroh: { type: Object, default: null },
});

const emit = defineEmits(['close', 'submit']);

const form = ref(null); // ref untuk elemen form
const submitButton = ref(null); // ref untuk tombol submit tersembunyi

const createParticipant = () => ({ name: '', email: '', gender: '' });
const participants = ref([createParticipant()]);

watch(() => props.show, (newValue) => {
  if (newValue) {
    participants.value = [createParticipant()];
  }
});

const addParticipant = () => {
  if (participants.value.length < 10) {
    participants.value.push(createParticipant());
  } else {
    alert('Anda hanya dapat membeli maksimal 10 tiket.');
  }
};

const removeParticipant = (index) => {
  participants.value.splice(index, 1);
};

const close = () => emit('close');

// PERUBAHAN LOGIKA VALIDASI
const triggerSubmit = () => {
  // Memicu klik pada tombol submit asli di dalam form
  // Ini akan memicu validasi HTML5 bawaan browser
  submitButton.value.click();
};

const handleSubmit = () => {
  // Fungsi ini sekarang hanya akan berjalan JIKA form sudah valid
  const registrationData = {
    dauroh: props.dauroh,
    participants: participants.value,
  };
  emit('submit', registrationData);
};
</script>

<style scoped>
/* CSS tidak berubah */
.modal { background-color: rgba(0, 0, 0, 0.5); }
.participant-form { background-color: #f8f9fa; }
</style>