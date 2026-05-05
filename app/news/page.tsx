import PageLayout from '@/components/PageLayout'

export default function News() {
  return (
    <PageLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">News & Announcements</h1>
        <div className="kaf-card p-6 rounded-2xl">
          <h2 className="text-xl font-semibold mb-4">Welcome to KAFConnect</h2>
          <p className="text-slate-400 mb-4">FEATURED EVENT</p>
          <p className="text-sm text-slate-500">5/2/2026</p>
        </div>
      </div>
    </PageLayout>
  )
}