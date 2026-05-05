import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function Tournaments() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('tournaments').select('*')

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tournaments</h1>
      <div className="grid grid-cols-3 gap-4">
        {data?.map((t) => (
          <div key={t.id} className="kaf-card p-4">
            {t.title}
          </div>
        ))}
      </div>
    </div>
  )
}