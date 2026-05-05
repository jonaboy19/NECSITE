import PageLayout from '@/components/PageLayout'

export default function Dashboard() {
  return (
    <PageLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="kaf-card p-6 rounded-2xl">
            <h3 className="text-lg font-semibold mb-2">Active Tournaments</h3>
            <p className="text-slate-400">Manage your ongoing tournaments</p>
          </div>
          <div className="kaf-card p-6 rounded-2xl">
            <h3 className="text-lg font-semibold mb-2">Your Clan</h3>
            <p className="text-slate-400">View and manage your clan</p>
          </div>
          <div className="kaf-card p-6 rounded-2xl">
            <h3 className="text-lg font-semibold mb-2">Upcoming Matches</h3>
            <p className="text-slate-400">Check your scheduled matches</p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}