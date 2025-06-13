<template>
  <div class="row justify-content-center">
    <div class="col-md-8">
      <div class="card shadow">
        <div class="card-body">
          <h2 class="text-center mb-4">Your Profile</h2>

          <div v-if="errorMessage" class="alert alert-danger">
            {{ errorMessage }}
          </div>

          <div v-if="successMessage" class="alert alert-success">
            {{ successMessage }}
          </div>

          <div v-if="loading" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>

          <form v-else @submit.prevent="updateProfile">
            <div class="mb-3">
              <label for="email" class="form-label">Email address</label>
              <input type="email" class="form-control" id="email" v-model="email" disabled>
              <div class="form-text">Email cannot be changed</div>
            </div>

            <div class="mb-3">
              <label for="fullName" class="form-label">Full Name</label>
              <input type="text" class="form-control" id="fullName" v-model="fullName" required>
            </div>

            <hr class="my-4">

            <h4>Change Password</h4>
            <div class="mb-3">
              <label for="currentPassword" class="form-label">Current Password</label>
              <input type="password" class="form-control" id="currentPassword" v-model="currentPassword">
            </div>

            <div class="mb-3">
              <label for="newPassword" class="form-label">New Password</label>
              <input type="password" class="form-control" id="newPassword" v-model="newPassword"
                :disabled="!currentPassword" minlength="6">
            </div>

            <div class="mb-3">
              <label for="confirmPassword" class="form-label">Confirm New Password</label>
              <input type="password" class="form-control" id="confirmPassword" v-model="confirmPassword"
                :disabled="!currentPassword">
              <div v-if="passwordMismatch" class="text-danger mt-1">
                Passwords do not match
              </div>
            </div>

            <div class="d-grid gap-2">
              <button type="submit" class="btn btn-primary" :disabled="loading || (newPassword && passwordMismatch)">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                Update Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { supabase } from '../utils/supabase';


const email = ref('');
const fullName = ref('');
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const loading = ref(true);
const errorMessage = ref('');
const successMessage = ref('');

const passwordMismatch = computed(() => {
  return newPassword.value && confirmPassword.value && newPassword.value !== confirmPassword.value;
});

// Load user data
onMounted(async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      email.value = user.email || '';
      fullName.value = user.user_metadata?.full_name || '';
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to load user data';
    console.error('Profile load error:', error);
  } finally {
    loading.value = false;
  }
});

// Update profile
const updateProfile = async () => {
  errorMessage.value = '';
  successMessage.value = '';
  loading.value = true;

  try {
    // Update user metadata (name)
    const updates: any = {
      data: { full_name: fullName.value }
    };

    // Update password if provided
    if (currentPassword.value && newPassword.value) {
      if (passwordMismatch.value) {
        errorMessage.value = 'New passwords do not match';
        loading.value = false;
        return;
      }

      // First verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: currentPassword.value
      });

      if (signInError) {
        throw new Error('Current password is incorrect');
      }

      updates.password = newPassword.value;
    }

    // Update user
    const { error } = await supabase.auth.updateUser(updates);

    if (error) throw error;

    successMessage.value = 'Profile updated successfully';

    // Reset password fields
    currentPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to update profile';
    console.error('Profile update error:', error);
  } finally {
    loading.value = false;
  }
};


</script>