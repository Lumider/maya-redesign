import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Icon } from '../shared/icon';
import { Reveal } from '../shared/reveal';
import { CAMPANA, CREDITOS_PENDIENTES, PLAN_CAMPANA, SEGMENTOS_GP, USUARIA } from '../data/mock';

/**
 * Inicio (nueva) — triage. No es dueño de datos: espeja lo más urgente de cada
 * vista y enruta. Columna principal (alerta · qué hacer · 4 áreas) + lateral.
 */
@Component({
  selector: 'app-inicio-n',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, RouterLink, Icon, Reveal],
  template: `
    <div class="v2">
      <header class="v2-head" appReveal>
        <h1 class="v2-title">¡Hola, {{ nombre }}! 👋</h1>
        <p class="v2-sub">Así va tu negocio en {{ u.campana }} · semana {{ u.semana }}. Esto es lo que importa hoy.</p>
        <div class="hero3">
          <div class="hero3__item"><span class="sem sem--bad"></span><div><div class="hero3__v">{{ ventaPct }}%</div><div class="tiny">Venta GP del MRM</div></div></div>
          <div class="hero3__item"><span class="sem sem--warn"></span><div><div class="hero3__v">31<span class="tiny"> / 65</span></div><div class="tiny">Activas GP</div></div></div>
          <div class="hero3__item"><span class="sem sem--bad"></span><div><div class="hero3__v">D</div><div class="tiny">Cuadrante actual</div></div></div>
        </div>
        <nav class="anchors" aria-label="Secciones de Inicio">
          <a class="anchor" href="#qhacer">Qué hacer</a>
          <a class="anchor" href="#areas">Mis 4 áreas</a>
          <a class="anchor" href="#novedades">Novedades</a>
        </nav>
      </header>

      <div class="v2-grid">
        <main>
          <section class="card pad alerta" appReveal>
            <span class="sem sem--bad" style="margin-top:5px"></span>
            <div>
              <strong>Vas por debajo del ritmo en {{ u.campana }}.</strong>
              <p class="muted">Proyectas \${{ plan.gananciaProyectada | number }} de \${{ plan.gananciaObjetivo | number }} para tu sueño. Aún puedes recuperar con las acciones de abajo.</p>
            </div>
            <a class="btn btn--soft btn--sm" routerLink="/n/campana">Ver mi plan</a>
          </section>

          <section id="qhacer" class="v2-section" appReveal>
            <h2 class="v2-h"><app-icon name="check" [size]="18" /> Qué hacer esta semana</h2>
            <div class="feed">
              @if (creditos > 0) {
                <a class="feed__item feed__item--urgent card" routerLink="/n/equipo">
                  <span class="feed__ic">💳</span>
                  <div class="feed__body">
                    <strong>{{ creditos }} créditos por aprobar</strong>
                    <span class="tiny">Sin tu aprobación, esas consultoras no pueden pedir. Impacta tu IM.</span>
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

          <section id="areas" class="v2-section" appReveal>
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
          <div class="tiles" appReveal>
            <div class="tile card"><div class="tile__label">Venta GP</div><div class="tile__value">\${{ campana.ventaActual / 1000 | number:'1.0-0' }}k</div><div class="tile__hint">{{ ventaPct }}% del MRM</div></div>
            <div class="tile card"><div class="tile__label">Activas</div><div class="tile__value">31</div><div class="tile__hint">meta 65</div></div>
          </div>

          <a class="card par" routerLink="/n/carrera" appReveal [revealDelay]="60">
            <div class="par__cover">🌴</div>
            <div class="par__body">
              <span class="badge badge--brand">{{ campana.par.nivel }}</span>
              <strong>{{ campana.par.sueno }}</strong>
              <div class="progress" style="margin:8px 0 6px"><div class="progress__fill" [style.width.%]="parPct"></div></div>
              <span class="tiny">{{ parPct }}% del sueño · ver mi progreso →</span>
            </div>
          </a>

          <div class="card pad" appReveal [revealDelay]="120">
            <h3 class="v2-h" style="font-size:15px"><app-icon name="users" [size]="16" /> Mi equipo por trabajar</h3>
            @for (s of equipoTop; track s.label) {
              <a class="row-eq" routerLink="/n/equipo">
                <span class="sem" [class]="'sem--' + tone(s.tone)"></span>
                <span class="row-eq__label">{{ s.label }}</span>
                <strong>{{ s.count }}</strong>
              </a>
            }
          </div>

          <div id="novedades" class="card novedad" appReveal [revealDelay]="160">
            <div class="novedad__video">▶</div>
            <div class="pad">
              <span class="tiny">Novedades · {{ u.campana }}</span>
              <strong>Product Book + Lanzamiento</strong>
            </div>
          </div>
        </aside>
      </div>
    </div>
  `,
  styles: [
    `
      .hero3 { display: flex; gap: 22px; flex-wrap: wrap; margin: 16px 0 4px; }
      .hero3__item { display: flex; align-items: center; gap: 10px; }
      .hero3__item .sem { width: 12px; height: 12px; }
      .hero3__v { font-family: var(--font-display); font-size: 22px; font-weight: 800; line-height: 1; }
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
      .par__cover { height: 96px; display: grid; place-items: center; font-size: 44px; background: linear-gradient(120deg, #0c5566, #0e7490 60%, #1287a8); }
      .par__body { padding: 14px 16px; display: flex; flex-direction: column; gap: 4px; }
      .row-eq { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid var(--line); }
      .row-eq:last-child { border-bottom: 0; }
      .row-eq__label { flex: 1; font-size: 13.5px; }
      .novedad { overflow: hidden; }
      .novedad__video { height: 120px; display: grid; place-items: center; font-size: 26px; color: #fff; background: linear-gradient(120deg, #c2410c, #9a3412); }
    `,
  ],
})
export class InicioN {
  protected readonly u = USUARIA;
  protected readonly nombre = USUARIA.nombre.split(' ')[0];
  protected readonly plan = PLAN_CAMPANA;
  protected readonly campana = CAMPANA;
  protected readonly creditos = CREDITOS_PENDIENTES.length;
  protected readonly ventaPct = Math.round((CAMPANA.ventaActual / CAMPANA.cuadrante.ventaRequerida) * 100);
  protected readonly parPct = Math.round((CAMPANA.par.ventaC6 / CAMPANA.par.metaSueno) * 100);

  protected readonly pendientes = [
    { id: 'a1', emoji: '📞', texto: 'Llama a 5 consultoras por reactivar', impacto: 'Reactivadas +5 · ~$14,000 de venta', ruta: '/n/equipo' },
    { id: 'a2', emoji: '🎯', texto: 'Asegura 2 primeros pedidos antes del cierre', impacto: 'PPED +2 de 4 · acerca el Cuadrante A', ruta: '/n/equipo' },
    { id: 'a3', emoji: '🛍️', texto: 'Pasa tu pedido personal al N1 Gana Más ($400)', impacto: 'Mantienes tu calificación y premios', ruta: '/n/campana' },
  ];

  protected readonly areas = [
    { titulo: 'Mi negocio', icon: 'chart', tone: 'bad', resumen: 'Cuadrante D · IM 4.2% · deuda $3,180', ruta: '/n/negocio' },
    { titulo: 'Mi campaña', icon: 'target', tone: 'warn', resumen: '56% del MRM · 0 de 4 primeros pedidos', ruta: '/n/campana' },
    { titulo: 'Mi equipo', icon: 'users', tone: 'warn', resumen: '31 activas · 3 créditos por aprobar', ruta: '/n/equipo' },
    { titulo: 'Mi carrera', icon: 'star', tone: 'info', resumen: 'PAR+ Estrella 3 · 53% del sueño', ruta: '/n/carrera' },
  ];

  protected readonly equipoTop = SEGMENTOS_GP.filter((s) =>
    ['Reactivar', 'Sin 1er Pedido', 'Deuda'].includes(s.label),
  );

  protected tone(t: string): string {
    return t === 'danger' ? 'bad' : t === 'warning' ? 'warn' : t === 'success' ? 'ok' : 'info';
  }
}
