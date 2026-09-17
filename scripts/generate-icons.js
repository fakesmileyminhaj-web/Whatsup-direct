import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const ROOT_DIR = process.cwd();
const RES_DIR = path.join(ROOT_DIR, 'android/app/src/main/res');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

// Android mipmap launcher icon sizes
const SIZES = [
  { folder: 'mipmap-mdpi', iconSize: 48, foregroundSize: 108 },
  { folder: 'mipmap-hdpi', iconSize: 72, foregroundSize: 162 },
  { folder: 'mipmap-xhdpi', iconSize: 96, foregroundSize: 216 },
  { folder: 'mipmap-xxhdpi', iconSize: 144, foregroundSize: 324 },
  { folder: 'mipmap-xxxhdpi', iconSize: 192, foregroundSize: 432 },
];

async function main() {
  console.log('--- WhatsApp Direct Icon & Header Asset Pipeline ---');

  // Check possible locations for wpdirect.png and wpheader.png
  let wpdirectSource = [
    path.join(ROOT_DIR, 'wpdirect.png'),
    path.join(PUBLIC_DIR, 'wpdirect.png'),
    path.join(ROOT_DIR, 'src/assets/wpdirect.png'),
  ].find((p) => fs.existsSync(p));

  let wpheaderSource = [
    path.join(ROOT_DIR, 'wpheader.png'),
    path.join(PUBLIC_DIR, 'wpheader.png'),
    path.join(ROOT_DIR, 'src/assets/wpheader.png'),
  ].find((p) => fs.existsSync(p));

  // If wpdirect.png not yet provided, create a high-res SVG-based PNG
  if (!wpdirectSource) {
    console.log('Creating initial high-res wpdirect.png asset...');
    const svgContent = fs.readFileSync(path.join(PUBLIC_DIR, 'icon.svg'));
    const generatedDirectPath = path.join(PUBLIC_DIR, 'wpdirect.png');
    await sharp(svgContent).resize(512, 512).png().toFile(generatedDirectPath);
    wpdirectSource = generatedDirectPath;
  } else {
    // Ensure public/wpdirect.png is synced
    const target = path.join(PUBLIC_DIR, 'wpdirect.png');
    if (wpdirectSource !== target) {
      fs.copyFileSync(wpdirectSource, target);
      console.log(`Copied ${wpdirectSource} to ${target}`);
    }
  }

  // If wpheader.png not yet provided, create a high-res SVG-based header logo
  if (!wpheaderSource) {
    console.log('Creating initial high-res wpheader.png asset...');
    const svgContent = fs.readFileSync(path.join(PUBLIC_DIR, 'icon.svg'));
    const generatedHeaderPath = path.join(PUBLIC_DIR, 'wpheader.png');
    await sharp(svgContent).resize(192, 192).png().toFile(generatedHeaderPath);
    wpheaderSource = generatedHeaderPath;
  } else {
    const target = path.join(PUBLIC_DIR, 'wpheader.png');
    if (wpheaderSource !== target) {
      fs.copyFileSync(wpheaderSource, target);
      console.log(`Copied ${wpheaderSource} to ${target}`);
    }
  }

  // Generate all Android launcher icon mipmaps from wpdirectSource
  console.log(`Generating Android launcher icons from: ${wpdirectSource}`);
  for (const { folder, iconSize, foregroundSize } of SIZES) {
    const folderPath = path.join(RES_DIR, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // 1. Standard square launcher icon
    await sharp(wpdirectSource)
      .resize(iconSize, iconSize)
      .png()
      .toFile(path.join(folderPath, 'ic_launcher.png'));

    // 2. Round launcher icon
    await sharp(wpdirectSource)
      .resize(iconSize, iconSize)
      .png()
      .toFile(path.join(folderPath, 'ic_launcher_round.png'));

    // 3. Adaptive foreground launcher icon (centered with standard padding)
    const innerSize = Math.round(foregroundSize * 0.72);
    const resizedInner = await sharp(wpdirectSource)
      .resize(innerSize, innerSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    await sharp({
      create: {
        width: foregroundSize,
        height: foregroundSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([{ input: resizedInner, gravity: 'center' }])
      .png()
      .toFile(path.join(folderPath, 'ic_launcher_foreground.png'));
  }

  console.log('✓ Successfully generated all Android launcher icons and header assets.');
}

main().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
