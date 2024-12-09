'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import { Send, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, Cell
} from 'recharts';

// Type definitions
interface Message {
    role: 'user' | 'bot';
    content: string;
    code?: string;
    visualization_data?: VisualizationData;
}

interface ApiResponse {
    code: string;
    visualization_data: VisualizationData;
    formatted_results: string;
    success: boolean;
}

interface VisualizationData {
    type: string;
    data: any[];
    options?: any;
}

interface FormattedMessageProps {
    content: string;
    code?: string;
    visualization_data?: VisualizationData;
}

interface ChartComponentProps {
    visualizationData: VisualizationData;
}

interface DataPoint {
    name: string;
    value: number;
    color?: string;
}

// Chart component with proper types
const ChartComponent: React.FC<ChartComponentProps> = ({ visualizationData }) => {
    const { type, data, options } = visualizationData;

    // Default color palette
    const defaultColors = [
        "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c",
        "#d0ed57", "#83a6ed", "#8dd1e1", "#a4add3", "#d0c1f3"
    ];

    const getColor = (index: number): string => {
        const colors = options?.colors || defaultColors;
        return colors[index % colors.length];
    };

    const transformData = (inputData: any[]): DataPoint[] => {
        if (!inputData || !Array.isArray(inputData)) return [];
        
        return inputData.map((item, index) => ({
            name: item.name || '',
            value: parseFloat(item.value || 0),
            color: getColor(index)
        }));
    };

    const transformedData = transformData(data);

    const renderChart = () => {
        const commonProps = {
            margin: { top: 20, right: 30, left: 40, bottom: 60 }
        };

        const defaultSeriesName = options?.seriesName || 'Value';

        switch (type) {
            case 'line':
                return (
                    <LineChart data={transformedData} {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            dataKey="name" 
                            angle={-45}
                            textAnchor="end"
                            height={60}
                            interval={0}
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                            label={{ 
                                value: options?.yAxisLabel || defaultSeriesName,
                                angle: -90,
                                position: 'insideLeft',
                                style: { textAnchor: 'middle' }
                            }}
                        />
                        <Tooltip />
                        <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                        <Line
                            name={defaultSeriesName}
                            type="monotone"
                            dataKey="value"
                            stroke={transformedData[0]?.color || defaultColors[0]}
                            strokeWidth={2}
                        />
                    </LineChart>
                );

            case 'bar':
                return (
                    <BarChart data={transformedData} {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={60}
                            interval={0}
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                            label={{ 
                                value: options?.yAxisLabel || defaultSeriesName,
                                angle: -90,
                                position: 'insideLeft',
                                style: { textAnchor: 'middle' }
                            }}
                        />
                        <Tooltip />
                        <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                        <Bar name={defaultSeriesName} dataKey="value">
                            {transformedData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                );

            case 'pie':
                return (
                    <PieChart {...commonProps}>
                        <Pie
                            data={transformedData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={150}
                            label
                        >
                            {transformedData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                    </PieChart>
                );

            default:
                return <div>Unsupported chart type: {type}</div>;
        }
    };

    return (
        <div className="w-full h-96">
            <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
            </ResponsiveContainer>
        </div>
    );
};

// Message formatting component with proper types
const FormattedMessage: React.FC<FormattedMessageProps> = ({ content, code, visualization_data }) => {
    return (
        <div className="prose max-w-none dark:prose-invert w-full">
            <div className="text-sm space-y-2">
                {content.split('\n').map((paragraph: string, index: number) => (
                    paragraph.trim() && (
                        <p key={index} className="text-sm leading-relaxed">{paragraph.trim()}</p>
                    )
                ))}
            </div>
            
            {visualization_data && (
                <div className="mt-4 w-full">
                    <ChartComponent visualizationData={visualization_data} />
                </div>
            )}
            
            {code && (
                <div className="mt-4 w-full">
                    <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-x-auto text-xs">
                        <code>{code}</code>
                    </pre>
                </div>
            )}
        </div>
    );
};

// Main page component
const GraphPage: React.FC = () => {
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
                <Card className="w-96">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-center space-x-2">
                            <Loader className="w-4 h-4 animate-spin" />
                            <span>Loading...</span>
                        </div>
                    </CardContent>
                </Card>
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
                const response = await fetch('http://127.0.0.1:5000/graphs', {
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
                    visualization_data: data.visualization_data
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
                                                        <FormattedMessage
                                                            content={message.content}
                                                            code={message.code}
                                                            visualization_data={message.visualization_data}
                                                        />
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
                            placeholder="Ask about your data visualization..."
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

export default GraphPage;