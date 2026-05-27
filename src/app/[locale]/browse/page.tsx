'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function BrowsePage() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const currentLocale = pathname.split('/')[1] || 'en'
  const [providers, setProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchCity, setSearchCity] = useState('')
  const [searchCategory, setSearchCategory] = useState('')

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (searchCity) params.append('city', searchCity)
    if (searchCategory) params.append('category', searchCategory)

    fetch('/api/providers?' + params.toString(), { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProviders(data)
        } else {
          setProviders([])
        }
        setLoading(false)
      })
  }, [searchCity, searchCategory])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-[var(--cards)] p-6 rounded-2xl shadow-sm border border-[var(--border)] mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
         <div>
            <Link href={session ? `/${currentLocale}/${(session.user as any)?.role?.toLowerCase() || 'client'}` : `/${currentLocale}`} className="inline-flex items-center text-sm font-bold text-[var(--muted)] hover:text-[var(--primary)] mb-4 transition-colors">
               ← {session ? 'Back to Dashboard' : 'Back to Home'}
            </Link>
            <h1 className="text-3xl font-bold text-[var(--foreground)]">Find Your Wellness Expert</h1>
            <p className="text-[var(--muted)] mt-1">Book highly rated massage, spa, and beauty professionals.</p>
         </div>
         <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <select 
               className="flex-1 md:w-48 bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] px-4 py-3 rounded-xl outline-none focus:border-[var(--primary)] shadow-sm font-medium"
               value={searchCity}
               onChange={(e) => setSearchCity(e.target.value)}
            >
               <option value="">All Regions</option>
               {["Atlanta", "Austin", "Baltimore", "Boston", "Charlotte", "Chicago", "Columbus", "Dallas", "Denver", "Detroit", "El Paso", "Fort Worth", "Houston", "Indianapolis", "Jacksonville", "Las Vegas", "Los Angeles", "Memphis", "Miami", "Milwaukee", "Minneapolis", "Nashville", "New Orleans", "New York", "Oakland", "Oklahoma City", "Philadelphia", "Phoenix", "Portland", "Sacramento", "San Antonio", "San Diego", "San Francisco", "San Jose", "Seattle", "Washington"].map(city => (
                  <option key={city} value={city}>{city}</option>
               ))}
            </select>
            <select 
               className="flex-1 md:w-48 bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] px-4 py-3 rounded-xl outline-none focus:border-[var(--primary)] shadow-sm font-medium"
               value={searchCategory}
               onChange={(e) => setSearchCategory(e.target.value)}
            >
               <option value="">All Categories</option>
               <option value="Massage">Massage</option>
               <option value="Hammam">Spa</option>
               <option value="Physiotherapy">Physiotherapy</option>
               <option value="Beauty">Beauty</option>
            </select>
         </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
           <div className="animate-spin text-4xl text-[var(--primary)]">⚙</div>
        </div>
      ) : providers.length === 0 ? (
        <div className="text-center py-20 bg-[var(--sections)] rounded-2xl border border-[var(--border)] border-dashed">
           <p className="text-[var(--muted)] text-lg">No experts found matching your criteria.</p>
           <button onClick={() => { setSearchCity(''); setSearchCategory('') }} className="mt-4 text-[var(--primary)] font-bold hover:underline">Clear Filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((p: any) => (
            <div key={p.id} className="bg-[var(--cards)] border border-[var(--border)] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col group">
              <div className="flex justify-between items-start mb-4 gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 bg-[var(--sections)] border border-[var(--border)] group-hover:scale-105 transition-transform duration-300">
                   {p.user?.profilePicture ? <img src={p.user.profilePicture} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">🏢</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold leading-tight line-clamp-1">{p.businessName}</h2>
                  <p className="text-[var(--primary)] text-sm font-bold uppercase tracking-wider mt-1">{p.city}</p>
                </div>
                <span className="bg-[var(--background)] text-[var(--foreground)] px-3 py-1 rounded-lg text-xs font-bold shrink-0 border border-[var(--border)] shadow-sm">
                  {p.category}
                </span>
              </div>
              <p className="text-sm flex-1 mb-3 text-[var(--muted)] line-clamp-2 leading-relaxed">{p.bio || 'Premium wellness services. Quality mathematically guaranteed.'}</p>
              
              <div className="mb-4 text-[var(--foreground)] font-bold text-sm">
                {p.services && p.services.length > 0 ? (
                  <span className="text-[var(--primary)] text-lg">Starts at ${Math.min(...p.services.map((s:any)=>s.price))}</span>
                ) : (
                  <span className="text-[var(--muted)] text-xs font-medium">Pricing unavailable</span>
                )}
              </div>
              
              <div className="bg-[var(--background)] -mx-6 -mb-6 px-6 py-4 flex justify-between items-center border-t border-[var(--border)]">
                <div className="flex items-center gap-2">
                   <div className="font-extrabold text-[#d4af37] text-lg leading-none">⭐ {p.rating}</div>
                   <div className="text-xs text-[var(--muted)] border-l border-[var(--border)] pl-2">
                     ({p.bookings?.length || 0} reviews)
                   </div>
                </div>
                <button onClick={() => router.push(`/${currentLocale}/provider/${p.id}`)} className="px-5 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg text-sm font-bold hover:scale-105 shadow-sm transition-transform">
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
