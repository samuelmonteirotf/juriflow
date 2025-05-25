import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "JuriFlow - Organização Jurídica Inteligente",
  description: "Aplicativo web para advogados organizarem suas tarefas com elegância e simplicidade",
  keywords: ["jurídico", "advocacia", "organização", "tarefas", "produtividade"],
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
