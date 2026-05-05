import Header from '@/components/Header'

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Header />
        <main className="mt-8">
          {children}
        </main>
      </div>
    </div>
  )
}