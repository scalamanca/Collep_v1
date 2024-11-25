'use client'

import React, { useEffect } from 'react';
import { SignIn, useAuth } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Home() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.push('/chatbot');
    }
  }, [isSignedIn, router]);

  if (isSignedIn) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Left side - Image */}
      <div className="w-1/2 hidden md:flex items-center justify-center bg-gray-200">
        <Image 
          src="/landing.jpg"  // Make sure extension matches your file (.jpg)
          alt="Welcome to our platform"
          width={800}
          height={800}
          priority
          className="object-cover w-full h-full"  // This will make it cover the entire left side
        />
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