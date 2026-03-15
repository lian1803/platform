import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

export const metadata: Metadata = {
  title: '마케터 둘러보기',
  description: '검증된 마케팅 전문가를 분야별로 둘러보고 비교해보세요. SNS, 블로그, 지역 마케팅, 광고 전문가를 만나보세요.',
  openGraph: {
    title: '마케터 둘러보기 | Platform',
    description: '검증된 마케팅 전문가를 분야별로 둘러보고 비교해보세요.',
    type: 'website',
    url: 'https://platform-mocha-chi.vercel.app/ko/marketers',
  },
}
import { createClient } from '@/lib/supabase/server'
import { Link } from '@/lib/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'
import type { MarketerProfileWithUser, Specialty } from '@/lib/types/database'

const specialtyLabel: Record<Specialty, string> = {
  sns: 'SNS', blog: 'Blog·SEO', place: 'Local', ads: 'Ads',
}

export default async function MarketersPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string }
  searchParams: { specialty?: string }
}) {
  setRequestLocale(locale)
  const t = await getTranslations('marketer')
  const supabase = createClient()

  let query = supabase
    .from('marketer_profiles')
    .select('*, users(name, avatar_url)')
    .order('rating_avg', { ascending: false })

  if (searchParams.specialty) {
    query = query.contains('specialties', [searchParams.specialty])
  }

  const { data: marketers } = await query
  const list = (marketers ?? []) as MarketerProfileWithUser[]

  const SPECIALTY_FILTERS: { value: string; label: string }[] = [
    { value: '', label: '전체' },
    { value: 'sns', label: 'SNS' },
    { value: 'blog', label: 'Blog·SEO' },
    { value: 'place', label: 'Local' },
    { value: 'ads', label: 'Ads' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-6">마케터 둘러보기</h1>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-6">
        {SPECIALTY_FILTERS.map(({ value, label }) => (
          <Link
            key={value}
            href={value ? `/marketers?specialty=${value}` : '/marketers'}
            className={`px-4 py-1.5 rounded-full text-sm border transition-all ${
              searchParams.specialty === value || (!searchParams.specialty && !value)
                ? 'border-primary bg-primary text-white'
                : 'border-border bg-surface text-text-secondary hover:border-primary/50'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Empty */}
      {list.length === 0 && (
        <div className="text-center py-20 text-text-secondary">
          <p className="text-lg">등록된 마케터가 없습니다</p>
          <p className="text-sm mt-1">다른 필터를 선택해보세요</p>
        </div>
      )}

      {/* Grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {list.map((m) => (
          <Link key={m.id} href={`/marketers/${m.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-4 flex flex-col gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  {m.users?.name?.[0] ?? 'M'}
                </div>
                <div>
                  <p className="font-semibold text-text-primary">{m.users?.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star size={12} className="fill-warning text-warning" />
                    <span className="text-xs text-text-secondary">
                      {Number(m.rating_avg).toFixed(1)} ({m.review_count}{t('reviews')})
                    </span>
                  </div>
                </div>
                {m.experience_years && (
                  <p className="text-xs text-text-secondary">경력 {m.experience_years}년</p>
                )}
                <div className="flex flex-wrap gap-1">
                  {m.specialties.map((s) => (
                    <Badge key={s} variant="default" className="text-xs">{specialtyLabel[s]}</Badge>
                  ))}
                </div>
                {m.price_range_min && (
                  <p className="text-xs text-text-secondary font-medium">
                    {m.price_range_min}만원~{m.price_range_max ? `${m.price_range_max}만원` : ''}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
