"use client";

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import PythonSandbox from './PythonSandbox';

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

        // Format Obsidian properties
        newContent = formatObsidianProperties(newContent);

        // Process image paths to make them relative to the WebDAV server
        // Convert Obsidian image markdown format ![alt](attachment/image.png) to proper URLs
        // Also handle Obsidian width syntax ![alt|width](path)
        newContent = newContent.replace(
            /!\[(.*?)(?:\|(\d+))?\]\((.*?)\)/g,
            (match, alt, width, src) => {
                // If the path is already absolute URL, return as is but with width if specified
                if (src.startsWith('http://') || src.startsWith('https://')) {
                    if (width) {
                        return `![${alt}](${src} width=${width}px)`;
                    }
                    return match;
                }

                // Check if the image is in the attachments folder
                if (src.startsWith('./') || src.startsWith('../') || !src.startsWith('/')) {
                    // Relative path - build proper path based on current file location
                    const absoluteSrc = `${directoryPath}/${src.replace(/^\.\//, '')}`;
                    console.log(`Converting relative image path: ${src} to absolute: ${absoluteSrc}`);

                    if (width) {
                        return `![${alt}](/api/webdav/image?path=${encodeURIComponent(absoluteSrc)}){width=${width}px}`;
                    }
                    return `![${alt}](/api/webdav/image?path=${encodeURIComponent(absoluteSrc)})`;
                }

                // Already absolute path
                console.log(`Using absolute image path: ${src}`);
                if (width) {
                    return `![${alt}](/api/webdav/image?path=${encodeURIComponent(src)}){width=${width}px}`;
                }
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

    // Function to format Obsidian properties
    const formatObsidianProperties = (content: string): string => {
        // Check if the content starts with a properties section
        if (!content.trim().startsWith('---') || !content.includes('---', 3)) {
            return content;
        }

        // Extract the properties section
        const propertiesMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (!propertiesMatch) {
            return content;
        }

        const propertiesSection = propertiesMatch[0];
        const propertiesContent = propertiesMatch[1];

        // Parse the properties
        const properties: Record<string, string> = {};
        const propertyLines = propertiesContent.split('\n');

        propertyLines.forEach(line => {
            const colonIndex = line.indexOf(':');
            if (colonIndex > 0) {
                const key = line.substring(0, colonIndex).trim();
                const value = line.substring(colonIndex + 1).trim();
                properties[key] = value;
            }
        });

        // Create a formatted HTML table for properties
        let formattedProperties = `
<div class="obsidian-properties">
  <h2 class="properties-heading">Properties</h2>
  <table class="properties-table">
    <tbody>`;

        // Add each property to the table
        Object.entries(properties).forEach(([key, value]) => {
            // Format tags specially
            if (key === 'tags' && value) {
                const tags = value.split(',').map((tag: string) => tag.trim());
                const formattedTags = tags.map((tag: string) =>
                    `<span class="property-tag">${tag}</span>`
                ).join(' ');

                formattedProperties += `
      <tr>
        <td class="property-key" data-key="${key}">${key}</td>
        <td class="property-value">${formattedTags}</td>
      </tr>`;
            } else {
                formattedProperties += `
      <tr>
        <td class="property-key" data-key="${key}">${key}</td>
        <td class="property-value">${value || 'Empty'}</td>
      </tr>`;
            }
        });

        formattedProperties += `
    </tbody>
  </table>
</div>

`;

        // Replace the original properties section with the formatted one
        return content.replace(propertiesSection, formattedProperties);
    };

    return (
        <div className="prose prose-slate max-w-none dark:prose-invert obsidian-markdown">
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeRaw, rehypeKatex]}
                components={{
                    // Add custom components for special rendering
                    img: ({ ...props }) => {
                        // Extract width from the alt text if it exists
                        let style = {};
                        const altText = props.alt || '';

                        // Check if there's a width attribute in the format {width=123px}
                        if (props.src) {
                            const widthMatch = props.src.match(/\)\{width=(\d+)px\}$/);
                            if (widthMatch) {
                                // Set the width in the style
                                style = { width: `${widthMatch[1]}px` };
                                // Remove the width attribute from the src
                                props.src = props.src.replace(/\{width=\d+px\}$/, '');
                            }
                        }

                        return (
                            <img
                                {...props}
                                className="max-w-full h-auto"
                                loading="lazy"
                                alt={altText}
                                style={style}
                            />
                        );
                    },
                    a: ({ ...props }) => (
                        <a
                            {...props}
                            className="text-blue-500 hover:text-blue-700"
                            target={props.href?.startsWith('http') ? '_blank' : undefined}
                            rel={props.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                        >
                            {props.children}
                        </a>
                    ),
                    code: (props) => {
                        const { className, children } = props as { className?: string; children: React.ReactNode };
                        const match = /language-(\w+)/.exec(className || '');
                        const language = match && match[1] ? match[1] : '';

                        // If it's not a Python code block, render normally
                        if (language !== 'python') {
                            return <code {...props} />;
                        }

                        // For Python code blocks, use our PythonSandbox component
                        return (
                            <PythonSandbox code={String(children).replace(/\n$/, '')} />
                        );
                    }
                }}
            >
                {processedContent}
            </ReactMarkdown>
        </div>
    );
} 