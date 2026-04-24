'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'

export default function SupportChat() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [inbox, setInbox] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [text, setText] = useState('')
  const msgsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!session || !isOpen) return

    const fetchChat = async () => {
      const url = `/api/support` + (activeConvId ? `?conversationId=${activeConvId}` : '')
      const res = await fetch(url)
      const data = await res.json()
      if (data.type === 'inbox') setInbox(data.conversations || [])
      if (data.type === 'chat') {
         setMessages(data.messages || [])
         if (data.conversationId) setActiveConvId(data.conversationId)
      }
    }

    fetchChat()
    const interval = setInterval(fetchChat, 3000)
    return () => clearInterval(interval)
  }, [session, isOpen, activeConvId])

  useEffect(() => {
     if (msgsEndRef.current) msgsEndRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!session) return null

  const handleSend = async () => {
    if (!text.trim()) return
    const res = await fetch('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text, conversationId: activeConvId })
    })
    const data = await res.json()
    if (data.conversationId) {
      setActiveConvId(data.conversationId)
      setText('')
      setMessages([...messages, { ...data, sender: { fullName: (session.user as any).fullName, role: (session.user as any).role } }])
    }
  }

  const isAdmin = (session.user as any).role === 'ADMIN'

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div 
          className="bg-[var(--background)] border border-[var(--border)] rounded-2xl w-[85vw] sm:w-[350px] mb-4 overflow-hidden flex flex-col h-[500px] transition-all duration-300 origin-bottom-right"
          style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25), 0 0 15px rgba(0,0,0,0.05)' }}
        >
          <div className="bg-[var(--primary)] text-[var(--primary-foreground)] p-4 font-bold flex justify-between items-center shadow-sm">
            <span>{isAdmin && !activeConvId ? 'Support Inbox' : 'Live Support Chat'}</span>
            {isAdmin && activeConvId && (
               <button onClick={() => setActiveConvId(null)} className="text-xs px-2 py-1 bg-black/20 rounded hover:bg-black/30 transition-colors">Back to Inbox</button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-[var(--cards)] scroll-smooth relative">
            {isAdmin && !activeConvId ? (
              <div className="grid gap-2">
                {inbox.map(c => (
                  <button key={c.id} onClick={() => setActiveConvId(c.id)} className="text-left p-3 border border-[var(--border)] bg-[var(--background)] rounded-lg hover:shadow-sm hover:border-[var(--primary)] transition-all transform hover:-translate-y-0.5">
                    <p className="font-bold text-sm line-clamp-1">{c.messages[0]?.sender?.fullName || 'Anonymous'}</p>
                    <p className="text-xs text-[var(--muted)] line-clamp-1 mt-1 text-ellipsis">{c.messages[0]?.content}</p>
                  </button>
                ))}
                {inbox.length === 0 && <p className="text-[var(--muted)] text-sm text-center mt-10">Inbox is completely clear.</p>}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {messages.length === 0 && <p className="text-sm text-center text-[var(--muted)] mt-10">An admin will respond shortly...</p>}
                {messages.map((m: any) => {
                  const isAdminMsg = m.sender.role === 'ADMIN'
                  const isMe = m.senderId === session.user.id
                  return (
                    <div key={m.id} className={`flex flex-col max-w-[85%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                      <p className="text-[10px] uppercase font-bold text-[var(--muted)] mb-1 mx-1 tracking-wider opacity-60">{m.sender.role}</p>
                      <div className={`px-4 py-2 rounded-2xl ${isMe ? 'bg-[var(--primary)] text-[var(--primary-foreground)] rounded-br-sm shadow-sm' : 'bg-[var(--sections)] border border-[var(--border)] text-[var(--foreground)] rounded-bl-sm shadow-sm'}`}>
                        <p className="text-sm leading-relaxed">{m.content}</p>
                      </div>
                    </div>
                  )
                })}
                <div ref={msgsEndRef} />
              </div>
            )}
          </div>

          {(!isAdmin || activeConvId) && (
             <div className="p-3 border-t border-[var(--border)] bg-[var(--background)] flex gap-2">
               <input 
                 className="flex-1 bg-[var(--cards)] border border-[var(--border)] rounded-full px-4 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
                 placeholder="Type your message..." 
                 value={text} 
                 onChange={e => setText(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && handleSend()}
               />
               <button onClick={handleSend} className="w-10 h-10 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] flex items-center justify-center font-bold hover:opacity-90 shadow-md transition-all hover:scale-105 active:scale-95 shrink-0">
                 &uarr;
               </button>
             </div>
          )}
        </div>
      )}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] shadow-2xl flex items-center justify-center text-2xl hover:scale-110 hover:-translate-y-1 active:scale-95 transition-all outline-none border-2 border-[var(--background)]"
      >
        {isOpen ? '✕' : '💬'}
      </button>
    </div>
  )
}
