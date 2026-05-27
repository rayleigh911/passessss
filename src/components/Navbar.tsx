'use client'

import { useState, useEffect } from 'react'
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

  // Prevent scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  return (
    <nav className="bg-[var(--cards)] shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <Link href={`/${locale}`} className="text-2xl font-bold text-[var(--primary)] shrink-0">1pass.us</Link>

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
              <Link href={`/${locale}/signup`} className="font-medium px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity shadow-sm">{dict.nav.signup}</Link>
            </>
          )}
          <LanguageSwitcher />
        </div>

        {/* Mobile Menu Button (Right Side) */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setIsOpen(true)} className="p-2 -mr-2 text-[var(--foreground)] hover:text-[var(--primary)] focus:outline-none transition-colors rounded-lg hover:bg-gray-100">
            <Menu size={28} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-[100]">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Vertical Drawer */}
          <div className="fixed inset-y-0 right-0 w-3/4 max-w-sm bg-white/95 backdrop-blur-xl shadow-2xl flex flex-col p-6 animate-in slide-in-from-right-8 duration-300">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border)]">
              <span className="text-xl font-extrabold text-[var(--primary)] tracking-tight">Menu</span>
              <button onClick={() => setIsOpen(false)} className="p-2 bg-gray-100/80 rounded-full text-gray-500 hover:text-black hover:bg-gray-200 transition-all shadow-inner">
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-6 flex-1">
              {session ? (
                <>
                  {isDashboard ? (
                    <>
                      <Link href={homeHref} onClick={() => setIsOpen(false)} className="text-lg font-bold text-[var(--foreground)] hover:text-[var(--primary)] transition-colors flex items-center">
                        {dict.nav.home}
                      </Link>
                      <Link href={browseHref} onClick={() => setIsOpen(false)} className="text-lg font-bold text-[var(--foreground)] hover:text-[var(--primary)] transition-colors flex items-center">
                        {dict.nav.browse}
                      </Link>
                    </>
                  ) : (
                    <Link 
                      href={dashboardHref}
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-bold text-[var(--foreground)] hover:text-[var(--primary)] transition-colors flex items-center"
                    >
                      {dict.nav.dashboard}
                    </Link>
                  )}
                  <div className="mt-4 border-t border-[var(--border)] pt-6" onClick={() => setIsOpen(false)}>
                    <LogoutButton />
                  </div>
                </>
              ) : (
                <>
                  <Link href={`/${locale}/login`} onClick={() => setIsOpen(false)} className="text-lg font-bold text-[var(--foreground)] hover:text-[var(--primary)] transition-colors">
                    {dict.nav.login}
                  </Link>
                  <Link href={`/${locale}/signup`} onClick={() => setIsOpen(false)} className="mt-2 text-center text-lg font-bold py-3 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl hover:opacity-90 hover:scale-[1.02] hover:shadow-lg transition-all shadow-md">
                    {dict.nav.signup}
                  </Link>
                </>
              )}
            </div>

            <div className="mt-auto pt-6 border-t border-[var(--border)]">
              <p className="text-[10px] text-[var(--muted)] mb-3 font-extrabold tracking-widest uppercase">Language Preference</p>
              <div className="bg-[var(--sections)] p-1 rounded-lg border border-[var(--border)] shadow-inner">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
