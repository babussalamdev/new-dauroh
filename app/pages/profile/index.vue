<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-lg-10">
        <h4 class="mb-0 fw-bold text-dark text-center">
            <i class="text-primary"></i>Edit Profil
          </h4>

        <div class="row g-4">
          <div class="col-lg-6">
            <ProfileEditInfoForm />
          </div>

          <div class="col-lg-6">
            <ProfileChangePasswordForm />
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth';

useHead({ title: 'Edit Profil' });

definePageMeta({
  middleware: () => {
    const { isLoggedIn } = useAuth();
    if (!isLoggedIn.value) {
      return navigateTo('/auth/login');
    }
  }
});
</script>

<style scoped>
@import url("~/assets/css/admin/cards.css");
</style>