const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const APP_DIR = path.join(__dirname, '..', 'app');

// ─── 1. Crear Favicon SVG con la identidad oficial de The Palace Company ─────
// Fondo Océano (#1B365D), aro bronce (#B88F69), y el monograma TPC
const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0E2338"/>
      <stop offset="50%" stop-color="#1B365D"/>
      <stop offset="100%" stop-color="#254D6E"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D4AF37"/>
      <stop offset="50%" stop-color="#B88F69"/>
      <stop offset="100%" stop-color="#8C6642"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Base circular océano -->
  <circle cx="256" cy="256" r="246" fill="url(#oceanGrad)"/>
  
  <!-- Anillo exterior dorado/bronce con sombra -->
  <circle cx="256" cy="256" r="236" fill="none" stroke="url(#goldGrad)" stroke-width="8" filter="url(#glow)"/>
  <circle cx="256" cy="256" r="222" fill="none" stroke="url(#goldGrad)" stroke-width="2" stroke-opacity="0.6"/>

  <!-- Monograma estilizado The Palace Company (TPC) -->
  <g id="monogram" transform="matrix(0.92 0 0 0.92 256 252)" text-anchor="middle">
    <!-- Diamantes decorativos institucionales -->
    <rect x="-6" y="-176" width="12" height="12" fill="#D4AF37" transform="rotate(45 0 -170)"/>
    <rect x="-6" y="158" width="12" height="12" fill="#D4AF37" transform="rotate(45 0 164)"/>

    <!-- TPC Letras ceremoniales entrelazadas -->
    <text x="0" y="58" 
          font-family="'Freight Text', 'Georgia', 'Times New Roman', serif" 
          font-size="190" 
          font-weight="bold" 
          letter-spacing="-6"
          fill="#FAF6F0" 
          filter="url(#glow)">TPC</text>
    
    <!-- Texto inferior de corona ceremonial -->
    <text x="0" y="118" 
          font-family="'Freight Sans Pro', 'Helvetica Neue', 'Arial', sans-serif" 
          font-size="28" 
          font-weight="600" 
          letter-spacing="10" 
          fill="#D4AF37">EST. 1984</text>
  </g>
</svg>`;

// ─── 2. Crear Link Preview Open Graph (1200 x 630) ───────────────────────────
const OG_IMAGE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#091827"/>
      <stop offset="45%" stop-color="#122A44"/>
      <stop offset="85%" stop-color="#1B365D"/>
      <stop offset="100%" stop-color="#254D6E"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EED59B"/>
      <stop offset="50%" stop-color="#C5A070"/>
      <stop offset="100%" stop-color="#9C774C"/>
    </linearGradient>
    <linearGradient id="goldSoft" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#C5A070" stop-opacity="0.8"/>
      <stop offset="50%" stop-color="#EED59B" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#C5A070" stop-opacity="0.8"/>
    </linearGradient>
    <filter id="shadowHeavy" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
    <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000000" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Fondo Institucional Océano Profundo -->
  <rect width="1200" height="630" fill="url(#bgGrad)"/>

  <!-- Trama geométrica sutil -->
  <g opacity="0.035" stroke="#FFFFFF" stroke-width="1">
    <line x1="0" y1="0" x2="1200" y2="630"/>
    <line x1="1200" y1="0" x2="0" y2="630"/>
    <line x1="0" y1="150" x2="1200" y2="150"/>
    <line x1="0" y1="480" x2="1200" y2="480"/>
    <line x1="300" y1="0" x2="300" y2="630"/>
    <line x1="900" y1="0" x2="900" y2="630"/>
    <circle cx="600" cy="315" r="280" fill="none"/>
    <circle cx="600" cy="315" r="420" fill="none"/>
  </g>

  <!-- Marco Perimetral de Gala (Doble filete bronce) -->
  <rect x="36" y="36" width="1128" height="558" fill="none" stroke="url(#gold)" stroke-width="2" opacity="0.85"/>
  <rect x="46" y="46" width="1108" height="538" fill="none" stroke="url(#gold)" stroke-width="1" opacity="0.35"/>

  <!-- Diamantes en esquinas de gala -->
  <g fill="#D4AF37">
    <rect x="31" y="31" width="10" height="10" transform="rotate(45 36 36)"/>
    <rect x="1159" y="31" width="10" height="10" transform="rotate(45 1164 36)"/>
    <rect x="31" y="589" width="10" height="10" transform="rotate(45 36 594)"/>
    <rect x="1159" y="589" width="10" height="10" transform="rotate(45 1164 594)"/>
  </g>

  <!-- Sello de agua monumental tenue a la derecha -->
  <g transform="translate(940, 315)" opacity="0.07">
    <circle cx="0" cy="0" r="240" fill="none" stroke="#FFFFFF" stroke-width="4"/>
    <circle cx="0" cy="0" r="215" fill="none" stroke="#FFFFFF" stroke-width="1.5"/>
    <text x="0" y="45" font-family="'Freight Text', serif" font-size="180" font-weight="bold" fill="#FFFFFF" text-anchor="middle">TPC</text>
  </g>

  <!-- ═══ CONTENIDO EDITORIAL CENTRAL ═══ -->
  <g transform="translate(80, 0)">
    <!-- 1. Encabezado de Marca -->
    <g transform="translate(0, 105)">
      <!-- Pastilla / Badge Convocatoria -->
      <rect x="0" y="0" width="370" height="34" rx="17" fill="#C5A070" fill-opacity="0.18" stroke="#C5A070" stroke-width="1"/>
      <circle cx="18" cy="17" r="4.5" fill="#EED59B"/>
      <text x="32" y="22" 
            font-family="'Freight Sans Pro', sans-serif" 
            font-size="12" 
            font-weight="bold" 
            letter-spacing="3" 
            fill="#EED59B">THE PALACE COMPANY · CONVOCATORIA OFICIAL</text>
    </g>

    <!-- 2. Título Principal Monumental -->
    <g transform="translate(0, 205)">
      <text x="0" y="0" 
            font-family="'Freight Text', 'Georgia', serif" 
            font-size="64" 
            font-weight="300" 
            letter-spacing="0.5" 
            fill="#FAF6F0"
            filter="url(#shadowHeavy)">Monedas · Momentos de Color</text>
      
      <!-- Filete de acento degradado -->
      <line x1="0" y1="26" x2="680" y2="26" stroke="url(#goldSoft)" stroke-width="2"/>
    </g>

    <!-- 3. Subtítulo Institucional -->
    <g transform="translate(0, 280)">
      <text x="0" y="0" 
            font-family="'Freight Sans Pro', sans-serif" 
            font-size="21" 
            font-weight="400" 
            letter-spacing="0.5" 
            fill="#CBD5E1">Programa Institucional de Reconocimiento al Talento Humano</text>
      <text x="0" y="32" 
            font-family="'Freight Sans Pro', sans-serif" 
            font-size="16" 
            font-weight="500" 
            letter-spacing="1.5" 
            fill="#94A3B8">DIRECCIÓN CORPORATIVA DE DISEÑO Y EXPERIENCIA</text>
    </g>

    <!-- 4. Cuarteto de Monedas (Las 4 Insignias Oficiales Borda) -->
    <g transform="translate(0, 370)">
      <!-- Tarjeta 🥇 4 Pts -->
      <g transform="translate(0, 0)" filter="url(#cardShadow)">
        <rect width="180" height="74" rx="14" fill="#142B43" stroke="#D4AF37" stroke-width="1.5"/>
        <text x="20" y="38" font-size="24">🥇</text>
        <text x="56" y="35" font-family="'Freight Sans Pro', sans-serif" font-size="18" font-weight="bold" fill="#FAF6F0">4 PUNTOS</text>
        <text x="56" y="55" font-family="'Freight Sans Pro', sans-serif" font-size="11" font-weight="600" letter-spacing="1.5" fill="#D4AF37">ORO · 1ª MONEDA</text>
      </g>

      <!-- Tarjeta 🥈 3 Pts -->
      <g transform="translate(195, 0)" filter="url(#cardShadow)">
        <rect width="180" height="74" rx="14" fill="#142B43" stroke="#94A3B8" stroke-width="1.2"/>
        <text x="20" y="38" font-size="24">🥈</text>
        <text x="56" y="35" font-family="'Freight Sans Pro', sans-serif" font-size="18" font-weight="bold" fill="#FAF6F0">3 PUNTOS</text>
        <text x="56" y="55" font-family="'Freight Sans Pro', sans-serif" font-size="11" font-weight="600" letter-spacing="1.5" fill="#94A3B8">PLATA · 2ª MONEDA</text>
      </g>

      <!-- Tarjeta 🥉 2 Pts -->
      <g transform="translate(390, 0)" filter="url(#cardShadow)">
        <rect width="180" height="74" rx="14" fill="#142B43" stroke="#C5A070" stroke-width="1.2"/>
        <text x="20" y="38" font-size="24">🥉</text>
        <text x="56" y="35" font-family="'Freight Sans Pro', sans-serif" font-size="18" font-weight="bold" fill="#FAF6F0">2 PUNTOS</text>
        <text x="56" y="55" font-family="'Freight Sans Pro', sans-serif" font-size="11" font-weight="600" letter-spacing="1.5" fill="#C5A070">BRONCE · 3ª MONEDA</text>
      </g>

      <!-- Tarjeta 🎖️ 1 Pt -->
      <g transform="translate(585, 0)" filter="url(#cardShadow)">
        <rect width="180" height="74" rx="14" fill="#142B43" stroke="#64748B" stroke-width="1.2"/>
        <text x="20" y="38" font-size="24">🎖️</text>
        <text x="56" y="35" font-family="'Freight Sans Pro', sans-serif" font-size="18" font-weight="bold" fill="#FAF6F0">1 PUNTO</text>
        <text x="56" y="55" font-family="'Freight Sans Pro', sans-serif" font-size="11" font-weight="600" letter-spacing="1.5" fill="#94A3B8">HONOR · 4ª MONEDA</text>
      </g>
    </g>

    <!-- 5. Footer con Características Clave -->
    <g transform="translate(0, 520)">
      <text x="0" y="0" 
            font-family="'Freight Sans Pro', sans-serif" 
            font-size="13" 
            font-weight="600" 
            letter-spacing="2.5" 
            fill="#C5A070">VOTACIÓN PLENARIA · AUDITORÍA CON ÁRBITRO IA · DIPLOMAS OFICIALES</text>
      <text x="960" y="0" 
            font-family="'Freight Sans Pro', sans-serif" 
            font-size="13" 
            font-weight="600" 
            letter-spacing="1" 
            fill="#64748B" 
            text-anchor="end">THE PALACE COMPANY © 2026</text>
    </g>
  </g>
</svg>`;

// ─── 3. Función auxiliar para empaquetar ICO binario ──────────────────────────
function createIco(pngBuffers) {
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  let offset = 6 + (16 * count);
  const entries = [];
  const imageBuffers = [];

  for (const item of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(item.width === 256 ? 0 : item.width, 0);
    entry.writeUInt8(item.height === 256 ? 0 : item.height, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(item.buffer.length, 8);
    entry.writeUInt32LE(offset, 12);

    entries.push(entry);
    imageBuffers.push(item.buffer);
    offset += item.buffer.length;
  }

  return Buffer.concat([header, ...entries, ...imageBuffers]);
}

// ─── 4. Generación Principal ──────────────────────────────────────────────────
async function main() {
  console.log('🚀 Iniciando generación de Favicon y Link Preview oficial...');

  // 1. Guardar favicon.svg
  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.svg'), FAVICON_SVG);
  console.log('✓ Creado: public/favicon.svg');

  // 2. Generar PNGs desde el Favicon SVG
  const svgBuffer = Buffer.from(FAVICON_SVG);

  const png16 = await sharp(svgBuffer).resize(16, 16).png().toBuffer();
  const png32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  const png48 = await sharp(svgBuffer).resize(48, 48).png().toBuffer();
  const png96 = await sharp(svgBuffer).resize(96, 96).png().toBuffer();
  const png180 = await sharp(svgBuffer).resize(180, 180).png().toBuffer();
  const png192 = await sharp(svgBuffer).resize(192, 192).png().toBuffer();
  const png512 = await sharp(svgBuffer).resize(512, 512).png().toBuffer();

  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon-96x96.png'), png96);
  console.log('✓ Creado: public/favicon-96x96.png');

  fs.writeFileSync(path.join(PUBLIC_DIR, 'apple-touch-icon.png'), png180);
  console.log('✓ Creado: public/apple-touch-icon.png (180x180)');

  fs.writeFileSync(path.join(PUBLIC_DIR, 'web-app-manifest-192x192.png'), png192);
  console.log('✓ Creado: public/web-app-manifest-192x192.png');

  fs.writeFileSync(path.join(PUBLIC_DIR, 'web-app-manifest-512x512.png'), png512);
  console.log('✓ Creado: public/web-app-manifest-512x512.png');

  // 3. Crear favicon.ico multi-resolución (16, 32, 48)
  const icoBuffer = createIco([
    { width: 16, height: 16, buffer: png16 },
    { width: 32, height: 32, buffer: png32 },
    { width: 48, height: 48, buffer: png48 }
  ]);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.ico'), icoBuffer);
  // También en app/favicon.ico para Next.js App Router
  fs.writeFileSync(path.join(APP_DIR, 'favicon.ico'), icoBuffer);
  console.log('✓ Creado: public/favicon.ico y app/favicon.ico (16, 32, 48px)');

  // 4. Crear site.webmanifest
  const webManifest = {
    name: "Monedas · Momentos de Color",
    short_name: "Momentos de Color",
    description: "Programa Institucional de Reconocimiento al Talento Humano — The Palace Company",
    start_url: "/",
    display: "standalone",
    background_color: "#1B365D",
    theme_color: "#1B365D",
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  };
  fs.writeFileSync(path.join(PUBLIC_DIR, 'site.webmanifest'), JSON.stringify(webManifest, null, 2));
  console.log('✓ Creado: public/site.webmanifest');

  // 5. Generar Imagen de Open Graph / Link Preview (1200x630)
  const ogSvgBuffer = Buffer.from(OG_IMAGE_SVG);
  const ogPngBuffer = await sharp(ogSvgBuffer).resize(1200, 630).png({ quality: 95 }).toBuffer();

  fs.writeFileSync(path.join(PUBLIC_DIR, 'og-image.png'), ogPngBuffer);
  fs.writeFileSync(path.join(APP_DIR, 'opengraph-image.png'), ogPngBuffer);
  fs.writeFileSync(path.join(APP_DIR, 'twitter-image.png'), ogPngBuffer);
  console.log('✓ Creado: public/og-image.png, app/opengraph-image.png, app/twitter-image.png (1200x630)');

  console.log('🎉 ¡Todos los activos de branding fueron generados con éxito!');
}

main().catch(err => {
  console.error('Error al generar activos:', err);
  process.exit(1);
});
