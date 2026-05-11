import { defineStore } from 'pinia';

export const useRegistrationStore = defineStore('registration', {
  state: () => ({
    formData: {
      name: '',
      email: '',
      username: '',
      phone_number: '',
      gender: '',
      birthDate: '',
      password: '',
      confirmPassword: ''
    }
  }),
  persist: true 
});