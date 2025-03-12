import { Metadata } from 'next';
import { defaultMetadata } from './metadata';

export const metadata: Metadata = defaultMetadata;

export default function HomePage() {
  return (
    <div className="homepage-container">
      <div className="homepage-content">
        <h1 className="homepage-title">欢迎使用 Markdown 知识库</h1>

        <div className="homepage-section">
          <h2>关于本应用</h2>
          <p>
            这是一个基于WebDAV的Markdown文档查看器，专为查看和分享知识库内容而设计。
            您可以通过左侧导航栏浏览文件结构，点击文件夹展开内容，点击文件查看内容。
          </p>
        </div>

        <div className="homepage-section">
          <h2>使用指南</h2>
          <ul className="homepage-list">
            <li>
              <strong>浏览文件：</strong> 点击左侧导航栏中的文件夹可以展开/折叠文件夹内容
            </li>
            <li>
              <strong>查看文档：</strong> 点击文件名可以在此区域查看文档内容
            </li>
            <li>
              <strong>导航栏：</strong> 可以通过左上角的按钮展开/折叠导航栏
            </li>
          </ul>
        </div>

        <div className="homepage-section">
          <h2>快速入门</h2>
          <p>
            从左侧导航栏选择一个文件夹，例如 &ldquo;Obsidian&rdquo;，然后浏览其中的文档。
            点击任何Markdown文件(.md)即可查看其内容。
          </p>
        </div>

        <div className="homepage-footer">
          <p>© {new Date().getFullYear()} Markdown知识库 - 轻松分享您的知识</p>
        </div>
      </div>
    </div>
  );
}
