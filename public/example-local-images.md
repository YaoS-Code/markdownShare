# 使用本地图片示例

## 1. 直接使用绝对路径（推荐）

<div style="display:flex;gap:5%">
	<img src="/attachments/image_01.png" alt="image_01" style="width:40%"/>
	<img src="/attachments/image_01.png" alt="image_01" style="width:40%" />
</div>

这是使用绝对路径引用图片的示例，图片位于 `/attachments/` 目录中。

## 2. 使用 API 路由（适用于本地图片）

<div style="display:flex;gap:5%">
	<img src="/api/local/image?path=/attachments/image_01.png" alt="image_01" style="width:40%"/>
	<img src="/api/local/image?path=/attachments/image_01.png" alt="image_01" style="width:40%" />
</div>

这是使用 API 路由引用图片的示例，图片位于 `/attachments/` 目录中。

## 3. 使用 HTML 标签

<div style="display:flex;gap:5%">
	<image src="/attachments/image_01.png" alt="image_01" style="width:40%"/>
	<image src="/attachments/image_01.png" alt="image_01" style="width:40%" />
</div>

注意：在 Markdown 中，推荐使用 `<img>` 标签而不是 `<image>` 标签，因为 `<image>` 不是标准 HTML 标签。

## 图片路径说明

在 Next.js 应用中，静态资源应该放在 `public` 目录下。引用这些资源时，路径应该从网站根目录开始，例如：

- 正确路径：`/attachments/image_01.png`
- 错误路径：`./attachments/image_01.png`

前导斜杠 `/` 很重要，它表示从网站根目录开始的路径。
