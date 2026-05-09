import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { MessageSquare, Trophy, Users, HelpCircle, ChevronRight } from 'lucide-react'
import PublicHeader from '@/components/PublicHeader'

const iconMap: any = {
  'message-square': MessageSquare,
  'trophy': Trophy,
  'users': Users,
  'help-circle': HelpCircle,
}

export default async function ForumHome() {
  const supabase = await createServerSupabaseClient()
  const { data: categories } = await supabase.from('forum_categories').select('*').order('display_order', { ascending: true })

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#050505] pb-20">
      <PublicHeader />
      
      {/* Hero Section */}
      <section className="relative w-full h-[30vh] min-h-[250px] bg-[#0a0a0c] overflow-hidden border-b border-kaf-border flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-kaf-bg via-kaf-bg/90 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 grayscale"></div>
        
        <div className="relative z-20 px-6 md:px-12 w-full max-w-7xl mx-auto flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-[10px] font-black uppercase tracking-widest mb-4 w-fit">
            <MessageSquare size={12} /> Community Hub
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-2 uppercase drop-shadow-lg">
            KAF <span className="text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.5)' }}>FORUMS</span>
          </h1>
          <p className="text-slate-400 font-medium max-w-md">
            Discuss strategies, find clans, and engage with the eFootball community.
          </p>
        </div>
      </section>

      {/* Categories */}
      <div className="p-6 md:p-12 max-w-7xl mx-auto w-full space-y-8">
        <div className="grid gap-2">
          {categories?.map((cat) => {
            const Icon = iconMap[cat.icon] || MessageSquare
            return (
              <Link href={`/forum/${cat.id}`} key={cat.id} className="group flex items-center justify-between p-6 bg-[#0a0a0c] border border-kaf-border hover:border-brand-cyan hover:bg-[#0f1014] transition-colors [clip-path:polygon(0_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%)]">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-kaf-bg flex items-center justify-center border border-kaf-border group-hover:border-brand-cyan/50 text-slate-400 group-hover:text-brand-cyan transition-colors">
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-widest group-hover:text-brand-cyan transition-colors">{cat.name}</h3>
                    <p className="text-sm text-slate-400 mt-1">{cat.description}</p>
                  </div>
                </div>
                <div className="hidden sm:block text-slate-600 group-hover:text-brand-cyan transition-colors">
                  <ChevronRight size={24} />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
