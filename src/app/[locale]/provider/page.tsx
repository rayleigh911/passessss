'use client'

import { useEffect, useState } from 'react'

export default function ProviderDashboard() {
  const [bookings, setBookings] = useState([])
  const [profile, setProfile] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [bioEdit, setBioEdit] = useState('')
  const [pins, setPins] = useState<{[key: string]: string}>({})
  const [isOnline, setIsOnline] = useState(false)
  
  // Withdrawal States
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [bankDetails, setBankDetails] = useState('')

  // New Service State
  const [newService, setNewService] = useState({ title: '', description: '', price: '', duration: '' })

  const handleCreateService = async () => {
    if (!newService.title || !newService.price || !newService.duration) return alert('Fill all required fields');
    const res = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newService)
    });
    if (res.ok) {
      alert('Service created successfully!');
      setNewService({ title: '', description: '', price: '', duration: '' });
      fetchDash();
    } else {
      alert('Failed to create service');
    }
  }

  const fetchDash = () => {
    fetch('/api/bookings', { cache: 'no-store' }).then(res => res.json()).then(setBookings)
    fetch('/api/profile', { cache: 'no-store' }).then(res => res.json()).then(data => {
      setProfile(data)
      setBioEdit(data?.providerProfile?.bio || '')
      setServices(data?.providerProfile?.services || [])
      setIsOnline(data?.providerProfile?.isOnline || false)
    })
    fetch('/api/withdrawals', { cache: 'no-store' }).then(res => res.json()).then(setWithdrawals)
  }

  useEffect(() => {
    fetchDash()
  }, [])

  const updateStatus = async (id: string, status: string, pin?: string) => {
    const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, pin })
    })
    const data = await res.json()
    if (data.error) {
       alert(data.error)
    } else {
       fetchDash()
    }
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
      fetchDash()
    }
    setUploading(false)
  }

  const handleServiceImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, serviceId: string) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const data = await res.json()
    if (data.url) {
      await fetch(`/api/services/${serviceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: data.url })
      })
      fetchDash()
    }
  }

  const handleSaveBio = async () => {
    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bio: bioEdit })
    })
    alert('Bio saved successfully!')
  }

  const handleToggleOnline = async () => {
    const newState = !isOnline
    setIsOnline(newState)
    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isOnline: newState })
    })
  }

  const handleWithdrawal = async () => {
    const amt = parseFloat(withdrawAmount)
    if (!amt || !bankDetails) return alert('Enter amount and bank details')
    const res = await fetch('/api/withdrawals', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ amount: amt, bankDetails })
    })
    const data = await res.json()
    if (data.error) return alert(data.error)
    alert('Withdrawal request initialized!')
    setWithdrawAmount('')
    setBankDetails('')
    fetchDash()
  }

  const activeBalance = profile?.providerProfile?.balance || 0

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Profile Section */}
      <div className="flex gap-6 items-center flex-wrap sm:flex-nowrap mb-8 bg-[var(--cards)] p-6 rounded-2xl border border-[var(--border)] shadow-sm">
        <div className="relative w-24 h-24 rounded-full bg-[var(--sections)] flex items-center justify-center overflow-hidden border border-[var(--border)] shrink-0">
          {profile?.profilePicture ? (
            <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
          ) : (
             <span className="text-3xl text-[var(--muted)]">🏢</span>
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Provider Dashboard</h1>
          <p className="text-[var(--muted)] mb-2">{profile?.providerProfile?.businessName}</p>
          <span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm ${profile?.providerProfile?.verificationStatus === 'APPROVED' ? 'bg-green-600' : profile?.providerProfile?.verificationStatus === 'REJECTED' ? 'bg-red-600' : 'bg-yellow-600'}`}>
            {profile?.providerProfile?.verificationStatus || 'PENDING'}
          </span>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
               onClick={handleToggleOnline}
               className={`text-sm font-medium px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-sm ${isOnline ? 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-200' : 'bg-[var(--sections)] text-[var(--muted)] border border-[var(--border)] hover:bg-gray-200'}`}
             >
               {isOnline ? '🟢 You are Online' : '⚫ You are Offline'}
            </button>
            <label className="text-sm font-medium px-4 py-2 bg-[var(--sections)] text-[var(--foreground)] border border-[var(--border)] rounded-lg cursor-pointer hover:bg-white inline-block transition-colors shadow-sm">
              {uploading ? 'Uploading...' : 'Change Profile Picture'}
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading}/>
            </label>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 bg-[var(--sections)] p-6 rounded-xl border border-[var(--border)] flex flex-col shadow-sm">
          <h2 className="text-xl font-bold mb-3">Storefront Bio</h2>
          <textarea 
             value={bioEdit} 
             onChange={(e) => setBioEdit(e.target.value)}
             className="w-full flex-1 bg-[var(--background)] p-3 shadow-inner rounded-lg border border-[var(--border)] focus:outline-none mb-4 min-h-[120px] transition-colors focus:border-[var(--primary)]"
          />
          <button className="w-full px-4 py-3 font-bold bg-[var(--accent)] text-[var(--accent-foreground)] rounded-xl shadow-sm hover:-translate-y-0.5 transition-all outline-none" onClick={handleSaveBio}>
            Update Public Bio
          </button>
        </div>

        {/* Withdrawal Section */}
        <div className="lg:col-span-2 bg-[var(--background)] border border-[var(--border)] p-6 rounded-xl shadow-sm flex flex-col justify-between">
           <div className="flex justify-between items-center bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl p-6 mb-4 shadow-inner">
             <p className="text-sm uppercase tracking-wider font-semibold opacity-90">Available Ledger Balance</p>
             <p className="text-5xl font-extrabold"><span className="text-3xl font-bold opacity-80">$</span>{activeBalance}</p>
           </div>
           
           <div className="flex flex-col sm:flex-row gap-2">
             <input type="number" placeholder="Amt ($)" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} className="w-full sm:w-32 bg-[var(--cards)] p-3 border border-[var(--border)] rounded-lg outline-none focus:border-[var(--primary)]" />
             <input type="text" placeholder="RIB / IBAN / PayPal Details" value={bankDetails} onChange={e => setBankDetails(e.target.value)} className="w-full flex-1 bg-[var(--cards)] p-3 border border-[var(--border)] rounded-lg outline-none focus:border-[var(--primary)]" />
             <button onClick={handleWithdrawal} className="w-full sm:w-auto px-6 py-3 bg-[var(--sections)] border border-[var(--border)] hover:bg-white text-[var(--foreground)] rounded-lg font-bold shadow-sm transition-all text-nowrap">
               Request Withdrawal
             </button>
           </div>
        </div>
      </div>

      {/* Withdrawal Queue History */}
      {withdrawals.length > 0 && (
        <div className="mb-10 bg-[var(--cards)] rounded-xl border border-[var(--border)] overflow-hidden shadow-sm">
           <div className="bg-[var(--sections)] px-6 py-4 border-b border-[var(--border)]">
              <h2 className="text-lg font-bold">Withdrawal History</h2>
           </div>
           <div className="p-0 overflow-x-auto">
             <table className="w-full text-left text-sm whitespace-nowrap">
               <thead className="bg-[var(--background)]">
                 <tr>
                   <th className="p-4 font-semibold text-[var(--muted)]">Date</th>
                   <th className="p-4 font-semibold text-[var(--muted)]">Bank Details</th>
                   <th className="p-4 font-semibold text-[var(--muted)]">Amount</th>
                   <th className="p-4 font-semibold text-[var(--muted)]">Status</th>
                 </tr>
               </thead>
               <tbody>
                 {withdrawals.map((w: any) => (
                   <tr key={w.id} className="border-t border-[var(--border)]">
                     <td className="p-4">{new Date(w.createdAt).toLocaleDateString()}</td>
                     <td className="p-4 max-w-[200px] truncate">{w.bankDetails}</td>
                     <td className="p-4 font-bold text-[var(--foreground)]">${w.amount}</td>
                     <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${w.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : w.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                           {w.status}
                        </span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      )}

      {/* Services Loop */}
      <h2 className="text-xl font-bold mb-4">Your Services Catalog</h2>
      
      {/* New Service Form */}
      <div className="bg-[var(--cards)] p-6 rounded-xl border border-[var(--border)] shadow-sm mb-6 flex flex-col gap-4">
        <h3 className="font-bold">Add New Service</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input type="text" placeholder="Service Title (e.g., Deep Tissue Massage)" className="bg-[var(--background)] p-3 border border-[var(--border)] rounded-lg outline-none focus:border-[var(--primary)]" value={newService.title} onChange={e => setNewService({...newService, title: e.target.value})} />
          <input type="number" placeholder="Price ($)" className="bg-[var(--background)] p-3 border border-[var(--border)] rounded-lg outline-none focus:border-[var(--primary)]" value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})} />
          <input type="number" placeholder="Duration (Minutes)" className="bg-[var(--background)] p-3 border border-[var(--border)] rounded-lg outline-none focus:border-[var(--primary)]" value={newService.duration} onChange={e => setNewService({...newService, duration: e.target.value})} />
          <input type="text" placeholder="Short Description..." className="bg-[var(--background)] p-3 border border-[var(--border)] rounded-lg outline-none focus:border-[var(--primary)]" value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} />
        </div>
        <button onClick={handleCreateService} className="self-end px-6 py-3 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg font-bold shadow-sm hover:scale-[1.02] transition-transform">Add Service</button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {services.map(s => (
            <div key={s.id} className="bg-[var(--cards)] rounded-xl border border-[var(--border)] overflow-hidden shadow-sm flex flex-col hover:-translate-y-1 transition-all">
              <div className="h-40 bg-[var(--sections)] relative flex items-center justify-center">
                  {s.imageUrl ? (
                    <img src={s.imageUrl} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[var(--muted)] text-sm">No Image</span>
                  )}
                  <label className="absolute bottom-2 right-2 bg-black/70 text-white px-3 py-1 rounded-md cursor-pointer backdrop-blur-sm transition-all font-bold tracking-widest text-xs shadow-sm hover:bg-black">
                    UPLOAD
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleServiceImageUpload(e, s.id)} />
                  </label>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg leading-tight">{s.title}</h3>
                  <p className="text-sm text-[var(--muted)] flex-1 my-3 leading-relaxed">{s.description}</p>
                  <div className="flex justify-between items-center border-t border-[var(--border)] pt-3 mt-auto font-bold">
                    <span className="text-[var(--foreground)] text-sm">{s.duration} mins</span>
                    <span className="text-[var(--primary)] text-lg">${s.price}</span>
                  </div>
              </div>
            </div>
        ))}
      </div>

      <h2 className="text-xl font-bold mb-4">Escrow Booking Requests</h2>
      <div className="grid gap-4">
        {bookings.map((b: any) => (
          <div key={b.id} className="bg-[var(--cards)] p-6 rounded-xl border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-lg font-bold leading-tight">{b.service?.title} for {b.client?.fullName}</h2>
              <span className="font-bold text-[var(--primary)] text-sm bg-[var(--sections)] px-3 py-1 rounded-full">{b.status}</span>
            </div>
            <p className="text-sm text-[var(--muted)] mb-1">Scheduled: {new Date(b.date).toLocaleString()}</p>
            <p className="mt-4 text-sm font-bold text-green-600 bg-green-50 inline-block px-3 py-1 rounded-lg">Net Escrowed Pay: +${b.providerAmount}</p>

            <div className="flex flex-col gap-2 mt-4 border-t border-[var(--border)] pt-4">
              {b.status === 'PAID' && (
                <div className="flex gap-2">
                  <button onClick={() => updateStatus(b.id, 'ACCEPTED')} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm transition-all">Accept Request</button>
                  <button onClick={() => updateStatus(b.id, 'REJECTED')} className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 shadow-sm transition-all">Reject</button>
                </div>
              )}

              {(b.status === 'ACCEPTED' || b.status === 'SCHEDULED') && (
                <div className="bg-[var(--sections)] p-5 rounded-xl border border-[var(--border)] flex flex-col sm:flex-row gap-4 items-start sm:items-end w-full">
                   <div className="flex-1">
                      <p className="text-sm font-bold text-[var(--foreground)] mb-1">Require Client PIN to Execute Payout</p>
                      <p className="text-xs text-[var(--muted)] mb-3 leading-relaxed">Escrow funds unlock directly into your active balance ledger only after providing the physical presence 6-digit confirmation PIN.</p>
                      <input 
                        type="text"
                        placeholder="Enter 6-Digit PIN"
                        className="px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg text-xl font-mono tracking-widest w-full sm:w-48 outline-none focus:border-[var(--primary)] text-center shadow-inner"
                        value={pins[b.id] || ''}
                        onChange={(e) => setPins(prev => ({...prev, [b.id]: e.target.value}))}
                        maxLength={6}
                      />
                   </div>
                   <button 
                     onClick={() => updateStatus(b.id, 'COMPLETED', pins[b.id])}
                     disabled={(pins[b.id] || '').length < 6}
                     className="w-full sm:w-auto px-8 py-3 bg-[#5c6e5c] text-white rounded-lg font-bold disabled:opacity-50 hover:bg-[#4a584a] shadow-sm transition-all whitespace-nowrap active:scale-95"
                   >
                     Unlock Payout
                   </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {bookings.length === 0 && <p className="text-[var(--muted)] text-center py-10 bg-[var(--cards)] rounded-xl border dashed border-[var(--border)]">No booking requests yet.</p>}
      </div>

      <h2 className="text-xl font-bold mb-4 mt-8">Client Feedback & Reviews</h2>
      <div className="grid md:grid-cols-2 gap-4">
         {bookings.filter((b: any) => b.review).map((b: any) => (
            <div key={b.review.id} className="bg-[var(--cards)] border border-[var(--border)] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
               <div className="flex justify-between items-start mb-2 border-b border-[var(--border)] pb-2">
                 <div>
                    <h3 className="font-bold text-[var(--foreground)]">{b.client?.fullName}</h3>
                    <p className="text-xs text-[var(--muted)]">Service: {b.service?.title}</p>
                 </div>
                 <div className="bg-yellow-50 px-2 py-1 rounded text-yellow-700 font-bold border border-yellow-200">
                    ⭐ {b.review.rating}
                 </div>
               </div>
               <p className="text-sm italic text-[var(--foreground)] mt-3">"{b.review.comment || 'No comment provided.'}"</p>
               <p className="text-xs text-[var(--muted)] mt-2 text-right">{new Date(b.review.createdAt).toLocaleDateString()}</p>
            </div>
         ))}
         {bookings.filter((b: any) => b.review).length === 0 && (
            <p className="col-span-full py-8 text-center border border-[var(--border)] border-dashed rounded-lg bg-[var(--background)] text-[var(--muted)]">No reviews received yet. Complete secure escrow payouts to unlock feedback!</p>
         )}
      </div>

    </div>
  )
}
