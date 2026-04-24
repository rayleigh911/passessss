import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import LogoutButton from '@/components/LogoutButton'
import LanguageSwitcher from '@/app/components/LanguageSwitcher'
import { getDictionary } from '@/lib/dictionaries'

export default async function Home({ params }: { params: Promise<{ locale: any }> }) {
  const session = await getServerSession(authOptions)
  const { locale } = await params
  const dict = await getDictionary(locale)

  return (
    <main className="flex-1 flex flex-col">
      {/* Navigation */}
      <nav className="bg-[var(--cards)] shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="text-2xl font-bold text-[var(--primary)] shrink-0">1pass.ma</div>
          <div className="flex gap-4 items-center">
            {session ? (
              <>
                <Link 
                  href={session.user.role === 'ADMIN' ? `/${locale}/admin` : session.user.role === 'PROVIDER' ? `/${locale}/provider` : `/${locale}/client`}
                  className="font-medium text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
                >
                  {dict.nav.dashboard}
                </Link>
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
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-[var(--sections)] flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
        <h1 className="text-5xl md:text-6xl font-bold text-[var(--foreground)] max-w-3xl leading-tight mb-6 tracking-tight">
          {dict.home.title_part1} <span className="text-[var(--primary)]">{dict.home.title_part2}</span>
        </h1>
        <p className="text-xl text-[var(--muted)] max-w-xl mb-10">
          {dict.home.subtitle}
        </p>
        <div className="flex gap-4 sm:flex-row flex-col w-full sm:w-auto">
          <Link href={`/${locale}/browse`} className="px-8 py-4 bg-[var(--accent)] text-[var(--accent-foreground)] font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all w-full sm:w-auto">
            {dict.home.browse_btn}
          </Link>
          {!session && (
            <Link href={`/${locale}/signup`} className="px-8 py-4 bg-[var(--cards)] text-[var(--foreground)] font-medium rounded-xl border border-[var(--border)] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all w-full sm:w-auto">
              {dict.home.join_btn}
            </Link>
          )}
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-[var(--cards)] py-8 border-t border-[var(--border)] text-center text-[var(--muted)]">
        &copy; {new Date().getFullYear()} 1pass.ma. All rights reserved.
      </footer>
    </main>
  )
}
