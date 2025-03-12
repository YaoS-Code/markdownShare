import { createWebDAVClient } from '@/lib/webdav';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // Start with root path by default
  let path = searchParams.get('path') || '/';
  
  console.log('API Route - Received request for path:', path);

  try {
    const client = createWebDAVClient(
      process.env.WEBDAV_URL || '',
      process.env.WEBDAV_USERNAME,
      process.env.WEBDAV_PASSWORD
    );

    console.log('API Route - WebDAV client created, fetching contents...');
    
    // Check if the path exists first
    const exists = await client.exists(path);
    if (!exists) {
      console.log(`Path ${path} does not exist, trying root directory`);
      path = '/';
    }
    
    const contents = await client.getDirectoryContents(path);
    console.log('API Route - Contents fetched successfully');
    return NextResponse.json(contents);
  } catch (error: Error | unknown) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    console.error('API Route - Error details:', {
      message: err.message,
      stack: err.stack,
      path: path,
      url: process.env.WEBDAV_URL,
    });
    
    return NextResponse.json(
      { error: `Failed to fetch directory contents: ${err.message}` },
      { status: 500 }
    );
  }
} 