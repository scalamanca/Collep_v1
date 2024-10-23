'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import PineconeDataTable from './PineconeDataTable';

// Match the interface from PineconeDataTable
interface FileData {
  name: string;
  updated_on: string;
}

interface PineconeData {
  files: FileData[];
}

const DataViewerPage = () => {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<PineconeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/');
    }
  }, [isLoaded, userId, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (isLoaded && userId) {
        try {
          console.log('Fetching data from API...');
          const protocol = window.location.protocol;
          const host = window.location.host;
          const apiUrl = `${protocol}//${host}/api/pinecone-data`;

          const res = await fetch(apiUrl, {
            cache: 'no-store',
          });

          console.log('API response status:', res.status);

          if (!res.ok) {
            const errorText = await res.text();
            console.error('API error response:', errorText);
            throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
          }

          const fetchedData = await res.json();
          console.log('Fetched data:', fetchedData);
          setData(fetchedData);
        } catch (error) {
          console.error('Error in fetchData:', error);
          setError(error instanceof Error ? error.message : String(error));
        }
      }
    };

    fetchData();
  }, [isLoaded, userId]);

  if (!isLoaded || !userId) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 h-[calc(100vh-4rem)] bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Error loading data</h1>
          <p className="mb-2">Please check the server logs for more details.</p>
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto p-4 h-[calc(100vh-4rem)] bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
          <p className="text-lg">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-4rem)] bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg">
        <PineconeDataTable initialData={data} />
      </div>
    </div>
  );
};

export default DataViewerPage;