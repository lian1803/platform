'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/lib/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface Props {
  proposalId: string
  requestId: string
  locale: string
}

export default function AcceptProposalButton({ proposalId, requestId, locale }: Props) {
  const t = useTranslations('proposal')
  const tc = useTranslations('common')
  const router = useRouter()
  const supabase = createClient()

  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleAccept() {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('proposals')
      .update({ status: 'accepted' })
      .eq('id', proposalId)

    if (!error) {
      // event_logs
      await supabase.from('event_logs').insert({
        user_id: user.id,
        event_name: 'proposal_accepted',
        event_data: { proposal_id: proposalId, request_id: requestId },
      })
      router.push(`/requests/${requestId}`)
    }
    setLoading(false)
  }

  if (!confirming) {
    return (
      <Button size="lg" className="w-full" onClick={() => setConfirming(true)}>
        {t('acceptBtn')}
      </Button>
    )
  }

  return (
    <div className="border-2 border-warning rounded-xl p-4 bg-warning/5">
      <p className="font-semibold text-text-primary mb-1">{t('acceptConfirmTitle')}</p>
      <p className="text-sm text-text-secondary mb-4">{t('acceptConfirmDesc')}</p>
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => setConfirming(false)} disabled={loading}>
          {tc('cancel')}
        </Button>
        <Button className="flex-1 bg-accent hover:bg-emerald-600" onClick={handleAccept} disabled={loading}>
          {loading ? tc('loading') : tc('confirm')}
        </Button>
      </div>
    </div>
  )
}
