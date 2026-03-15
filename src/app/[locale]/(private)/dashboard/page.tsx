import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/lib/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { PlusCircle, MessageSquare, Inbox } from 'lucide-react'
import type { MarketingRequest } from '@/lib/types/database'

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'warning' | 'outline'> = {
  open: 'default',
  in_progress: 'success',
  completed: 'outline',
  closed: 'outline',
}

export default async function DashboardPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string }
  searchParams: { status?: string }
}) {
  setRequestLocale(locale)
  const t = await getTranslations('request')
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()

  // 마케터는 피드로 리다이렉트
  if (userData?.role === 'marketer') redirect(`/${locale}/feed`)

  let query = supabase
    .from('requests')
    .select('*')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })

  if (searchParams.status) {
    query = query.eq('status', searchParams.status)
  }

  const { data: requests } = await query
  const list = (requests ?? []) as MarketingRequest[]

  const STATUS_TABS = ['전체', 'open', 'in_progress', 'completed', 'closed']

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">{t('myRequests')}</h1>
        <Link href="/requests/new">
          <Button size="sm" className="gap-2">
            <PlusCircle size={16} /> 의뢰 등록
          </Button>
        </Link>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap mb-8">
        {STATUS_TABS.map((s) => (
          <Link
            key={s}
            href={s === '전체' ? '/dashboard' : `/dashboard?status=${s}`}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
              (s === '전체' && !searchParams.status) || searchParams.status === s
                ? 'border-primary bg-primary text-white shadow-sm'
                : 'border-border/60 bg-surface text-text-secondary hover:border-primary/40 hover:text-primary'
            }`}
          >
            {s === '전체' ? '전체' : t(`status.${s}` as Parameters<typeof t>[0])}
          </Link>
        ))}
      </div>

      {/* Empty */}
      {list.length === 0 && (
        <div className="text-center py-24 border-2 border-dashed border-border/60 rounded-2xl bg-background/50">
          <div className="w-16 h-16 rounded-2xl bg-background flex items-center justify-center mx-auto mb-4">
            <Inbox size={28} className="text-text-secondary" />
          </div>
          <p className="text-text-secondary font-medium">아직 등록한 의뢰가 없어요</p>
          <Link href="/requests/new" className="mt-4 inline-block">
            <Button className="mt-2 gap-2"><PlusCircle size={16} /> 첫 의뢰 등록하기</Button>
          </Link>
        </div>
      )}

      {/* Request list */}
      <div className="flex flex-col gap-3">
        {list.map((req) => (
          <Link key={req.id} href={`/requests/${req.id}`}>
            <Card className="hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={STATUS_VARIANT[req.status]}>
                        {t(`status.${req.status}` as Parameters<typeof t>[0])}
                      </Badge>
                      <span className="text-xs text-text-secondary font-medium">{req.industry}</span>
                    </div>
                    <h3 className="font-semibold text-text-primary mt-2 truncate tracking-tight">{req.title}</h3>
                    <p className="text-sm text-text-secondary mt-1 line-clamp-1">{req.marketing_type}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-text-secondary flex-shrink-0 bg-background rounded-lg px-2.5 py-1.5">
                    <MessageSquare size={14} />
                    <span className="text-sm font-semibold">{req.proposal_count}</span>
                  </div>
                </div>
                <p className="text-xs text-text-secondary mt-3 pt-3 border-t border-border/40">
                  {new Date(req.created_at).toLocaleDateString()} 등록
                  {req.expires_at && ` · ${new Date(req.expires_at).toLocaleDateString()} 마감`}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
