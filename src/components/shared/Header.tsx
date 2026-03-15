import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { Link } from '@/lib/navigation'
import { Button } from '@/components/ui/button'

export default async function Header({ locale }: { locale: string }) {
  const t = await getTranslations('nav')
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userRole: string | null = null
  if (user) {
    const { data } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    userRole = data?.role ?? null
  }

  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-primary">
          Platform
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/marketers" className="text-text-secondary hover:text-text-primary transition-colors text-sm">
            {t('marketers')}
          </Link>
          {user && userRole === 'client' && (
            <Link href="/dashboard" className="text-text-secondary hover:text-text-primary transition-colors text-sm">
              {t('dashboard')}
            </Link>
          )}
          {user && userRole === 'marketer' && (
            <Link href="/feed" className="text-text-secondary hover:text-text-primary transition-colors text-sm">
              {t('feed')}
            </Link>
          )}
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-2">
          {user ? (
            <form action={`/${locale}/auth/logout`} method="POST">
              <Button variant="ghost" size="sm" type="submit">{t('logout')}</Button>
            </form>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">{t('login')}</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">{t('signup')}</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
