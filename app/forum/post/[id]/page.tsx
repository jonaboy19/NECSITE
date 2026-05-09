import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import PublicHeader from '@/components/PublicHeader'

export default async function ForumPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  
  // Increment view count
  await supabase.rpc('increment_post_views', { post_id: id })
  
  const { data: post } = await supabase.from('forum_posts').select('*, profiles:author_id(username, avatar_url, region), forum_categories(id, name)').eq('id', id).single()
  const { data: replies } = await supabase.from('forum_replies').select('*, profiles:author_id(username, avatar_url)').eq('post_id', id).order('created_at', { ascending: true })

  if (!post) return <div className="p-20 text-center text-white">Post not found.</div>

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#050505] pb-20">
      <PublicHeader />
      
      <div className="p-6 md:p-12 max-w-4xl mx-auto w-full space-y-8 mt-24">
        <Link href={`/forum/${post.category_id}`} className="text-xs text-brand-cyan hover:underline font-bold uppercase tracking-widest flex items-center gap-2">
          <ArrowLeft size={12} /> Back to {post.forum_categories?.name}
        </Link>

        {/* Original Post */}
        <div className="bg-[#0a0a0c] border border-kaf-border p-6 md:p-8">
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-white mb-6">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 mb-8 border-b border-kaf-border/50 pb-6">
            <div className="w-12 h-12 bg-kaf-bg border border-kaf-border rounded-sm bg-cover bg-center" style={{ backgroundImage: `url(${post.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.profiles?.username}`})`}}></div>
            <div>
              <div className="text-brand-gold font-bold">{post.profiles?.username}</div>
              <div className="text-xs text-slate-500 uppercase tracking-widest font-mono">{new Date(post.created_at).toLocaleString()}</div>
            </div>
          </div>
          <div className="text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
            {post.content}
          </div>
        </div>

        {/* Replies */}
        <div className="space-y-4 pt-8 border-t-2 border-brand-cyan shadow-[inset_0_5px_15px_rgba(25,133,59,0.05)]">
          <h3 className="text-lg font-black uppercase tracking-widest text-white mb-4">Replies ({replies?.length || 0})</h3>
          
          {replies?.map(reply => (
            <div key={reply.id} className="bg-[#0a0a0c] border border-kaf-border p-6 flex gap-6">
              <div className="w-10 h-10 shrink-0 bg-kaf-bg border border-kaf-border rounded-sm bg-cover bg-center hidden sm:block" style={{ backgroundImage: `url(${reply.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.profiles?.username}`})`}}></div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-white text-sm">{reply.profiles?.username}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">{new Date(reply.created_at).toLocaleString()}</span>
                </div>
                <div className="text-slate-400 text-sm whitespace-pre-wrap">
                  {reply.content}
                </div>
              </div>
            </div>
          ))}

          {/* Quick Reply Box */}
          <div className="bg-[#050505] border border-kaf-border p-6 mt-8">
            <textarea placeholder="Write a reply..." className="w-full bg-[#0a0a0c] border border-kaf-border text-white p-4 font-mono text-sm focus:border-brand-cyan focus:outline-none min-h-[120px] resize-none mb-4" />
            <button className="px-6 py-3 bg-brand-cyan text-white font-black text-xs tracking-widest uppercase hover:bg-brand-teal transition-colors [clip-path:polygon(10px_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%,0_10px)]">
              Submit Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
