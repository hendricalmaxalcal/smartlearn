import sharp from 'sharp'
import { mkdirSync } from 'fs'

mkdirSync('./public/icons', { recursive: true })

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]

for (const size of sizes) {
  await sharp('./public/smartlearn.png')
    .resize(size, size)
    .png()
    .toFile(`./public/icons/icon-${size}x${size}.png`)
  console.log(`✓ Generated ${size}x${size}`)
}

console.log('All icons generated!')