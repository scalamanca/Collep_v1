// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
    try {
        // Check authentication
        const { userId } = auth();
        
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Validate environment variables
        const apiUrl = process.env.PINECONE_API_URL;
        const apiKey = process.env.PINECONE_API_KEY;

        if (!apiUrl || !apiKey) {
            console.error('Missing API configuration');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        // Parse request body
        const body = await req.json();
        const { messages } = body;

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: 'Invalid request format' },
                { status: 400 }
            );
        }

        // Make API request
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Api-Key': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages,
                stream: false,
                model: "gpt-4o"
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Pinecone API error:', {
                status: response.status,
                response: errorText
            });
            return NextResponse.json(
                { error: 'External API error' },
                { status: 502 }
            );
        }

        // Return response
        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}