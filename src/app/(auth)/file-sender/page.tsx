'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAuth } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { sendFileToWebhook } from "@/app/(auth)/actions"
import { useFormStatus } from 'react-dom'
import { Upload, FileIcon } from 'lucide-react'

export default function FileSender() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null)

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/');
    }
  }, [isLoaded, userId, router]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles[0]) {
      setFile(acceptedFiles[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    
    const response = await sendFileToWebhook(formData)
    setResult(response)
  }

  if (!isLoaded || !userId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-4rem)] bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">File Sender</CardTitle>
          <CardDescription>Choose a file to send via the webhook</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              {file ? (
                <div className="flex items-center justify-center space-x-2">
                  <FileIcon className="h-8 w-8 text-blue-500" />
                  <span className="text-lg text-gray-700">{file.name}</span>
                </div>
              ) : (
                <p className="text-gray-500 text-lg">
                  {isDragActive ? 'Drop the file here...' : 'Drag and drop a file here, or click to select a file'}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full text-lg py-6" disabled={!file}>
              <Upload className="mr-2 h-6 w-6" /> Send File
            </Button>
          </form>
          <ResultDisplay result={result} />
        </CardContent>
      </Card>
    </div>
  )
}

function ResultDisplay({ result }: { result: { success?: boolean; message?: string; error?: string } | null }) {
  const { pending } = useFormStatus()

  if (pending) {
    return <p className="mt-6 p-4 bg-gray-200 rounded text-lg">File is being sent...</p>
  }

  if (result?.success) {
    return <p className="mt-6 p-4 bg-green-200 rounded text-lg">{result.message}</p>
  }

  if (result?.error) {
    return <p className="mt-6 p-4 bg-red-200 rounded text-lg">{result.error}</p>
  }

  return null
}