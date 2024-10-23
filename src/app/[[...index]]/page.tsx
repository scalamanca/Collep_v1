'use client'

import React, { useEffect } from 'react';
import { SignIn, useAuth } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';

export default function Home() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.push('/chatbot');
    }
  }, [isSignedIn, router]);

  if (isSignedIn) {
    return null; // or a loading spinner
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Left side - Placeholder */}
      <div className="w-1/2 hidden md:flex items-center justify-center bg-gray-200">
        <span className="text-4xl font-bold text-gray-500">Your App Image</span>
      </div>

      {/* Right side - Sign In */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <SignIn
            appearance={{
              elements: {
                formButtonPrimary: "bg-primary text-white",
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
