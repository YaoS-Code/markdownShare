"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface FileItem {
    filename: string;
    basename: string;
    type: string;
    lastmod: string;
    size: number;
}

interface NavItem {
    path: string;
    name: string;
    type: 'file' | 'directory';
    isExpanded?: boolean;
    children?: NavItem[];
}

interface SideNavProps {
    isOpen?: boolean;
    onToggle?: (open: boolean) => void;
}

export default function SideNav({ isOpen: externalIsOpen, onToggle }: SideNavProps) {
    const [isOpenInternal, setIsOpenInternal] = useState(true);
    const [rootItems, setRootItems] = useState<NavItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const pathname = usePathname();

    // Use external state if provided, otherwise use internal state
    const isOpen = externalIsOpen !== undefined ? externalIsOpen : isOpenInternal;

    const handleToggle = () => {
        const newState = !isOpen;
        if (onToggle) {
            onToggle(newState);
        } else {
            setIsOpenInternal(newState);
        }
    };

    // 过滤隐藏文件(以.开头的文件或文件夹)
    const filterHiddenItems = (items: FileItem[]) => {
        return items.filter(item => !item.basename.startsWith('.'));
    };

    useEffect(() => {
        // 获取根目录结构
        const fetchRootStructure = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch('/api/webdav/list?path=/');
                if (!response.ok) {
                    throw new Error('Failed to fetch root directories');
                }
                const data = await response.json();

                // 过滤隐藏文件
                const filteredData = filterHiddenItems(data);

                // 转换API返回数据为导航项
                const navItems: NavItem[] = filteredData.map((item: FileItem) => ({
                    path: item.filename,
                    name: item.basename,
                    type: item.type === 'directory' ? 'directory' : 'file',
                    isExpanded: item.type === 'directory' && item.basename.toLowerCase() === 'obsidian', // 默认展开Obsidian文件夹
                    children: []
                }));

                // 根据类型排序：文件夹优先，然后是文件
                navItems.sort((a: NavItem, b: NavItem) => {
                    if (a.type === b.type) {
                        return a.name.localeCompare(b.name);
                    }
                    return a.type === 'directory' ? -1 : 1;
                });

                setRootItems(navItems);

                // 如果有Obsidian文件夹，自动加载其内容
                const obsidianFolder = navItems.find((f: NavItem) =>
                    f.type === 'directory' && f.name.toLowerCase() === 'obsidian'
                );

                if (obsidianFolder) {
                    fetchFolderContent(obsidianFolder.path);
                }
            } catch (error) {
                console.error('Error fetching root items:', error);
                setError('无法加载文件结构');
            } finally {
                setLoading(false);
            }
        };

        fetchRootStructure();
    }, []);

    const fetchFolderContent = async (folderPath: string) => {
        try {
            setError(null);
            const response = await fetch(`/api/webdav/list?path=${encodeURIComponent(folderPath)}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch folder: ${folderPath}`);
            }
            const data = await response.json();

            // 过滤隐藏文件
            const filteredData = filterHiddenItems(data);

            // 转换所有项目（包括文件和文件夹）
            const items: NavItem[] = filteredData.map((item: FileItem) => ({
                path: item.filename,
                name: item.basename,
                type: item.type === 'directory' ? 'directory' : 'file',
                isExpanded: false,
                children: item.type === 'directory' ? [] : undefined
            }));

            // 排序：文件夹优先，然后是文件
            items.sort((a: NavItem, b: NavItem) => {
                if (a.type === b.type) {
                    return a.name.localeCompare(b.name);
                }
                return a.type === 'directory' ? -1 : 1;
            });

            // 更新状态
            setRootItems(prev => {
                return updateFolderInTree(prev, folderPath, items);
            });
        } catch (error) {
            console.error(`Error fetching folder ${folderPath}:`, error);
            setError(`无法加载文件夹 "${folderPath}"`);
        }
    };

    // 递归更新文件夹树
    const updateFolderInTree = (items: NavItem[], folderPath: string, children: NavItem[]): NavItem[] => {
        return items.map(item => {
            if (item.path === folderPath) {
                return { ...item, children, isExpanded: true };
            } else if (item.children && item.children.length > 0) {
                return {
                    ...item,
                    children: updateFolderInTree(item.children, folderPath, children)
                };
            }
            return item;
        });
    };

    const toggleFolder = (folderPath: string) => {
        setRootItems(prev => {
            const updatedItems = toggleFolderInTree(prev, folderPath);

            // 如果文件夹被展开且没有子项，获取其内容
            const folder = findFolderInTree(updatedItems, folderPath);
            if (folder && folder.isExpanded && folder.type === 'directory' && (!folder.children || folder.children.length === 0)) {
                fetchFolderContent(folderPath);
            }

            return updatedItems;
        });
    };

    // 递归查找文件夹
    const findFolderInTree = (items: NavItem[], folderPath: string): NavItem | null => {
        for (const item of items) {
            if (item.path === folderPath) {
                return item;
            }
            if (item.children && item.children.length > 0) {
                const found = findFolderInTree(item.children, folderPath);
                if (found) return found;
            }
        }
        return null;
    };

    // 递归切换文件夹的展开/折叠状态
    const toggleFolderInTree = (items: NavItem[], folderPath: string): NavItem[] => {
        return items.map(item => {
            if (item.path === folderPath) {
                return { ...item, isExpanded: !item.isExpanded };
            } else if (item.children && item.children.length > 0) {
                return {
                    ...item,
                    children: toggleFolderInTree(item.children, folderPath)
                };
            }
            return item;
        });
    };

    // 获取文件类型图标
    const getFileIcon = (fileName: string) => {
        const extension = fileName.split('.').pop()?.toLowerCase();

        if (extension === 'md') {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <path d="M10 13l1 2 3-4"></path>
                </svg>
            );
        } else if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(extension || '')) {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
            );
        } else if (['pdf'].includes(extension || '')) {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <path d="M9 15h6"></path>
                    <path d="M9 11h6"></path>
                </svg>
            );
        } else {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
            );
        }
    };

    // 递归渲染导航树
    const renderNavItems = (items: NavItem[], level = 0) => {
        return items.map(item => (
            <div key={item.path} className={`nav-item ${item.type} ${level === 0 ? 'root-level' : ''}`}>
                {item.type === 'directory' ? (
                    <>
                        <div
                            className={`nav-folder-title ${pathname.includes(item.path) ? 'active' : ''}`}
                            onClick={() => toggleFolder(item.path)}
                        >
                            <div className="nav-collapse-indicator">
                                <svg className={`chevron-icon ${item.isExpanded ? 'expanded' : ''}`} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </div>
                            <div className="nav-icon folder-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                                </svg>
                            </div>
                            <span className="nav-name">{item.name}</span>
                        </div>
                        {item.isExpanded && item.children && (
                            <div className="nav-children">
                                {renderNavItems(item.children, level + 1)}
                            </div>
                        )}
                    </>
                ) : (
                    <Link
                        href={`/view${item.path}`}
                        className={`nav-file-title ${pathname === `/view${item.path}` ? 'active' : ''}`}
                    >
                        <div className="nav-icon file-icon">
                            {getFileIcon(item.name)}
                        </div>
                        <span className="nav-name">{item.name}</span>
                    </Link>
                )}
            </div>
        ));
    };

    return (
        <aside className={`sidenav ${isOpen ? 'open' : 'closed'}`}>
            <div className="sidenav-container">
                <div className="sidenav-header">
                    {isOpen && <h2 className="sidenav-title">Knowledge Library</h2>}
                    <button
                        onClick={handleToggle}
                        className="sidenav-toggle"
                        aria-label={isOpen ? "收起侧边栏" : "展开侧边栏"}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {isOpen ? (
                                <polyline points="15 18 9 12 15 6"></polyline>
                            ) : (
                                <polyline points="9 18 15 12 9 6"></polyline>
                            )}
                        </svg>
                    </button>
                </div>

                <div className="sidenav-content">
                    {isOpen && (
                        loading ? (
                            <div className="sidenav-loading">
                                <svg className="spinner" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <circle className="spinner-circle" cx="12" cy="12" r="10" fill="none" strokeWidth="3"></circle>
                                </svg>
                                <span>加载中...</span>
                            </div>
                        ) : error ? (
                            <div className="sidenav-error">{error}</div>
                        ) : (
                            <div className="sidenav-tree">
                                {renderNavItems(rootItems)}
                            </div>
                        )
                    )}
                </div>
            </div>
        </aside>
    );
} 