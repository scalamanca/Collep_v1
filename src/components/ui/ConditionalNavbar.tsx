'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/ui/navbar'
import { useAuth } from "@clerk/nextjs";

export default function ConditionalNavbar() {
  const pathname = usePathname()
  const { isSignedIn } = useAuth();
  const isLandingPage = pathname === '/'

  if (isLandingPage || !isSignedIn) {
    return null
  }

  return <Navbar />
}