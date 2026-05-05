import PageLayout from '@/components/PageLayout'
import { Play, Clock } from 'lucide-react'

export default function MatchCenter() {
  return (
    <PageLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Match Center</h1>

        <div className="kaf-card p-6 rounded-2xl">
          <h2 className="text-xl font-semibold mb-4">Live Matches</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
              <div className="flex items-center gap-4">
                <Play size={20} className="text-emerald-400" />
                <div>
                  <p className="font-semibold">NECTOUR 2025 — LIVE</p>
                  <p className="text-sm text-slate-400">KAF E-LEAGUE SEASON 1</p>
                </div>
              </div>
              <a href="https://twitch.tv/nectour2025" className="text-cyan-200 hover:text-cyan-100 transition">
                Watch Stream
              </a>
            </div>
          </div>
        </div>

        <div className="kaf-card p-6 rounded-2xl">
          <h2 className="text-xl font-semibold mb-4">Upcoming Matches</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
              <div className="flex items-center gap-4">
                <Clock size={20} className="text-slate-400" />
                <div>
                  <p className="font-semibold">Tournament Match</p>
                  <p className="text-sm text-slate-400">Team A vs Team B</p>
                </div>
              </div>
              <span className="text-sm text-slate-400">Scheduled</span>
            </div>
          </div>
        </div>

        <div className="kaf-card p-6 rounded-2xl">
          <h2 className="text-xl font-semibold mb-4">Recent Results</h2>
          <p className="text-slate-400">No completed matches yet.</p>
        </div>
      </div>
    </PageLayout>
  )
}