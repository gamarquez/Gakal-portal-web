export * from './database.types'
export * from './plans'

export interface UserProfile {
  id: string
  nombre: string
  email: string
  avatar_url: string | null
  plan_id: string
  suscripcion_activa_id: string | null
}

export interface Suscripcion {
  id: string
  usuario_id: string
  plan_id: string
  estado: 'active' | 'paused' | 'cancelled' | 'expired'
  mp_preapproval_id: string | null
  fecha_inicio: string
  fecha_fin: string | null
  fecha_cancelacion: string | null
  es_anual: boolean
  analisis_ia_usados: number
  mes_actual_inicio: string
}

export interface CreateSuscripcionRequest {
  planId: string
  esAnual: boolean
}

export interface CreateSuscripcionResponse {
  success: boolean
  init_point?: string
  error?: string
}

export interface CancelSuscripcionResponse {
  success: boolean
  error?: string
}

export interface EstadoSuscripcionResponse {
  plan_id: string
  suscripcion: Suscripcion | null
}
