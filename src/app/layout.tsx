import './globals.css'

import type {Metadata} from 'next'

export const metadata = {
  title: 'Styled Components & Concurrent Rendering',
} satisfies Metadata

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full overscroll-none">
      <body className="h-full overscroll-none">{children}</body>
    </html>
  )
}
