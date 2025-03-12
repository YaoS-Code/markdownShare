# 修复图片显示问题

## 问题描述

在 Markdown 文件中，使用以下代码时图片无法正确显示：

```markdown
<div style="display:flex;gap:5%">
	<image src="./attachments/image_01.png" alt="image_01" style="width:40%"/>
	<image src="./attachments/image_01.png" alt="image_01" style="width:40%" />
</div>
```

## 解决方案

### 1. 使用正确的 HTML 标签

将 `<image>` 标签替换为标准的 `<img>` 标签：

```markdown
<div style="display:flex;gap:5%">
	<img src="./attachments/image_01.png" alt="image_01" style="width:40%"/>
	<img src="./attachments/image_01.png" alt="image_01" style="width:40%" />
</div>
```

### 2. 保持相对路径（WebDAV 环境）

在 WebDAV 环境中，图片通常存储在与 Markdown 文件相同目录下的`attachments`文件夹中。在这种情况下，应该使用相对路径：

```markdown
<div style="display:flex;gap:5%">
	<img src="./attachments/image_01.png" alt="image_01" style="width:40%"/>
	<img src="./attachments/image_01.png" alt="image_01" style="width:40%" />
</div>
```

或者使用标准的 Markdown 图片语法：

```markdown
![image_01](./attachments/image_01.png)
```

我们的应用程序会自动处理这些相对路径，并将它们转换为正确的 WebDAV 图片 URL。

### 3. 实际效果

下面是修复后的图片显示效果：

<div style="display:flex;gap:5%">
	<img src="./attachments/image_01.png" alt="image_01" style="width:40%"/>
	<img src="./attachments/image_01.png" alt="image_01" style="width:40%" />
</div>

## 总结

1. 使用 `<img>` 标签而不是 `<image>` 标签（HTML 兼容性）
2. 在 WebDAV 环境中，保持相对路径（`./attachments/image_01.png`）
3. 也可以使用标准 Markdown 图片语法：`![alt](./attachments/image_01.png)`
4. 我们的应用会自动处理相对路径并转换为正确的 WebDAV 图片 URL
