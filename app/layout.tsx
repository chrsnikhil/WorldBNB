import type React from "react"
import type { Metadata } from "next"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import MiniKitProvider from "./components/MiniKitProvider"

export const metadata: Metadata = {
  title: "WorldBNB",
  description: "Your global accommodation platform",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${GeistMono.className} bg-black text-white antialiased`}>
        <MiniKitProvider>
          {children}
        </MiniKitProvider>
      </body>
    </html>
  )
}
