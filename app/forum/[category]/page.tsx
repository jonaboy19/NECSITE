import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'
import PublicHeader from '@/components/PublicHeader'

export default async function ForumCategory({ params }: { params: Promise<{ category: string }> }) {
  const { category: categoryId } = await params
  const supabase = await createServerSupabaseClient()
  const { data: category } = await supabase.from('forum_categories').select('*').eq('id', categoryId).single()
  const { data: posts } = await supabase.from('forum_posts').select('*, profiles:author_id(username)').eq('category_id', categoryId).order('created_at', { ascending: false })

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#050505] pb-20">
      <PublicHeader />
      
      <div className="p-6 md:p-12 max-w-7xl mx-auto w-full space-y-8 mt-24">
        <div className="flex items-center justify-between border-b-2 border-kaf-border pb-4">
          <div>
            <Link href="/forum" className="text-xs text-brand-cyan hover:underline font-bold uppercase tracking-widest flex items-center gap-2 mb-4">
              <ArrowLeft size={12} /> Back to Forums
            </Link>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white">
              {category?.name || 'Category'}
            </h1>
          </div>
          <Link href={`/forum/create?category=${categoryId}`} className="px-6 py-3 bg-brand-cyan text-white font-black text-xs tracking-widest uppercase hover:bg-brand-teal transition-colors [clip-path:polygon(10px_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%,0_10px)] flex items-center gap-2">
            <Plus size={16} /> New Post
          </Link>
        </div>

        <div className="grid gap-2">
          {posts && posts.length > 0 ? posts.map(post => (
            <Link href={`/forum/post/${post.id}`} key={post.id} className="group flex items-center justify-between p-6 bg-[#0a0a0c] border border-kaf-border hover:border-brand-cyan hover:bg-[#0f1014] transition-colors">
              <div>
                <h3 className="text-lg font-black text-white group-hover:text-brand-cyan transition-colors">{post.title}</h3>
                <p className="text-xs text-slate-500 uppercase tracking-widest mt-2">
                  By <span className="text-brand-gold">{post.profiles?.username || 'Unknown'}</span> • {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-xs font-mono text-slate-500 text-right">
                {post.views} Views
              </div>
            </Link>
          )) : (
            <div className="p-12 text-center border border-kaf-border bg-[#0a0a0c] text-slate-500 uppercase font-mono text-sm">
              No posts found in this category.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
