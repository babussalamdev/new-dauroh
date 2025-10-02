<template>
  <div class="login-container">
    <div class="login-overlay">
      <div class="login-box">
        <div class="login-content">
          <div class="text-center mb-4">
            <img src="~/assets/img/Logo-Mahad.png" alt="Logo Dauroh" style="height: 60px;" class="mb-3">
            <h1 class="login-title">Admin <span class="text-primary">SignIn</span></h1>
            <p class="text-muted small">Silakan masuk untuk melanjutkan</p>
          </div>

          <form @submit.prevent="handleLogin">
            <div class="mb-3">
              <label for="username" class="form-label">Email/Username</label>
              <input
                type="text"
                id="username"
                v-model="form.email"
                placeholder="Masukkan username atau email"
                class="form-control form-control-lg"
                required
              />
            </div>

            <div class="mb-3">
              <label for="password" class="form-label">Password</label>
              <div class="password-wrapper">
                <input
                  :type="showPassword ? 'text' : 'password'"
                  v-model="form.password"
                  id="password"
                  placeholder="Masukkan password"
                  class="form-control form-control-lg"
                  required
                />
                <span @click="togglePasswordVisibility" class="password-toggle-icon">
                  <!-- ikon sama persis dengan login user -->
                  <svg
                    v-if="showPassword"
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    class="bi bi-eye-fill"
                    viewBox="0 0 16 16"
                  >
                    <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" />
                    <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7" />
                  </svg>
                  <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    class="bi bi-eye-slash-fill"
                    viewBox="0 0 16 16"
                  >
                    <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588M5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z" />
                    <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z" />
                  </svg>
                </span>
              </div>
            </div>

            <div class="d-flex justify-content-end mb-4">
              <a href="#!" class="text-decoration-none small">Lupa password?</a>
            </div>

            <div class="d-grid gap-2">
              <button type="submit" class="btn btn-primary btn-lg">
                Login Admin
              </button>
            </div>

            <div class="text-center mt-4">
              <NuxtLink to="/" class="d-block text-decoration-none">
                Kembali ke Beranda
              </NuxtLink>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useAuth } from "~/composables/useAuth";

definePageMeta({ layout: "auth" });

const { login, loading } = useAuth()

const form = reactive({ email:'', password:'' })
const showPassword = ref(false);

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value;
}

const handleLogin = async () => {
  await login(form, 'admin') // arahkan ke dashboard admin
}
</script>

<style scoped>
/* Sama persis dengan login user */
.login-container {
  display: flex;
  min-height: 100vh;
  background: url("~/assets/img/city-rain.jpg") no-repeat center center/cover;
}
.login-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  width: 100%;
  padding: 2rem 1rem;
  background-color: rgba(0, 0, 0, 0.55);
}
.login-box {
  width: 80%;
  max-width: 380px;
}
.login-content {
  background-color: white;
  padding: 2.5rem;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}
.login-title {
  font-weight: 600;
  font-size: 1.8rem;
  color: #333;
}
.form-label {
  font-weight: 500;
  color: #555;
  margin-bottom: 0.25rem;
}
.form-control {
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
}
.password-wrapper {
  position: relative;
}
.password-toggle-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #6c757d;
}
.btn-lg {
  padding-top: 0.7rem;
  padding-bottom: 0.7rem;
  font-size: 0.95rem;
}
</style>
