'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import { Send, ChevronDown, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Message {
  role: 'user' | 'bot';
  content: string;
  code?: string;
  raw_results?: string | null;
}

interface ApiResponse {
  code: string;
  formatted_results: string;
  raw_results: string | null;
  success: boolean;
}

const FormattedMessage: React.FC<{ content: string; code?: string }> = ({ content, code }) => {
  const formatContent = (text: string) => {
    return text.split('\n').map((paragraph: string, index: number) => {
      if (paragraph.trim().startsWith('•') || paragraph.trim().startsWith('-')) {
        return (
          <li key={index} className="ml-6 mb-2">
            {paragraph.trim().substring(1).trim()}
          </li>
        );
      }
      if (paragraph.trim().match(/^\d+\./)) {
        return (
          <p key={index} className="font-semibold mt-4 mb-2">
            {paragraph.trim()}
          </p>
        );
      }
      return <p key={index} className="mb-4">{paragraph.trim()}</p>;
    });
  };

  return (
    <div className="prose max-w-none dark:prose-invert">
      {formatContent(content)}
      {code && (
        <div className="mt-4">
          <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-x-auto">
            <code>{code}</code>
          </pre>
        </div>
      )}
    </div>
  );
};

const ChatbotPage = () => {
    const { isLoaded, userId } = useAuth();
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isLoaded && !userId) {
            router.push('/');
        }
    }, [isLoaded, userId, router]);

    if (!isLoaded || !userId) {
        return (
            <div className="container mx-auto p-4 h-[calc(100vh-4rem)] bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                    <p className="text-lg">Loading...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-4 h-[calc(100vh-4rem)] bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                    <h1 className="text-2xl font-bold mb-4">Error</h1>
                    <p className="mb-2">An error occurred while processing your request.</p>
                    <p className="text-red-600">Error: {error}</p>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            setIsLoading(true);
            setError(null);
            const userMessage: Message = { role: 'user', content: input };
            setMessages(prev => [...prev, userMessage]);
            setInput('');
    
            try {
                const response = await fetch('https://scalamanca.pythonanywhere.com/analyze', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        question: input
                    }),
                });
    
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Failed to send message');
                }
    
                const data: ApiResponse = await response.json();
                const botMessage: Message = {
                    role: 'bot',
                    content: data.formatted_results,
                    code: data.code,
                    raw_results: data.raw_results
                };
                setMessages(prev => [...prev, botMessage]);
            } catch (error) {
                console.error('Error:', error);
                setError(error instanceof Error ? error.message : String(error));
                setMessages(prev => [...prev, { 
                    role: 'bot', 
                    content: 'Sorry, there was an error processing your message. Please try again.' 
                }]);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="container mx-auto p-4 h-[calc(100vh-4rem)] bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            <Card className="h-full flex flex-col max-w-6xl mx-auto shadow-lg border-0">
                <CardContent className="flex-1 p-0">
                    <ScrollArea className="h-[calc(100vh-12rem)]">
                        <div className="p-6 space-y-6">
                            <AnimatePresence initial={false}>
                                {messages.map((message, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`flex flex-col max-w-[80%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                                            <Card className={`px-4 py-2 ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-800'}`}>
                                                <CardContent className="p-2">
                                                    {message.role === 'user' ? (
                                                        <p className="text-sm">{message.content}</p>
                                                    ) : (
                                                        <FormattedMessage content={message.content} code={message.code} />
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </motion.div>
                                ))}
                                {isLoading && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="flex justify-start"
                                    >
                                        <Card className="px-4 py-2 bg-white dark:bg-gray-800">
                                            <CardContent className="p-2 flex items-center space-x-2">
                                                <Loader className="w-4 h-4 animate-spin" />
                                                <span className="text-sm">...</span>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </ScrollArea>
                </CardContent>
                <div className="p-4 border-t bg-white dark:bg-gray-800">
                    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                        <Input
                            type="text"
                            placeholder="Type your message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1"
                            disabled={isLoading}
                        />
                        <Button type="submit" size="icon" disabled={isLoading}>
                            <Send className="h-4 w-4" />
                            <span className="sr-only">Send message</span>
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
};

export default ChatbotPage;