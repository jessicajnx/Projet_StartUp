import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Livre2main',
  description: 'Plateforme d\'échange de livres',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const globalStyles = `
    .auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 48px 16px; }
    .card { width: 100%; max-width: 960px; background: rgba(255,255,255,0.78); border: 1px solid var(--color-border); border-radius: 18px; padding: 32px; box-shadow: 0 18px 45px rgba(47,36,29,0.12); backdrop-filter: blur(6px); }
    .card-narrow { max-width: 520px; }
    .card-header { text-align: center; margin-bottom: 24px; }
    .card-kicker { letter-spacing: 0.18em; text-transform: uppercase; color: var(--color-primary); font-size: 12px; margin-bottom: 6px; }
    .card-title { font-size: 28px; font-weight: 600; margin: 0 0 6px; color: var(--color-secondary); }
    .card-sub { margin: 0; color: var(--color-text); font-size: 14px; }
    .form-grid { display: grid; gap: 14px; grid-template-columns: 1fr; }
    @media (min-width: 768px) { .form-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    .field { display: flex; flex-direction: column; gap: 6px; font-size: 14px; color: var(--color-text); }
    .input { border: 1px solid var(--color-border); border-radius: 10px; padding: 10px 12px; background: rgba(255,255,255,0.9); color: var(--color-secondary); font-size: 15px; box-shadow: 0 4px 12px rgba(47,36,29,0.06); }
    .input:focus { outline: 1px solid var(--color-primary); }
    .actions { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; margin-top: 8px; }
    .btn { border-radius: 10px; padding: 10px 16px; font-weight: 600; border: 1px solid transparent; cursor: pointer; transition: transform 120ms ease, box-shadow 120ms ease, background 120ms ease; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-primary { background: var(--color-primary); color: white; box-shadow: 0 10px 18px rgba(139,94,60,0.22); }
    .btn-primary:hover { background: var(--color-primary-dark); transform: translateY(-1px); }
    .btn-ghost { background: transparent; border-color: var(--color-border); color: var(--color-text); }
    .btn-ghost:hover { border-color: var(--color-primary); color: var(--color-primary); transform: translateY(-1px); }
    .text-error { color: var(--color-error); font-size: 14px; }
    .text-success { color: var(--color-success-text); font-size: 14px; }
  `;

  return (
    <html lang="fr">
      <body
        className="min-h-screen"
        style={{ background: "linear-gradient(135deg,#f7f2ea 0%,#f0e4d3 50%,#e8d8c4 100%)", color: "#2f241d" }}
        suppressHydrationWarning
      >
        <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
        {children}
      </body>
    </html>
  )
}
