"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface FileItem {
    filename: string;
    basename: string;
    type: string;
    lastmod: string;
    size: number;
}

export default function FileBrowser() {
    // Start with root path
    const [files, setFiles] = useState<FileItem[]>([]);
    const [currentPath, setCurrentPath] = useState('/');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                console.log('Fetching files for path:', currentPath);
                const response = await fetch(`/api/webdav/list?path=${encodeURIComponent(currentPath)}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch directory contents');
                }

                console.log('Files fetched successfully:', data);
                // 直接在设置文件列表前过滤隐藏文件和attachments文件夹
                setFiles(filterFiles(data));
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to fetch files';
                setError(errorMessage);
                console.error('Error fetching files:', err);
            }
        };

        fetchFiles();
    }, [currentPath]);

    const navigateToFolder = (path: string) => {
        console.log('Navigating to folder:', path);
        setCurrentPath(path);
    };

    // 过滤隐藏文件和attachments文件夹
    const filterFiles = (files: FileItem[]) => {
        return files.filter(file => {
            // 过滤掉以.开头的隐藏文件
            if (file.basename.startsWith('.')) {
                return false;
            }

            // 过滤掉attachments文件夹
            if (file.type === 'directory' && file.basename.toLowerCase() === 'attachments') {
                return false;
            }

            return true;
        });
    };

    if (error) {
        return (
            <div className="p-4">
                <div className="text-red-500 mb-4">Error: {error}</div>
                <button
                    onClick={() => {
                        setError(null);
                        setCurrentPath('/');
                    }}
                    className="text-blue-500 hover:text-blue-700"
                >
                    Try Again
                </button>
            </div>
        );
    }

    const pathSegments = currentPath.split('/').filter(Boolean);

    return (
        <div className="p-4">
            <div className="mb-4 flex justify-between items-center">
                <div>
                    <button
                        onClick={() => navigateToFolder('/')}
                        className="text-blue-500 hover:text-blue-700"
                    >
                        Root
                    </button>
                    {pathSegments.map((segment, index, array) => {
                        const fullPath = '/' + array.slice(0, index + 1).join('/');
                        return (
                            <span key={index}>
                                {' / '}
                                <button
                                    onClick={() => navigateToFolder(fullPath)}
                                    className="text-blue-500 hover:text-blue-700"
                                >
                                    {segment}
                                </button>
                            </span>
                        );
                    })}
                </div>
            </div>

            <div className="grid gap-2">
                {files.map((file) => {
                    return (
                        <div
                            key={file.filename}
                            className="p-2 border rounded hover:bg-gray-50 flex items-center"
                        >
                            {file.type === 'directory' ? (
                                <button
                                    onClick={() => navigateToFolder(file.filename)}
                                    className="flex items-center space-x-2"
                                >
                                    <span>📁</span>
                                    <span>{file.basename}</span>
                                </button>
                            ) : (
                                <Link
                                    href={`/view${file.filename}`}
                                    className="flex items-center space-x-2"
                                >
                                    <span>📄</span>
                                    <span>{file.basename}</span>
                                </Link>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
} 