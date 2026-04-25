'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LanguageSwitcher from '@/app/components/LanguageSwitcher'
import LogoutButton from '@/components/LogoutButton'
import { Menu, X } from 'lucide-react'

export default function Navbar({ session, locale, dict }: { session: any, locale: string, dict: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const isDashboard = pathname.includes('/admin') || pathname.includes('/provider') || pathname.includes('/client')
  
  const dashboardHref = session ? (session.user.role === 'ADMIN' ? `/${locale}/admin` : session.user.role === 'PROVIDER' ? `/${locale}/provider` : `/${locale}/client`) : `/${locale}/login`
  const homeHref = `/${locale}`
  const browseHref = `/${locale}/browse`

  return (
    <nav className="bg-[var(--cards)] shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <Link href={`/${locale}`} className="text-2xl font-bold text-[var(--primary)] shrink-0">1pass.ma</Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-4 items-center">
          {session ? (
            <>
              {isDashboard ? (
                <>
                  <Link href={homeHref} className="font-medium text-[var(--foreground)] hover:text-[var(--primary)] transition-colors">
                    {dict.nav.home}
                  </Link>
                  <Link href={browseHref} className="font-medium text-[var(--foreground)] hover:text-[var(--primary)] transition-colors">
                    {dict.nav.browse}
                  </Link>
                </>
              ) : (
                <Link 
                  href={dashboardHref}
                  className="font-medium text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
                >
                  {dict.nav.dashboard}
                </Link>
              )}
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href={`/${locale}/login`} className="font-medium text-[var(--foreground)] hover:text-[var(--primary)] transition-colors">{dict.nav.login}</Link>
              <Link href={`/${locale}/signup`} className="font-medium px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity">{dict.nav.signup}</Link>
            </>
          )}
          <LanguageSwitcher />
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setIsOpen(!isOpen)} className="text-[var(--foreground)] hover:text-[var(--primary)] focus:outline-none">
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[var(--cards)] border-t border-[var(--border)] px-4 pt-2 pb-4 space-y-3 shadow-lg absolute w-full left-0 z-40">
          {session ? (
            <>
              {isDashboard ? (
                <>
                  <Link href={homeHref} onClick={() => setIsOpen(false)} className="block font-medium text-[var(--foreground)] hover:text-[var(--primary)] transition-colors py-2">
                    {dict.nav.home}
                  </Link>
                  <Link href={browseHref} onClick={() => setIsOpen(false)} className="block font-medium text-[var(--foreground)] hover:text-[var(--primary)] transition-colors py-2">
                    {dict.nav.browse}
                  </Link>
                </>
              ) : (
                <Link 
                  href={dashboardHref}
                  onClick={() => setIsOpen(false)}
                  className="block font-medium text-[var(--foreground)] hover:text-[var(--primary)] transition-colors py-2"
                >
                  {dict.nav.dashboard}
                </Link>
              )}
              <div className="py-2" onClick={() => setIsOpen(false)}>
                <LogoutButton />
              </div>
            </>
          ) : (
            <>
              <Link href={`/${locale}/login`} onClick={() => setIsOpen(false)} className="block font-medium text-[var(--foreground)] hover:text-[var(--primary)] transition-colors py-2">
                {dict.nav.login}
              </Link>
              <Link href={`/${locale}/signup`} onClick={() => setIsOpen(false)} className="block font-medium text-center py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity mt-2">
                {dict.nav.signup}
              </Link>
            </>
          )}
          <div className="pt-2 border-t border-[var(--border)]">
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </nav>
  )
}
