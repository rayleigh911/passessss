'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'

export default function SignupPage() {
  const [role, setRole] = useState<'CLIENT' | 'PROVIDER'>('CLIENT')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    businessName: '',
    city: '',
    category: 'Massage'
  })
  const [error, setError] = useState('')
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, role })
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Registration failed')
      return
    }

    // Auto login
    const loginRes = await signIn('credentials', {
      email: formData.email,
      password: formData.password,
      redirect: false,
    })

    if (loginRes?.error) {
      setError(loginRes.error)
    } else {
      router.push(role === 'PROVIDER' ? '/provider' : '/client')
      router.refresh()
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] py-12 px-4">
      <div className="max-w-md w-full bg-[var(--cards)] p-8 rounded-2xl shadow-sm border border-[var(--border)]">
        <h1 className="text-2xl font-bold mb-6 text-center text-[var(--foreground)]">Create Account</h1>
        
        <div className="flex bg-[var(--background)] p-1 rounded-lg mb-6">
          <button 
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${role === 'CLIENT' ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'text-[var(--muted)]'}`}
            onClick={() => setRole('CLIENT')}
          >
            Client
          </button>
          <button 
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${role === 'PROVIDER' ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'text-[var(--muted)]'}`}
            onClick={() => setRole('PROVIDER')}
          >
            Provider
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input name="fullName" required className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)]" onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" name="email" required className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)]" onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input name="phone" className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)]" onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" name="password" required minLength={6} className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)]" onChange={handleChange} />
          </div>
          
          {role === 'PROVIDER' && (
            <>
              <div className="border-t border-[var(--border)] my-2"></div>
              <div>
                <label className="block text-sm font-medium mb-1">Business Name</label>
                <input name="businessName" required className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)]" onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <select name="city" required value={formData.city} className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)]" onChange={handleChange}>
                  <option value="" disabled>Select your city...</option>
                  {["Agadir", "Al Hoceima", "Beni Mellal", "Berkane", "Berrechid", "Casablanca", "Chefchaouen", "Dakhla", "El Jadida", "Errachidia", "Essaouira", "Fes", "Guelmim", "Ifrane", "Kenitra", "Khenifra", "Khouribga", "Laayoune", "Larache", "Marrakech", "Meknes", "Mohammedia", "Nador", "Ouarzazate", "Oujda", "Rabat", "Safi", "Sale", "Settat", "Sidi Kacem", "Tangier", "Taroudant", "Taza", "Temara", "Tetouan", "Tiznit"].map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select name="category" required className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)]" onChange={handleChange}>
                  <option value="Massage">Massage</option>
                  <option value="Hammam">Hammam</option>
                  <option value="Spa">Spa Center</option>
                  <option value="Wellness">Wellness Professional</option>
                </select>
              </div>
            </>
          )}

          <button type="submit" className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] py-3 rounded-lg font-medium hover:opacity-90 mt-2">
            Sign Up
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          Already have an account? <Link href="/login" className="text-[var(--primary)] hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  )
}
