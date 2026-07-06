# Adopción de FrYDA Design System — estado en maya-redesign

> Seguimiento del [Checklist de adopción — FRYDA Design System](https://zeroheight.com/9f9e7345e/p/450412-checklist-de-adopcion--fryda-design-system)
> (FrYDA v.2.0, zeroheight). Actualizado: 2026-07-06.

## Resumen

| #   | Ítem del checklist                       | Estado       | Nota                                                                                           |
| --- | ---------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------- |
| 1.1 | Acceso e infraestructura (.npmrc + auth) | 🟡 Parcial   | `.npmrc` listo con scope `@yanbal`; falta PAT de Azure DevOps                                  |
| 1.2 | Selección de versiones                   | 🔴 Bloqueado | **Maya usa Angular 22 — no existe wrapper** (hay 15/18/19/20)                                  |
| 1.3 | Instalación del paquete                  | 🔴 Bloqueado | Depende de 1.1 (PAT) y 1.2 (wrapper)                                                           |
| 1.4 | Registro de Web Components               | ⚪ Pendiente | Depende de 1.3                                                                                 |
| 1.5 | Integración de CSS versionado            | ✅ Hecho     | v `1.2.0` fijada en `index.html`, orden documentado, sin `/latest/`                            |
| 1.6 | Theming y overrides (`--fry-*`)          | ✅ Hecho     | Todo el tema deriva de custom properties `--fry-*`; cero overrides de clases internas          |
| 1.7 | Validación visual vs Storybook PROD      | 🟡 Parcial   | Tokens verificados idénticos; componentes pendientes de 1.3                                    |
| 1.8 | Validación de accesibilidad              | ✅ Hecho     | Contrastes AA medidos y comentados en `styles.scss`; navegación por teclado en interactivos    |
| 1.9 | Gobernanza                               | ✅ Hecho     | Regla en CLAUDE.md: candidatos entran a `/ui` primero; migración solo con aprobación explícita |

## 1.5 — Cómo quedó la integración de tokens

- `index.html` carga los 4 CSS oficiales **versionados** (`1.2.0`) en el orden del
  checklist: `foundation → semantic → component → variables`. Los 4 archivos son
  solo definiciones `:root` (custom properties), sin selectores que puedan
  contaminar estilos.
- `scripts/fryda-primitives.py` genera cada primitive local referenciando el
  oficial con fallback: `--fry-yanbal-orange-60: var(--fry-p-color-yanbal-orange-60, #d95f34)`.
  La fuente de verdad pasa a ser el CDN; si no responde, el prototipo se ve
  idéntico (los 230 valores están verificados byte a byte contra `foundation.css` 1.2.0).
- Verificación hecha el 2026-07-06: los **230 primitives de color** del CDN
  (`--fry-p-color-*`) coinciden exactamente en nombre y valor con nuestro export
  de Figma (`design-tokens/Primitives.json`). Cero divergencias.

Versiones publicadas detectadas en el CDN: `0.0.10 · 0.0.11 · 0.0.12 · 1.0.0 · 1.1.0 · 1.2.0`
(`latest` ≡ `1.2.0` a la fecha). Cada versión es inmutable.

## Bloqueos que requieren acción externa

1. **PAT de Azure DevOps** (checklist 1.1): pedir un Personal Access Token con
   permiso _Packaging (Read)_ en `dev.azure.com/YanbalInternational` y
   configurarlo en base64 en el `.npmrc` del usuario (macOS/Linux). El `.npmrc`
   del repo ya apunta al registry `FRYDAComponentLibrary`.
2. **Wrapper para Angular 22** (checklist 1.2): los paquetes publicados son
   `@yanbal/component-library-angular-15|18|19|20`. Mismo riesgo que el
   proyecto DAM (Angular 21, "no soportado" en su checklist). Opciones a
   coordinar con el equipo FRYDA / Propelland:
   - que publiquen el wrapper 21/22 (Stencil los genera automáticamente), o
   - usar los **Web Components nativos sin wrapper** (vía validada por el
     proyecto `_TV_AMS` en Vue 2) con `CUSTOM_ELEMENTS_SCHEMA`.
3. **Decisión de Shadow DOM** (checklist por producto): registrar la decisión
   para Maya cuando se integren componentes. Recomendación preliminar: Shadow
   DOM **activo** (personalización solo vía `--fry-*`, que ya es nuestra regla).

## Referencias oficiales

- Storybook PROD (referencia visual): <https://delightful-water-0fd3e730f.2.azurestaticapps.net/>
- CDN de tokens: `https://frydacdn.yanbal.com/styles/{version}/…`
- Catálogo publicado (Storybook, 2026-07-06): **Atoms** Accordion · Alert ·
  Banner · Button · Button icon · Chip · List Item · Scrollbar · Searchbar ·
  Tab · Tag · Tooltip — **Foundations** Icon · Illustration — **Molecules**
  Breadcrumb · Calendar · Card Business · List Group · Modal Alert · Modal
  Business · Tab-group.
- Proceso interno de migración (CLAUDE.md): componente candidato → `/ui` (UI
  Kit) → comparación contra Storybook PROD → reemplazo solo con aprobación
  explícita; la versión anterior se conserva en `/ui` como "Anterior".
