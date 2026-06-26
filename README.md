# Maya Redesign

Rediseño de la app **Maya** (Yanbal). Aplicación construida con [Angular](https://angular.dev) 22.

## Requisitos

- **Node.js** `>= 22.22.3` (recomendado: `24.16.0`, fijado en [`.nvmrc`](.nvmrc)).
- **npm** (incluido con Node).

Si usas [nvm](https://github.com/nvm-sh/nvm), basta con ejecutar en la raíz del proyecto:

```bash
nvm use   # toma la versión de .nvmrc (24.16.0)
```

> ⚠️ Angular 22 **no compila** con versiones de Node menores a 22.22.3. El campo `engines` en `package.json` y el `.nvmrc` están para evitar ese error.

## Instalación

```bash
npm install
```

## Servidor de desarrollo

```bash
npm start        # equivale a: ng serve
```

Abre el navegador en `http://localhost:4200/`. La aplicación se recarga automáticamente al modificar el código fuente.

### Rutas principales

`inicio`, `mi-campana`, `mi-plan`, `cuadrante`, `grupo-personal`, `incorpora-gana`, `herramientas`, `externa`.

## Build de producción

```bash
npm run build    # equivale a: ng build (configuración production)
```

Los artefactos se generan en `dist/maya-redesign/browser/`. Al ser una SPA, el hosting debe configurar un *fallback* a `index.html` para que funcione el routing del lado del cliente.

## Generar código (scaffolding)

```bash
ng generate component nombre-componente
ng generate --help    # lista completa de schematics
```

## Tests

```bash
npm test         # tests unitarios con Vitest (ng test)
```

## Recursos

- [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli)
