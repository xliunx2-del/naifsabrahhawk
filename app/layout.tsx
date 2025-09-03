import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "نظام توقع الطعام بالذكاء الاصطناعي",
  description: "تطبيق ذكي لتوقع الأطعمة باستخدام الذكاء الاصطناعي",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`font-sans ${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
        style={{
          backgroundImage:
            'url("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%D8%AE%D9%84%D9%81%D9%8A%D8%A9_%D8%A7%D9%84%D9%85%D9%88%D9%82%D8%B9-zoogs0aSsewcNQja74D010amoj4fHa.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Background overlay for better content readability */}
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-0" />

        {/* Content wrapper with relative positioning */}
        <div className="relative z-10 min-h-screen">
          <Suspense fallback={null}>{children}</Suspense>
        </div>
        <Analytics />
      </body>
    </html>
  )
}
