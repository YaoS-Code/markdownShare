import { NextRequest, NextResponse } from 'next/server';
import { createWebDAVClient, getFileContents } from '@/lib/webdav';
import { WebDAVClient } from 'webdav';

// 更可靠地检查路径是否为Markdown文件
function isMarkdownFile(path: string): boolean {
    return path.toLowerCase().endsWith('.md') || 
           path.toLowerCase().endsWith('.markdown') ||
           path.toLowerCase().endsWith('.mdown');
}

// 修正常见路径问题
function correctPath(path: string): string {
    // 修正Obsidian拼写错误
    return path.replace(/\/Obisidian\//i, '/Obsidian/');
}

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const path = url.searchParams.get('path');

        if (!path) {
            return NextResponse.json({ error: 'Path parameter is required' }, { status: 400 });
        }

        // 修正路径拼写问题
        const correctedPath = correctPath(path);
        console.log(`API Route - Fetching file content for: "${correctedPath}" (original: "${path}")`);
        
        // 创建WebDAV客户端
        const client = createWebDAVClient(
            process.env.WEBDAV_URL || '',
            process.env.WEBDAV_USERNAME,
            process.env.WEBDAV_PASSWORD
        );

        // 首先检查文件是否存在（先尝试修正路径，再尝试原始路径）
        let finalPath = correctedPath;
        let exists = await client.exists(correctedPath);
        
        // 如果修正后的路径不存在，尝试原始路径
        if (!exists && path !== correctedPath) {
            exists = await client.exists(path);
            if (exists) {
                finalPath = path;
                console.log(`Using original path: "${path}" as corrected path does not exist`);
            }
        }
        
        if (!exists) {
            console.error(`File does not exist: ${finalPath}`);
            return NextResponse.json({ error: `File not found: ${finalPath}` }, { status: 404 });
        }

        // 对于Markdown文件，强制视为文件而非目录
        if (isMarkdownFile(finalPath)) {
            console.log(`Path "${finalPath}" is a Markdown file, fetching content directly`);
            
            // 获取文件内容
            let content;
            try {
                content = await getFileContents(client, finalPath);
            } catch (contentError) {
                console.error(`Failed to get file contents for ${finalPath}:`, contentError);
                return NextResponse.json({ 
                    error: `Failed to read file: ${contentError instanceof Error ? contentError.message : String(contentError)}` 
                }, { status: 500 });
            }

            if (!content) {
                console.error(`File content is empty or null for ${finalPath}`);
                return NextResponse.json({ error: 'File content is empty or could not be read' }, { status: 500 });
            }
            
            // 返回Markdown内容
            const response = new NextResponse(content as string);
            response.headers.set('Content-Type', 'text/markdown');
            return response;
        }
        
        // 对于非Markdown文件，检查是否为目录
        try {
            await client.getDirectoryContents(finalPath);
            console.error(`Path is a directory, not a file: ${finalPath}`);
            return NextResponse.json({ error: 'Cannot read content of a directory' }, { status: 400 });
        } catch {
            // 获取目录内容失败，说明这可能是一个文件
            console.log(`Path "${finalPath}" is likely a file, proceeding to fetch content`);
        }

        // 获取文件内容
        let content;
        try {
            content = await getFileContents(client, finalPath);
        } catch (contentError) {
            console.error(`Failed to get file contents for ${finalPath}:`, contentError);
            return NextResponse.json({ 
                error: `Failed to read file: ${contentError instanceof Error ? contentError.message : String(contentError)}` 
            }, { status: 500 });
        }

        if (!content) {
            console.error(`File content is empty or null for ${finalPath}`);
            return NextResponse.json({ error: 'File content is empty or could not be read' }, { status: 500 });
        }
        
        // 确定内容类型
        let contentType = 'text/plain';
        if (path.endsWith('.md') || path.endsWith('.markdown')) {
            contentType = 'text/markdown';
        } else if (path.endsWith('.html') || path.endsWith('.htm')) {
            contentType = 'text/html';
        } else if (path.endsWith('.json')) {
            contentType = 'application/json';
        } else if (path.endsWith('.xml')) {
            contentType = 'application/xml';
        } else if (path.endsWith('.css')) {
            contentType = 'text/css';
        } else if (path.endsWith('.js')) {
            contentType = 'application/javascript';
        } else if (path.endsWith('.txt')) {
            contentType = 'text/plain';
        }
        
        // 成功获取内容后，创建响应
        const response = new NextResponse(content as string);
        response.headers.set('Content-Type', contentType);
        return response;
    } catch (error) {
        console.error('Error in file API route:', error);
        console.error('Error details:', JSON.stringify({
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : 'No stack trace',
            path: request.url
        }));
        
        return NextResponse.json(
            { error: `Failed to fetch file content: ${error instanceof Error ? error.message : String(error)}` },
            { status: 500 }
        );
    }
} 