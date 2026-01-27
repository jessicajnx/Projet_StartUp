import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BookExchange',
  description: 'Plateforme d\'échange de livres',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
