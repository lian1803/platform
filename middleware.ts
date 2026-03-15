import createMiddleware from 'next-intl/middleware'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { locales, defaultLocale } from '@/i18n'

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
})

const PRIVATE_PATHS = [
  '/dashboard',
  '/requests/new',
  '/proposals',
  '/profile',
  '/portfolio',
  '/feed',
  '/reviews',
]

function isPrivatePath(pathname: string): boolean {
  // pathname 예시: /ko/dashboard, /en/feed
  const withoutLocale = pathname.replace(/^\/(ko|en|zh|ja)/, '')
  return PRIVATE_PATHS.some((p) => withoutLocale.startsWith(p))
}

export async function middleware(request: NextRequest) {
  let response = intlMiddleware(request)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (isPrivatePath(request.nextUrl.pathname) && !user) {
    const locale = request.nextUrl.pathname.split('/')[1] || defaultLocale
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|.*\\..*).*)'],
}
