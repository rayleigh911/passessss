'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function CheckoutPage() {
  const { id } = useParams()
  const router = useRouter()
  const [booking, setBooking] = useState<any>(null)

  useEffect(() => {
    fetch('/api/bookings').then(res => res.json()).then(data => {
      const found = data.find((b: any) => b.id === id)
      setBooking(found)
    })
  }, [id])

  const handlePay = async () => {
    const res = await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'PAID' })
    })
    
    if (res.ok) {
      alert('Payment successful! Held in escrow.')
      router.push('/client')
    } else {
      alert('Payment failed')
    }
  }

  if (!booking) return <div className="p-8">Loading checkout...</div>

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="bg-[var(--cards)] rounded-2xl p-8 shadow-sm border border-[var(--border)]">
        <h1 className="text-2xl font-bold mb-6 text-center">Secure Escrow Checkout</h1>
        
        <div className="space-y-4 mb-8">
          <div className="flex justify-between">
            <span className="text-[var(--muted)]">Service:</span>
            <span className="font-medium">{booking.service.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--muted)]">Provider:</span>
            <span className="font-medium">{booking.provider.businessName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--muted)]">Date:</span>
            <span className="font-medium">{new Date(booking.date).toLocaleDateString()}</span>
          </div>
          <hr className="border-[var(--border)]" />
          <div className="flex justify-between items-center text-lg">
            <span className="font-bold">Total (USD):</span>
            <span className="font-bold text-[var(--primary)]">${booking.totalAmount}</span>
          </div>
          <p className="text-xs text-[var(--muted)] mt-2">
            * Escrow Logic: Funds will be held securely until you confirm the service is COMPLETED.
          </p>
        </div>

        <button 
          onClick={handlePay}
          disabled={booking.status !== 'PENDING'}
          className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] py-4 rounded-xl font-bold hover:opacity-90 disabled:opacity-50"
        >
          {booking.status === 'PENDING' ? `Pay Securely` : `Already Paid`}
        </button>
      </div>
    </div>
  )
}
