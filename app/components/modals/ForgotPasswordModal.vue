<template>
  <Teleport to="body">
    <div class="modal fade" id="forgotPasswordModal" tabindex="-1" aria-labelledby="forgotPasswordLabel" data-bs-backdrop="static" data-bs-keyboard="false" data-bs-focus="false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div class="modal-header border-0 px-4 pt-4 pb-2">
            <h5 class="modal-title txt-subtitle fw-bold text-dark" id="forgotPasswordLabel">
              {{ step === 1 ? 'Lupa Password?' : 'Reset Password' }}
            </h5>
            <button 
              type="button" 
              class="btn-close shadow-none bg-light p-2 rounded-circle" 
              data-bs-dismiss="modal" 
              aria-label="Close" 
              @click="closeAndReset" 
              ref="closeModalBtn"
            ></button>
          </div>
          
          <div class="modal-body p-4">
            
            <div v-if="step === 1">
              <p class="text-muted txt-caption mb-4">
                Masukkan alamat email yang terdaftar. Kami akan mengirimkan kode verifikasi untuk mereset password Anda.
              </p>
              <form @submit.prevent="handleSendCode">
                <div class="mb-3">
                  <label for="forgotEmail" class="form-label txt-label fw-bold text-secondary">Email</label>
                  <input 
                    type="email" 
                    class="form-control txt-body" 
                    id="forgotEmail" 
                    v-model="form.email" 
                    placeholder="nama@email.com" 
                    required
                    :disabled="loading"
                  >
                </div>
                <div class="d-grid mt-4">
                  <button type="submit" class="btn btn-primary rounded-pill txt-body fw-bold py-2 shadow-sm" :disabled="loading">
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                    {{ loading ? 'Mengirim...' : 'Kirim Kode Verifikasi' }}
                  </button>
                </div>
              </form>
            </div>

            <div v-else>
              <div class="alert alert-info txt-caption fw-bold py-2 d-flex align-items-center border-0 rounded-3">
                <i class="bi bi-envelope-check me-2 fs-5"></i>
                <span>Kode telah dikirim ke <b>{{ form.email }}</b></span>
              </div>

              <form @submit.prevent="handleChangePassword">
                <div class="mb-3">
                  <label for="verifyCode" class="form-label txt-label fw-bold text-secondary">Kode Verifikasi (OTP)</label>
                  <input 
                    type="text" 
                    class="form-control text-center letter-spacing-2 fw-bold txt-body" 
                    id="verifyCode" 
                    v-model="form.code" 
                    placeholder="xxxxxx" 
                    required
                    :disabled="loading"
                  >
                </div>

                <div class="mb-3">
                  <label for="newPass" class="form-label txt-label fw-bold text-secondary">Password Baru</label>
                  <div class="input-group">
                    <input 
                      :type="showPass ? 'text' : 'password'" 
                      class="form-control txt-body" 
                      id="newPass" 
                      v-model="form.newPassword" 
                      :class="{'is-invalid': form.newPassword && !isPasswordValid}"
                      placeholder="Min. 8 karakter"
                      required
                    >
                    <button class="btn btn-outline-secondary" type="button" @click="showPass = !showPass">
                      <i :class="showPass ? 'bi bi-eye-fill' : 'bi bi-eye-slash-fill'"></i>
                    </button>
                  </div>
                  <div class="form-text txt-caption fw-bold mt-2" :class="isPasswordValid ? 'text-success' : 'text-muted'">
                    <i v-if="isPasswordValid" class="bi bi-check-circle-fill me-1"></i>
                    Syarat: Min. 8 Karakter, Besar, Kecil, & Angka.
                  </div>
                </div>

                <div class="mb-3">
                  <label for="confirmPass" class="form-label txt-label fw-bold text-secondary">Konfirmasi Password</label>
                  <div class="input-group">
                    <input 
                      :type="showConfirmPass ? 'text' : 'password'" 
                      class="form-control txt-body" 
                      id="confirmPass" 
                      v-model="form.confirmPassword" 
                      :class="{'is-invalid': form.confirmPassword && form.newPassword !== form.confirmPassword}"
                      required
                    >
                    <button class="btn btn-outline-secondary" type="button" @click="showConfirmPass = !showConfirmPass">
                      <i :class="showConfirmPass ? 'bi bi-eye-fill' : 'bi bi-eye-slash-fill'"></i>
                    </button>
                  </div>
                </div>

                <div class="d-grid gap-2 mt-4">
                  <button type="submit" class="btn btn-primary rounded-pill txt-body fw-bold py-2 shadow-sm" :disabled="loading || !isPasswordValid">
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                    {{ loading ? 'Memproses...' : 'Ubah Password' }}
                  </button>
                  <button type="button" class="btn btn-link text-decoration-none txt-caption fw-bold text-muted mt-2" @click="step = 1">
                    Kirim Ulang / Ganti Email
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive, ref, computed, nextTick } from 'vue';
import { useAlert } from '~/utils/swal';

const { $apiBase } = useNuxtApp() as any;
const { alert: swalAlert } = useAlert();

const step = ref(1);
const loading = ref(false);
const showPass = ref(false);
const showConfirmPass = ref(false);
const closeModalBtn = ref<HTMLButtonElement | null>(null);

const form = reactive({
  email: '',
  code: '',
  newPassword: '',
  confirmPassword: ''
});

const isPasswordValid = computed(() => {
  const pwd = form.newPassword;
  if (!pwd) return false;
  return pwd.length >= 8 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /\d/.test(pwd);
});

const handleSendCode = async () => {
  loading.value = true;
  try {
    await $apiBase.put('/forgot-password', 
      { email: form.email }, 
      { params: { forgotpassword: 'verify' } }
    );

    step.value = 2;
    await nextTick(); 
    
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    swalAlert(
      'Kode Terkirim!', 
      'Silakan cek email Anda untuk mendapatkan kode verifikasi.', 
      'success'
    );
  } catch (err: any) {
    console.error(err);
    await nextTick();
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    
    const msg = err.response?.data?.message || "Email tidak ditemukan atau terjadi kesalahan.";
    swalAlert('Gagal', msg, 'error');
  } finally {
    loading.value = false;
  }
};

const handleChangePassword = async () => {
  if (form.newPassword !== form.confirmPassword) {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    swalAlert('Error', 'Konfirmasi password tidak cocok.', 'warning');
    return;
  }
  
  loading.value = true;
  try {
    const payload = {
      email: form.email,
      code: form.code,
      newPassword: form.newPassword
    };
    
    const response = await $apiBase.put('/forgot-password', payload, {
      params: { forgotpassword: 'change' }
    });
    
    if (closeModalBtn.value) {
      closeModalBtn.value.click();
    }

    const successMessage = response.data?.message || 'Password berhasil diperbarui!';
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    swalAlert('Berhasil!', successMessage, 'success');
    setTimeout(() => resetForm(), 500);

  } catch (err: any) {
    console.error("Change Password Error:", err);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    
    const msg = err.response?.data?.message || "Kode salah atau kadaluarsa.";
    swalAlert('Gagal', msg, 'error');
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  setTimeout(() => {
    step.value = 1;
    form.email = '';
    form.code = '';
    form.newPassword = '';
    form.confirmPassword = '';
    loading.value = false;
    showPass.value = false;
    showConfirmPass.value = false;
  }, 500);
};

const closeAndReset = () => {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
  document.body.focus();
  resetForm();
};
</script>

<style scoped>
.letter-spacing-2 {
  letter-spacing: 2px;
}
</style>