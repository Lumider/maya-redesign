---
name: revision-codigo
description: Revisión de código específica de Maya Redesign. Usar antes de cada commit/push, cuando el usuario pida "revisa el código", "code review", o al terminar cualquier cambio en src/. Verifica convenciones Angular del proyecto, sistema de diseño, accesibilidad y build.
---

# Revisión de código — Maya Redesign

Revisa el diff actual (`git diff` + `git diff --staged` + archivos nuevos sin trackear) contra las reglas del proyecto. Reporta hallazgos por severidad (🔴 bloqueante / 🟡 mejora / 🔵 nota) con `archivo:línea`.

## 1. Convenciones Angular (bloqueantes)

- [ ] Componentes con `ChangeDetectionStrategy.OnPush`.
- [ ] Standalone, template y estilos inline en el `.ts` (sin `.html`/`.scss` separados).
- [ ] Signals: `input()`/`input.required()`, `signal()`, `computed()`, `inject()`. Sin `@Input()`, `@Output()` con decorador ni inyección por constructor.
- [ ] Control flow `@if`/`@for`/`@switch` — nunca `*ngIf`/`*ngFor`/`*ngSwitch`.
- [ ] Nuevas rutas: lazy con `loadComponent`, registradas en `app.routes.ts`.
- [ ] Página de vista nueva → `src/app/nueva/` con ruta `/n/...`; vista actual → `src/app/pages/`. **Un cambio en una vista no debe tocar la otra.**

## 2. Datos y estructura

- [ ] Ningún dato inventado dentro de componentes: todo desde `src/app/data/mock.ts`, tipado con interfaces exportadas.
- [ ] Componentes reutilizables van a `src/app/shared/`.
- [ ] Sin dependencias nuevas en `package.json` que no se hayan acordado con el usuario.

## 3. Sistema de diseño (bloqueantes)

- [ ] **Cero colores hardcodeados** (`#hex`, `rgb()`) en estilos de componentes — solo `var(--token)` de `styles.scss`. Excepción: SVG ilustrativos tipo `Icon3d`.
- [ ] Nada de estilos que rompan el tema oscuro (fondos/textos fijos claros). Si se añade un token nuevo, debe definirse en `:root` **y** en `[data-theme='dark']`.
- [ ] Radios/sombras/tipografía desde tokens (`--radius*`, `--shadow*`, `--font-*`).

## 4. Accesibilidad

- [ ] Botones/enlaces solo-icono llevan `aria-label`.
- [ ] SVG decorativos llevan `aria-hidden="true"`.
- [ ] Imágenes de contenido llevan `alt` descriptivo en español.
- [ ] Texto sobre fondos suaves usa el token de texto AA correspondiente (`--ink-3`, `--brand-600`, `--success`, etc.), no versiones claras de la rampa.
- [ ] Jerarquía de encabezados coherente (un `h1` por página, luego `h2`…).

## 5. Estilo y idioma

- [ ] Comentarios/JSDoc en español, explicando el porqué (no el qué).
- [ ] Textos de UI en español, con la voz del producto (tuteo a la líder: "tu negocio", "te faltan…").
- [ ] Prettier limpio: `npx prettier --check` sobre los archivos tocados.

## 6. Verificación final (siempre ejecutar)

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use
npm run build          # debe terminar sin errores
```

Si el dev server está corriendo, revisa que no haya errores de compilación en su log.

## Formato del reporte

```
## Revisión de código — <fecha>
🔴 Bloqueantes (N) — impiden commit
🟡 Mejoras (N) — recomendadas
🔵 Notas (N) — opcionales
✅ Build: OK/FALLA · Prettier: OK/FALLA
Veredicto: LISTO PARA COMMIT / REQUIERE CAMBIOS
```

No hagas push si hay bloqueantes sin resolver, salvo que el usuario lo pida explícitamente.
