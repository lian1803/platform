import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'

export const locales = ['ko', 'en', 'zh', 'ja'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'ko'

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as Locale)) notFound()

  return {
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
