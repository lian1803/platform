'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/lib/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const INDUSTRIES = ['음식점', '카페', '학원', '미용실', '병원', '쇼핑몰', '기타']
const MARKETING_TYPES = ['sns', 'blog', 'place', 'ads', '종합 마케팅', '기타']
const BUDGETS = [
  { label: '30만원 이하', value: '0-30' },
  { label: '30~50만원', value: '30-50' },
  { label: '50~100만원', value: '50-100' },
  { label: '100~200만원', value: '100-200' },
  { label: '200~300만원', value: '200-300' },
  { label: '300만원 이상', value: '300-999' },
]

export default function NewRequestPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('request')
  const tc = useTranslations('common')
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    industry: '',
    marketing_types: [] as string[],
    budget: '',
    title: '',
    description: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isValid =
    form.industry &&
    form.marketing_types.length > 0 &&
    form.budget &&
    form.title.trim() &&
    form.description.trim()

  function toggleType(type: string) {
    setForm((f) => ({
      ...f,
      marketing_types: f.marketing_types.includes(type)
        ? f.marketing_types.filter((t) => t !== type)
        : [...f.marketing_types, type],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    setSaving(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError(tc('networkError')); setSaving(false); return }

    const { data: userData } = await supabase.from('users').select('region').eq('id', user.id).single()
    if (!userData) { setError(tc('networkError')); setSaving(false); return }

    const [budgetMin, budgetMax] = form.budget.split('-').map(Number)

    const { data, error: insertError } = await supabase
      .from('requests')
      .insert({
        client_id: user.id,
        title: form.title.trim(),
        industry: form.industry,
        marketing_type: form.marketing_types.join(', '),
        budget_min: budgetMin,
        budget_max: budgetMax === 999 ? null : budgetMax,
        description: form.description.trim(),
        region: userData.region,
      })
      .select('id')
      .single()

    if (insertError || !data) {
      setError(tc('networkError'))
      setSaving(false)
      return
    }

    // event_logs: request_created
    await supabase.from('event_logs').insert({
      user_id: user.id,
      event_name: 'request_created',
      event_data: { request_id: data.id },
    })

    router.push(`/requests/${data.id}`)
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-text-primary mb-2">{t('newTitle')}</h1>
      <p className="text-text-secondary text-sm mb-6">3분 안에 작성할 수 있어요</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* 업종 */}
        <div className="flex flex-col gap-2">
          <Label>{t('industry')}</Label>
          <div className="flex flex-wrap gap-2">
            {INDUSTRIES.map((ind) => (
              <button
                key={ind}
                type="button"
                onClick={() => setForm((f) => ({ ...f, industry: ind }))}
                className={`px-3 py-1.5 rounded-full text-sm border-2 transition-all ${
                  form.industry === ind
                    ? 'border-primary bg-primary text-white'
                    : 'border-border bg-surface text-text-secondary hover:border-primary/50'
                }`}
              >
                {ind}
              </button>
            ))}
          </div>
        </div>

        {/* 마케팅 분야 */}
        <div className="flex flex-col gap-2">
          <Label>{t('marketingType')}</Label>
          <div className="flex flex-wrap gap-2">
            {MARKETING_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => toggleType(type)}
                className={`px-3 py-1.5 rounded-full text-sm border-2 transition-all ${
                  form.marketing_types.includes(type)
                    ? 'border-primary bg-primary text-white'
                    : 'border-border bg-surface text-text-secondary hover:border-primary/50'
                }`}
              >
                {type.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* 예산 */}
        <div className="flex flex-col gap-2">
          <Label>{t('budget')}</Label>
          <div className="flex flex-wrap gap-2">
            {BUDGETS.map(({ label, value }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, budget: value }))}
                className={`px-3 py-1.5 rounded-full text-sm border-2 transition-all ${
                  form.budget === value
                    ? 'border-primary bg-primary text-white'
                    : 'border-border bg-surface text-text-secondary hover:border-primary/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 제목 */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="title">{t('title')}</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder={t('titlePlaceholder')}
            required
          />
        </div>

        {/* 상세 요구사항 */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="desc">{t('description')}</Label>
          <textarea
            id="desc"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder={t('descriptionPlaceholder')}
            rows={5}
            className="flex w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">{error}</div>
        )}

        <Button type="submit" size="lg" disabled={!isValid || saving}>
          {saving ? tc('loading') : t('submitBtn')}
        </Button>
      </form>
    </div>
  )
}
