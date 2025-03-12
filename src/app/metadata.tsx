import type { Metadata } from 'next';

export const siteConfig = {
    name: 'Knowledge Library',
    description: 'Educational resource and knowledge sharing platform',
    keywords: [
        'education',
        'knowledge',
        'markdown',
        'obsidian',
        'document',
        'webdav',
        'learning'
    ],
    authors: [
        {
            name: 'Knowledge Library Team',
            url: 'https://github.com/yourusername/markdownshare',
        },
    ],
};

export const defaultMetadata: Metadata = {
    title: {
        default: siteConfig.name,
        template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: siteConfig.keywords,
    authors: siteConfig.authors,
    creator: 'Knowledge Library Team',
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#ffffff' },
        { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
    ],
    icons: {
        icon: '/favicon.ico',
    },
};

// 通用元数据生成函数，可以在服务器组件中使用
export function generateMetadata({
    title,
    description,
    path
}: {
    title?: string,
    description?: string,
    path?: string
}): Metadata {
    return {
        ...defaultMetadata,
        title: title || defaultMetadata.title,
        description: description || defaultMetadata.description,
        openGraph: {
            title: title || siteConfig.name,
            description: description || siteConfig.description,
            type: 'website',
            url: path ? `/${path}` : '/',
            siteName: siteConfig.name,
        },
        twitter: {
            card: 'summary_large_image',
            title: title || siteConfig.name,
            description: description || siteConfig.description,
        },
    };
} 