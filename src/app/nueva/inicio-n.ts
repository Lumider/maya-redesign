import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Icon } from '../shared/icon';
import { Reveal } from '../shared/reveal';
import { CAMPANA, CREDITOS_PENDIENTES, DIRECTORAS, USUARIA } from '../data/mock';

/**
 * Inicio (nueva) — cabina de triage. NO es dueño de los datos: espeja lo más urgente
 * de cada vista y enruta. Cada cifra vive en un solo lugar:
 *  · Los 3 críticos (Cuadrante · % MRM · días al cierre) viven solo en el encabezado.
 *  · Venta GP / Activas / IM / PAR+ viven una sola vez en "Un vistazo a tus 4 áreas".
 *  · El sueño/PAR+ vive solo en su tarjeta dedicada del lateral.
 * Un único valor de MRM coherente con el Cuadrante (56% · D).
 */
@Component({
  selector: 'app-inicio-n',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, RouterLink, Icon, Reveal],
  template: `
    <div class="v2">
      <header class="v2-head" appReveal>
        <h1 class="v2-title">¡Hola, {{ nombre }}! 👋</h1>
        <p class="v2-sub">Esto es lo más importante de tu {{ u.campana }}, semana {{ semana }}.</p>

        <!-- Los 3 (y solo 3) indicadores críticos -->
        <div class="crit">
          <div class="crit__i card">
            <span class="crit__top"><span class="crit__label">Cuadrante</span><span class="sem sem--bad"></span></span>
            <span class="crit__v bad">{{ cuadrante }}</span>
            <span class="tiny">Riesgo · no cumple MRM ni PPED</span>
          </div>
          <div class="crit__i card">
            <span class="crit__top"><span class="crit__label">Avance al MRM</span></span>
            <span class="crit__v">{{ mrmPct }}%</span>
            <div class="progress" style="margin:8px 0 4px"><div class="progress__fill" [style.width.%]="mrmPct"></div></div>
            <span class="tiny">del mínimo para Cuadrante A · faltan \${{ faltaVentaK }}k</span>
          </div>
          <div class="crit__i card">
            <span class="crit__top"><span class="crit__label">Cierre de campaña</span></span>
            <span class="crit__v">{{ diasCierre }}<span class="muted" style="font-size:15px"> días</span></span>
            <span class="tiny">Semana {{ semana }} de {{ totalSemanas }}</span>
          </div>
        </div>
      </header>

      <div class="v2-grid">
        <main>
          <!-- Alerta: una sola narrativa — la CAMPAÑA (subir a Cuadrante A → bono) -->
          <section class="card pad alerta" appReveal>
            <span class="sem sem--bad" style="margin-top:5px"></span>
            <div>
              <strong>Sube a Cuadrante A esta campaña.</strong>
              <p class="muted">Te faltan \${{ faltaVentaK }}k de venta y {{ ppedFaltan }} primeros pedidos para tu bono de \${{ bono | number }}.</p>
            </div>
            <a class="btn btn--soft btn--sm" routerLink="/n/campana">Ver mi plan</a>
          </section>

          <section class="v2-section" appReveal>
            <h2 class="v2-h"><app-icon name="check" [size]="18" /> Qué hacer esta semana</h2>
            <div class="feed">
              @if (creditos > 0) {
                <a class="feed__item feed__item--urgent card" routerLink="/n/equipo">
                  <span class="feed__ic">💳</span>
                  <div class="feed__body">
                    <strong>Aprueba {{ creditos }} créditos pendientes</strong>
                    <span class="tiny">Sin tu aprobación, esas consultoras no pueden pasar pedido.</span>
                  </div>
                  <app-icon name="chevron-right" [size]="18" />
                </a>
              }
              @for (a of pendientes; track a.id) {
                <a class="feed__item card" [routerLink]="a.ruta">
                  <span class="feed__ic">{{ a.emoji }}</span>
                  <div class="feed__body"><strong>{{ a.texto }}</strong><span class="tiny">{{ a.impacto }}</span></div>
                  <app-icon name="chevron-right" [size]="18" />
                </a>
              }
            </div>
          </section>

          <section class="v2-section" appReveal>
            <h2 class="v2-h"><app-icon name="sparkles" [size]="18" /> Un vistazo a tus 4 áreas</h2>
            <div class="areas">
              @for (ar of areas; track ar.ruta) {
                <a class="area card card--hover" [routerLink]="ar.ruta">
                  <div class="area__top"><app-icon [name]="ar.icon" [size]="22" /><span class="sem" [class]="'sem--' + ar.tone"></span></div>
                  <strong>{{ ar.titulo }}</strong>
                  <span class="tiny">{{ ar.resumen }}</span>
                </a>
              }
            </div>
          </section>
        </main>

        <aside class="v2-aside">
          <!-- Único lugar del sueño / PAR+ -->
          <a class="card par" routerLink="/n/carrera" appReveal>
            <div class="par__cover"><img src="media/punta-cana.jpg" alt="" aria-hidden="true" /></div>
            <div class="par__body">
              <span class="badge badge--brand">{{ campana.par.nivel }}</span>
              <strong>{{ campana.par.sueno }}</strong>
              <div class="progress" style="margin:8px 0 6px"><div class="progress__fill" [style.width.%]="parPct"></div></div>
              <span class="tiny">{{ parPct }}% del sueño · ver mi progreso →</span>
            </div>
          </a>

          <div class="card pad" appReveal [revealDelay]="80">
            <h3 class="v2-h" style="font-size:15px"><app-icon name="users" [size]="16" /> Mi equipo por trabajar</h3>
            @for (s of equipoTop; track s.label) {
              <a class="row-eq" [class.row-eq--accent]="s.accent" routerLink="/n/equipo">
                <span class="sem" [class]="'sem--' + s.tone"></span>
                <span class="row-eq__label">{{ s.label }}</span>
                <strong>{{ s.count }}</strong>
              </a>
            }
          </div>

          <div class="card novedad" appReveal [revealDelay]="140">
            <div class="novedad__video">▶</div>
            <div class="pad">
              <span class="tiny">Novedades · {{ u.campana }}</span>
              <strong>Lanzamiento + Product Book</strong>
              <div class="novedad__links">
                <a class="nlink" routerLink="/n/herramientas">📖 Product Book</a>
                <a class="nlink" routerLink="/n/carrera">🚀 Carrera de Liderazgo</a>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  `,
  styles: [
    `
      /* Indicadores críticos */
      .crit { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 16px 0 4px; }
      .crit__i { padding: 14px 16px; display: flex; flex-direction: column; gap: 2px; }
      .crit__top { display: flex; align-items: center; justify-content: space-between; }
      .crit__label { font-size: 12px; color: var(--ink-2); font-weight: 600; }
      .crit__v { font-family: var(--font-display); font-size: 26px; font-weight: 800; line-height: 1.1; margin-top: 2px; }
      .crit__v.bad { color: var(--danger); }

      .alerta { display: flex; gap: 12px; align-items: flex-start; border-color: var(--warning); margin-bottom: 22px; }
      .alerta p { margin: 4px 0 0; font-size: 13.5px; }
      .alerta .btn { margin-left: auto; white-space: nowrap; }
      .btn--sm { padding: 8px 14px; font-size: 13px; }
      .pad { padding: 18px 20px; }

      .feed { display: flex; flex-direction: column; gap: 10px; }
      .feed__item { display: flex; align-items: center; gap: 12px; padding: 14px 16px; }
      .feed__item--urgent { border-color: var(--danger); }
      .feed__ic { font-size: 22px; }
      .feed__body { flex: 1; display: flex; flex-direction: column; gap: 2px; }

      .areas { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .area { display: flex; flex-direction: column; gap: 6px; padding: 16px; }
      .area__top { display: flex; align-items: center; justify-content: space-between; }
      .area__top .sem { width: 9px; height: 9px; }

      .par { overflow: hidden; display: block; }
      .par__cover { height: 110px; overflow: hidden; background: linear-gradient(120deg, #0c5566, #0e7490 60%, #1287a8); }
      .par__cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .par__body { padding: 14px 16px; display: flex; flex-direction: column; gap: 4px; }

      .row-eq { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid var(--line); }
      .row-eq:last-child { border-bottom: 0; }
      .row-eq__label { flex: 1; font-size: 13.5px; }
      .row-eq--accent { padding: 9px 10px; margin: 4px 0; border-bottom: 0; border-radius: var(--radius-s); background: var(--brand-100); }
      .row-eq--accent .row-eq__label { font-weight: 700; color: var(--brand-700); }
      .row-eq--accent .sem { background: var(--brand-500); }

      .novedad { overflow: hidden; }
      .novedad__video { height: 120px; display: grid; place-items: center; font-size: 26px; color: #fff; background: linear-gradient(120deg, #c2410c, #9a3412); }
      .novedad__links { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }
      .nlink { font-size: 13px; font-weight: 600; color: var(--ink); padding: 6px 0; border-top: 1px solid var(--line); }
      .nlink:hover { color: var(--brand-600); }

      @media (max-width: 720px) {
        .crit { grid-template-columns: 1fr; }
        .areas { grid-template-columns: 1fr; }
      }
    `,
  ],
})
export class InicioN {
  protected readonly u = USUARIA;
  protected readonly nombre = USUARIA.nombre.split(' ')[0];
  protected readonly campana = CAMPANA;

  // --- 3 críticos (coherentes con el Cuadrante D) ---
  protected readonly cuadrante = CAMPANA.cuadrante.actual; // 'D'
  /** Único % de MRM en toda la app: venta sobre el mínimo requerido para Cuadrante A.
   *  92% (aún por debajo del mínimo → D) y coherente con "faltan $14k", con Mi negocio
   *  y con Mi campaña, que usan el mismo denominador. */
  protected readonly mrmPct = Math.round((CAMPANA.ventaActual / CAMPANA.cuadrante.ventaRequerida) * 100); // 92
  protected readonly diasCierre = 9;
  protected readonly semana = 3;
  protected readonly totalSemanas = 4;

  // --- alerta de campaña ---
  protected readonly faltaVentaK = Math.round(CAMPANA.cuadrante.faltaVenta / 1000); // 14
  protected readonly ppedFaltan = CAMPANA.cuadrante.ppedRequeridos; // 4
  protected readonly bono = CAMPANA.cuadrante.bono; // 2300

  protected readonly creditos = CREDITOS_PENDIENTES.length;
  protected readonly parPct = Math.round((CAMPANA.par.ventaC6 / CAMPANA.par.metaSueno) * 100); // 53

  private readonly hijas = DIRECTORAS.filter((d) => d.generacion === 1);
  private readonly pctHijasA = Math.round(
    (this.hijas.filter((d) => d.cuadrante === 'A').length / this.hijas.length) * 100,
  );

  protected readonly pendientes = [
    { id: 'a1', emoji: '📞', texto: 'Llama a 5 consultoras por reactivar', impacto: 'Reactivadas +5 · ~$14,000 de venta', ruta: '/n/equipo' },
    { id: 'a2', emoji: '🎯', texto: 'Asegura 2 primeros pedidos antes del cierre', impacto: 'PPED +2 de 4 · acerca el Cuadrante A', ruta: '/n/campana' },
    { id: 'a3', emoji: '🛍️', texto: 'Pasa tu pedido personal al N1 Gana Más ($400)', impacto: 'Mantienes tu calificación y premios', ruta: '/n/campana' },
  ];

  /** Cifra de apoyo de cada área — vive SOLO aquí (sin duplicar arriba ni en el lateral). */
  protected readonly areas = [
    { titulo: 'Mi negocio', icon: 'chart', tone: 'bad', resumen: 'Venta GP $158k · IM 4.2% · deuda $3,180', ruta: '/n/negocio' },
    { titulo: 'Mi campaña', icon: 'target', tone: 'warn', resumen: '31/65 activas · 0 de 4 primeros pedidos', ruta: '/n/campana' },
    { titulo: 'Mi equipo', icon: 'users', tone: 'warn', resumen: `${this.pctHijasA}% hijas en Cuadrante A · ${this.creditos} créditos por aprobar`, ruta: '/n/equipo' },
    { titulo: 'Mi carrera', icon: 'star', tone: 'info', resumen: 'PAR+ Estrella 3 · auto 35%', ruta: '/n/carrera' },
  ];

  /** Lista corta priorizada por urgencia: créditos (acento) → reactivar → incorporables. */
  protected readonly equipoTop = [
    { label: 'Créditos por aprobar', count: this.creditos, tone: 'bad', accent: true, ruta: '/n/equipo' },
    { label: 'Reactivar', count: 42, tone: 'warn', accent: false, ruta: '/n/equipo' },
    { label: 'Incorporables', count: 59, tone: 'info', accent: false, ruta: '/n/equipo' },
  ];
}
