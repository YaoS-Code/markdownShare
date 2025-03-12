"use client";

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface MarkdownRendererProps {
    content: string;
    filePath?: string;
    basePath?: string;
}

export default function MarkdownRenderer({ content, filePath, basePath }: MarkdownRendererProps) {
    const [processedContent, setProcessedContent] = useState(content);

    useEffect(() => {
        // Process the markdown content to handle Obsidian-specific syntax
        let newContent = content;

        // Use basePath if provided, otherwise use directory from filePath
        const directoryPath = basePath || (filePath
            ? filePath.substring(0, filePath.lastIndexOf('/'))
            : '/');

        console.log(`Processing markdown with directoryPath: ${directoryPath}`);

        // Process image paths to make them relative to the WebDAV server
        // Convert Obsidian image markdown format ![alt](attachment/image.png) to proper URLs
        newContent = newContent.replace(
            /!\[(.*?)\]\((.*?)\)/g,
            (match, alt, src) => {
                // If the path is already absolute URL, return as is
                if (src.startsWith('http://') || src.startsWith('https://')) {
                    return match;
                }

                // Check if the image is in the attachments folder
                if (src.startsWith('./') || src.startsWith('../') || !src.startsWith('/')) {
                    // Relative path - build proper path based on current file location
                    const absoluteSrc = `${directoryPath}/${src.replace(/^\.\//, '')}`;
                    console.log(`Converting relative image path: ${src} to absolute: ${absoluteSrc}`);
                    return `![${alt}](/api/webdav/image?path=${encodeURIComponent(absoluteSrc)})`;
                }

                // Already absolute path
                console.log(`Using absolute image path: ${src}`);
                return `![${alt}](/api/webdav/image?path=${encodeURIComponent(src)})`;
            }
        );

        // Process HTML img tags to handle relative paths
        newContent = newContent.replace(
            /<img\s+([^>]*?)src=["'](.*?)["']([^>]*?)>/gi,
            (match, beforeSrc, src, afterSrc) => {
                // If the path is already absolute URL, return as is
                if (src.startsWith('http://') || src.startsWith('https://')) {
                    return match;
                }

                // If the path is a local public file (starts with /), return as is
                if (src.startsWith('/') && !src.startsWith('/api/webdav')) {
                    return match;
                }

                // Check if the image is using a relative path
                if (src.startsWith('./') || src.startsWith('../') || !src.startsWith('/')) {
                    // Relative path - build proper path based on current file location
                    const absoluteSrc = `${directoryPath}/${src.replace(/^\.\//, '')}`;
                    console.log(`Converting relative HTML image path: ${src} to absolute: ${absoluteSrc}`);
                    return `<img ${beforeSrc}src="/api/webdav/image?path=${encodeURIComponent(absoluteSrc)}"${afterSrc}>`;
                }

                // Already absolute path (but not a public file)
                console.log(`Using absolute HTML image path: ${src}`);
                return `<img ${beforeSrc}src="/api/webdav/image?path=${encodeURIComponent(src)}"${afterSrc}>`;
            }
        );

        // Special handling for <image> tags (non-standard but sometimes used)
        newContent = newContent.replace(
            /<image\s+([^>]*?)src=["'](.*?)["']([^>]*?)>/gi,
            (match, beforeSrc, src, afterSrc) => {
                // Convert <image> to <img>
                console.log(`Converting <image> tag to <img> tag for src: ${src}`);

                // If the path is already absolute URL, return as is but with img tag
                if (src.startsWith('http://') || src.startsWith('https://')) {
                    return `<img ${beforeSrc}src="${src}"${afterSrc}>`;
                }

                // If the path is a local public file (starts with /), return as is but with img tag
                if (src.startsWith('/') && !src.startsWith('/api/webdav')) {
                    return `<img ${beforeSrc}src="${src}"${afterSrc}>`;
                }

                // Check if the image is using a relative path
                if (src.startsWith('./') || src.startsWith('../') || !src.startsWith('/')) {
                    // Relative path - build proper path based on current file location
                    const absoluteSrc = `${directoryPath}/${src.replace(/^\.\//, '')}`;
                    console.log(`Converting relative <image> path: ${src} to absolute: ${absoluteSrc}`);
                    return `<img ${beforeSrc}src="/api/webdav/image?path=${encodeURIComponent(absoluteSrc)}"${afterSrc}>`;
                }

                // Already absolute path (but not a public file)
                console.log(`Using absolute <image> path: ${src}`);
                return `<img ${beforeSrc}src="/api/webdav/image?path=${encodeURIComponent(src)}"${afterSrc}>`;
            }
        );

        // Handle Obsidian wiki links [[Page]] or [[Page|DisplayText]]
        newContent = newContent.replace(
            /\[\[(.*?)\]\]/g,
            (match, link) => {
                const parts = link.split('|');
                const path = parts[0].trim();
                const text = parts.length > 1 ? parts[1].trim() : path;

                // Build relative path for the link
                let linkPath = path;
                if (!linkPath.startsWith('/')) {
                    linkPath = `${directoryPath}/${linkPath}`;
                }

                // Return as markdown link for proper rendering
                return `[${text}](/view${encodeURIComponent(linkPath)})`;
            }
        );

        setProcessedContent(newContent);
    }, [content, filePath, basePath]);

    return (
        <div className="prose prose-slate max-w-none dark:prose-invert obsidian-markdown">
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeRaw, rehypeKatex]}
                components={{
                    // Add custom components for special rendering
                    img: ({ ...props }) => (
                        <img
                            {...props}
                            className="max-w-full h-auto"
                            loading="lazy"
                            alt={props.alt || ''}
                        />
                    ),
                    a: ({ ...props }) => (
                        <a
                            {...props}
                            className="text-blue-500 hover:text-blue-700"
                            target={props.href?.startsWith('http') ? '_blank' : undefined}
                            rel={props.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                        >
                            {props.children}
                        </a>
                    )
                }}
            >
                {processedContent}
            </ReactMarkdown>
        </div>
    );
} 