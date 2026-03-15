import type { Metadata } from 'next'
import { Inter, Noto_Sans_SC, Noto_Sans_JP, Noto_Sans_KR } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales, type Locale } from '@/i18n'
import './globals.css'

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  variable: '--font-noto-kr',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  variable: '--font-noto-sc',
  display: 'swap',
})

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-noto-jp',
  display: 'swap',
})

const fontByLocale: Record<Locale, string> = {
  ko: notoSansKR.variable,
  en: inter.variable,
  zh: notoSansSC.variable,
  ja: notoSansJP.variable,
}

export const metadata: Metadata = {
  title: 'Platform — Verified Marketers',
  description: 'Connect with verified marketers for your business',
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  if (!locales.includes(locale as Locale)) notFound()

  const messages = await getMessages()
  const fontVariable = fontByLocale[locale as Locale]

  return (
    <NextIntlClientProvider messages={messages}>
      <div lang={locale} className={`${fontVariable} bg-background text-text-primary font-sans antialiased min-h-screen`}>
        {children}
      </div>
    </NextIntlClientProvider>
  )
}
