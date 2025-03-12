import { Metadata } from 'next';
import { generateMetadata as baseGenerateMetadata } from '../../metadata';

export async function generateMetadata({ params }: { params: { path: string[] } }): Promise<Metadata> {
    // 需要先await params
    const resolvedParams = await params;

    const pathString = resolvedParams.path.join('/');
    return baseGenerateMetadata({
        title: pathString,
        description: `Viewing ${pathString} - Knowledge Library document`,
        path: `view/${pathString}`
    });
}

export default function ViewLayout({ children }: { children: React.ReactNode }) {
    return children;
} 