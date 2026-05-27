'use client'

import { useEffect, useState } from 'react'

function StarRatingInput({ name }: { name: string }) {
  const [hover, setHover] = useState(0)
  const [rating, setRating] = useState(0)
  
  return (
    <div className="flex gap-2 text-3xl mb-3">
      <input type="hidden" name={name} value={rating} />
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          type="button"
          key={star}
          className={`transition-colors ${(hover || rating) >= star ? 'text-yellow-500' : 'text-gray-300'}`}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => setRating(star)}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export default function ClientDashboard() {
  const [bookings, setBookings] = useState([])
  const [profile, setProfile] = useState<any>(null)
  const [uploading, setUploading] = useState(false)

  const fetchBookings = () => {
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setBookings(data as any)
        } else {
          setBookings([])
        }
      })
  }

  useEffect(() => {
    fetchBookings()
    fetch('/api/profile').then(res => res.json()).then(setProfile)
  }, [])

  const submitReview = async (bookingId: string, rating: number, comment: string) => {
    if (rating < 1) return alert('Please select a star rating')
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ bookingId, rating, comment })
    })
    const data = await res.json()
    if (data.error) alert(data.error)
    else { alert('Review published!'); fetchBookings() }
  }

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    })
    fetchBookings()
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    const data = await res.json()
    
    if (data.url) {
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profilePicture: data.url })
      })
      setProfile((prev: any) => ({ ...prev, profilePicture: data.url }))
    }
    setUploading(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex gap-6 items-center flex-wrap sm:flex-nowrap mb-8 bg-[var(--cards)] p-6 rounded-xl border border-[var(--border)]">
        <div className="relative w-24 h-24 rounded-full bg-[var(--sections)] flex items-center justify-center overflow-hidden border border-[var(--border)]">
          {profile?.profilePicture ? (
            <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl text-[var(--muted)]">👤</span>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold">Client Dashboard</h1>
          <p className="text-[var(--muted)]">{profile?.fullName}</p>
          <div className="mt-2 flex gap-2">
            <label className="text-sm font-medium px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg cursor-pointer hover:opacity-90 inline-block shadow-sm transition-opacity whitespace-nowrap">
              {uploading ? 'Uploading...' : 'Change Profile Picture'}
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading}/>
            </label>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Your Bookings</h2>
      <div className="grid gap-4">
        {bookings.map((b: any) => (
          <div key={b.id} className="bg-[var(--cards)] p-6 rounded-xl border border-[var(--border)] relative overflow-hidden">
             {b.service?.imageUrl && (
                <div className="absolute right-0 top-0 bottom-0 w-48 opacity-20 hidden sm:block">
                  <img src={b.service.imageUrl} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--cards)] to-transparent"></div>
                </div>
             )}
            <div className="flex justify-between mb-2 relative z-10">
              <h2 className="text-lg font-bold">{b.service?.title}</h2>
              <span className="font-bold text-[var(--primary)] text-sm">{b.status}</span>
            </div>
            <p className="text-sm text-[var(--muted)] relative z-10">Provider: {b.provider?.businessName}</p>
            <p className="text-sm text-[var(--muted)] relative z-10">Date: {new Date(b.date).toLocaleString()}</p>
            <p className="mt-2 font-bold relative z-10">${b.totalAmount}</p>

            {(b.status === 'PAID' || b.status === 'ACCEPTED' || b.status === 'SCHEDULED') && b.completionPin && (
               <div className="mt-6 p-4 bg-[var(--background)] border-2 border-dashed border-[var(--primary)] rounded-lg relative z-10 inline-block">
                 <p className="text-xs uppercase font-bold text-[var(--primary)] tracking-widest mb-1">Secure Completion Escrow PIN</p>
                 <p className="text-3xl font-mono tracking-widest">{b.completionPin}</p>
                 <p className="text-xs text-[var(--muted)] mt-2">Only give this PIN to the provider once you are satisfied with the service completion.</p>
               </div>
            )}

            {b.review && (
               <div className="mt-4 p-4 bg-[var(--sections)] rounded-lg relative z-10 flex flex-col border border-[var(--border)] shadow-sm">
                 <p className="text-sm font-bold text-yellow-600 mb-1">Your Review: ⭐ {b.review.rating} / 5</p>
                 {b.review.comment && <p className="text-sm italic">"{b.review.comment}"</p>}
               </div>
            )}

            {b.status === 'COMPLETED' && !b.review && (!b.dispute || b.dispute.status !== 'OPEN') && (
               <form 
                 onSubmit={e => {
                   e.preventDefault()
                   const formData = new FormData(e.currentTarget)
                   const r = parseInt(formData.get('rating') as string)
                   const c = formData.get('comment') as string
                   submitReview(b.id, r, c)
                 }}
                 className="mt-6 p-4 bg-[var(--background)] border border-[var(--border)] rounded-lg relative z-10 shadow-sm"
               >
                 <p className="font-bold text-sm mb-2">Leave a Verified Review</p>
                 <StarRatingInput name="rating" />
                 <input type="text" name="comment" className="w-full text-sm p-3 border border-[var(--border)] bg-[var(--cards)] rounded-lg mb-2 outline-none focus:border-[var(--primary)] shadow-inner flex-1" placeholder="Share your experience (optional)..." />
                 <button type="submit" className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-bold hover:bg-yellow-700 shadow-sm transition-all w-full md:w-auto">Submit Review</button>
               </form>
            )}

            <div className="flex gap-2 mt-4 relative z-10">
              {(b.status === 'PAID' || b.status === 'ACCEPTED' || b.status === 'SCHEDULED') && (
                <button onClick={() => updateStatus(b.id, 'DISPUTED')} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium shadow-sm hover:bg-red-700">
                  Open Dispute
                </button>
              )}
            </div>
          </div>
        ))}
        {bookings.length === 0 && <p className="text-[var(--muted)]">No bookings found.</p>}
      </div>
    </div>
  )
}
