# 1. Create a virtual provider

<div style="display:flex;gap:5%">
	<img src="/attachments/image_01.png" alt="image_01" style="width:40%"/>
	<img src="/attachments/image_01.png" alt="image_01" style="width:40%" />
</div>

This is an example of the images, they are located at `/attachments/` in the public directory.

## How to reference images in Markdown

When using Next.js, all static assets should be placed in the `public` directory.
Images in the `public/attachments` directory can be referenced with paths starting with `/attachments/`.

For example:

- Correct path: `/attachments/image_01.png`
- Incorrect path: `./attachments/image_01.png`

The leading slash `/` is important as it references the root of your website.

## Important Notes

1. Use `<img>` tag instead of `<image>` tag for HTML compatibility
2. Always use absolute paths starting with `/` for images in the public directory
3. Make sure the image file exists in the specified location
4. For SVG images, you may need to add `.svg` extension explicitly
