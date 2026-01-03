import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Gakal - Nutrición con Gamificación',
  description: 'Registrá tus comidas, alcanzá tus objetivos y desbloqueá logros con Gakal',
  keywords: ['nutrición', 'fitness', 'argentina', 'gamificación', 'calorías'],
  authors: [{ name: 'Gakal' }],
  openGraph: {
    title: 'Gakal - Nutrición con Gamificación',
    description: 'Registrá tus comidas, alcanzá tus objetivos y desbloqueá logros',
    type: 'website',
    locale: 'es_AR',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es-AR">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
