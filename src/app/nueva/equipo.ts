import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Icon } from '../shared/icon';
import { Reveal } from '../shared/reveal';
import {
  CONSULTORAS,
  CREDITOS_PENDIENTES,
  CreditoPendiente,
  Consultora,
  DIRECTORAS,
  SEGMENTOS_GP,
} from '../data/mock';

/** Mi equipo (gente): GP + filtros + tarjetas de acción, créditos por aprobar,
 *  crecer/incorporar, genealogía de directoras y celebraciones. */
@Component({
  selector: 'app-equipo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, RouterLink, Icon, Reveal],
  template: `
    <div class="v2">
      <header class="v2-head" appReveal>
        <nav class="crumbs tiny"><a routerLink="/n/inicio">Inicio</a> / Mi equipo</nav>
        <h1 class="v2-title">Mi equipo</h1>
        <p class="v2-sub">Tu grupo personal y tus directoras — a quién trabajar esta semana.</p>
        <nav class="anchors" aria-label="Secciones">
          <a class="anchor" href="#trabajar">Por trabajar</a>
          <a class="anchor" href="#creditos">Créditos ({{ pendientes().length }})</a>
          <a class="anchor" href="#consultoras">Consultoras</a>
          <a class="anchor" href="#directoras">Mis directoras</a>
        </nav>
      </header>

      <div class="v2-grid">
        <main>
          <!-- Créditos por aprobar -->
          @if (pendientes().length) {
            <section id="creditos" class="card pad cred v2-section" appReveal>
              <h2 class="v2-h"><app-icon name="wallet" [size]="18" /> Créditos por aprobar ({{ pendientes().length }})</h2>
              <p class="tiny" style="margin:-4px 0 12px">Sin tu aprobación, estas consultoras no pueden pasar pedido. Aprobar un crédito impacta tu IM.</p>
              @for (cr of pendientes(); track cr.codigo) {
                <div class="cred__row">
                  <span class="ava" [style.background]="avatarBg(cr.nombre)">{{ cr.iniciales }}</span>
                  <div class="cred__info"><strong>{{ cr.nombre }}</strong><span class="tiny">Solicita \${{ cr.montoSolicitado | number }} · IM +{{ cr.impactoIM }} pts</span></div>
                  <button class="btn btn--primary btn--sm" (click)="pedirConfirmar(cr)">Aprobar</button>
                </div>
              }
              @if (aprobados()) { <div class="alert alert--info" style="margin-top:8px"><app-icon name="check" [size]="16" /> {{ aprobados() }} crédito(s) aprobado(s) esta sesión.</div> }
            </section>
          }

          <section id="trabajar" class="v2-section" appReveal>
            <h2 class="v2-h"><app-icon name="users" [size]="18" /> A quién trabajar</h2>
            <div class="seg-grid">
              @for (s of segmentos; track s.label) {
                <button class="seg card card--hover" (click)="filtrarPorSegmento(s.label)">
                  <div class="seg__top"><span class="seg__n">{{ s.count }}</span><span class="sem" [class]="'sem--' + sem(s.tone)"></span></div>
                  <strong>{{ s.label }}</strong><span class="tiny">{{ s.hint }}</span>
                </button>
              }
            </div>
          </section>

          <section id="consultoras" class="v2-section" appReveal>
            <h2 class="v2-h"><app-icon name="users" [size]="18" /> Consultoras del GP</h2>
            <div class="chips">
              @for (f of filtros; track f.id) {
                <button class="chip" [class.chip--active]="filtro()===f.id" (click)="filtro.set(f.id)">{{ f.label }}@if (f.id==='credito') { ({{ pendientes().length }}) }</button>
              }
            </div>
            <div class="card lista">
              @for (cn of visibles(); track cn.nombre) {
                <div class="cn">
                  <span class="ava" [style.background]="avatarBg(cn.nombre)">{{ ini(cn.nombre) }}</span>
                  <div class="cn__info"><strong>{{ cn.nombre }}</strong><span class="tiny">{{ cn.nivel }} · {{ estadoLabel(cn.estado) }}</span></div>
                  @if (tieneCredito(cn)) { <span class="badge badge--info">Crédito pendiente</span> }
                  <span class="sem" [class]="'sem--' + estadoSem(cn.estado)"></span>
                </div>
              } @empty { <div class="pad tiny">Sin consultoras en este filtro.</div> }
            </div>
          </section>
        </main>

        <aside class="v2-aside">
          <div class="card pad" appReveal>
            <h3 class="v2-h" style="font-size:15px">🌱 Crecer e incorporar</h3>
            <a class="grow" routerLink="/n/equipo"><span>Incorpora y Gana</span><span class="tiny">~$15 USD por nueva activa · máx 3 campañas →</span></a>
            <a class="grow" routerLink="/n/equipo"><span>Elige Crecer</span><span class="tiny">$50 / $100 / $200 por crecimiento de activas →</span></a>
          </div>

          <div id="directoras" class="card pad" appReveal [revealDelay]="70">
            <h3 class="v2-h" style="font-size:15px"><app-icon name="star" [size]="16" /> Mis directoras</h3>
            <div class="row-between" style="margin-bottom:10px"><span class="tiny">{{ directoras.length }} hijas · {{ pctEnA }}% en Cuadrante A</span><span class="badge" [class]="pctEnA>=60 ? 'badge badge--success':'badge badge--warning'">meta 60%</span></div>
            @for (d of directoras; track d.nombre) {
              <div class="dir">
                <span class="ava ava--sm" [style.background]="avatarBg(d.nombre)">{{ d.iniciales }}</span>
                <div class="dir__info"><strong>{{ d.nombre }}</strong><span class="tiny">{{ d.estatus }} · GP \${{ d.ventaGP/1000 | number:'1.0-0' }}k</span></div>
                <span class="qbadge" [class]="'qbadge--' + d.cuadrante.toLowerCase()">{{ d.cuadrante }}</span>
              </div>
            }
          </div>

          <div class="card pad" appReveal [revealDelay]="130">
            <h3 class="v2-h" style="font-size:15px">🎉 Celebraciones</h3>
            <span class="tiny">12 esta campaña — cumpleaños y logros. Reconocer sostiene la actividad.</span>
          </div>
        </aside>
      </div>
    </div>

    <!-- Confirmación de aprobación de crédito (acción financiera sensible) -->
    @if (confirmando(); as cr) {
      <div class="scrim" (click)="confirmando.set(null)"></div>
      <div class="confirm card" role="dialog" aria-modal="true" aria-label="Confirmar aprobación de crédito">
        <h3>Aprobar crédito</h3>
        <p class="muted">Vas a aprobar el crédito de <strong>{{ cr.nombre }}</strong>.</p>
        <div class="confirm__kv"><span>Monto</span><strong>\${{ cr.montoSolicitado | number }}</strong></div>
        <div class="confirm__kv"><span>Impacto en tu IM</span><strong class="warn">+{{ cr.impactoIM }} pts</strong></div>
        <div class="alert alert--warning"><app-icon name="alert" [size]="16" /> Habilita su pedido, pero sube tu índice de morosidad. Revisa antes de confirmar.</div>
        <div class="confirm__actions">
          <button class="btn btn--ghost" (click)="confirmando.set(null)">Cancelar</button>
          <button class="btn btn--primary" (click)="aprobar(cr)">Confirmar aprobación</button>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .crumbs { margin-bottom: 6px; } .crumbs a { color: var(--ink-2); }
      .pad { padding: 18px 20px; }
      .row-between { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
      .ava { width: 38px; height: 38px; border-radius: 99px; display: grid; place-items: center; color: #fff; font-weight: 700; font-size: 13px; flex-shrink: 0; }
      .ava--sm { width: 32px; height: 32px; font-size: 11.5px; }
      .cred { border-color: var(--brand-500); }
      .cred__row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--line); }
      .cred__row:last-of-type { border-bottom: 0; }
      .cred__info { flex: 1; display: flex; flex-direction: column; gap: 1px; }
      .btn--sm { padding: 8px 16px; font-size: 13px; }
      .seg-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
      .seg { display: flex; flex-direction: column; gap: 4px; padding: 14px; text-align: left; background: var(--surface); }
      .seg__top { display: flex; align-items: center; justify-content: space-between; }
      .seg__n { font-family: var(--font-display); font-size: 24px; font-weight: 800; }
      .chips { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
      .lista { display: flex; flex-direction: column; }
      .cn { display: flex; align-items: center; gap: 12px; padding: 11px 16px; border-bottom: 1px solid var(--line); }
      .cn:last-child { border-bottom: 0; }
      .cn__info { flex: 1; display: flex; flex-direction: column; gap: 1px; }
      .grow { display: flex; flex-direction: column; gap: 2px; padding: 11px 0; border-bottom: 1px solid var(--line); }
      .grow:last-child { border-bottom: 0; }
      .grow span:first-child { font-weight: 700; font-size: 14px; }
      .dir { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--line); }
      .dir:last-child { border-bottom: 0; }
      .dir__info { flex: 1; display: flex; flex-direction: column; gap: 1px; }
      .qbadge { width: 26px; height: 26px; border-radius: 7px; display: grid; place-items: center; font-weight: 800; font-size: 12px; }
      .qbadge--a { background: var(--success-bg); color: var(--success); }
      .qbadge--c { background: var(--warning-bg); color: var(--warning); }
      .qbadge--d { background: var(--danger-bg); color: var(--danger); }
      .qbadge--b { background: var(--brand-100); color: var(--brand-700); }
      .warn { color: var(--warning); }
      .scrim { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 70; }
      .confirm { position: fixed; z-index: 71; top: 50%; left: 50%; transform: translate(-50%,-50%); width: min(420px, 92vw); padding: 22px; box-shadow: var(--shadow-l); }
      .confirm h3 { font-size: 19px; margin: 0 0 6px; }
      .confirm__kv { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px solid var(--line); font-size: 14px; }
      .confirm__actions { display: flex; gap: 10px; margin-top: 16px; }
      .confirm__actions .btn { flex: 1; }
      @media (max-width: 720px) { .seg-grid { grid-template-columns: 1fr 1fr; } }
    `,
  ],
})
export class Equipo {
  protected readonly segmentos = SEGMENTOS_GP;
  protected readonly directoras = DIRECTORAS;
  protected readonly pendientes = signal<CreditoPendiente[]>([...CREDITOS_PENDIENTES]);
  protected readonly confirmando = signal<CreditoPendiente | null>(null);
  protected readonly aprobados = signal(0);
  protected readonly filtro = signal<string>('todas');

  protected readonly filtros = [
    { id: 'todas', label: 'Todas' },
    { id: 'activa', label: 'Activas' },
    { id: 'riesgo', label: 'Por reactivar' },
    { id: 'deuda', label: 'Con deuda' },
    { id: 'nueva', label: 'Nuevas' },
    { id: 'credito', label: 'Crédito pendiente' },
  ];

  protected readonly pctEnA = Math.round(
    (DIRECTORAS.filter((d) => d.cuadrante === 'A').length / DIRECTORAS.length) * 100,
  );

  private readonly nombresPendientes = computed(() => new Set(this.pendientes().map((c) => c.nombre.split(' ')[0])));

  protected readonly visibles = computed<Consultora[]>(() => {
    const f = this.filtro();
    if (f === 'todas') return CONSULTORAS;
    if (f === 'credito') return CONSULTORAS.filter((c) => this.tieneCredito(c));
    return CONSULTORAS.filter((c) => c.estado === f);
  });

  protected tieneCredito(c: Consultora): boolean {
    return this.nombresPendientes().has(c.nombre.split(' ')[0]);
  }

  protected pedirConfirmar(cr: CreditoPendiente): void {
    this.confirmando.set(cr);
  }
  protected aprobar(cr: CreditoPendiente): void {
    this.pendientes.set(this.pendientes().filter((c) => c.codigo !== cr.codigo));
    this.aprobados.set(this.aprobados() + 1);
    this.confirmando.set(null);
  }

  protected filtrarPorSegmento(label: string): void {
    const map: Record<string, string> = {
      Reactivar: 'riesgo', Deuda: 'deuda', Activas: 'activa', 'Sin 1er Pedido': 'nueva',
    };
    this.filtro.set(map[label] ?? 'todas');
    document.getElementById('consultoras')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  protected ini(nombre: string): string {
    const p = nombre.split(' ');
    return ((p[0]?.[0] ?? '') + (p[1]?.[0] ?? '')).toUpperCase();
  }
  protected avatarBg(nombre: string): string {
    const grads = [
      'linear-gradient(135deg,#c2410c,#9a3412)', 'linear-gradient(135deg,#0e7490,#0c5566)',
      'linear-gradient(135deg,#7c3aed,#4c2a59)', 'linear-gradient(135deg,#157347,#0f5132)',
      'linear-gradient(135deg,#be185d,#831843)',
    ];
    let h = 0;
    for (const ch of nombre) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return grads[h % grads.length];
  }
  protected sem(t: string): string {
    return t === 'danger' ? 'bad' : t === 'warning' ? 'warn' : t === 'success' ? 'ok' : 'info';
  }
  protected estadoSem(e: string): string {
    return e === 'activa' ? 'ok' : e === 'deuda' ? 'bad' : e === 'nueva' ? 'info' : 'warn';
  }
  protected estadoLabel(e: string): string {
    return { activa: 'Activa', riesgo: 'Por reactivar', nueva: 'Nueva', deuda: 'Con deuda' }[e] ?? e;
  }
}
