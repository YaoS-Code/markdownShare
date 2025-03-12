import { NextRequest, NextResponse } from 'next/server';
import { createWebDAVClient } from '@/lib/webdav';
import { WebDAVClient } from 'webdav';

// 检查路径是否为图片文件
function isImageFile(path: string): boolean {
    const lowerPath = path.toLowerCase();
    return lowerPath.endsWith('.png') || 
           lowerPath.endsWith('.jpg') || 
           lowerPath.endsWith('.jpeg') || 
           lowerPath.endsWith('.gif') || 
           lowerPath.endsWith('.svg') || 
           lowerPath.endsWith('.webp');
}

// 更可靠的方式检查路径是否为目录
async function isDirectorySafe(client: WebDAVClient, path: string): Promise<boolean> {
    try {
        // 对于图片文件，直接返回false（不是目录）
        if (isImageFile(path)) {
            console.log(`Path "${path}" is an image file, treating as file not directory`);
            return false;
        }
        
        // 首先尝试使用stat方法获取文件信息
        const stat = await client.stat(path);
        
        // 检查stat返回对象的不同可能表示
        if (typeof stat === 'object') {
            // 直接检查type属性（标准方式）
            if ('type' in stat && stat.type === 'directory') {
                return true;
            }
            
            // 检查data.type（某些WebDAV客户端可能会这样返回）
            if ('data' in stat && typeof stat.data === 'object' && stat.data !== null) {
                if ('type' in stat.data && (stat.data as any).type === 'directory') {
                    return true;
                }
                
                // 某些服务器使用resourceType或其他属性
                if ('resourceType' in stat.data) {
                    const resourceType = (stat.data as any).resourceType;
                    if (resourceType === 'collection' || resourceType === 'directory') {
                        return true;
                    }
                }
            }
        }
        
        // 如果无法通过stat确定，使用后备方法
        try {
            // 如果这是文件，应该会抛出错误
            const contents = await client.getDirectoryContents(path);
            // 如果没有抛出错误且返回了数组，这很可能是一个目录
            return Array.isArray(contents);
        } catch (dirError) {
            // 获取目录内容失败，这可能是一个文件
            return false;
        }
    } catch (error) {
        console.error(`Error in isDirectorySafe for path: ${path}`, error);
        
        // 如果连stat也失败了，尝试通过路径特征判断（不可靠但可作为备用）
        if (path.endsWith('.md') || path.endsWith('.markdown') || 
            path.endsWith('.txt') || path.endsWith('.html') || 
            path.endsWith('.css') || path.endsWith('.js') || 
            path.endsWith('.json') || path.endsWith('.xml') ||
            isImageFile(path)) {
            // 如果路径以常见文件扩展名结尾，则很可能是文件
            return false;
        }
        
        // 保守假设，如果无法确定，返回false（假设为文件）
        return false;
    }
}

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const path = url.searchParams.get('path');

        if (!path) {
            return NextResponse.json({ error: 'Path parameter is required' }, { status: 400 });
        }

        // 修正常见拼写错误：Obisidian → Obsidian
        const correctedPath = path.replace(/\/Obisidian\//i, '/Obsidian/');
        
        console.log(`API Route (exists) - Checking path: "${correctedPath}" (original: "${path}")`);
        
        // 创建WebDAV客户端
        const client = createWebDAVClient(
            process.env.WEBDAV_URL || '',
            process.env.WEBDAV_USERNAME,
            process.env.WEBDAV_PASSWORD
        );

        // 检查文件或目录是否存在
        const exists = await client.exists(correctedPath);
        
        // 如果不存在，也尝试检查原始路径
        let finalPath = correctedPath;
        if (!exists && correctedPath !== path) {
            const originalExists = await client.exists(path);
            if (originalExists) {
                finalPath = path;
                console.log(`Original path exists but corrected path does not, using original: "${path}"`);
            }
        }
        
        // 如果存在，检查是文件还是目录
        let isDirectory = false;
        if (exists || finalPath !== correctedPath) {
            // 对于.md文件和图片文件，强制将其视为文件而非目录
            if (finalPath.endsWith('.md') || isImageFile(finalPath)) {
                isDirectory = false;
                console.log(`Path "${finalPath}" is forced to be treated as file because it is a markdown or image file`);
            } else {
                isDirectory = await isDirectorySafe(client, finalPath);
                console.log(`Path "${finalPath}" exists and is a ${isDirectory ? 'directory' : 'file'}`);
            }
        } else {
            console.log(`Path "${finalPath}" does not exist`);
        }

        return NextResponse.json({ 
            exists: exists || finalPath !== correctedPath,
            isDirectory,
            path: finalPath,
            originalPath: path,
            corrected: finalPath !== path
        });
    } catch (error) {
        const requestUrl = request.url ? new URL(request.url) : null;
        const pathParam = requestUrl?.searchParams.get('path') || 'unknown path';
        
        console.error('Error checking if file exists:', error);
        console.error('Path that failed:', pathParam);
        
        return NextResponse.json(
            { 
                error: `Failed to check file: ${error instanceof Error ? error.message : String(error)}`,
                exists: false
            },
            { status: 500 }
        );
    }
} 