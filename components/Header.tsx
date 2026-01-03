'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import Button from './ui/Button'

export default function Header() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary-600">
              Gakal
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/planes"
              className={`text-sm font-medium transition-colors hover:text-primary-600 ${
                pathname === '/planes' ? 'text-primary-600' : 'text-gray-700'
              }`}
            >
              Planes
            </Link>
            {user && (
              <Link
                href="/cuenta"
                className={`text-sm font-medium transition-colors hover:text-primary-600 ${
                  pathname === '/cuenta' ? 'text-primary-600' : 'text-gray-700'
                }`}
              >
                Mi Cuenta
              </Link>
            )}
          </nav>

          {/* Auth buttons */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="h-10 w-24 animate-pulse bg-gray-200 rounded-lg" />
            ) : user ? (
              <div className="flex items-center space-x-4">
                <span className="hidden sm:inline text-sm text-gray-700">
                  {user.email}
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Salir
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button size="sm">Ingresar</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
