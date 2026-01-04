import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: object) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // El método `set` fue llamado desde un Server Component
            // Esto puede ser ignorado si tienes middleware refrescando
            // las cookies del usuario
          }
        },
        remove(name: string, options: object) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // El método `delete` fue llamado desde un Server Component
            // Esto puede ser ignorado si tienes middleware refrescando
            // las cookies del usuario
          }
        },
      },
    }
  )
}

// Cliente con service role para operaciones administrativas
export function createAdminClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {},
    }
  )
}
