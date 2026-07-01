---
name: diseno-ux
description: Sistema de diseño y verificación UX de Maya Redesign. Usar al crear o modificar cualquier UI (páginas, componentes, estilos, iconos), cuando el usuario pida "diseña", "mejora el diseño", "revisa la UX", o antes de dar por terminado un cambio visual. Incluye tokens, patrones de layout y protocolo de verificación en navegador.
---

# Diseño y UX — Maya Redesign

Estética objetivo: **estilo Airbnb** — superficies blancas, cards con bordes suaves, sombras sutiles, mucho aire, naranja Yanbal como único acento fuerte. La usuaria es una **líder/directora Yanbal**; el tono le habla de tú y va al grano con su negocio.

## Tokens (única fuente: `src/styles.scss`)

| Uso | Token |
|---|---|
| Acento de marca | `--brand-500` (#DC582A) · rampa `--brand-50…800` |
| Texto naranja sobre claro (AA) | `--brand-600` |
| Degradado decorativo / texto grande | `--brand-grad` · con texto blanco: `--brand-grad-strong` |
| Fondos | `--bg` (página) · `--surface` (cards) · `--sand` (bloques suaves) |
| Texto | `--ink` (principal) · `--ink-2` (secundario) · `--ink-3` (tenue AA) · `--on-ink` |
| Bordes | `--line` · `--line-strong` |
| Rellenos sólidos c/ texto blanco | `--fill-brand` · `--fill-success` · `--fill-danger` |
| Estados (texto + fondo suave) | `--success/-bg` · `--warning/-bg` · `--danger/-bg` · `--info/-bg` · `--teal/-bg` · `--violet/-bg` |
| Forma | `--radius-s` 8 · `--radius` 12 · `--radius-l` 16 |
| Sombra | `--shadow-s` · `--shadow` · `--shadow-l` |
| Tipografía | `--font-body` / `--font-display` (Plus Jakarta Sans) |

**Reglas duras:** nunca hex/rgb en componentes · todo token nuevo se define en `:root` Y en `[data-theme='dark']` · los pares estado/fondo no se mezclan entre tonos.

## Iconografía (3 niveles)

1. **`<app-icon name="..." [size]="16" />`** — iconos de línea SVG (`shared/icon.ts`): navegación, botones, títulos de sección. Nombres: home, chart, target, users, star, gift, cart, file, cap, heart-plus, search, sparkles, trending, box, alert, wallet…
2. **`<app-icon3d name="..." [size]="64" />`** — ilustraciones SVG 3D (`shared/icon3d.ts`): bag, chart, gift, plane, rocket, heart, cap. Para héroes/empty states.
3. **PNG 3D `public/icons/`** (100×100, fondo transparente): `/icons/check.png`, goals, medal-01, money-01, megaphone, growth, alert-02, airplane-01, file, searching. Para cards de logros, metas, avisos. Siempre con `alt` o `aria-hidden` según sean contenido o decoración.

## Patrones de layout (vista nueva `/n/...`)

Anatomía de página (ver `nueva/negocio.ts` como referencia):

```html
<div class="v2">
  <header class="v2-head" appReveal>
    <nav class="crumbs tiny"><a routerLink="/n/inicio">Inicio</a> / Sección</nav>
    <h1 class="v2-title">Título</h1>
    <p class="v2-sub">Subtítulo en una frase.</p>
    <nav class="anchors" aria-label="Secciones">…</nav>
  </header>
  <div class="v2-grid">
    <main><section class="card pad v2-section" appReveal>…</section></main>
    <aside>…</aside>
  </div>
</div>
```

- Clases base: `.card` + `.pad`, `.badge badge--{success|warning|danger|brand|info}`, `.btn btn--{primary|ghost} btn--sm`, `.muted`, `.tiny`.
- Directivas: `appReveal` (aparición al hacer scroll), `appAnchor` (navegación por anclas), `<app-ring>` (progreso circular).
- **Jerarquía de datos**: cada cifra vive en UN solo lugar por página; un único % grande como veredicto; el detalle al lateral. No repetir el mismo dato en dos cards.

## Principios UX del producto

1. **Veredicto primero**: la página abre con el estado del negocio (badge + frase), no con una tabla.
2. **Acción clara**: cada alerta/estado dice qué hacer y cuánto falta ("te faltan $X y N pedidos").
3. **Español, tuteo, sin jerga técnica**; términos del negocio Yanbal se respetan (campaña, MRM, PPED, cuadrante, GP, incorporar).
4. Mobile-first real: bottom-nav en móvil, header compacto, tap targets ≥ 44px.

## Protocolo de verificación visual (obligatorio tras cambios de UI)

1. Levanta el server si no corre (`npm start`, puerto 4200) — o usa el preview configurado en `.claude/launch.json` (nombre `maya`).
2. Navega a la ruta afectada y toma screenshot **desktop (1280px)**.
3. Redimensiona a **móvil (375px)** y verifica: sin scroll horizontal, bottom-nav visible, textos sin desbordar.
4. Activa **tema oscuro** (botón del header o `document.documentElement.setAttribute('data-theme','dark')`) y re-verifica contraste y fondos.
5. Revisa consola del navegador: cero errores.
6. Muestra al usuario los screenshots del antes/después cuando el cambio sea visual.
