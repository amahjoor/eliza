import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '../components/Navbar'
import { AuthProvider } from '../components/AuthProvider'
import React from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Eliza.ai - AI Meeting Assistant',
  description: 'Record, transcribe, and summarize your meetings with AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-neutral-950 to-neutral-900 text-white">
          <AuthProvider>
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
            {/* Toast notifications will be added later */}
          </AuthProvider>
        </div>
      </body>
    </html>
  )
}
