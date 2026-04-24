'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function ProviderProfilePage() {
  const { id } = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [provider, setProvider] = useState<any>(null)

  useEffect(() => {
    fetch('/api/providers', { cache: 'no-store' }).then(res => res.json()).then(data => {
      setProvider(data.find((p: any) => p.id === id))
    })
  }, [id])

  const handleBook = async (serviceId: string) => {
    if (!session) {
      router.push('/login')
      return
    }
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providerId: id, serviceId, date: new Date().toISOString() })
    })
    
    const data = await res.json()
    if (res.ok) {
      router.push(`/checkout/${data.id}`)
    } else {
      alert(data.error || 'Failed to create booking request')
    }
  }

  if (!provider) return <div className="p-8 text-[var(--muted)]">Loading profile...</div>

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-[var(--cards)] rounded-2xl p-8 shadow-sm border border-[var(--border)] mb-8 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
        <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden bg-[var(--sections)] border-4 border-[var(--background)] shrink-0 shadow-sm">
           {provider.user?.profilePicture ? (
             <img src={provider.user.profilePicture} alt="Provider Avatar" className="w-full h-full object-cover" />
           ) : (
             <div className="w-full h-full flex items-center justify-center text-6xl">🏢</div>
           )}
        </div>
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-2 text-[var(--foreground)]">{provider.businessName}</h1>
          <p className="text-[var(--primary)] font-medium text-lg mb-4">{provider.city} • {provider.category} • ⭐ {provider.rating}</p>
          <p className="text-[var(--foreground)] bg-[var(--background)] p-4 rounded-xl border border-[var(--border)]">{provider.bio || 'Premium wellness services. Contact us for details.'}</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Services Offered</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {provider.services?.map((service: any) => (
          <div key={service.id} className="bg-[var(--cards)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm flex flex-col">
            <div className="h-48 bg-[var(--sections)] relative flex items-center justify-center">
                {service.imageUrl ? (
                  <img src={service.imageUrl} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[var(--muted)]">No Image Preview</span>
                )}
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-xl font-bold">{service.title}</h3>
              <p className="text-[var(--muted)] text-sm mb-4 flex-1 mt-2 line-clamp-3">{service.description}</p>
              <div className="flex justify-between items-center border-t border-[var(--border)] pt-4 mt-auto">
                <div className="font-bold">
                   <span className="block text-[var(--foreground)] text-sm">{service.duration} mins</span>
                   <span className="block text-[var(--primary)]">{service.price} MAD</span>
                </div>
                <button 
                  onClick={() => handleBook(service.id)}
                  className="px-6 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg font-medium hover:bg-[#7a8e79] transition-colors shadow-sm"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
        {(!provider.services || provider.services.length === 0) && (
          <p className="text-[var(--muted)] w-full col-span-full">No services listed yet.</p>
        )}
      </div>

      <div className="mt-16 mb-8 flex items-end justify-between border-b border-[var(--border)] pb-4">
         <h2 className="text-2xl font-bold">Trusted Client Reviews</h2>
         <p className="text-[var(--muted)] font-medium">{provider.bookings?.length || 0} Verified Escrows</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {provider.bookings?.map((b: any) => (
           <div key={b.review.id} className="bg-[var(--cards)] p-6 rounded-2xl border border-[var(--border)] shadow-sm hover:shadow-md transition-all">
             <div className="flex justify-between items-start mb-4">
               <div>
                  <h3 className="font-bold text-[var(--foreground)]">{b.client?.fullName}</h3>
                  <p className="text-xs text-[var(--muted)] uppercase tracking-wider mt-1">{b.service?.title}</p>
               </div>
               <div className="text-yellow-600 font-bold bg-yellow-50 px-3 py-1 rounded-lg border border-yellow-200 shadow-sm shrink-0">⭐ {b.review.rating}.0</div>
             </div>
             <p className="italic text-[var(--foreground)] text-sm mb-3 leading-relaxed">"{b.review.comment}"</p>
             <p className="text-xs text-[var(--muted)] text-right opacity-70">{new Date(b.review.createdAt).toLocaleDateString()}</p>
           </div>
        ))}
        {(!provider.bookings || provider.bookings.length === 0) && (
           <div className="py-12 px-6 bg-[var(--cards)] rounded-2xl border border-[var(--border)] border-dashed col-span-full flex flex-col items-center justify-center text-center">
              <span className="text-4xl mb-3 opacity-30">🛡️</span>
              <h3 className="font-bold text-lg mb-1">No Verified Reviews Yet</h3>
              <p className="text-[var(--muted)] text-sm">Be the first to securely book and review this provider!</p>
           </div>
        )}
      </div>
    </div>
  )
}
