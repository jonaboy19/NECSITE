import Link from 'next/link'
import PageLayout from '@/components/PageLayout'
import { Tv, Image, Users, MessageCircle } from 'lucide-react'

export default function Sponsors() {
  const benefits = [
    { icon: Tv, title: 'Live Coverage', description: 'Twitch + YouTube broadcasts' },
    { icon: Image, title: '5 Regions', description: 'Africa, EU, Asia, MENA, AM' },
    { icon: Image, title: 'Branded Overlays', description: 'Logo on every match' },
    { icon: Users, title: 'Engaged Community', description: 'TikTok / Discord / WhatsApp' }
  ]

  return (
    <PageLayout>
      <div className="space-y-12">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-black">Become a Sponsor</h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Reach a fast-growing international esports community. KAFConnect connects players across Africa, Europe, Asia and MENA — with live-streamed tournaments, branded overlays and growing social reach.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map(({ icon: Icon, title, description }) => (
            <div key={title} className="kaf-card p-6 rounded-2xl text-center">
              <Icon size={48} className="text-cyan-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-sm text-slate-400">{description}</p>
            </div>
          ))}
        </div>

        <div className="kaf-card p-8 rounded-2xl text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Partner?</h2>
          <p className="text-slate-400 mb-6">Contact us to discuss sponsorship opportunities and get your brand in front of thousands of esports enthusiasts.</p>
          <Link href="/contact" className="rounded-2xl bg-cyan-400 px-8 py-4 font-bold text-slate-950 hover:bg-cyan-300 transition">
            Contact Us
          </Link>
        </div>
      </div>
    </PageLayout>
  )
}