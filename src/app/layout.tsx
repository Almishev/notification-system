'use client';
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import { useEffect } from 'react'

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
  useEffect(() => {
    require('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  return (
    <html lang="en">
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" 
        />
      </head>
      <body className={`${inter.className} d-flex flex-column min-vh-100`}>
        <Toaster 
          position="top-center"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
              padding: '16px',
              borderRadius: '8px',
            },
            success: {
              duration: 3000,
              style: {
                background: '#4caf50',
                color: '#fff',
              },
            },
            error: {
              duration: 3000,
              style: {
                background: '#f44336',
                color: '#fff',
              },
            },
          }}
        />
        <Navigation />
        <main className="flex-grow-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
