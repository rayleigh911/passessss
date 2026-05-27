import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDictionary } from '@/lib/dictionaries'

export const dynamic = 'force-dynamic'

export default async function Home({ params }: { params: Promise<{ locale: any }> }) {
  const session = await getServerSession(authOptions)
  const { locale } = await params
  const dict = await getDictionary(locale)

  return (
    <main className="flex-1 flex flex-col">
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
        &copy; {new Date().getFullYear()} marketplace1pass. All rights reserved.
      </footer>
    </main>
  )
}
