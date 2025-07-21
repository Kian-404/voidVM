// apps/web/src/types/vmEdit.ts
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

export interface PortForwardingType {
  hostPort: number | null
  guestPort: number | null
}

export interface VMConfig {
  memory: number
  cpuCores: number
  vncPort: number
  isoPath: string
  networkType: string
  portForwarding: PortForwardingType[]
  networks: NetworkConfig[]
}

export interface EditingVM {
  name: string
  config: VMConfig
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
