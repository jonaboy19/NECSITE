import './globals.css'
import { Inter, Outfit } from 'next/font/google'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import LeftSidebar from '@/components/LeftSidebar'
import RightSidebar from '@/components/RightSidebar'
import MobileNav from '@/components/MobileNav'
import { ToastProvider } from '@/components/Toast'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })

export const metadata = {
  title: 'KAFConnect — The Home of eFootball Esports',
  description: 'The ultimate esports platform for competitive eFootball. Tournaments, clans, rankings, and live match coverage.',
  keywords: 'esports, eFootball, tournament, clans, competitive gaming, KAF',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} dark`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#111418" />
        <link rel="icon" href="/kaf-logo.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="font-sans antialiased bg-kaf-bg text-white selection:bg-brand-cyan/30">
        <ToastProvider>
          {isLoggedIn ? (
            /* Logged-In Layout: Sidebar + Content + Right Panel */
            <div className="flex h-screen overflow-hidden">
              <LeftSidebar />
              <main className="flex-1 flex flex-col h-screen overflow-y-auto overflow-x-hidden no-scrollbar pb-24 lg:pb-0 relative">
                {children}
              </main>
              <RightSidebar />
              <MobileNav />
            </div>
          ) : (
            /* Public Layout: Full width, no sidebars */
            <div className="min-h-screen flex flex-col">
              {children}
            </div>
          )}
        </ToastProvider>
      </body>
    </html>
  )
}