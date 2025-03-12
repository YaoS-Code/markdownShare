"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MarkdownRenderer from "@/components/MarkdownRenderer";

export default function MarkdownViewerClient({ filePath }: { filePath: string }) {
    const [content, setContent] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [fileName, setFileName] = useState<string>("");

    useEffect(() => {
        const fetchContent = async () => {
            try {
                setLoading(true);
                setError(null);

                // 提取文件名
                const name = filePath.split('/').pop() || '';
                setFileName(name);

                // 首先检查文件是否存在
                const checkResponse = await fetch(`/api/webdav/exists?path=${encodeURIComponent(filePath)}`);
                const { exists, isDirectory } = await checkResponse.json();

                if (!exists) {
                    setError(`File not found`);
                    setLoading(false);
                    return;
                }

                if (isDirectory) {
                    setError(`This is a directory, not a file`);
                    setLoading(false);
                    return;
                }

                // 获取文件内容
                const response = await fetch(`/api/webdav/file?path=${encodeURIComponent(filePath)}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
                }

                const text = await response.text();
                setContent(text);
            } catch (err) {
                console.error("Error fetching file content:", err);
                setError(`Error loading file: ${err instanceof Error ? err.message : String(err)}`);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [filePath]);

    return (
        <div className="page-container">
            <Link href="/" className="back-link">
                ← Back to files
            </Link>

            <div className="content-container">
                <h1 className="content-title">{fileName}</h1>

                {loading ? (
                    <div className="py-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-blue-500 border-gray-200"></div>
                        <p className="mt-4">Loading content...</p>
                    </div>
                ) : error ? (
                    <div className="py-8 text-center">
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
                            <p className="font-medium">{error}</p>
                            <div className="mt-2 text-sm">
                                Possible issues:
                                <ul className="list-disc list-inside mt-2">
                                    <li>The file may not exist on the server</li>
                                    <li>WebDAV connection issues</li>
                                    <li>Permission problems accessing the file</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="obsidian-markdown">
                        <MarkdownRenderer content={content || ""} basePath={filePath.substring(0, filePath.lastIndexOf('/'))} />
                    </div>
                )}
            </div>
        </div>
    );
} 