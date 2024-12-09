import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from 'next-themes'
import { ClerkProvider } from '@clerk/nextjs'
import dynamic from 'next/dynamic'

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Collep | Instant Insights",
  description: "Collep assists you in transforming your financial data into actionable insights, empowering smarter business decisions",
};

const ConditionalNavbar = dynamic(() => import('@/components/ui/ConditionalNavbar'), { ssr: false })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
        <body>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ConditionalNavbar />
            <main>{children}</main>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}