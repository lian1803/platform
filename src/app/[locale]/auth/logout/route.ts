import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { locale: string } }
) {
  const supabase = createClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL(`/${params.locale}`, request.url))
}
