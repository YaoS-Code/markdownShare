# Markdown 知识库

这是一个基于 WebDAV 的 Markdown 文档查看器，专为查看和分享知识库内容而设计。

## 功能特点

- 浏览 WebDAV 服务器上的文件和文件夹
- 查看 Markdown 文件内容，支持 Markdown 格式化
- 响应式设计，适配各种设备
- 支持暗色模式
- 简洁直观的用户界面

## Docker 部署

### 前提条件

- Docker 和 Docker Compose 已安装
- 有可访问的 WebDAV 服务器

### 部署步骤

1. 克隆仓库：

```bash
git clone <repository-url>
cd markdownshare
```

2. 创建环境变量文件：

```bash
cp .env.example .env
```

3. 编辑`.env`文件，填入您的 WebDAV 服务器信息：

```
# 应用配置（可选）
PORT=9527  # 可以修改为任何未被占用的端口
# CORS配置，多个域名用逗号分隔，使用*允许所有域名
ALLOWED_ORIGINS=*  # 生产环境建议设置为特定域名

# WebDAV配置（必填）
WEBDAV_URL=https://your-webdav-server.com
WEBDAV_USERNAME=your_username
WEBDAV_PASSWORD=your_password
```

4. 构建并启动 Docker 容器：

```bash
docker-compose up -d
```

5. 访问应用：

打开浏览器，访问 `http://your-server-ip:9527`

### 更新应用

```bash
git pull
docker-compose down
docker-compose up -d --build
```

## 手动部署

如果您想手动部署而不使用 Docker：

1. 确保 Node.js 18 或更高版本已安装

2. 安装依赖：

```bash
npm install
```

3. 创建`.env.local`文件并配置 WebDAV 信息：

```
WEBDAV_URL=https://your-webdav-server.com
WEBDAV_USERNAME=your_username
WEBDAV_PASSWORD=your_password
```

4. 构建应用：

```bash
npm run build
```

5. 启动应用：

```bash
npm start
```

## 使用说明

- 左侧导航栏显示文件和文件夹结构
- 点击文件夹可以展开/折叠文件夹内容
- 点击文件可以查看文件内容
- 可以通过左上角的按钮展开/折叠导航栏

## 技术栈

- Next.js
- React
- TypeScript
- WebDAV 客户端
- Tailwind CSS

## 主要特点

- **现代化界面**: 提供专业的教育主题设计，支持亮色/暗色模式
- **侧边导航栏**: 直接在侧边栏展示完整的文件和文件夹结构，便于浏览
- **Markdown 渲染**: 支持 Obsidian 特定的 Markdown 语法，包括图片、链接和嵌入内容
- **WebDAV 集成**: 直接连接到 WebDAV 服务器，无需额外配置
- **响应式设计**: 在不同设备上提供良好的用户体验
- **教育目的优化**: 为教学资料、教育文档展示和知识共享优化

## 环境要求

- Node.js 18+
- 一个 WebDAV 服务器（如 Obsidian Sync、NextCloud 等）

## 配置说明

1. 复制`.env.example`到`.env.local`并设置以下变量：

```bash
WEBDAV_URL=https://your-webdav-server.com
WEBDAV_USERNAME=your_username
WEBDAV_PASSWORD=your_password
```

2. 确保 WebDAV 服务器已启用并可访问

## 开发指南

### 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 启动开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建应用

```bash
npm run build
# 或
yarn build
# 或
pnpm build
```

### 启动生产服务器

```bash
npm start
# 或
yarn start
# 或
pnpm start
```

## 文件结构

```
/
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── api/           # API路由
│   │   │   └── webdav/    # WebDAV相关API
│   │   ├── view/          # 文件查看页面
│   │   └── page.tsx       # 主页
│   ├── components/        # 可复用组件
│   │   ├── FileBrowser.tsx     # 文件浏览器组件
│   │   ├── MarkdownRenderer.tsx # Markdown渲染器
│   │   └── SideNav.tsx          # 侧边导航栏
│   └── lib/               # 实用工具和库
├── public/                # 静态资源
└── ...配置文件
```

## 自定义主题

应用使用 CSS 变量进行主题定制，可在`src/app/globals.css`中找到并根据需要调整。主要变量包括：

- `--sidenav-bg`：侧边栏背景色
- `--sidenav-text`：侧边栏文本颜色
- `--content-bg`：内容区背景色
- `--content-text`：内容区文本颜色
- 等等

## 常见问题

- **无法连接 WebDAV 服务器**: 确保.env.local 中的凭证正确，并检查服务器是否在线
- **Markdown 渲染不正确**: 检查 Markdown 语法，注意 Obsidian 特定语法在处理时可能有差异
- **API 错误**: 查看服务器日志，检查 WebDAV 路径和权限设置

## 许可

MIT
