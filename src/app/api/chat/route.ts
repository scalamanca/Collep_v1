// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// app/api/chat/route.ts
export async function POST(req: NextRequest) {
    try {
        // Check authentication
        const { userId } = auth();
        console.log('Auth check:', { userId });
        
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Validate environment variables
        const apiUrl = process.env.PINECONE_API_URL;
        const apiKey = process.env.PINECONE_API_KEY;
        console.log('Environment check:', { 
            hasApiUrl: !!apiUrl, 
            hasApiKey: !!apiKey 
        });

        if (!apiUrl || !apiKey) {
            console.error('Missing API configuration');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        // Parse request body
        const body = await req.json();
        console.log('Request body:', body);

        const { messages } = body;
        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: 'Invalid request format' },
                { status: 400 }
            );
        }

        // Log the request we're about to make
        console.log('Making API request to:', apiUrl);

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Api-Key': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages,
                stream: false,
                model: "gpt-4"  // Note: fixed typo from "gpt-4o" to "gpt-4"
            }),
        });

        console.log('API response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Pinecone API error:', {
                status: response.status,
                statusText: response.statusText,
                response: errorText
            });
            return NextResponse.json(
                { 
                    error: `External API error: ${response.status} ${response.statusText}`,
                    details: errorText
                },
                { status: 502 }
            );
        }

        const data = await response.json();
        console.log('Successful response data:', data);
        return NextResponse.json(data);

    } catch (error) {
        console.error('Chat API error:', error);
        // More detailed error response
        return NextResponse.json(
            { 
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
            },
            { status: 500 }
        );
    }
}