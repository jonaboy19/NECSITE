import PageLayout from '@/components/PageLayout'
import { MessageCircle, Users, Trophy } from 'lucide-react'

export default function Community() {
  const communities = [
    { name: 'Discord', description: 'Main community hub for discussions and announcements', members: '2.5K+' },
    { name: 'WhatsApp Groups', description: 'Regional groups for local coordination', members: '500+' },
    { name: 'TikTok', description: 'Highlights, memes, and esports content', members: '10K+' }
  ]

  return (
    <PageLayout>
      <div className="space-y-12">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-black">Join the Community</h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Connect with fellow eFootball players, share strategies, and stay updated with the latest KAF events.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {communities.map(community => (
            <div key={community.name} className="kaf-card p-6 rounded-2xl text-center">
              <MessageCircle size={48} className="text-cyan-200 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{community.name}</h3>
              <p className="text-slate-400 mb-4">{community.description}</p>
              <p className="text-sm text-cyan-200">{community.members} members</p>
            </div>
          ))}
        </div>

        <div className="kaf-card p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-6 text-center">Community Guidelines</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <Users size={32} className="text-cyan-200 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Respect</h3>
              <p className="text-sm text-slate-400">Treat all members with respect and sportsmanship</p>
            </div>
            <div className="text-center">
              <Trophy size={32} className="text-cyan-200 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Fair Play</h3>
              <p className="text-sm text-slate-400">Compete fairly and report any issues</p>
            </div>
            <div className="text-center">
              <MessageCircle size={32} className="text-cyan-200 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Communication</h3>
              <p className="text-sm text-slate-400">Keep discussions positive and on-topic</p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}