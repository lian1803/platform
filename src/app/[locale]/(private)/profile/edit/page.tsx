'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { Specialty } from '@/lib/types/database'

const SPECIALTIES: { value: Specialty; key: string }[] = [
  { value: 'sns', key: 'specialtySns' },
  { value: 'blog', key: 'specialtyBlog' },
  { value: 'place', key: 'specialtyPlace' },
  { value: 'ads', key: 'specialtyAds' },
]

export default function ProfileEditPage() {
  const t = useTranslations('marketer')
  const tc = useTranslations('common')
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [form, setForm] = useState({
    experience_years: '',
    bio: '',
    price_range_min: '',
    price_range_max: '',
  })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('marketer_profiles')
        .select('specialties, experience_years, bio, price_range_min, price_range_max')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setSpecialties(data.specialties ?? [])
        setForm({
          experience_years: data.experience_years?.toString() ?? '',
          bio: data.bio ?? '',
          price_range_min: data.price_range_min?.toString() ?? '',
          price_range_max: data.price_range_max?.toString() ?? '',
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  function toggleSpecialty(s: Specialty) {
    setSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    )
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (specialties.length === 0) {
      setError('전문 분야를 1개 이상 선택해주세요')
      return
    }
    if (form.bio.length < 50) {
      setError('소개글은 50자 이상 작성해주세요')
      return
    }

    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: updateError } = await supabase
      .from('marketer_profiles')
      .update({
        specialties,
        experience_years: form.experience_years ? Number(form.experience_years) : null,
        bio: form.bio,
        price_range_min: form.price_range_min ? Number(form.price_range_min) : null,
        price_range_max: form.price_range_max ? Number(form.price_range_max) : null,
      })
      .eq('user_id', user.id)

    if (updateError) {
      setError(tc('networkError'))
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="max-w-xl mx-auto p-6 flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-text-primary mb-6">{t('profileEdit')}</h1>

      <form onSubmit={handleSave} className="flex flex-col gap-5">
        {/* 전문 분야 */}
        <div className="flex flex-col gap-2">
          <Label>{t('specialties')}</Label>
          <div className="flex flex-wrap gap-2">
            {SPECIALTIES.map(({ value, key }) => (
              <button
                key={value}
                type="button"
                onClick={() => toggleSpecialty(value)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium border-2 transition-all',
                  specialties.includes(value)
                    ? 'border-primary bg-primary text-white'
                    : 'border-border bg-surface text-text-secondary hover:border-primary/50'
                )}
              >
                {t(key as Parameters<typeof t>[0])}
              </button>
            ))}
          </div>
        </div>

        {/* 경력 */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="exp">{t('experienceYears')}</Label>
          <Input
            id="exp"
            type="number"
            min="0"
            max="50"
            value={form.experience_years}
            onChange={(e) => setForm((f) => ({ ...f, experience_years: e.target.value }))}
            placeholder="0"
          />
        </div>

        {/* 소개글 */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bio">
            {t('bio')}
            <span className="text-text-secondary font-normal ml-2">({form.bio.length}/50자+)</span>
          </Label>
          <textarea
            id="bio"
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            placeholder={t('bioPlaceholder')}
            rows={4}
            className="flex w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        {/* 가격 범위 */}
        <div className="flex gap-3">
          <div className="flex flex-col gap-1.5 flex-1">
            <Label htmlFor="min">{t('priceRangeMin')}</Label>
            <Input
              id="min"
              type="number"
              min="0"
              value={form.price_range_min}
              onChange={(e) => setForm((f) => ({ ...f, price_range_min: e.target.value }))}
              placeholder="30"
            />
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <Label htmlFor="max">{t('priceRangeMax')}</Label>
            <Input
              id="max"
              type="number"
              min="0"
              value={form.price_range_max}
              onChange={(e) => setForm((f) => ({ ...f, price_range_max: e.target.value }))}
              placeholder="300"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">{error}</div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-600">저장되었습니다 ✓</div>
        )}

        <Button type="submit" size="lg" disabled={saving}>
          {saving ? tc('loading') : tc('save')}
        </Button>
      </form>
    </div>
  )
}
