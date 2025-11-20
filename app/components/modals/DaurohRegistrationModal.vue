<template>
  <div v-if="show" class="modal fade show d-block" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Form Pendaftaran: {{ dauroh?.Title }}</h5>
          <button type="button" class="btn-close" @click="close"></button>
        </div>
        <div class="modal-body">
          <div v-if="dauroh?.Quota && dauroh.Quota > 0" class="alert alert-info small py-2 mb-3">
             Sisa Kuota: <strong>{{ dauroh.Quota }}</strong> Peserta
          </div>

          <p class="text-muted">
            Silakan isi data peserta. Email hanya diperlukan untuk peserta pertama (sebagai penanggung jawab).
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
                    placeholder="Sesuai KTP" 
                    v-model="participant.name"
                    required >
                </div>

                <div class="col-md-6 mb-2" v-if="index === 0">
                  <label :for="'email-' + index" class="form-label small">Email *</label>
                  <input 
                    :id="'email-' + index"
                    type="email" 
                    class="form-control" 
                    placeholder="email@contoh.com" 
                    v-model="participant.email"
                    required 
                  >
                </div>
                <div class="col-md-6 mb-2" v-else></div>

                <div class="col-md-4 mb-2">
                   <label :for="'gender-' + index" class="form-label small">Jenis Kelamin</label>
                  <select :id="'gender-' + index" class="form-select" v-model="participant.gender" required> 
                    <option value="" disabled>Pilih Ikhwan/Akhwat</option>
                    <option value="ikhwan">Ikhwan (Laki-laki)</option>
                    <option value="akhwat">Akhwat (Perempuan)</option>
                  </select>
                </div>

                <div class="col-md-4 mb-2">
                  <label :for="'age-' + index" class="form-label small">Usia</label>
                  <input 
                    :id="'age-' + index"
                    type="number" 
                    class="form-control" 
                    placeholder="Umur" 
                    v-model="participant.age"
                    required 
                    min="5"
                  >
                </div>

                <div class="col-md-4 mb-2">
                  <label :for="'domicile-' + index" class="form-label small">Domisili</label>
                  <input 
                    :id="'domicile-' + index"
                    type="text" 
                    class="form-control" 
                    placeholder="Kota Tinggal" 
                    v-model="participant.domicile"
                    required 
                  >
                </div>

              </div>
            </div>

            <button class="btn btn-outline-primary btn-sm mt-2" type="button" @click="addParticipant">
              + Tambah Peserta Lain
            </button>
            
            <button type="submit" ref="submitButton" style="display: none;"></button>
          </form>

          <div class="alert alert-info mt-4 d-flex justify-content-between align-items-center">
            <span><strong>Total Tiket:</strong> {{ participants.length }}</span>
            <span><strong>Total Bayar:</strong> {{ formatCurrency((dauroh?.Price || 0) * participants.length) }}</span>
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

const form = ref(null); 
const submitButton = ref(null); 

const createParticipant = () => ({ name: '', email: '', gender: '', age: '', domicile: '' });
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

const triggerSubmit = () => {
  submitButton.value.click();
};

const handleSubmit = () => {
  // Salin email peserta pertama ke peserta lain di backend logic (sebelum dikirim)
  const mainEmail = participants.value[0].email;
  const finalParticipants = participants.value.map((p, i) => ({
    ...p,
    email: i === 0 ? p.email : mainEmail // Otomatis pakai email peserta 1
  }));

  const registrationData = {
    dauroh: props.dauroh,
    participants: finalParticipants,
  };
  emit('submit', registrationData);
};

const formatCurrency = (val) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
};
</script>

<style scoped>
.modal { background-color: rgba(0, 0, 0, 0.5); }
.participant-form { background-color: #f8f9fa; }
</style>