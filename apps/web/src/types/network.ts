// apps/web/src/types/network.ts
export interface NetworkInterface {
  name: string
  type: 'bridge' | 'tap' | 'ethernet' | 'loopback' | 'wireless'
  status: 'up' | 'down'
  addresses: Array<{
    local: string
    prefixlen: number
  }>
  mtu: number
}

export interface BridgeData {
  name: string
  ip: string
  netmask: string
  dhcp: boolean
  dhcpStart?: string
  dhcpEnd?: string
}

export interface TapData {
  name: string
  bridge?: string
}

export interface PortForwardData {
  hostPort: number
  guestIP: string
  guestPort: number
  protocol: 'tcp' | 'udp'
}

export interface PortForwardRule extends PortForwardData {
  created: string
}

export interface TapInterface {
  name: string
  bridge?: string
  status: 'active' | 'inactive'
  created: string
}

export interface TrafficControlData {
  interfaceItem: string
  bandwidth: string
  delay: string
  loss: string
}

export interface NetworkStats {
  rx: {
    bytes: number
    packets: number
    errors: number
    dropped: number
    rate?: number
  }
  tx: {
    bytes: number
    packets: number
    errors: number
    dropped: number
    rate?: number
  }
}

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}
