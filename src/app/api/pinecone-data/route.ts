import { NextResponse } from 'next/server';

export async function GET() {
  const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
  const PINECONE_FILES_URL = process.env.PINECONE_FILES_URL;

  if (!PINECONE_API_KEY || !PINECONE_FILES_URL) {
    console.error('Missing environment variables: NEXT_PUBLIC_PINECONE_API_KEY or NEXT_PUBLIC_PINECONE_FILES_URL');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  try {
    console.log('Fetching data from Pinecone API...');
    const response = await fetch(PINECONE_FILES_URL, {
      method: 'GET',
      headers: {
        'Api-Key': PINECONE_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    console.log('Pinecone API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pinecone API error response:', errorText);
      return NextResponse.json({ error: `Pinecone API request failed: ${response.status} ${response.statusText}` }, { status: response.status });
    }

    const data = await response.json();
    console.log('Fetched data from Pinecone:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching Pinecone data:', error);
    return NextResponse.json({ error: 'Failed to fetch Pinecone data' }, { status: 500 });
  }
}