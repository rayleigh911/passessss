'use client'
import { signOut } from 'next-auth/react'

export default function LogoutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: '/' })}
      className="text-sm font-medium px-4 py-2 bg-[var(--sections)] text-[var(--foreground)] border border-[var(--border)] rounded-lg hover:bg-red-50 hover:border-red-200 hover:text-red-600 ml-4 transition-all shadow-sm"
    >
      Log Out
    </button>
  )
}
