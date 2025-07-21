export const getBaseUrl = () => {
  // 在生产环境中，使用当前主机的 IP 和端口
  if (import.meta.env.PROD) {
    const protocol = window.location.protocol
    const hostname = window.location.hostname
    const port = import.meta.env.VITE_BASE_PORT || '3030'
    return `${protocol}//${hostname}:${port}`
  }

  // 开发环境使用配置的 URL
  return import.meta.env.VITE_BASE_URL || 'http://localhost:3030'
}

export const getWsUrl = () => {
  if (import.meta.env.PROD) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const hostname = window.location.hostname
    const port = import.meta.env.VITE_WS_PORT || '3030'
    return `${protocol}//${hostname}:${port}`
  }

  return import.meta.env.VITE_WS_URL || 'ws://localhost:3030'
}

// 导出配置对象
export const config = {
  baseUrl: getBaseUrl(),
  wsUrl: getWsUrl(),
  basePath: import.meta.env.VITE_BASE_VNC_PATH || '/',
  isOpenAuth: import.meta.env.VITE_IS_OPEN_AUTH === 'true' || false,
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
}
