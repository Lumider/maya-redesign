# Maya Redesign — Guía para Claude

Rediseño de la app **Maya** (Yanbal) para líderes/directoras de venta. Angular 22, SPA, prototipo con datos mock.

## Comandos

Requiere Node 24.16.0 vía nvm (Angular 22 no compila con Node < 22.22.3):

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use   # SIEMPRE antes de npm/ng
npm start            # dev server → http://localhost:4200
npm run build        # build producción → dist/maya-redesign/browser/
npm test             # tests unitarios (ng test)
npx prettier --check "src/**/*.{ts,scss,html}"   # verificar formato
```

## Arquitectura

Dos versiones de la app conviven en paralelo (switch en el header, `VersionService`):

- **Vista actual** (`src/app/pages/`): rutas `/inicio`, `/mi-plan`, `/mi-campana`, `/incorpora-y-gana`, `/grupo-personal`, `/cuadrante`, `/herramientas`, `/externa/:slug`.
- **Vista nueva (beta)** (`src/app/nueva/`): rutas `/n/inicio`, `/n/negocio`, `/n/campana`, `/n/equipo`, `/n/carrera`. **Al trabajar en la vista nueva, la actual queda intacta** (y viceversa).

```
src/
├── styles.scss          # design tokens (:root + [data-theme='dark']) y estilos base
├── app/
│   ├── app.ts           # shell: header, nav, menú, bottom-nav móvil (~570 líneas)
│   ├── app.routes.ts    # todas las rutas, lazy con loadComponent
│   ├── data/mock.ts     # TODOS los datos (ficticios) — única fuente; no inventar datos en páginas
│   ├── shared/          # Icon (SVG línea), Icon3d (SVG 3D), Ring, Reveal, Anchor, Loader,
│   │                    # ThemeService (claro/oscuro), VersionService (actual/nueva)
│   ├── pages/           # vista actual
│   ├── nueva/           # vista nueva (beta) — audiencia Directoras + hubs por audiencia
│   ├── ces/             # vista nueva — audiencia Emprendedoras (CNS→ASP)
│   └── bdm/             # vista nueva — audiencia BDM (Staff de Ventas): inicio, mi campaña
│                        # y mis directoras (herramienta de gestión "Cuadrantes y Medallas")
public/
├── brand/               # logo-yanbal.svg, iso-yanbal.svg
├── icons/               # set de iconos 3D PNG 100×100 (check, goals, medal-01, money-01,
│                        # megaphone, growth, alert-02, airplane-01, file, searching)
├── loader/              # 01.jpg…12.jpg (pantalla de carga)
└── media/               # imágenes de contenido
```

Assets de `public/` se referencian desde la raíz: `/icons/check.png`, `/brand/logo-yanbal.svg`.

**Breadcrumb (FrYDA):** el shell (`app.ts`) renderiza un único `<app-breadcrumb>` sobre el `<router-outlet>`, derivado de la ruta con `ROUTE_LABELS`/`EXTERNA_LABELS` (mismos rótulos de la nav). Home (`/inicio`, `/n/inicio`) y `/ui` no lo muestran; es desktop-only (oculto <720px). Para dar nombre a una ruta nueva en el breadcrumb, se añade su entrada al mapa — no se toca cada página.

## Convenciones de código (obligatorias)

- **Componentes standalone** con `template:` y `styles:` inline en el `.ts` — no hay archivos `.html`/`.scss` separados. Un componente = un archivo.
- **`ChangeDetectionStrategy.OnPush` siempre.**
- **Signals**, no decoradores: `input()` / `input.required()`, `signal()`, `inject()` en vez de constructor injection.
- **Control flow moderno**: `@if` / `@for` / `@switch` (nunca `*ngIf`/`*ngFor`).
- **Rutas lazy**: `loadComponent: () => import(...)`.
- **Comentarios y JSDoc en español**, explican el *porqué* de las decisiones de UX/negocio (ver `nueva/negocio.ts` como referencia de estilo).
- **Datos solo desde `data/mock.ts`** — tipados con interfaces exportadas.
- Formato: Prettier (printWidth 100, singleQuote), indentación 2 espacios. Sin tests por schematic (`skipTests: true`).

## Sistema de diseño (resumen — detalle en la skill `diseno-ux`)

- **Solo tokens CSS** de `styles.scss`: `var(--brand-500)`, `var(--ink)`, `var(--surface)`, etc. **Nunca colores hardcodeados** en componentes.
- Marca: naranja Yanbal `#DC582A` (`--brand-500`). Tipografía: Plus Jakarta Sans.
- **Tema claro y oscuro**: todo cambio visual debe verse bien en ambos (`data-theme` en `<html>`). Los tokens ya resuelven el 95%; no redefinir colores por tema en componentes.
- **Accesibilidad AA**: contrastes ya calibrados en los tokens (los comentarios de `styles.scss` lo indican); `aria-label` en botones de icono; `aria-hidden` en SVG decorativos.
- Tonos de estado: `success`, `warning`, `danger`, `info`, `teal`, `violet` — cada uno con par `--X` / `--X-bg`.

## Conocimiento de negocio (en `docs/`)

- `docs/calendario-campanas.md` — cómo se dividen las campañas del año: 13 campañas × 4 semanas (sáb→vie), C13 cruza Año Nuevo y a veces dura 5 semanas. Fechas 2024–2026.
- `docs/referencia-vista-ces.md` — levantamiento de la Maya real vista por una CES.
- Vista BDM: la base de conocimiento vive fuera del repo, en el vault Obsidian `~/Library/CloudStorage/OneDrive-UNIQUEYANBAL/Yanbal - BDM/` (Home, Mi Campaña con 6 cards de indicador, 5 frentes de gestión, glosario). Los datos de `data/mock-bdm.ts` son los valores de ejemplo del Figma documentados ahí.

## UI Kit (styleguide viviente)

Ruta oculta `/ui` (`pages/ui-kit.ts`): muestra todos los tokens, badges, botones, iconos y componentes del sistema. **Antes de crear un componente nuevo, revisar ahí si ya existe**; al crear uno reutilizable, añadirlo a la galería.

### Primitives FrYDA (fuente de color)

`design-tokens/Primitives.json` (export de Figma Variables) → `scripts/fryda-primitives.py` → `src/fryda-primitives.scss` (230 vars `--fry-familia-tono`, 23 familias × tonos 10–100). **Los componentes FrYDA (botón, badge, card) y TODOS los tokens del redesign (`:root` de styles.scss: marca, neutros, estados) referencian primitives, nunca hex.** Familias semánticas: marca=yanbal-orange, neutros de texto/línea=yanbal-black, lienzo=bone, success=mint, warning=marigold, danger=crimson, info=blue, teal=aegean, violet=wine. En oscuro todo se deriva de los mismos primitives (tonos pastel 30–60 para texto + `color-mix()` para fondos/superficies); los ratios AA medidos están comentados junto a cada bloque. Si el equipo de diseño actualiza los primitives: reemplazar el JSON y correr el script. Galería completa y personalizador en vivo en `/ui`.

Reglas de migración de componentes (proceso FrYDA):
1. Un componente nuevo/candidato entra primero SOLO al UI Kit — nunca directo a la app.
2. El reemplazo en la app se aplica únicamente cuando Giovanni lo pide explícitamente.
3. Al migrar, la versión anterior NO se elimina: se conserva en `/ui` como referencia ("Anterior"), renderizada con los tokens aún vivos del sistema.

## Acceso a la demo publicada

La demo (GitHub Pages) tiene una puerta de clave en el frontend (`shared/acceso.ts` + `shared/acceso-gate.ts`). Es cortesía para datos ficticios, no seguridad real. Para cambiar la clave: `echo -n "nueva-clave" | shasum -a 256` y reemplazar `CLAVE_HASH` en `acceso.ts`. La sesión se recuerda por dispositivo (localStorage `maya-acceso`).

## Flujo de trabajo

- Rama principal: `main`. Remoto SSH: `git@github.com:Lumider/maya-redesign.git`.
- Antes de dar por terminado un cambio: `npm run build` debe pasar sin errores y el formato debe cumplir Prettier.
- Cambios de UI: verificar en el navegador (desktop + móvil 375px + tema oscuro) — usar la skill `diseno-ux`.
- Antes de commit/push: pasar la skill `revision-codigo`.
