import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { Link } from '@/lib/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, ArrowRight, CheckCircle } from 'lucide-react'
import type { MarketerProfileWithUser } from '@/lib/types/database'

async function getStats() {
  const supabase = createClient()
  const [{ count: marketerCount }, { count: matchCount }, { data: ratings }] = await Promise.all([
    supabase.from('marketer_profiles').select('id', { count: 'exact', head: true }),
    supabase.from('proposals').select('id', { count: 'exact', head: true }).eq('status', 'accepted'),
    supabase.from('marketer_profiles').select('rating_avg').gt('review_count', 0),
  ])
  const avg =
    ratings && ratings.length > 0
      ? (ratings.reduce((s, m) => s + Number(m.rating_avg), 0) / ratings.length).toFixed(1)
      : '0.0'
  return { marketerCount: marketerCount ?? 0, matchCount: matchCount ?? 0, avgRating: avg }
}

async function getFeaturedMarketers() {
  const supabase = createClient()
  const { data } = await supabase
    .from('marketer_profiles')
    .select('*, users(name, avatar_url)')
    .order('rating_avg', { ascending: false })
    .gt('review_count', 0)
    .limit(4)
  return (data ?? []) as MarketerProfileWithUser[]
}

export const metadata: Metadata = {
  title: 'Platform — 검증된 마케터 매칭',
  description: '검증된 마케터와 연결하여 비즈니스를 성장시키세요. SNS, 블로그, 광고 등 다양한 마케팅 전문가를 만나보세요.',
  openGraph: {
    title: 'Platform — 검증된 마케터 매칭',
    description: '검증된 마케터와 연결하여 비즈니스를 성장시키세요.',
    type: 'website',
    url: 'https://platform-mocha-chi.vercel.app',
  },
}

const specialtyLabel: Record<string, string> = {
  sns: 'SNS',
  blog: 'Blog·SEO',
  place: 'Local',
  ads: 'Ads',
}

export default async function LandingPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  setRequestLocale(locale)
  const t = await getTranslations('landing')
  const tc = await getTranslations('common')

  const [stats, featuredMarketers] = await Promise.all([getStats(), getFeaturedMarketers()])

  return (
    <div className="flex flex-col">
      {/* ─── Hero ─── */}
      <section className="bg-gradient-to-b from-primary/5 to-background px-4 py-20 md:py-32 text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-6">
          <h1 className="text-[clamp(2rem,5vw,2.5rem)] font-bold text-text-primary leading-tight">
            {t('heroTitle')}
          </h1>
          <p className="text-text-secondary text-lg leading-relaxed max-w-xl">
            {t('heroSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Link href="/signup?role=client">
              <Button size="lg" className="w-full sm:w-auto gap-2">
                {t('ctaClient')} <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/signup?role=marketer">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                {t('ctaMarketer')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="border-y border-border bg-surface py-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-3 divide-x divide-border text-center">
          <div className="px-4 py-2">
            <p className="text-3xl font-bold text-primary">{stats.marketerCount}+</p>
            <p className="text-sm text-text-secondary mt-1">{t('statsMarketers')}</p>
          </div>
          <div className="px-4 py-2">
            <p className="text-3xl font-bold text-primary">{stats.matchCount}+</p>
            <p className="text-sm text-text-secondary mt-1">{t('statsMatches')}</p>
          </div>
          <div className="px-4 py-2">
            <p className="text-3xl font-bold text-primary">⭐ {stats.avgRating}</p>
            <p className="text-sm text-text-secondary mt-1">{t('statsRating')}</p>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-text-primary mb-12">
            {t('howTitle')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: t('how1Title'), desc: t('how1Desc') },
              { step: '02', title: t('how2Title'), desc: t('how2Desc') },
              { step: '03', title: t('how3Title'), desc: t('how3Desc') },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  {step}
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary mb-1">{title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Marketers ─── */}
      {featuredMarketers.length > 0 && (
        <section className="py-16 px-4 bg-surface border-t border-border">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-text-primary mb-8">{t('featuredMarketers')}</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {featuredMarketers.map((m) => (
                <Link key={m.id} href={`/marketers/${m.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent className="p-4 flex flex-col gap-3">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                        {m.users?.name?.[0] ?? 'M'}
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">{m.users?.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star size={12} className="fill-warning text-warning" />
                          <span className="text-xs text-text-secondary">
                            {Number(m.rating_avg).toFixed(1)} ({m.review_count})
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {m.specialties.slice(0, 2).map((s) => (
                          <Badge key={s} variant="default" className="text-xs">
                            {specialtyLabel[s] ?? s}
                          </Badge>
                        ))}
                      </div>
                      {m.price_range_min && (
                        <p className="text-xs text-text-secondary">
                          {locale === 'en' ? `From $${m.price_range_min}` : `${m.price_range_min}만원~`}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/marketers">
                <Button variant="outline">{tc('search')} <ArrowRight size={16} className="ml-2" /></Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA Repeat ─── */}
      <section className="py-20 px-4 bg-primary text-white text-center">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">
          <CheckCircle size={40} />
          <h2 className="text-2xl md:text-3xl font-bold">{t('heroTitle')}</h2>
          <p className="text-primary-foreground/80">{t('heroSubtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/signup?role=client">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary w-full sm:w-auto">
                {t('ctaClient')}
              </Button>
            </Link>
            <Link href="/signup?role=marketer">
              <Button size="lg" className="bg-white text-primary hover:bg-primary-foreground w-full sm:w-auto">
                {t('ctaMarketer')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
