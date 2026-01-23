'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import TerminosCheckbox from '@/components/TerminosCheckbox'

interface RegistroFormProps {
  redirectUrl?: string
}

export default function RegistroForm({ redirectUrl = '/cuenta' }: RegistroFormProps) {
  const router = useRouter()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [aceptoTerminos, setAceptoTerminos] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [terminosError, setTerminosError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setTerminosError('')

    // Validaciones
    if (!aceptoTerminos) {
      setTerminosError('Debes aceptar los Términos y Condiciones para continuar')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre,
          email,
          password,
          terminos_aceptados: aceptoTerminos,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear la cuenta')
      }

      // Registro exitoso, redirigir
      router.push(redirectUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la cuenta')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre completo"
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Tu nombre"
        required
        disabled={loading}
      />

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@email.com"
        required
        disabled={loading}
      />

      <Input
        label="Contraseña"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Mínimo 6 caracteres"
        required
        disabled={loading}
      />

      <Input
        label="Confirmar contraseña"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirma tu contraseña"
        required
        disabled={loading}
      />

      <TerminosCheckbox
        checked={aceptoTerminos}
        onChange={setAceptoTerminos}
        error={terminosError}
      />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
      </Button>
    </form>
  )
}
