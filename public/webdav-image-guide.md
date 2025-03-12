# WebDAV 环境中的图片处理指南

## 图片存储位置

在使用 Obsidian 等知识管理工具时，图片通常存储在以下位置：

1. **同级 attachments 文件夹**：与 Markdown 文件位于同一目录下的`attachments`文件夹
2. **全局 attachments 文件夹**：知识库根目录下的`attachments`文件夹
3. **嵌入式图片**：直接嵌入在 Markdown 文件中的 Base64 编码图片

## 图片引用方式

### 1. 标准 Markdown 语法（推荐）

```markdown
![图片描述](./attachments/image.png)
```

这是最常用的方式，我们的应用会自动处理这种语法，并将相对路径转换为正确的 WebDAV 图片 URL。

### 2. HTML 标签方式

```markdown
<img src="./attachments/image.png" alt="图片描述" />
```

注意：

- 使用`<img>`标签而不是`<image>`标签
- 保持相对路径，不要修改为绝对路径

### 3. 多图片并排显示

```markdown
<div style="display:flex;gap:5%">
    <img src="./attachments/image1.png" alt="图片1" style="width:48%" />
    <img src="./attachments/image2.png" alt="图片2" style="width:48%" />
</div>
```

## 路径处理说明

我们的应用会自动处理以下类型的图片路径：

1. **相对路径**：`./attachments/image.png`或`attachments/image.png`

   - 这些路径会相对于当前 Markdown 文件的位置解析

2. **上级目录路径**：`../images/image.png`

   - 这些路径会相对于当前 Markdown 文件的位置解析

3. **绝对路径**：`/attachments/image.png`

   - 这些路径会相对于 WebDAV 根目录解析

4. **网络图片**：`https://example.com/image.png`
   - 这些 URL 会直接使用，不会经过 WebDAV 处理

## 常见问题解决

### 图片不显示

如果图片不显示，请检查：

1. 图片文件是否存在于正确的位置
2. 图片路径是否正确（注意大小写）
3. 图片格式是否受支持（PNG、JPG、JPEG、GIF、SVG、WEBP）

### 路径错误

常见的路径错误包括：

1. 使用错误的斜杠方向（Windows 风格的`\`而不是`/`）
2. 路径大小写不匹配（WebDAV 通常区分大小写）
3. 路径中包含特殊字符或空格（应该使用 URL 编码）

### 最佳实践

1. 使用标准 Markdown 语法引用图片
2. 保持图片文件名简单，避免特殊字符和空格
3. 将所有图片存放在`attachments`文件夹中
4. 使用相对路径引用图片

## 示例

### 正确示例

```markdown
![我的图片](./attachments/my-image.png)

<img src="./attachments/my-image.png" alt="我的图片" />

<div style="display:flex;gap:5%">
    <img src="./attachments/image1.png" alt="图片1" style="width:48%" />
    <img src="./attachments/image2.png" alt="图片2" style="width:48%" />
</div>
```

### 错误示例

```markdown
![我的图片](attachments\my-image.png) <!-- 错误：使用了反斜杠 -->

<image src="./attachments/my-image.png" alt="我的图片" /> <!-- 错误：使用了<image>标签 -->

<img src="/attachments/my-image.png" alt="我的图片" /> <!-- 可能错误：使用了绝对路径 -->
```
