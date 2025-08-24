import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'University Application Tracker',
  description: 'Track your university applications and deadlines',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
