# Referencia: Mi Campaña de la Maya real (vista Directora)

> Levantamiento de la sección **Mi Campaña** de `maya.yanbal.com` vista por una Directora
> real (Lidia Salgado, DIR SSE, México, campaña C8·S2, montos MXN, versión v1.0, jul 2026),
> a partir de captura compartida por Giovanni el 27/07/2026. Es el equivalente DIR de
> [`referencia-vista-ces.md`](./referencia-vista-ces.md). Incluye la **tabla de
> convivencia** con la propuesta [`seguimiento-objetivos-lider.md`](./seguimiento-objetivos-lider.md).

## 1. Estructura de la pantalla

Orden vertical de módulos (columna única + sidebar izquierdo):

1. Sidebar: título "Mi Campaña" (C8 - S2) + card colapsable del **Sueño PAR+**
   (Estrella 3 · ¡Viaje a Punta Cana!, con foto).
2. Selector de campañas: tabs **C8** (activa) · C7 · C6 — actual + 2 cerradas.
3. **Venta GP** (hero): actual $80,592.00 · te falta $207,408.00 · Meta C8 $288,000.00 ·
   CTA "Detalle de meta".
4. **Activas GP** (banner naranja): 16 · meta campañal 64 · chips de composición por
   estatus `ASP 0 · CES 0 · CEM 0 · CNS 15` · Retenidas 14/55 · Reactivadas 1/5 ·
   Primeros pedidos 0/4.
5. **Premios Ganamás**: Premios calificados (Retener) 35 CNS · Cerca del Premio (Activas)
   13 CNS · Mis Premios C8: 0 · Venta Personal $2,705.00 · alerta "Realiza una venta
   personal y califica a un premio".
6. **Cuadrante**: actual **D** · "para subir a Cuadrante A y ganar un bono de $2,300.00":
   venta requerida $172,500.00 (faltan $91,908.00) · PPED requeridos 4 (faltan 4).
7. **Morosidad y deuda**: IM 3.84% etiquetado "**IM Riesgoso**" · Deuda GP $166,554.66 ·
   "tu grupo necesita pagar $16,779.08 para lograr un **IM Saludable**" · Contactar
   deudoras (2) · Ver calculadora ↗ · Estado de Deuda ↗ · ¿Qué es el IM? · Mi deuda $2,190.45.
8. **Crédito**: Aprobado · utilizado $2,190.45 · disponible $11,809.55 · total $14,000.00.
9. **Consultoras Productivas**: 6 · meta 5 · "¡Lo lograste!".

## 2. Hallazgos (lo que la pantalla enseña)

- **Meta campañal ≠ MRM.** La meta C8 es $288,000 pero la vara del Cuadrante A es
  $172,500. Producción ya distingue "meta" (ambiciosa, con "Detalle de meta") de "vara"
  (mínimo del cuadrante). Hoy la meta es un número sin origen visible → la propuesta de
  objetivos la deriva del Business Plan (spec §4.2).
- **Metas por componente de activas**: retenidas 55 + reactivadas 5 + PPED 4 = 64 = meta
  de activas. Es la "composición de activas" del documento maestro §3.1 con meta por tipo.
- **Composición del GP por estatus** en chips (ASP·CES·CEM·CNS): la tubería de formación
  visible a nivel conteo. Lidia (SSE real) tiene **0 emprendedoras** — el caso "semillero"
  del spec §6.1 existe en producción y no es exclusivo de JNR.
- **Semántica oficial del IM**: "IM Riesgoso" / "IM Saludable", con el monto exacto de
  pago para sanar. En México **3.84% ya es riesgoso** → el umbral MX es menor que el 6%
  de Perú (¿3%?). **Por confirmar** — el maestro solo documenta Perú/Colombia/Bolivia.
- **Cifras México** (calibración de mocks): MRM SSE $172,500 + 4 PPED · bono Cuadrante A
  SSE $2,300 · crédito típico $14,000 · IM riesgoso desde <4%.
- La discrepancia activas (16) vs. suma de componentes (15) sugiere que la directora
  cuenta en su rol de consultora dentro de las activas (maestro §3.1).

## 3. Convivencia con "Mis objetivos" (decisión de diseño)

Mi Campaña responde *"¿cómo cierro esta campaña?"*; Mis objetivos responde *"¿voy a
lograr mi año y qué le pido a esta campaña?"*. **Nada se muda: cambia el origen de las
metas y se añaden 4 bisagras.**

| Módulo de Mi Campaña | Vive en | Bisagra con Mis objetivos |
| --- | --- | --- |
| Venta GP + meta campañal | Mi Campaña | La meta pasa a **derivarse del BP** (la tajada campañal del plan anual) — gana trazabilidad y link al plan |
| Activas + componentes | Mi Campaña | Sin cambio (los PPED alimentan el cuadrante) |
| Composición ASP·CES·CEM·CNS | Mi Campaña | Espejo campañal de la **cadena de formación** → link al frente Formaciones |
| Premios Ganamás · venta personal | Mi Campaña | Sin lectura anual |
| Cuadrante (corte campañal) | Mi Campaña | **La bisagra central**: el mismo hecho paga bono (campañal) y suma medalla (anual). El acumulado/racha es dueño Mis objetivos; aquí, link |
| Morosidad (IM GP campañal) | Mi Campaña | El IM de **GF anual** (≤3%, PAR+) vive en Objetivos — son índices distintos (spec §6.2) |
| Crédito · Productivas | Mi Campaña | Sin cambio |
| Card Sueño PAR+ (sidebar) | Mi Campaña | Deja de ser decorativa: es **la puerta** al seguimiento de objetivos |
| Tabs C8/C7/C6 | Mi Campaña | El reloj campañal; el reloj anual (toggle) vive en Objetivos |

Implementación de referencia en el prototipo: `src/app/nueva/campana-n.ts` (bisagras) ↔
`src/app/nueva/objetivos.ts` (plan anual).
