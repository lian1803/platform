import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/lib/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PlusCircle, MessageSquare } from 'lucide-react'
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
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">{t('myRequests')}</h1>
        <Link href="/requests/new">
          <Button size="sm" className="gap-2">
            <PlusCircle size={16} /> 의뢰 등록
          </Button>
        </Link>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {STATUS_TABS.map((s) => (
          <Link
            key={s}
            href={s === '전체' ? '/dashboard' : `/dashboard?status=${s}`}
            className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
              (s === '전체' && !searchParams.status) || searchParams.status === s
                ? 'border-primary bg-primary text-white'
                : 'border-border bg-surface text-text-secondary hover:border-primary/50'
            }`}
          >
            {s === '전체' ? '전체' : t(`status.${s}` as Parameters<typeof t>[0])}
          </Link>
        ))}
      </div>

      {/* Empty */}
      {list.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
          <p className="text-text-secondary">아직 등록한 의뢰가 없어요</p>
          <Link href="/requests/new" className="mt-4 inline-block">
            <Button className="mt-4 gap-2"><PlusCircle size={16} /> 첫 의뢰 등록하기</Button>
          </Link>
        </div>
      )}

      {/* Request list */}
      <div className="flex flex-col gap-3">
        {list.map((req) => (
          <Link key={req.id} href={`/requests/${req.id}`}>
            <div className="border border-border rounded-xl p-4 bg-surface hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={STATUS_VARIANT[req.status]}>
                      {t(`status.${req.status}` as Parameters<typeof t>[0])}
                    </Badge>
                    <span className="text-xs text-text-secondary">{req.industry}</span>
                  </div>
                  <h3 className="font-semibold text-text-primary mt-1 truncate">{req.title}</h3>
                  <p className="text-sm text-text-secondary mt-0.5 line-clamp-1">{req.marketing_type}</p>
                </div>
                <div className="flex items-center gap-1 text-text-secondary flex-shrink-0">
                  <MessageSquare size={16} />
                  <span className="text-sm font-medium">{req.proposal_count}</span>
                </div>
              </div>
              <p className="text-xs text-text-secondary mt-2">
                {new Date(req.created_at).toLocaleDateString()} 등록
                {req.expires_at && ` · ${new Date(req.expires_at).toLocaleDateString()} 마감`}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
