import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Trophy } from 'lucide-react'
import PublicHeader from '@/components/PublicHeader'
import RankingsClient from '@/components/RankingsClient'

export const metadata = {
  title: 'Global Rankings — KAFConnect',
  description: 'The official KAFConnect Top 50 global leaderboard based on Elo MMR performance.',
}

export default async function Rankings() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('rankings')
    .select('*, profiles(username, avatar_url), clans(name)')
    .order('rating', { ascending: false })
    .limit(50)

  const rankingsData = data && data.length > 0 ? data : []

  return (
    <div className="flex flex-col w-full">
      <PublicHeader />
      <div className="p-4 md:p-6 lg:p-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-kaf-border pb-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-display font-black text-white flex items-center gap-3 uppercase tracking-wide">
              <Trophy className="text-brand-gold" size={40} /> Global Leaderboard
            </h1>
            <p className="text-slate-400 mt-2 font-medium">The official KAFConnect Top 50 Rankings based on Elo MMR.</p>
          </div>
          {/* Tab switcher is rendered inside RankingsClient */}
        </div>

        <RankingsClient rankingsData={rankingsData as any} />
      </div>
    </div>
  )
}
