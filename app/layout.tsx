import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import { GlobalHeader } from '@/components/global-header'
import PawgrammerBanner from '@/components/pawgrammer-banner'
import DemoBanner from '@/components/demo-banner'
import VideoNudge from '@/components/VideoNudge'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Packing List Generator',
  description: 'Generate smart packing lists with Master List Library',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PawgrammerBanner />
        <GlobalHeader />
        <div className="container mx-auto px-4">
          <DemoBanner />
        </div>
        {children}
        <VideoNudge />
        <Toaster />
      </body>
    </html>
  )
}