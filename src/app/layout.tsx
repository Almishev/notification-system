import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import ClientRootLayout from './components/ClientRootLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Email Reminder System',
  description: 'Schedule and manage your email notifications efficiently',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" 
        />
      </head>
      <body className={`${inter.className} d-flex flex-column min-vh-100`}>
        <ClientRootLayout>
          <>
            <Navigation />
            <main className="flex-grow-1">
              {children}
            </main>
            <Footer />
          </>
        </ClientRootLayout>
      </body>
    </html>
  )
}
