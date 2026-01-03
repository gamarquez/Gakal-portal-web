export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      perfiles: {
        Row: {
          id: string
          nombre: string
          email: string
          avatar_url: string | null
          plan_id: string
          suscripcion_activa_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          nombre: string
          email: string
          avatar_url?: string | null
          plan_id?: string
          suscripcion_activa_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          email?: string
          avatar_url?: string | null
          plan_id?: string
          suscripcion_activa_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      planes: {
        Row: {
          id: string
          nombre: string
          descripcion: string
          precio_mensual: number
          precio_anual: number
          dias_historial: number | null
          analisis_ia_mes: number | null
          max_alimentos_custom: number
          multiplicador_xp: number
          badge_texto: string
          badge_color: string
          badge_animado: boolean
        }
        Insert: {
          id: string
          nombre: string
          descripcion: string
          precio_mensual: number
          precio_anual: number
          dias_historial?: number | null
          analisis_ia_mes?: number | null
          max_alimentos_custom?: number
          multiplicador_xp?: number
          badge_texto: string
          badge_color: string
          badge_animado?: boolean
        }
        Update: {
          id?: string
          nombre?: string
          descripcion?: string
          precio_mensual?: number
          precio_anual?: number
          dias_historial?: number | null
          analisis_ia_mes?: number | null
          max_alimentos_custom?: number
          multiplicador_xp?: number
          badge_texto?: string
          badge_color?: string
          badge_animado?: boolean
        }
      }
      suscripciones: {
        Row: {
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
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          usuario_id: string
          plan_id: string
          estado?: 'active' | 'paused' | 'cancelled' | 'expired'
          mp_preapproval_id?: string | null
          fecha_inicio?: string
          fecha_fin?: string | null
          fecha_cancelacion?: string | null
          es_anual?: boolean
          analisis_ia_usados?: number
          mes_actual_inicio?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          usuario_id?: string
          plan_id?: string
          estado?: 'active' | 'paused' | 'cancelled' | 'expired'
          mp_preapproval_id?: string | null
          fecha_inicio?: string
          fecha_fin?: string | null
          fecha_cancelacion?: string | null
          es_anual?: boolean
          analisis_ia_usados?: number
          mes_actual_inicio?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
