import { createRouter, createWebHashHistory } from "vue-router";
import { supabase } from "../utils/supabase";

// 组件导入
const Home = () => import("../views/Home.vue");
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import ResetPassword from "../views/ResetPassword.vue";
import Profile from "../views/Profile.vue";
import NotFound from "../views/NotFound.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/todo",
    name: "todo",
    component: () => import("../views/todo.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/console",
    name: "Console",
    component: () => import("../views/Console.vue"),
  },
  {
    path: '/images',
    name: 'Images',
    component: () => import('../views/Image.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: "/vms",
    name: "VMS",
    component: () => import("../views/VmsCenter.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: () => import("../views/Dashboard.vue"),
    // meta: { requiresAuth: true },
  },
  {
    path: '/docs',
    name: 'Docs',
    component: () => import('../views/DocsPage.vue'),
    meta: {
      title: '项目文档'
    }
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { requiresGuest: true },
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
    meta: { requiresGuest: true },
  },
  {
    path: "/reset-password",
    name: "ResetPassword",
    component: ResetPassword,
    meta: { requiresGuest: true },
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: { requiresAuth: true },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// 导航守卫
router.beforeEach(async (to, _from, next) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  console.log("session", session);
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const requiresGuest = to.matched.some((record) => record.meta.requiresGuest);

  if (requiresAuth && !session) {
    next("/login");
  } else if (requiresGuest && session) {
    next("/");
  } else {
    next();
  }
});

export default router;
