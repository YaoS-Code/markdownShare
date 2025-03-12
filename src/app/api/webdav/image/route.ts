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

        // 获取图片内容
        const imageBuffer = await client.getFileContents(path, { format: 'binary' }) as Buffer;
        
        // 确定Content-Type
        let contentType = 'image/jpeg'; // 默认
        
        // 根据文件扩展名设置正确的内容类型
        if (path.endsWith('.png')) {
            contentType = 'image/png';
        } else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
            contentType = 'image/jpeg';
        } else if (path.endsWith('.gif')) {
            contentType = 'image/gif';
        } else if (path.endsWith('.webp')) {
            contentType = 'image/webp';
        } else if (path.endsWith('.svg')) {
            contentType = 'image/svg+xml';
        }
        
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