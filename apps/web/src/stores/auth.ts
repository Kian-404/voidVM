import { defineStore } from "pinia";
import { supabase } from "../utils/supabase";
import { ref, computed } from "vue";

export const useAuthStore = defineStore("auth", () => {
  const user: any = ref(null);
  const loading = ref(true);
  const errorMessage: any = ref("");

  const isAuthenticated = computed(() => !!user.value);

  // 初始化用户状态
  async function initialize() {
    loading.value = true;
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        user.value = session.user;
      }
    } catch (error: any) {
      console.error("Error initializing auth:", error);
      errorMessage.value = error.message;
    } finally {
      loading.value = false;
    }
  }

  // 注册
  async function register(email: any, password: any, fullName: any) {
    loading.value = true;
    errorMessage.value = "";
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error("Error registering:", error);
      errorMessage.value = error.message;
      return { success: false, error: error.message };
    } finally {
      loading.value = false;
    }
  }

  // 登录
  async function login(email: any, password: any) {
    loading.value = true;
    errorMessage.value = "";
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      user.value = data.user;
      return { success: true, data };
    } catch (error: any) {
      console.error("Error logging in:", error);
      errorMessage.value = error.message;
      return { success: false, error: error.message };
    } finally {
      loading.value = false;
    }
  }

  // 登出
  async function logout() {
    loading.value = true;
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      user.value = null;
    } catch (error: any) {
      console.error("Error logging out:", error);
      errorMessage.value = error.message;
    } finally {
      loading.value = false;
    }
  }

  // 重置密码
  async function resetPassword(email: string) {
    loading.value = true;
    errorMessage.value = "";
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error("Error resetting password:", error);
      errorMessage.value = error.message;
      return { success: false, error: error.message };
    } finally {
      loading.value = false;
    }
  }

  // 更新用户资料
  async function updateProfile(userData: any) {
    loading.value = true;
    errorMessage.value = "";
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: userData,
      });

      if (error) throw error;
      user.value = data.user;
      return { success: true, data };
    } catch (error: any) {
      console.error("Error updating profile:", error);
      errorMessage.value = error.message;
      return { success: false, error: error.message };
    } finally {
      loading.value = false;
    }
  }

  return {
    user,
    loading,
    errorMessage,
    isAuthenticated,
    initialize,
    register,
    login,
    logout,
    resetPassword,
    updateProfile,
  };
});
