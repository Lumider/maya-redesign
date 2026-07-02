# Referencia: vista CES (CEM Senior) en Maya actual

> Levantamiento hecho navegando `maya.yanbal.com` (Perú) el 02/07/2026 con una cuenta CES real
> (Vaselisa Alcacer, campaña C7-S2). Base para construir la vista Consultora/Emprendedora del redesign.
> Términos verificados contra `Yanbal_Base_Conocimiento_MAESTRO.md`.

## Navegación real (menú hamburguesa)

| Sección | Ruta | ¿Interna? |
|---|---|---|
| Inicio | `#/inicio` | ✅ |
| Mi Negocio → Mi Campaña | `#/mi-campanha-actual` (tabs C7/C6/C5) | ✅ |
| Mi Negocio → Incorpora y Gana | `#/mi-campanha-actual/incorpora-y-gana` | ✅ |
| Mi Negocio → Mis Pedidos | — | ❌ externa (pedidos) |
| Mi Negocio → Reportes | — | ❌ externa (pro-vst, login MS) |
| Mi Grupo Personal | `#/grupo-personal` (+ `/detalle/:id`) | ✅ |
| Mis Herramientas | `herramientas.yanbal.com` | ⚠️ otro subdominio |
| Mis Cursos (Créana) | — | ❌ externa |
| Incorporación | — | ❌ externa |
| Elige Crecer (quicklink) | `#/external/ELCR` → serviciosyanbal | ❌ externa |

Header: Menú · botón "Realizar Pedido" (primario, externo) · logo · usuaria con badge de nivel (CES) · carrito.

## 1. Inicio

- **Sidebar naranja "Indicadores"** (contexto campaña C7-S2):
  - Banner "Estás calificando como **CNS**" — el nivel de calificación fluctúa por campaña.
  - Venta GP actual S/ 3,029.00 · Activas GP 3 · Primeros pedidos 0 · Índice de morosidad 5.14% · Deuda actual S/ 1,529.05 · Crédito Yanbal S/ 1,670.95 · **Ganancia S/ -------- (oculta por defecto)**.
- **Quicklinks** (iconos 3D): Realizar Pedido · Reportes · Incorpora y Gana · Elige Crecer · Incorporar · Mis Cursos.
- **Gestión de tu Grupo Personal** — chips segmentos con contador (idéntico concepto a la vista Líder): Reactivar 20 · Deuda 1 · Retener 5 · Inicio Ganador 5 · Sin 1er Pedido 7 · Activas 3 · Incorporables 0 · Celebraciones 8.
- **Anuncios** (banners) y **Material Campañal** (carrusel: Ganamás C7, Catálogo C7/C8, Entrenos, "Para incorporar").

## 2. Mi Campaña (la página más rica)

Sidebar con historial (Campaña 7 activa, 6, 5). Secciones en orden:

1. **Venta GP actual** S/ 3,029.00 (card hero con ilustración bolsa de dinero).
2. **Activas GP: 3** (banda naranja) — chip "Estatus: ASP 0 - CES 0 - CEM 0 - CNS 2" + Retenidas 2 · Reactivadas 0 · Primeros pedidos 0.
3. **Bonificaciones Ganamás**:
   - Bonificaciones GP: calificadas (Retener) 5 CNS · cerca a la bonificación (Activas) 3 CNS.
   - Mis Bonificaciones C7: Unicampañal 1 [Calificado] · Bicampañal 1 [Calificado]. Venta Personal: S/ 1,500.50.
4. **Morosidad y deuda**: IM No Cobro **5.14%** (rojo, grande) · Deuda GP S/ 7,336.39 · botón "Contactar deudoras (1)" · alerta accionable: *"Tu GP necesita pagar S/ 111.15 para lograr un IM 5.00%"* · Mi deuda S/ 1,529.05. Link "¿Qué es el IM?".
5. **Crédito**: estado [Aprobado] · Utilizado S/ 1,529.05 · Disponible S/ 1,670.95 · Total S/ 3,200.00.
6. **Ganancia estimada actual** (card celeste): oculta con botón "Mostrar ganancia" 👁 → S/ 525.00. Composición: Escala de 35% dscto. S/ 525.00 · Incorpora y Gana S/ 0.00 · Crece Haciendo Crecer S/ 0.00.

## 3. Incorpora y Gana (seguimiento)

- Header salmón + chip campaña + banner "Entérate cómo ganar — Conoce aquí".
- **Participantes**: chips avatar de cada incorporada (9).
- Por participante: "Ganancia por [nombre]" S/ 0.00 · código · banner "¡Empieza a ganar! Motiva a que pase su Primer Pedido, lo pague y gana por incorporar".
- Tabla 3 filas (máx. 3 campañas de bono): **Nro Campaña · Monto pedido (S/470 min) · Días para pagar · Recibes**.
- Card Incorporación: fecha de incorporación (27/05/2026, C6 S1) · fecha de su primer pedido.
- ⚠️ N1GM vigente Perú: **S/ 470** de pedido mínimo.

## 4. Mi Grupo Personal

- Buscador + tabs **Mi estructura | Reportes** + lista de ~44 integrantes.
- Card por integrante: borde izquierdo de color (estado), nombre, badge nivel (CNS/CEM), Venta Personal; CEM además Venta Grupal + alerta ⚠ "Ganará como CNS".
- Barra inferior: **Ordenar por** (niveles, nombre, apellido, venta ↑↓) y **Filtrar por**:
  - Por nivel: Nuevas Consultoras · Consultoras · CEM Senior · CEM · Aspirante
  - Por actividad: Primeros pedidos · Retenidas · Reactivadas · Inactivas
  - Por deuda: Por vencer · Morosas · Sin deuda
  - Por monto de venta: menor/mayor a monto mínimo
  - Por Nivel de Ganamás: Nivel especial · N1–N5
  - Por inicio ganador: 1º/2º/3º campaña
  - Por escala de descuento: 25% · 30% · 35%
  - Por campañas inactivas: 1 · 2 · 3 · 4-11 · 12

### Detalle de integrante (`/grupo-personal/detalle/:id`)

- Panel izq.: avatar + badge, código, botones **WhatsApp** y **Llamar**, Datos Personales (colapsable).
- Panel der. (mini Mi Campaña de ella, tabs C7/C6/C5):
  - Venta Personal actual.
  - **Bonificaciones Ganamás**: cards de premio EN PRODUCTO (ej. "Bicampañal N1 — Hervidor + Sandwichera + Exprimidor Eléctrico") con línea de tiempo C7: Calificado → C8: Seguir calificando → C9: Entrega. Empty state "¡A más pedidos, más bonificaciones!".
  - **Deuda**: "¿Sabías que existen sanciones por no pagar a tiempo?" · detalle por boleta (#101168011, Normal, vence en 26 días, S/ 552.83).
  - **Crédito**: aprobado/utilizado/disponible/total.
  - **Ganancia estimada** (oculta): composición "Escala de 30% dscto."

## Patrones UX destacables (adoptar en el redesign)

1. **Ganancia siempre oculta por defecto** con toggle 👁 — privacidad en entornos compartidos.
2. **Alertas accionables con cifra exacta** ("necesitas pagar S/ 111.15 para IM 5.00%").
3. **Nivel de calificación ≠ título**: badge CES en header pero "calificando como CNS" — la distinción es central.
4. **Contacto directo** WhatsApp/Llamar desde la ficha de cada integrante.
5. **Bonificaciones como productos tangibles** con línea de tiempo de 3 campañas.
6. **Segmentos de GP como chips accionables** con contador (igual que vista Líder).
7. Todo lo transaccional (pedidos, reportes, cursos, incorporación) **vive fuera** — Maya es la capa de gestión/asesoría.

## Diferencias CES vs. Líder (para el redesign)

- La CES **sí tiene GP** (hijas/nietas) pero NO cuadrantes, NO genealogía de directoras, NO PAR+.
- Sus programas: **Ganamás** (bonificaciones producto), **Incorpora y Gana** (S/ 50/campaña), **Elige Crecer**, **Crece Haciendo Crecer**.
- Su ganancia: escala de descuento (25/30/35%) + Incorpora y Gana + Crece Haciendo Crecer (vs. líder: 10% GP + 5% directoras + bonos).
- Su norte: mantener calificación CES (4 requisitos) y avanzar a Aspirante → Directora.
