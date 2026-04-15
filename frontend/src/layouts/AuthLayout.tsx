import type { PropsWithChildren } from 'react'

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '24px',
      }}
    >
      <section
        className="panel panel-elevated"
        style={{
          width: '100%',
          maxWidth: '440px',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 20px 60px rgba(18, 48, 71, 0.12)',
          border: '1px solid rgba(18, 48, 71, 0.08)',
        }}
      >
        {children}
      </section>
    </main>
  )
}
