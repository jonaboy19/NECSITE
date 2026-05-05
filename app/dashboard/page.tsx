export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="kaf-card p-4">Active Tournaments</div>
        <div className="kaf-card p-4">Your Clan</div>
        <div className="kaf-card p-4">Upcoming Matches</div>
      </div>
    </div>
  );
}