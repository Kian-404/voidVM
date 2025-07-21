export interface VMConfig {
  vncPort: number
  memory: number
  cpuCores: number
}

export interface VMMetadata {
  isMountIso?: boolean
}

export interface VirtualMachine {
  name: string
  status: 'running' | 'stopped'
  pid?: number
  config: VMConfig
  metadata: VMMetadata
}

export interface VNCConfig {
  webPort: number
  vncPort: number
}

export interface VMOperation {
  success: boolean
  error?: string
  message?: string
}
