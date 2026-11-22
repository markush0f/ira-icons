import sharp from "sharp";

// Only use repository SVGs or SVGs emitted by the local compiler, never raw model markup.
export async function renderIconPreview(svg) {
  const png = await sharp(Buffer.from(svg), { density: 384 })
    .flatten({ background: "#ffffff" })
    .png()
    .toBuffer();
  return { inlineData: { mimeType: "image/png", data: png.toString("base64") } };
}
