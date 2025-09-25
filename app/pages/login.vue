<template>
  <div class="login-container">
    <div class="login-overlay">
      <div class="login-box">
        <div class="login-content">
          <div class="text-center mb-5">
            <h1 class="login-title">
              Sign<span class="text-primary">In</span>
            </h1>
          </div>
          <div>
            <form @submit.prevent="signinUser">
              <div class="mb-4">
                <label for="username" class="form-label">Email/Username</label>
                <input type="text" id="username" v-model="form.email" placeholder="username" class="form-control form-control-lg" required />
              </div>

              <div class="mb-3">
                <label class="form-label">Password</label>
                <div class="password-wrapper">
                  <input :type="showPassword ? 'text' : 'password'" v-model="form.password" id="password" placeholder="Masukkan password" class="form-control form-control-lg" required />
                  <span @click="togglePasswordVisibility" class="password-toggle-icon">
                    <svg v-if="showPassword" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.0002 13.8619C7.23361 13.8619 4.86803 12.1372 3.92328 9.70241C4.86804 7.26761 7.23361 5.54297 10.0002 5.54297C12.7667 5.54297 15.1323 7.26762 16.0771 9.70243C15.1323 12.1372 12.7667 13.8619 10.0002 13.8619ZM10.0002 4.04297C6.48191 4.04297 3.49489 6.30917 2.4155 9.4593C2.3615 9.61687 2.3615 9.78794 2.41549 9.94552C3.49488 13.0957 6.48191 15.3619 10.0002 15.3619C13.5184 15.3619 16.5055 13.0957 17.5849 9.94555C17.6389 9.78797 17.6389 9.6169 17.5849 9.45932C16.5055 6.30919 13.5184 4.04297 10.0002 4.04297ZM9.99151 7.84413C8.96527 7.84413 8.13333 8.67606 8.13333 9.70231C8.13333 10.7286 8.96527 11.5605 9.99151 11.5605H10.0064C11.0326 11.5605 11.8646 10.7286 11.8646 9.70231C11.8646 8.67606 11.0326 7.84413 10.0064 7.84413H9.99151Z" fill="#98A2B3" /></svg>
                    <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M4.63803 3.57709C4.34513 3.2842 3.87026 3.2842 3.57737 3.57709C3.28447 3.86999 3.28447 4.34486 3.57737 4.63775L4.85323 5.91362C3.74609 6.84199 2.89363 8.06395 2.4155 9.45936C2.3615 9.61694 2.3615 9.78801 2.41549 9.94558C3.49488 13.0957 6.48191 15.3619 10.0002 15.3619C11.255 15.3619 12.4422 15.0737 13.4994 14.5598L15.3625 16.4229C15.6554 16.7158 16.1302 16.7158 16.4231 16.4229C16.716 16.13 16.716 15.6551 16.4231 15.3622L4.63803 3.57709ZM12.3608 13.4212L10.4475 11.5079C10.3061 11.5423 10.1584 11.5606 10.0064 11.5606H9.99151C8.96527 11.5606 8.13333 10.7286 8.13333 9.70237C8.13333 9.5461 8.15262 9.39434 8.18895 9.24933L5.91885 6.97923C5.03505 7.69015 4.34057 8.62704 3.92328 9.70247C4.86803 12.1373 7.23361 13.8619 10.0002 13.8619C10.8326 13.8619 11.6287 13.7058 12.3608 13.4212ZM16.0771 9.70249C15.7843 10.4569 15.3552 11.1432 14.8199 11.7311L15.8813 12.7925C16.6329 11.9813 17.2187 11.0143 17.5849 9.94561C17.6389 9.78803 17.6389 9.61696 17.5849 9.45938C16.5055 6.30925 13.5184 4.04303 10.0002 4.04303C9.13525 4.04303 8.30244 4.17999 7.52218 4.43338L8.75139 5.66259C9.1556 5.58413 9.57311 5.54303 10.0002 5.54303C12.7667 5.54303 15.1323 7.26768 16.0771 9.70249Z" fill="#98A2B3" /></svg>
                  </span>
                </div>
              </div>

              <div class="d-flex justify-content-end mb-4">
                <a href="#!" class="text-decoration-none small">Lupa password?</a>
              </div>
              
              <div class="d-grid gap-2">
                <button type="submit" class="btn btn-primary btn-lg" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Sign In
                </button>
              </div>
              
              <div class="text-center mt-4">
                <NuxtLink to="/" class="d-block text-decoration-none">Saya hanya pengunjung</NuxtLink>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useAuth } from '~/composables/useAuth';

definePageMeta({
  layout: 'auth'
});

const { login, loading } = useAuth();

const form = reactive({ email: '', password: '' })

const showPassword = ref(false);

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value;
}

const signinUser = async () => {
  await login(form);
};
</script>

<style scoped>
.login-container { 
  display: flex; 
  min-height: 100vh; 
  background: url('~/assets/img/city-rain.jpg') no-repeat center center/cover; 
}
.login-overlay { 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  flex: 1; width: 100%; 
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
  box-shadow: 0 10px 25px rgba(0,0,0,0.1); 
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
  right: 15px; top: 50%; 
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