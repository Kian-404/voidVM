// apps/web/src/types/vmCreation.ts
export interface PortForward {
  protocol: 'tcp' | 'udp'
  hostPort: number | null
  guestIP: string
  guestPort: number | null
}

export interface NetworkConfig {
  type: 'user' | 'bridge' | 'tap'
  mac?: string
  bridge?: string
  ifname?: string
  script?: string
  downscript?: string
  hostfwd?: PortForward[]
}

export interface BridgeInfo {
  name: string
  ip?: string
  status: string
}

export interface BridgeData {
  name: string
  ip: string
  netmask: string
  dhcp: boolean
  dhcpStart?: string
  dhcpEnd?: string
}

export interface VMData {
  vmName: string
  memory: string
  cpu: string
  disk: string
  cdrom?: string
  network: NetworkConfig[]
  vncPort: string
}

export interface ISOInfo {
  name: string
  path: string
  size: string
}

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
