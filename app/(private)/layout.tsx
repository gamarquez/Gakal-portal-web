import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AuthGuard from '@/components/AuthGuard'

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-gray-50">{children}</main>
        <Footer />
      </div>
    </AuthGuard>
  )
}
