import Link from 'next/link'
import { FOOTER_SECTIONS, REGIONS } from '@/lib/constants'

export function Footer() {
  return (
    <footer className="py-16 border-t border-slate-800">
      <div className="grid md:grid-cols-4 gap-8">
        {Object.entries(FOOTER_SECTIONS).map(([key, section]) => (
          <div key={key}>
            <h4 className="font-bold mb-4">{section.title}</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              {section.links.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-cyan-200 transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <h4 className="font-bold mb-4">KAFConnect</h4>
          <p className="text-sm text-slate-400 mb-4">
            International esports hub for tournaments, clans, rankings and live match coverage. Powered by KAF E-League.
          </p>
          <p className="text-xs text-slate-500">© 2026 KAFCONNECT • ALL RIGHTS RESERVED</p>
        </div>
      </div>
      <div className="mt-8 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
        {REGIONS.join(' • ')}
      </div>
    </footer>
  )
}