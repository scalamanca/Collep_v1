import React from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"

export default function Navbar() {
  return (
    <nav className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-semibold" style={{ color: '#000000' }}>
              Collep
            </Link>
          </div>
          <div className="hidden md:flex md:items-center md:space-x-6">
            <SignedIn>
              <Button variant="ghost" asChild>
                <Link href="/chatbot">Chat</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/file-sender">Upload</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/data-viewer">Data</Link>
              </Button>
            </SignedIn>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="default">Sign In</Button>
              </SignInButton>
            </SignedOut>
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="h-[1.2rem] w-[1.2rem]" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <SignedIn>
                    <DropdownMenuItem asChild>
                      <Link href="/chatbot">Chat</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/file-sender">Upload</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/data-viewer">Data</Link>
                    </DropdownMenuItem>
                  </SignedIn>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}