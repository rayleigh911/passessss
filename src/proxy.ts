import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

const locales = ['en', 'fr', 'ar']
const defaultLocale = 'en'

export async function proxy(req: any) {
  const { pathname } = req.nextUrl
  
  // Skip API routes, static files, and Next.js internals
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.match(/\.(png|svg|jpg|jpeg|ico|webp)$/)
  ) {
    return
  }

  // Check locale
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  if (pathnameIsMissingLocale) {
    const locale = defaultLocale
    return NextResponse.redirect(new URL(`/${locale}${pathname === '/' ? '' : pathname}`, req.url))
  }

  // Next-Auth manual check
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_vercel_deployment_passessss_12345" 
  })
  const segments = pathname.split('/')
  const localeFound = segments[1] // en, fr, or ar
  const route = segments[2] // admin, provider, client, etc. (might be undefined for homepage)
  
  if (['admin', 'client', 'checkout'].includes(route)) {
    if (!token) return NextResponse.redirect(new URL(`/${localeFound}/login`, req.url))
    
    if (route === 'admin' && token.role !== 'ADMIN') return NextResponse.redirect(new URL(`/${localeFound}`, req.url))
    if (route === 'client' && token.role !== 'CLIENT') return NextResponse.redirect(new URL(`/${localeFound}`, req.url))
  }

  if (route === 'provider') {
    const isPublicProfile = segments.length > 3
    if (!isPublicProfile) {
      if (!token) return NextResponse.redirect(new URL(`/${localeFound}/login`, req.url))
      if (token.role !== 'PROVIDER') return NextResponse.redirect(new URL(`/${localeFound}`, req.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
