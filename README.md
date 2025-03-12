# Markdown Share

一个简洁的 Markdown 文件查看器，支持 WebDAV 协议，可以直接连接到您的 WebDAV 服务器浏览和查看 Markdown 文件。特别适合查看 Obsidian 笔记库中的文件。

## 功能特点

- 支持 WebDAV 协议，可连接任何 WebDAV 服务器
- 支持 Obsidian 格式的 Markdown 文件
- 支持 Obsidian 属性表格显示
- 支持图片显示（包括本地图片和网络图片）
- 支持 Python 代码块交互式运行（内置代码沙箱）
- 响应式设计，适配桌面和移动设备
- 支持深色模式和浅色模式
- Docker 部署支持

## 快速开始

### 使用 Docker 部署

1. 克隆仓库：

```bash
git clone <repository-url>
cd markdownShare
```

2. 编辑`.env`文件，填入您的 WebDAV 服务器信息：

```
# 应用配置
PORT=9527
# CORS配置，多个域名用逗号分隔，使用*允许所有域名
ALLOWED_ORIGINS=*

# WebDAV配置
WEBDAV_URL=https://your-webdav-server.com
WEBDAV_USERNAME=username
WEBDAV_PASSWORD=password
```

3. 构建并启动 Docker 容器：

```bash
docker-compose up -d --build
```

4. 访问应用：

浏览器打开 `http://localhost:9527` 即可访问应用。

### 本地开发

1. 克隆仓库：

```bash
git clone <repository-url>
cd markdownShare
```

2. 安装依赖：

```bash
npm install
```

3. 创建`.env.local`文件并配置 WebDAV 信息：

```
NEXT_PUBLIC_WEBDAV_URL="https://your-webdav-server.com"
NEXT_PUBLIC_WEBDAV_USERNAME="username"
NEXT_PUBLIC_WEBDAV_PASSWORD="password"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
WEBDAV_URL="https://your-webdav-server.com"
WEBDAV_USERNAME="username"
WEBDAV_PASSWORD="password"
OBSIDIAN_PATH="/Obisidian"
```

4. 启动开发服务器：

```bash
npm run dev
```

5. 访问应用：

浏览器打开 `http://localhost:3000` 即可访问应用。

## 项目结构

```
markdownShare/
├── public/                # 静态资源
│   ├── attachments/       # 本地附件目录
│   └── favicon.ico        # 网站图标
├── src/                   # 源代码
│   ├── app/               # Next.js App Router
│   │   ├── api/           # API路由
│   │   │   ├── local/     # 本地文件API
│   │   │   └── webdav/    # WebDAV API
│   │   ├── file/          # 文件查看页面
│   │   └── globals.css    # 全局样式
│   ├── components/        # React组件
│   │   ├── MarkdownRenderer.tsx  # Markdown渲染器
│   │   └── SideNav.tsx    # 侧边导航
│   └── lib/               # 工具库
│       └── webdav.ts      # WebDAV客户端
├── .env.example           # 环境变量示例
├── docker-compose.yml     # Docker配置
└── Dockerfile             # Docker构建文件
```

## 配置说明

### 环境变量

- `PORT`: 应用运行端口（Docker 模式下）
- `ALLOWED_ORIGINS`: CORS 允许的域名，多个域名用逗号分隔，使用`*`允许所有域名
- `WEBDAV_URL`: WebDAV 服务器地址
- `WEBDAV_USERNAME`: WebDAV 用户名
- `WEBDAV_PASSWORD`: WebDAV 密码
- `OBSIDIAN_PATH`: Obsidian 库在 WebDAV 服务器上的路径（可选）

### Docker 配置

项目包含了完整的 Docker 配置，可以通过`docker-compose.yml`文件进行自定义：

```yaml
version: "3"
services:
  markdownshare:
    build: .
    ports:
      - "${PORT:-9527}:3000"
    environment:
      - NODE_ENV=production
      - PORT=${PORT:-9527}
      - ALLOWED_ORIGINS=${ALLOWED_ORIGINS}
      - WEBDAV_URL=${WEBDAV_URL}
      - WEBDAV_USERNAME=${WEBDAV_USERNAME}
      - WEBDAV_PASSWORD=${WEBDAV_PASSWORD}
    restart: unless-stopped
```

## 使用指南

### Python 代码沙箱

Markdown Share 支持在 Markdown 文件中运行 Python 代码块。使用方法：

1. 在 Markdown 文件中创建一个 Python 代码块：

````markdown
​`python
print("Hello, World!")
for i in range(5):
    print(f"Number: {i}")
​`
````

2. 在查看页面中，Python 代码块会显示一个"Run"按钮
3. 点击"Run"按钮执行代码，结果会显示在代码块下方

注意事项：

- 代码执行在服务器端进行，有 5 秒的执行时间限制
- 代码长度限制为 10,000 个字符
- 出于安全考虑，某些系统操作可能被限制

## 常见问题

- **无法连接 WebDAV 服务器**: 确保`.env`或`.env.local`中的凭证正确，并检查服务器是否在线
- **图片无法显示**: 检查图片路径是否正确，WebDAV 服务器是否支持图片文件的访问
- **Markdown 格式问题**: 本应用支持标准 Markdown 和部分 Obsidian 特性，如果有格式问题，请检查您的 Markdown 文件

## 许可证

MIT
