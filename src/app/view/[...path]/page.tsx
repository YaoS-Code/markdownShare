import MarkdownViewerClient from "../../../components/MarkdownViewerClient";

// 服务器组件 - 处理参数并传递给客户端组件
export default async function ViewPage({ params }: { params: { path: string[] } }) {
    // 需要先await params
    const resolvedParams = await params;

    // 构建文件路径
    const filePath = "/" + resolvedParams.path.map(segment => decodeURIComponent(String(segment))).join("/");

    return <MarkdownViewerClient filePath={filePath} />;
} 