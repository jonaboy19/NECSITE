import { createClient } from '@/lib/supabase/client'

export default async function Clans() {
  const supabase = createClient()
  const { data } = await supabase.from('clans').select('*')

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Clans</h1>
      <div className="grid grid-cols-3 gap-4">
        {data?.map((clan) => (
          <div key={clan.id} className="kaf-card p-4">
            {clan.name}
          </div>
        ))}
      </div>
    </div>
  )
}