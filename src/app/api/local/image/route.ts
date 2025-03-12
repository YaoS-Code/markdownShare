import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const imagePath = url.searchParams.get('path');

        if (!imagePath) {
            return NextResponse.json({ error: 'Path parameter is required' }, { status: 400 });
        }

        // 移除开头的斜杠，以便正确解析路径
        const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
        
        // 构建图片的绝对路径（从public目录开始）
        const publicDir = path.join(process.cwd(), 'public');
        const fullPath = path.join(publicDir, cleanPath);

        // 检查文件是否存在
        if (!fs.existsSync(fullPath)) {
            console.error(`Local image does not exist: ${fullPath}`);
            return NextResponse.json({ error: `Image not found: ${imagePath}` }, { status: 404 });
        }

        // 读取图片内容
        const imageBuffer = fs.readFileSync(fullPath);
        
        // 确定Content-Type
        let contentType = 'image/jpeg'; // 默认
        
        // 根据文件扩展名设置正确的内容类型
        if (fullPath.endsWith('.png')) {
            contentType = 'image/png';
        } else if (fullPath.endsWith('.jpg') || fullPath.endsWith('.jpeg')) {
            contentType = 'image/jpeg';
        } else if (fullPath.endsWith('.gif')) {
            contentType = 'image/gif';
        } else if (fullPath.endsWith('.webp')) {
            contentType = 'image/webp';
        } else if (fullPath.endsWith('.svg')) {
            contentType = 'image/svg+xml';
        }
        
        // 创建响应
        const response = new NextResponse(imageBuffer);
        response.headers.set('Content-Type', contentType);
        response.headers.set('Cache-Control', 'public, max-age=86400'); // 缓存1天
        
        return response;
    } catch (error) {
        console.error('Error fetching local image:', error);
        return NextResponse.json(
            { error: `Failed to fetch image: ${error instanceof Error ? error.message : String(error)}` },
            { status: 500 }
        );
    }
} 