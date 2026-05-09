import Link from 'next/link'
import { Award, Bell, CalendarDays, Eye, MessageSquare, TrendingUp } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/StatusBadge'

const operationsLinks = [
  { href: '/calendar', label: 'Operations Calendar', detail: 'Deadlines, fixtures, media windows', Icon: CalendarDays },
  { href: '/scouting', label: 'Scouting Board', detail: 'Filters, shortlists, recruitment notes', Icon: Eye },
  { href: '/seasons', label: 'Season Control', detail: 'Transfer windows, awards, resets', Icon: TrendingUp },
  { href: '/awards', label: 'Awards Room', detail: 'MVPs, rookies, clan trophies', Icon: Award },
]

export default async function RightSidebar() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: upcomingMatches }, { data: matchRooms }, { data: notifications }] = await Promise.all([
    supabase
    .from('matches')
      .select('id, tournament_id, round, status, scheduled_at, clan_a:clan_a_id(name,tag), clan_b:clan_b_id(name,tag), tournaments(title)')
    .eq('status', 'scheduled')
      .order('scheduled_at', { ascending: true })
      .limit(5),
    supabase
      .from('clan_match_rooms')
      .select('id, status, match_type, scheduled_at, clan_a:clan_a_id(name,tag), clan_b:clan_b_id(name,tag)')
      .in('status', ['proposed', 'scheduled', 'accepted', 'live'])
      .order('scheduled_at', { ascending: true, nullsFirst: false })
      .limit(5),
    user
      ? supabase
        .from('notifications')
        .select('id,title,body,link,read,created_at')
        .eq('user_id', user.id)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(5)
      : Promise.resolve({ data: [] as any[] }),
  ])

  const matches = upcomingMatches || []
  const rooms = matchRooms || []
  const unread = notifications || []

  return (
    <aside className="sticky top-0 hidden h-screen w-[19rem] flex-col overflow-y-auto border-l border-white/[0.07] bg-[#070908]/94 p-4 no-scrollbar backdrop-blur-2xl xl:flex">
      <div className="mb-8">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-300">
          <Bell size={16} className="text-brand-lime" />
          Command Queue
        </h3>
        <div className="flex flex-col gap-3">
          {unread.length === 0 ? (
            <div className="kaf-cut-sm border border-white/[0.06] bg-white/[0.025] px-3 py-4 text-center text-xs text-slate-500">No unread tasks.</div>
          ) : unread.map((item: any) => (
            <Link key={item.id} href={item.link || '/notifications'} className="group kaf-cut-sm border border-white/[0.06] bg-white/[0.025] p-3 transition-colors hover:border-brand-lime/40 hover:bg-brand-cyan/10">
              <div className="text-sm font-black text-white group-hover:text-brand-lime transition-colors line-clamp-1">{item.title}</div>
              {item.body && <div className="mt-1 line-clamp-2 text-xs text-slate-500">{item.body}</div>}
            </Link>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-300">
          <TrendingUp size={16} className="text-brand-cyan" />
          Upcoming Matches
        </h3>
        <div className="flex flex-col gap-3">
          {matches.length === 0 ? (
            <div className="kaf-cut-sm border border-white/[0.06] bg-white/[0.025] px-3 py-4 text-center text-xs text-slate-500">No upcoming tournament matches.</div>
          ) : matches.map((match: any) => (
            <Link key={match.id} href={`/matches/${match.id}`} className="flex flex-col gap-2 kaf-cut-sm bg-gradient-to-br from-kaf-card to-slate-900/50 p-4 border border-white/[0.06] hover:border-brand-cyan/40 transition-all shadow-md group">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span className="text-brand-cyan/80">{match.tournaments?.title || 'Scrim'}</span>
                <span>{match.scheduled_at ? new Date(match.scheduled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'TBD'}</span>
              </div>
              <div className="flex items-center justify-between font-black text-sm mt-1">
                <span className="group-hover:text-brand-cyan transition-colors">{match.clan_a?.tag || match.clan_a?.name || 'TBD'}</span>
                <span className="text-slate-500 text-[10px] px-2 py-0.5 rounded bg-kaf-bg border border-kaf-border">VS</span>
                <span className="group-hover:text-brand-cyan transition-colors">{match.clan_b?.tag || match.clan_b?.name || 'TBD'}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
          <CalendarDays size={16} />
          Operations
        </h3>
        <div className="flex flex-col gap-2">
          {operationsLinks.map(({ href, label, detail, Icon }) => (
            <Link key={href} href={href} className="group flex gap-3 kaf-cut-sm border border-white/[0.06] bg-white/[0.025] p-3 transition-colors hover:border-brand-cyan/40 hover:bg-brand-cyan/10">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-brand-cyan/20 bg-brand-cyan/10 text-brand-lime">
                <Icon size={16} />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-black uppercase tracking-wider text-white group-hover:text-brand-cyan">{label}</span>
                <span className="mt-1 block text-[11px] leading-snug text-slate-500">{detail}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
          <MessageSquare size={16} />
          Match Rooms
        </h3>
        <div className="flex flex-col gap-3">
          {rooms.length === 0 ? (
            <div className="kaf-cut-sm border border-white/[0.06] bg-white/[0.025] px-3 py-4 text-center text-xs text-slate-500">No active clan match rooms.</div>
          ) : rooms.map((room: any) => (
            <Link key={room.id} href={`/scrims`} className="kaf-cut-sm border border-white/[0.06] bg-white/[0.025] p-3 transition-colors hover:border-brand-lime/40 hover:bg-brand-cyan/10">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{room.match_type}</span>
                <StatusBadge status={room.status} />
              </div>
              <div className="text-sm font-black text-white">
                {room.clan_a?.tag || room.clan_a?.name || 'Clan A'} <span className="text-slate-500">vs</span> {room.clan_b?.tag || room.clan_b?.name || 'Clan B'}
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                {room.scheduled_at ? new Date(room.scheduled_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Scheduling open'}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  )
}
