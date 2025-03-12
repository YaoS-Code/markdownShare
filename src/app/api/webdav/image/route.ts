import { NextRequest, NextResponse } from 'next/server';
import { createWebDAVClient } from '@/lib/webdav';

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const path = url.searchParams.get('path');

        if (!path) {
            return NextResponse.json({ error: 'Path parameter is required' }, { status: 400 });
        }

        console.log(`API Route - Fetching image for: "${path}"`);
        
        // 创建WebDAV客户端
        const client = createWebDAVClient(
            process.env.WEBDAV_URL || '',
            process.env.WEBDAV_USERNAME,
            process.env.WEBDAV_PASSWORD
        );

        // 检查文件是否存在
        const exists = await client.exists(path);
        if (!exists) {
            console.error(`Image does not exist: ${path}`);
            return NextResponse.json({ error: `Image not found: ${path}` }, { status: 404 });
        }

        // 尝试获取文件信息
        try {
            const stat = await client.stat(path);
            console.log(`File stat for ${path}:`, JSON.stringify(stat));
        } catch (statError) {
            console.warn(`Could not get stat for ${path}:`, statError);
            // 继续处理，不中断流程
        }

        // 获取图片内容
        let imageBuffer;
        try {
            console.log(`Attempting to get file contents for: ${path}`);
            imageBuffer = await client.getFileContents(path, { format: 'binary' }) as Buffer;
            console.log(`Successfully retrieved image content, size: ${imageBuffer?.length || 0} bytes`);
        } catch (contentError) {
            console.error(`Error getting file contents for ${path}:`, contentError);
            return NextResponse.json({ 
                error: `Failed to get image content: ${contentError instanceof Error ? contentError.message : String(contentError)}` 
            }, { status: 500 });
        }
        
        if (!imageBuffer || imageBuffer.length === 0) {
            console.error(`Empty image content for ${path}`);
            return NextResponse.json({ error: 'Image content is empty' }, { status: 500 });
        }
        
        // 确定Content-Type
        let contentType = 'image/jpeg'; // 默认
        
        // 根据文件扩展名设置正确的内容类型
        const lowerPath = path.toLowerCase();
        if (lowerPath.endsWith('.png')) {
            contentType = 'image/png';
        } else if (lowerPath.endsWith('.jpg') || lowerPath.endsWith('.jpeg')) {
            contentType = 'image/jpeg';
        } else if (lowerPath.endsWith('.gif')) {
            contentType = 'image/gif';
        } else if (lowerPath.endsWith('.webp')) {
            contentType = 'image/webp';
        } else if (lowerPath.endsWith('.svg')) {
            contentType = 'image/svg+xml';
        }
        
        console.log(`Serving image ${path} with content type: ${contentType}`);
        
        // 创建响应
        const response = new NextResponse(imageBuffer);
        response.headers.set('Content-Type', contentType);
        response.headers.set('Cache-Control', 'public, max-age=86400'); // 缓存1天
        
        return response;
    } catch (error) {
        console.error('Error fetching image:', error);
        return NextResponse.json(
            { error: `Failed to fetch image: ${error instanceof Error ? error.message : String(error)}` },
            { status: 500 }
        );
    }
} 