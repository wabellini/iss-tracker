# AGENTS.md — ISS 3D Orbital Tracker

Guía técnica, arquitectura incremental y flujo de trabajo por fases para agentes de inteligencia artificial y desarrolladores.

---

## 1. Visión General y Metodología de Desarrollo

**ISS 3D Orbital Tracker** es una aplicación web interactiva de alto rendimiento que rastrea la Estación Espacial Internacional (ISS) en tiempo real mediante un globo 3D (Three.js WebGL) y un minimapa 2D estilo Mission Control.

> [!IMPORTANT]
> **METODOLOGÍA DE CONSTRUCCIÓN INCREMENTAL OBLIGATORIA:**
> **NO crear todos los archivos de golpe.** La aplicación se construye y verifica fase por fase. Cada fase añade un conjunto mínimo de archivos y se prueba inmediatamente en el navegador antes de avanzar a la siguiente.

---

## 2. Stack Tecnológico

| Componente | Tecnología | Propósito |
|---|---|---|
| **Framework Base** | React 19 + TypeScript | Manejo del estado, ciclo de vida y componentes modulares. |
| **Build Tool** | Vite 8 | Compilación instantánea y HMR. |
| **Motor 3D** | Three.js (`^0.185.1`) + WebGL | Renderizado 3D de la Tierra, nubes, atmósfera, estrellas y modelo ISS. |
| **Iconografía** | Lucide React | Iconos vectoriales de interfaz aeroespacial. |
| **Tipografía** | Google Fonts (`Space Grotesk`, `JetBrains Mono`) | Legibilidad de datos numéricos y telemetría. |
| **Estilos** | CSS Puro (Vanilla CSS Tokens) | Máximo rendimiento, glassmorphism y diseño responsivo. |
| **PWA (Fase Final Opcional)** | `vite-plugin-pwa` + Workbox | *Añadir solo al final en la Fase 5*. |

---

## 3. Fases de Desarrollo y Arquitectura Incremental

---

### 🟢 FASE 1: Globo 3D Base (Mínimo Viable — ~2 Minutos)

**Objetivo:** Levantar el entorno y ver inmediatamente la Tierra 3D con texturas fotorrealistas de la NASA, estrellas y controles de órbita.

#### Estructura de archivos de la Fase 1:
```
/
├── public/
│   └── textures/
│       ├── earth_day_4096.jpg     # Textura diurna NASA Blue Marble
│       ├── earth_night_4096.jpg   # Luces nocturnas
│       ├── earth_specular_2048.jpg# Máscara de océanos
│       ├── earth_normal_2048.jpg  # Mapa de relieve/normales
│       └── earth_clouds_1024.png  # Capa de nubes
├── src/
│   ├── components/
│   │   └── 3d/
│   │       └── SpaceScene.tsx     # Canvas Three.js, luces, estrellas y esfera con MeshStandardMaterial
│   ├── utils/
│   │   └── textureGenerator.ts    # Carga limpia y directa con TextureLoader
│   ├── styles/
│   │   └── index.css              # Reset básico y fondo espacial (#030712)
│   ├── App.tsx                    # Renderiza solo <SpaceScene />
│   └── main.tsx
├── postcss.config.js              # Aislamiento obligatorio: export default { plugins: {} }
├── package.json
└── vite.config.ts
```

#### Reglas de la Fase 1:
1. En `SpaceScene.tsx`, inicializar el globo terrestre usando **`THREE.MeshStandardMaterial`** con `textures.day`, `textures.normal` y `textures.specular`.
2. En `textureGenerator.ts`, usar **`THREE.TextureLoader().load(...)`** de forma sincrónica y directa (sin promesas complejas ni placeholders en Canvas).
3. **Hito de Verificación:** Abrir `http://localhost:5173/` y confirmar que la Tierra se ve nítida en 3D con océanos, continentes y estrellas.

---

### 🟢 FASE 2: Telemetría en Vivo y Modelo 3D de la ISS

**Objetivo:** Consumir las coordenadas GPS reales de la ISS, proyectar su posición 3D, generar su trayectoria orbital y aplicar extrapolación continua a 60 FPS (*dead-reckoning*).

#### Archivos añadidos en la Fase 2:
```
src/
├── types/
│   └── index.ts                   # Interfaces ISSPosition, Telemetry, etc.
├── services/
│   ├── issApi.ts                  # Fetch a https://api.wheretheiss.at/v1/satellites/25544
│   ├── orbitalMath.ts             # latLonToVector3, extrapolateISSPosition, generateOrbitTrail
│   └── reverseGeo.ts              # Geocodificación inversa con fallback oceánico offline
├── hooks/
│   └── useISSTelemetry.ts         # Polling cada 1.5s y cálculo de rumbo
└── components/
    └── 3d/
        └── ISSModel3D.ts          # Geometría procedural de la estación espacial y haz láser Nadir
```

#### Reglas de la Fase 2:
1. Integrar el modelo 3D de la ISS en `SpaceScene.tsx`.
2. En el bucle de animación `requestAnimationFrame`, aplicar `extrapolateISSPosition` para que el movimiento entre lecturas de la API sea 100% fluido a 60 FPS sin tirones.
3. **Hito de Verificación:** La ISS debe orbitar la Tierra suavemente y proyectar su huella (*footprint*) y línea orbital cian.

---

### 🟢 FASE 3: Minimapa 2D Mission Control

**Objetivo:** Proyectar la Tierra en 2D equirectangular con continentes vectoriales, curva del terminador solar día/noche y posición en vivo de la ISS.

#### Archivo añadido en la Fase 3:
```
src/
└── components/
    └── 2d/
        └── MiniMap2D.tsx          # Canvas 2D con Retina DPR, terminador solar y ground track
```

#### Reglas de la Fase 3:
1. Conectar `MiniMap2D.tsx` a los datos de telemetría de `useISSTelemetry`.
2. Calcular la curva del terminador solar con `calculateSolarTerminator(new Date())`.
3. **Hito de Verificación:** El minimapa 2D en la esquina superior derecha refleja en tiempo real la posición y rumbo de la ISS con su curva orbital sinusoidal.

---

### 🟢 FASE 4: HUD Aeroespacial, Shaders Avanzados y Responsividad

**Objetivo:** Incorporar la interfaz de usuario con efecto cristal (*glassmorphism*), selector de cámaras cinemáticas, modales de tripulación, diseño táctil móvil (*Bottom Sheet*) y shaders fotométricos.

#### Archivos añadidos en la Fase 4:
```
src/
├── components/
│   ├── 3d/
│   │   ├── AtmosphereShader.ts    # Halo de dispersión atmosférica Rayleigh
│   │   └── EarthMaterialShader.ts # Shader GLSL fotométrico (luces urbanas, specular, crepúsculo)
│   └── hud/
│       ├── HeaderBar.tsx          # Estado en vivo, reloj UTC y accesos a modales
│       ├── TelemetryCards.tsx     # Velocidad (Mach), altitud, ciclo solar y ubicación
│       ├── CameraToolbar.tsx      # Selector de cámaras (Libre, Follow, Cúpula, Polos, Sol)
│       ├── MobileSheet.tsx        # Bottom sheet gestual para móviles
│       ├── CrewModal.tsx          # Roster de astronautas en el espacio
│       └── PassAlertsModal.tsx    # Cálculo de próximos pases
└── hooks/
    ├── useCrew.ts                 # Consulta de astronautas en órbita
    ├── useGeoLocation.ts          # Distancia relativa usuario-ISS
    └── useTranslations.ts         # Soporte bilingüe completo (ES / EN)
```

#### Reglas de la Fase 4:
1. Al activar `EarthMaterialShader.ts`, verificar que todas las variables GLSL estén declaradas antes de calcular `gl_FragColor`.
2. Integrar `AtmosphereShader.ts` como capa externa con `side: THREE.BackSide` y `depthWrite: false`.
3. **Hito de Verificación:** La interfaz completa funciona de forma reactiva, bilingüe, con transiciones fluidas y diseño adaptable a escritorio y teléfonos móviles.

---

### 🟢 FASE 5 (Final Opcional): Habilitación de PWA e Instalabilidad

**Objetivo:** Convertir la aplicación web validada en una Progressive Web App instalable y con funcionamiento offline.

#### Archivos añadidos en la Fase 5:
```
/
├── public/
│   ├── icon-192.png               # Icono para dispositivos móviles
│   ├── icon-512.png               # Icono de alta resolución
│   └── manifest.webmanifest      # Manifiesto standalone
└── vite.config.ts                 # Incorporación de vite-plugin-pwa y caché Workbox
```

#### Reglas de la Fase 5:
1. **Solo ejecutar cuando las Fases 1 a 4 estén 100% terminadas.**
2. Configurar `vite-plugin-pwa` para cachear la app shell y las texturas NASA.
3. Probar instalación en navegador (botón de instalar en barra de direcciones o móvil).

---

## 4. Lecciones Críticas y Pautas Técnicas Obligatorias

### 4.1. Aislamiento Obligatorio de PostCSS (`postcss.config.js`)
- En la raíz del proyecto **SIEMPRE** debe existir un archivo `postcss.config.js`:
  ```javascript
  export default {
    plugins: {},
  };
  ```
  Esto evita que PostCSS en Windows busque configuraciones globales en `C:\Users\<Usuario>\postcss.config.js` y falle intentando cargar Tailwind.

### 4.2. Carga Directa de Texturas Three.js
- **Prohibido**: No usar promesas encadenadas complejas (`Promise.all`), *placeholders* creados con Canvas 2D ni sustituciones tardías de `mesh.material` dentro de `.then()`.
- **Enfoque correcto**:
  ```typescript
  export function loadEarthTextures(): LoadedTextures {
    const loader = new THREE.TextureLoader();
    const day = loader.load('/textures/earth_day_4096.jpg');
    day.colorSpace = THREE.SRGBColorSpace;

    const night = loader.load('/textures/earth_night_4096.jpg');
    night.colorSpace = THREE.SRGBColorSpace;

    const specular = loader.load('/textures/earth_specular_2048.jpg');
    const normal = loader.load('/textures/earth_normal_2048.jpg');

    const clouds = loader.load('/textures/earth_clouds_1024.png');
    clouds.colorSpace = THREE.SRGBColorSpace;
    clouds.wrapS = THREE.RepeatWrapping;
    clouds.wrapT = THREE.ClampToEdgeWrapping;

    return { day, night, specular, normal, clouds };
  }
  ```

---

## 5. Reglas Generales de Código

1. **TypeScript Estricto**: `verbatimModuleSyntax` activo. Usar `import type { ... }`.
2. **Rendimiento 3D**: Sin instanciaciones dentro de `requestAnimationFrame`. Usar `performance.now()`.
3. **Internacionalización**: Mantener soporte bilingüe `es` / `en` en `src/hooks/useTranslations.ts`.
4. **Estética**: Paleta aeroespacial profunda (`#030712`, `#00e5ff`, `#38bdf8`, `#4ade80`), efecto cristal (*glassmorphism*) y diseño responsive.
