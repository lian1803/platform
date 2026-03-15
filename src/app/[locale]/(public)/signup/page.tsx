'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Building2, Megaphone, CheckCircle2 } from 'lucide-react'
import { Link } from '@/lib/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUp } from '@/app/actions/auth'
import { cn } from '@/lib/utils'
import type { Region, UserRole } from '@/lib/types/database'

type Step = 'role' | 'region' | 'info'

const STEPS: Step[] = ['role', 'region', 'info']

const REGIONS: { value: Region; flag: string; key: string }[] = [
  { value: 'kr', flag: '🇰🇷', key: 'regionKr' },
  { value: 'us', flag: '🇺🇸', key: 'regionUs' },
  { value: 'cn', flag: '🇨🇳', key: 'regionCn' },
  { value: 'jp', flag: '🇯🇵', key: 'regionJp' },
]

export default function SignupPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('auth')
  const tc = useTranslations('common')
  const searchParams = useSearchParams()

  const initialRole = (searchParams.get('role') as UserRole) ?? 'client'

  const [step, setStep] = useState<Step>(searchParams.has('role') ? 'region' : 'role')
  const [role, setRole] = useState<UserRole>(initialRole)
  const [region, setRegion] = useState<Region>('kr')
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const stepIndex = STEPS.indexOf(step)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await signUp({ ...form, role, region, locale })
    if (result?.error) {
      setError(t(result.error as Parameters<typeof t>[0]))
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-primary">Platform</Link>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors',
                i <= stepIndex ? 'bg-primary text-white' : 'bg-slate-200 text-text-secondary'
              )}>
                {i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn('w-10 h-px transition-colors', i < stepIndex ? 'bg-primary' : 'bg-border')} />
              )}
            </div>
          ))}
        </div>

        {/* ─── Step 1: Role ─── */}
        {step === 'role' && (
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-semibold text-text-primary text-center">{t('roleSelect')}</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: 'client' as UserRole, label: t('client'), desc: t('clientDesc'), Icon: Building2 },
                { value: 'marketer' as UserRole, label: t('marketer'), desc: t('marketerDesc'), Icon: Megaphone },
              ].map(({ value, label, desc, Icon }) => (
                <button
                  key={value}
                  onClick={() => { setRole(value); setStep('region') }}
                  className={cn(
                    'flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all text-center hover:shadow-sm',
                    role === value ? 'border-primary bg-primary/5' : 'border-border bg-surface hover:border-primary/40'
                  )}
                >
                  <Icon size={32} className="text-primary" />
                  <div>
                    <p className="font-semibold text-text-primary">{label}</p>
                    <p className="text-xs text-text-secondary mt-1">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── Step 2: Region ─── */}
        {step === 'region' && (
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-semibold text-text-primary text-center">{t('regionSelect')}</h2>
            <div className="grid grid-cols-2 gap-3">
              {REGIONS.map(({ value, flag, key }) => (
                <button
                  key={value}
                  onClick={() => setRegion(value)}
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
                    region === value ? 'border-primary bg-primary/5' : 'border-border bg-surface hover:border-primary/40'
                  )}
                >
                  <span className="text-2xl">{flag}</span>
                  <span className="font-medium text-text-primary">{t(key as Parameters<typeof t>[0])}</span>
                  {region === value && <CheckCircle2 size={16} className="text-primary ml-auto" />}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep('role')}>
                {tc('back')}
              </Button>
              <Button className="flex-1" onClick={() => setStep('info')}>
                {tc('next')}
              </Button>
            </div>
          </div>
        )}

        {/* ─── Step 3: Info form ─── */}
        {step === 'info' && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <h2 className="text-xl font-semibold text-text-primary text-center">{t('signupBtn')}</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">{t('name')}</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="홍길동"
                required
                minLength={2}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="hello@example.com"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">{t('password')}</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="영문+숫자 8자 이상"
                required
              />
            </div>

            <div className="flex gap-3 mt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setStep('region')}
                disabled={loading}
              >
                {tc('back')}
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? tc('loading') : t('signupBtn')}
              </Button>
            </div>
          </form>
        )}

        <p className="text-center text-sm text-text-secondary mt-6">
          {t('alreadyHaveAccount')}{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            {t('loginBtn')}
          </Link>
        </p>
      </div>
    </div>
  )
}
