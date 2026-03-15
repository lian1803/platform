'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Region, UserRole } from '@/lib/types/database'

function isValidPassword(pw: string) {
  return pw.length >= 8 && /[a-zA-Z]/.test(pw) && /[0-9]/.test(pw)
}

export async function signUp(data: {
  email: string
  password: string
  name: string
  role: UserRole
  region: Region
  locale: string
}): Promise<{ error: string } | never> {
  if (data.name.length < 2) return { error: 'nameTooShort' }
  if (!isValidPassword(data.password)) return { error: 'passwordFormat' }

  const supabase = createClient()

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  })

  if (authError) {
    if (authError.message.toLowerCase().includes('already registered')) return { error: 'emailDuplicate' }
    return { error: 'networkError' }
  }

  if (!authData.user) return { error: 'networkError' }

  // users 테이블에 role, name, region 삽입
  const { error: insertError } = await supabase.from('users').insert({
    id: authData.user.id,
    email: data.email,
    role: data.role,
    name: data.name,
    region: data.region,
  })
  if (insertError) return { error: 'networkError' }

  // 마케터인 경우 빈 프로필 생성
  if (data.role === 'marketer') {
    await supabase.from('marketer_profiles').insert({
      user_id: authData.user.id,
      specialties: [],
      region: data.region,
    })
  }

  // event_logs: user_signup
  await supabase.from('event_logs').insert({
    user_id: authData.user.id,
    event_name: 'user_signup',
    event_data: { role: data.role, region: data.region },
  })

  const destination = data.role === 'client' ? 'dashboard' : 'feed'
  redirect(`/${data.locale}/${destination}`)
}

export async function signIn(data: {
  email: string
  password: string
  locale: string
}): Promise<{ error: string } | never> {
  const supabase = createClient()

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })

  if (error || !authData.user) return { error: 'networkError' }

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', authData.user.id)
    .single()

  const destination = userData?.role === 'marketer' ? 'feed' : 'dashboard'
  redirect(`/${data.locale}/${destination}`)
}

export async function signOut(locale: string) {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect(`/${locale}`)
}
