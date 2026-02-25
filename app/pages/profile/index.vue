<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-lg-10">
        <h1 class="mb-4 text-center">Edit Profil</h1>

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