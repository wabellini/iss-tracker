import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const texturesDir = path.resolve(__dirname, '../public/textures');
if (!fs.existsSync(texturesDir)) {
  fs.mkdirSync(texturesDir, { recursive: true });
}

const textures = [
  {
    name: 'earth_day_4096.jpg',
    url: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg'
  },
  {
    name: 'earth_night_4096.jpg',
    url: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_lights_2048.png'
  },
  {
    name: 'earth_specular_2048.jpg',
    url: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg'
  },
  {
    name: 'earth_normal_2048.jpg',
    url: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg'
  },
  {
    name: 'earth_clouds_1024.png',
    url: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png'
  }
];

async function downloadAll() {
  console.log('Downloading NASA textures...');
  for (const item of textures) {
    const dest = path.join(texturesDir, item.name);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 10000) {
      console.log(`Already exists: ${item.name} (${fs.statSync(dest).size} bytes)`);
      continue;
    }
    console.log(`Downloading ${item.name} from ${item.url}...`);
    const res = await fetch(item.url);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${item.url}: ${res.statusText}`);
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(dest, buffer);
    console.log(`Saved ${item.name} (${buffer.length} bytes)`);
  }
  console.log('All textures downloaded successfully!');
}

downloadAll().catch(err => {
  console.error('Error downloading textures:', err);
  process.exit(1);
});
