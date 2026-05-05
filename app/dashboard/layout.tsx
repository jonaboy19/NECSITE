export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 kaf-card p-4">
        <h2 className="font-bold text-xl mb-6">KAF</h2>
        <nav className="flex flex-col gap-3 text-sm">
          <a href="/dashboard">Dashboard</a>
          <a href="/clans">Clans</a>
          <a href="/tournaments">Tournaments</a>
          <a href="/rankings">Rankings</a>
          <a href="/admin">Admin</a>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}