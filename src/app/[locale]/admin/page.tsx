'use client'
import { useEffect, useState } from 'react'

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<any[]>([])
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [providers, setProviders] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])

  const fetchAdminData = () => {
    fetch('/api/bookings', { cache: 'no-store' }).then(res => res.json()).then(data => { if (Array.isArray(data)) setBookings(data) })
    fetch('/api/withdrawals', { cache: 'no-store' }).then(res => res.json()).then(data => { if (Array.isArray(data)) setWithdrawals(data) })
    fetch('/api/providers', { cache: 'no-store' }).then(res => res.json()).then(data => { if (Array.isArray(data)) setProviders(data.filter((p: any) => p.verificationStatus === 'PENDING')) })
    fetch('/api/users', { cache: 'no-store' }).then(res => res.json()).then(data => { if (Array.isArray(data)) setUsers(data) })
    fetch('/api/services/admin', { cache: 'no-store' }).then(res => res.json()).then(data => { if (Array.isArray(data)) setServices(data) })
  }

  useEffect(() => {
    fetchAdminData()
  }, [])

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    })
    fetch('/api/bookings').then(res => res.json()).then(setBookings)
  }

  const updateWithdrawal = async (id: string, status: string) => {
    await fetch(`/api/withdrawals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    })
    fetchAdminData()
  }

  const approveProvider = async (id: string, verificationStatus: string) => {
    await fetch(`/api/providers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationStatus })
    })
    fetchAdminData()
  }

  const toggleUserBan = async (id: string, isBanned: boolean) => {
    if (!confirm(isBanned ? 'Are you sure you want to BAN this user forever?' : 'Unban this user?')) return;
    await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isBanned })
    })
    fetchAdminData()
  }

  const removeService = async (id: string) => {
    if (!confirm('Are you sure you want to remove this service from the platform?')) return;
    await fetch(`/api/services/${id}`, { method: 'DELETE' })
    fetchAdminData()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Platform Control</h1>
      </div>
      
      <h2 className="text-xl font-bold mb-4">All Platform Bookings</h2>
      <div className="overflow-x-auto bg-[var(--cards)] rounded-xl border border-[var(--border)]">
        <table className="w-full text-left">
          <thead className="bg-[var(--sections)]">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Client</th>
              <th className="p-4">Provider</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b: any) => (
              <tr key={b.id} className="border-t border-[var(--border)]">
                <td className="p-4 text-xs">{b.id.slice(0, 8)}...</td>
                <td className="p-4">{b.client?.fullName}</td>
                <td className="p-4">{b.provider?.user?.fullName}</td>
                <td className="p-4 font-bold">{b.status}</td>
                <td className="p-4">
                  {b.status === 'DISPUTED' && (
                    <button onClick={() => updateStatus(b.id, 'REFUNDED')} className="px-3 py-1 bg-red-600 text-white rounded text-sm">Force Refund</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 className="text-xl font-bold mt-12 mb-4">Pending Provider Payouts (Withdrawals)</h2>
      <div className="overflow-x-auto bg-[var(--cards)] rounded-xl border border-[var(--border)] mb-12 shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-[var(--sections)] text-sm">
            <tr>
              <th className="p-4">Provider</th>
              <th className="p-4">Bank/ACH Details</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map((w: any) => (
              <tr key={w.id} className="border-t border-[var(--border)] hover:bg-[var(--background)] transition-colors">
                <td className="p-4 font-medium">{w.provider?.businessName}</td>
                <td className="p-4 text-xs font-mono">{w.bankDetails}</td>
                <td className="p-4 font-bold text-[var(--primary)]">${w.amount}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${w.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : w.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                     {w.status}
                  </span>
                </td>
                <td className="p-4">
                  {w.status === 'PENDING' && (
                    <div className="flex gap-2">
                       <button onClick={() => updateWithdrawal(w.id, 'APPROVED')} className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-bold transition-all">Send Wire</button>
                       <button onClick={() => updateWithdrawal(w.id, 'REJECTED')} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold transition-all">Reject</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {withdrawals.length === 0 && (
               <tr><td colSpan={5} className="p-6 text-center text-[var(--muted)]">No withdrawal requests found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="text-xl font-bold mt-12 mb-4">Pending Provider Approvals</h2>
      <div className="overflow-x-auto bg-[var(--cards)] rounded-xl border border-[var(--border)] mb-12 shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-[var(--sections)] text-sm">
            <tr>
              <th className="p-4">Business Name</th>
              <th className="p-4">Owner Email</th>
              <th className="p-4">City / Category</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {providers.map((p: any) => (
              <tr key={p.id} className="border-t border-[var(--border)] hover:bg-[var(--background)] transition-colors">
                <td className="p-4 font-medium">{p.businessName}</td>
                <td className="p-4 text-xs font-mono">{p.user?.email}</td>
                <td className="p-4 text-sm">{p.city} - {p.category}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                     <button onClick={() => approveProvider(p.id, 'APPROVED')} className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-bold transition-all">Approve</button>
                     <button onClick={() => approveProvider(p.id, 'REJECTED')} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold transition-all">Reject</button>
                  </div>
                </td>
              </tr>
            ))}
            {providers.length === 0 && (
               <tr><td colSpan={4} className="p-6 text-center text-[var(--muted)]">No pending providers.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="text-xl font-bold mt-12 mb-4">Platform Services Management (Remove Services)</h2>
      <div className="overflow-x-auto bg-[var(--cards)] rounded-xl border border-[var(--border)] mb-12 shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-[var(--sections)] text-sm">
            <tr>
              <th className="p-4">Service Details</th>
              <th className="p-4">Provider</th>
              <th className="p-4">Price</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s: any) => (
              <tr key={s.id} className="border-t border-[var(--border)] hover:bg-[var(--background)] transition-colors">
                <td className="p-4">
                   <p className="font-bold">{s.title}</p>
                   <p className="text-xs text-[var(--muted)]">{s.duration} mins</p>
                </td>
                <td className="p-4">
                   <p className="font-medium">{s.provider?.businessName}</p>
                   <p className="text-xs font-mono opacity-80">{s.provider?.user?.email}</p>
                </td>
                <td className="p-4 font-bold text-[var(--primary)]">${s.price}</td>
                <td className="p-4">
                   <button onClick={() => removeService(s.id)} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold transition-all">Remove</button>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
               <tr><td colSpan={4} className="p-6 text-center text-[var(--muted)]">No active services on platform.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="text-xl font-bold mt-12 mb-4">Platform Accounts (Global Control)</h2>
      <div className="overflow-x-auto bg-[var(--cards)] rounded-xl border border-[var(--border)] mb-12 shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-[var(--sections)] text-sm">
            <tr>
              <th className="p-4">Name & Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Joined Date</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.id} className={`border-t border-[var(--border)] transition-colors ${u.isBanned ? 'bg-red-50' : 'hover:bg-[var(--background)]'}`}>
                <td className="p-4">
                   <p className="font-bold">{u.fullName}</p>
                   <p className="text-xs font-mono opacity-80">{u.email}</p>
                </td>
                <td className="p-4">
                   <span className="bg-[var(--sections)] border border-[var(--border)] px-2 py-1 rounded text-xs font-bold">{u.role}</span>
                </td>
                <td className="p-4 text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="p-4">
                   <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.isBanned ? 'bg-red-200 text-red-900 border border-red-300' : 'bg-green-100 text-green-800'}`}>
                      {u.isBanned ? 'BANNED' : 'ACTIVE'}
                   </span>
                </td>
                <td className="p-4">
                   {u.isBanned ? (
                      <button onClick={() => toggleUserBan(u.id, false)} className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-bold transition-all">Unban</button>
                   ) : (
                      <button onClick={() => toggleUserBan(u.id, true)} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold transition-all disabled:opacity-50" disabled={u.role === 'ADMIN'}>Ban User</button>
                   )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
               <tr><td colSpan={5} className="p-6 text-center text-[var(--muted)]">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
