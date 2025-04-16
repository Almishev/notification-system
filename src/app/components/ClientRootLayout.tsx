'use client';

import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'

export default function ClientRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    require('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  return (
    <>
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
      {children}
    </>
  )
}