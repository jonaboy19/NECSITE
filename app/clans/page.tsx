import { createClient } from '@/lib/supabase/client'
import PageLayout from '@/components/PageLayout'

export default async function Clans() {
  const supabase = createClient()
  const { data } = await supabase.from('clans').select('*')

  return (
    <PageLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Clans</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data?.map((clan) => (
            <div key={clan.id} className="kaf-card p-6 rounded-2xl">
              <div className="text-lg font-semibold">{clan.name}</div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  )
}