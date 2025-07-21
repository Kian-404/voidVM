import { createRouter, createWebHashHistory } from 'vue-router'
import { supabase } from '../utils/supabase'
import { config } from '../utils/config'

// 组件导入
const Home = () => import('../views/Home.vue')
const Login = () => import('../views/Login.vue')
const Register = () => import('../views/Register.vue')
const ResetPassword = () => import('../views/ResetPassword.vue')
const Profile = () => import('../views/Profile.vue')
const NotFound = () => import('../views/NotFound.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/todo',
    name: 'todo',
    component: () => import('../views/todo.vue'),
    meta: { requiresAuth: config.isOpenAuth ? true : false },
  },
  {
    path: '/console',
    name: 'Console',
    component: () => import('../views/Console.vue'),
  },
  {
    path: '/images',
    name: 'Images',
    component: () => import('../views/Image.vue'),
    meta: { requiresAuth: config.isOpenAuth ? true : false },
  },
  {
    path: '/vms',
    name: 'VMS',
    component: () => import('../views/VmsCenter.vue'),
    meta: { requiresAuth: config.isOpenAuth ? true : false },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: config.isOpenAuth ? true : false },
  },
  {
    path: '/files',
    name: 'FileSystem',
    component: () => import('../views/FilePage.vue'),
    meta: { requiresAuth: config.isOpenAuth ? true : false },
  },
  {
    path: '/network',
    name: 'Network',
    component: () => import('../views/Network.vue'),
    meta: {
      title: '网络管理',
      requiresAuth: config.isOpenAuth ? true : false,
    },
  },
  {
    path: '/snapshots',
    name: 'SnapshotManager',
    component: () => import('../views/SnapshotManager.vue'),
    meta: {
      title: '快照管理',
      requiresAuth: config.isOpenAuth ? true : false,
    },
  },
  {
    path: '/docs',
    name: 'Docs',
    component: () => import('../views/DocsPage.vue'),
    meta: {
      title: '项目文档',
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresGuest: true },
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPassword,
    meta: { requiresGuest: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 如果有保存的滚动位置（比如通过浏览器前进/后退按钮）
    if (savedPosition) {
      return savedPosition
    }
    // 如果路由有hash锚点
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }
    // 默认情况下滚动到页面顶部
    return {
      top: 0,
      behavior: 'smooth',
    }
  },
})

// 导航守卫
router.beforeEach(async (to, _from, next) => {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  console.log('session', session)
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)

  if (requiresAuth && !session) {
    next('/login')
  } else if (requiresGuest && session) {
    next('/')
  } else {
    next()
  }
})

export default router
