'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/lib/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn } from '@/app/actions/auth'

export default function LoginPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('auth')
  const tc = useTranslations('common')

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await signIn({ ...form, locale })
    if (result?.error) {
      setError(tc(result.error as Parameters<typeof tc>[0]))
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-primary">Platform</Link>
          <p className="text-text-secondary text-sm mt-2">{t('loginBtn')}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="hello@example.com"
              required
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">{t('password')}</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
              required
            />
          </div>

          <Button type="submit" className="w-full mt-2" size="lg" disabled={loading}>
            {loading ? tc('loading') : t('loginBtn')}
          </Button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-6">
          {t('noAccount')}{' '}
          <Link href="/signup" className="text-primary hover:underline font-medium">
            {t('signupBtn')}
          </Link>
        </p>
      </div>
    </div>
  )
}
