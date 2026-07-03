import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Icon } from '../shared/icon';
import { Ring } from '../shared/ring';
import { Reveal } from '../shared/reveal';
import {
  CAMPANA,
  CONSULTORAS,
  CREDITOS_PENDIENTES,
  CreditoPendiente,
  Consultora,
  DIRECTORAS,
  Directora,
  SEGMENTOS_GP,
} from '../data/mock';

/**
 * Mi equipo (gente). Reúne a toda la gente de la Líder en DOS grupos bajo un toggle:
 *  · Mi Grupo Personal = tus consultoras (CNS/CEM/CES/ASP) + su crédito (lo apruebas tú).
 *  · Mis Directoras     = tu red de liderazgo (genealogía); cada una es empresaria
 *                         independiente → aquí NO hay aprobación de créditos. Persona al
 *                         centro: cada directora aparece una vez y las lentes reordenan
 *                         la misma lista. Reutiliza identidad y componentes del repo.
 */
@Component({
  selector: 'app-equipo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, RouterLink, Icon, Ring, Reveal],
  template: `
    <div class="v2">
      <header class="v2-head" appReveal>
        <nav class="crumbs tiny"><a routerLink="/n/inicio">Inicio</a> / Mi equipo</nav>
        <h1 class="v2-title">Mi equipo</h1>
        <p class="v2-sub">Tu gente directa y tu red de liderazgo — a quién trabajar esta semana.</p>
        <div class="grupo-toggle" role="tablist" aria-label="Grupos de Mi equipo">
          <button
            role="tab"
            [attr.aria-selected]="grupo() === 'gp'"
            [class.on]="grupo() === 'gp'"
            (click)="grupo.set('gp')"
          >
            <app-icon name="users" [size]="16" /> Mi Grupo Personal
          </button>
          <button
            role="tab"
            [attr.aria-selected]="grupo() === 'dir'"
            [class.on]="grupo() === 'dir'"
            (click)="grupo.set('dir')"
          >
            <app-icon name="star" [size]="16" /> Mis Directoras
          </button>
        </div>
      </header>

      <!-- ========================= GRUPO 1 · MI GRUPO PERSONAL ========================= -->
      @if (grupo() === 'gp') {
        <div class="gp-ind" appReveal>
          <div class="tile card">
            <div class="tile__top">
              <span class="tile__label">Activas</span><span class="sem sem--ok"></span>
            </div>
            <div class="tile__value">
              {{ gpActivas }}<span class="muted" style="font-size:15px">/{{ gpMeta }}</span>
            </div>
            <div class="tile__hint">activas del GP esta campaña</div>
          </div>
          <div class="tile card">
            <div class="tile__top">
              <span class="tile__label">En riesgo</span><span class="sem sem--warn"></span>
            </div>
            <div class="tile__value">{{ gpEnRiesgo }}</div>
            <div class="tile__hint">por reactivar o con deuda</div>
          </div>
          <div class="tile card">
            <div class="tile__top">
              <span class="tile__label">Créditos</span
              ><span class="sem" [class]="pendientes().length ? 'sem--bad' : 'sem--ok'"></span>
            </div>
            <div class="tile__value">{{ pendientes().length }}</div>
            <div class="tile__hint">por aprobar</div>
          </div>
        </div>

        <div class="v2-grid">
          <main>
            @if (pendientes().length) {
              <section class="card pad cred v2-section" appReveal>
                <h2 class="v2-h">
                  <app-icon name="wallet" [size]="18" /> Créditos por aprobar ({{
                    pendientes().length
                  }})
                </h2>
                <p class="tiny" style="margin:-4px 0 12px">
                  Es crédito a <strong>tus</strong> consultoras: sin tu aprobación no pueden pasar
                  pedido, y aprobar suma a tu deuda GP (IM).
                </p>
                @for (cr of pendientes(); track cr.codigo) {
                  <div class="cred__row">
                    <span class="ava" [style.background]="avatarBg(cr.nombre)">{{
                      cr.iniciales
                    }}</span>
                    <div class="cred__info">
                      <strong>{{ cr.nombre }}</strong
                      ><span class="tiny"
                        >Solicita \${{ cr.montoSolicitado | number }} · IM +{{
                          cr.impactoIM
                        }}
                        pts</span
                      >
                    </div>
                    <button class="btn btn--primary btn--sm" (click)="pedirConfirmar(cr)">
                      Aprobar
                    </button>
                  </div>
                }
                @if (aprobados()) {
                  <div class="alert alert--info" style="margin-top:8px">
                    <app-icon name="check" [size]="16" /> {{ aprobados() }} crédito(s) aprobado(s)
                    esta sesión.
                  </div>
                }
              </section>
            }

            <section class="v2-section" appReveal>
              <h2 class="v2-h"><app-icon name="users" [size]="18" /> Acciones del grupo</h2>
              <div class="seg-grid">
                @for (s of acciones; track s.label) {
                  <button class="seg card card--hover" (click)="filtrarPorSegmento(s.label)">
                    <div class="seg__top">
                      <span class="seg__n">{{ s.count }}</span
                      ><span class="sem" [class]="'sem--' + sem(s.tone)"></span>
                    </div>
                    <strong>{{ s.label }}</strong
                    ><span class="tiny">{{ s.hint }}</span>
                  </button>
                }
              </div>
            </section>

            <section id="consultoras" class="v2-section" appReveal>
              <h2 class="v2-h"><app-icon name="users" [size]="18" /> Consultoras del GP</h2>
              <input
                class="search"
                type="search"
                [value]="q()"
                (input)="q.set($any($event.target).value)"
                placeholder="Buscar consultora…"
                aria-label="Buscar consultora"
              />
              <div class="chips">
                @for (f of filtros; track f.id) {
                  <button
                    class="chip"
                    [class.chip--active]="filtro() === f.id"
                    (click)="filtro.set(f.id)"
                  >
                    {{ f.label }}
                    @if (f.id === 'credito') {
                      ({{ pendientes().length }})
                    }
                  </button>
                }
              </div>
              <div class="card lista">
                @for (cn of visibles(); track cn.nombre) {
                  <div class="cn">
                    <span class="ava" [style.background]="avatarBg(cn.nombre)">{{
                      ini(cn.nombre)
                    }}</span>
                    <div class="cn__info">
                      <strong>{{ cn.nombre }}</strong>
                      <span class="tiny"
                        >{{ cn.nivel }} · personal \${{ cn.ventaPersonal | number }}
                        @if (cn.ventaGrupal) {
                          · grupal \${{ cn.ventaGrupal | number }}
                        }
                      </span>
                    </div>
                    <div class="cn__tags">
                      @if (cn.estado === 'deuda') {
                        <span class="badge badge--danger">Deuda</span>
                      }
                      @if (cn.estado === 'nueva') {
                        <span class="badge badge--violet">Nueva</span>
                      }
                      @if (tieneCredito(cn)) {
                        <span class="badge badge--info">Crédito pend.</span>
                      }
                    </div>
                    <span class="sem" [class]="'sem--' + estadoSem(cn.estado)"></span>
                  </div>
                } @empty {
                  <div class="pad tiny">Sin consultoras en este filtro.</div>
                }
              </div>
            </section>
          </main>

          <aside class="v2-aside">
            <div class="card pad" appReveal>
              <h3 class="v2-h" style="font-size:15px">
                <img class="h-ill" src="icons/growth.png" alt="" /> Crecer e incorporar
              </h3>
              <a class="grow" routerLink="/n/equipo"
                ><span>Incorpora y Gana</span
                ><span class="tiny">~$15 USD por nueva activa · máx 3 campañas →</span></a
              >
              <a class="grow" routerLink="/n/equipo"
                ><span>Elige Crecer</span
                ><span class="tiny">$50 / $100 / $200 por crecimiento de activas →</span></a
              >
              <p class="tiny" style="margin:10px 0 0">
                Los prospectos <strong>Incorporables</strong> se gestionan en la vista Incorporar.
              </p>
            </div>
            <div class="card pad" appReveal [revealDelay]="80">
              <h3 class="v2-h" style="font-size:15px">🎉 Celebraciones</h3>
              <span class="tiny"
                >12 esta campaña — cumpleaños y logros. Reconocer sostiene la actividad.</span
              >
            </div>
          </aside>
        </div>
      }

      <!-- ========================= GRUPO 2 · MIS DIRECTORAS ========================= -->
      @if (grupo() === 'dir') {
        <!-- Resumen visual (arriba): liderazgo, distribución y genealogía -->
        <section class="card pad v2-section" appReveal>
          <div class="resumen">
            <div class="resumen__ring">
              <app-ring [pct]="pctHijasA" [size]="104" label="hijas en A" [expected]="60" />
              <span class="tiny" [class.bad]="pctHijasA < 60"
                >{{ pctHijasA }}% · meta 60% (Medalla de Liderazgo)</span
              >
            </div>
            <div class="resumen__dist">
              <span class="tiny" style="font-weight:700"
                >Distribución por cuadrante · {{ directoras.length }} directoras</span
              >
              <div
                class="dist-bar"
                role="img"
                [attr.aria-label]="
                  'A ' + dist.A + ', B ' + dist.B + ', C ' + dist.C + ', D ' + dist.D
                "
              >
                @for (q of dist.partes; track q.k) {
                  @if (q.n) {
                    <span
                      class="dist-bar__seg"
                      [class]="'dist-bar__seg--' + q.k.toLowerCase()"
                      [style.flex]="q.n"
                      >{{ q.k }} {{ q.n }}</span
                    >
                  }
                }
              </div>
              <div class="gen-counts">
                <span
                  ><strong>{{ gen[1] }}</strong> hijas</span
                >
                <span
                  ><strong>{{ gen[2] }}</strong> nietas</span
                >
                <span
                  ><strong>{{ gen[3] }}</strong> bisnietas</span
                >
              </div>
            </div>
          </div>
        </section>

        <!-- Lentes: reordenan/recolorean la MISMA lista -->
        <div class="lentes chips" appReveal role="tablist" aria-label="Lente de la lista">
          @for (l of lentes; track l.id) {
            <button
              class="chip"
              role="tab"
              [attr.aria-selected]="lente() === l.id"
              [class.chip--active]="lente() === l.id"
              (click)="lente.set(l.id)"
            >
              {{ l.label }}
            </button>
          }
        </div>
        <p class="tiny lente-hint" appReveal>{{ lenteHint() }}</p>

        <!-- Lista única de directoras (orden según la lente) -->
        <div class="card lista dir-lista v2-section" appReveal>
          @for (d of principales(); track d.nombre) {
            <div class="dir-row" [class.dir-row--open]="abierta() === d.nombre">
              <button
                class="dir-row__head"
                [attr.aria-expanded]="abierta() === d.nombre"
                (click)="toggle(d.nombre)"
              >
                <span class="sem" [class]="'sem--' + semDir(d.cuadrante)"></span>
                <span class="ava" [style.background]="avatarBg(d.nombre)">{{ d.iniciales }}</span>
                <span class="dir-row__info">
                  <strong
                    >{{ d.nombre }} <span class="gen">{{ genLabel(d.generacion) }}</span></strong
                  >
                  <span class="tiny">{{ sub(d) }}</span>
                </span>
                <span class="qbadge" [class]="'qbadge--' + d.cuadrante.toLowerCase()">{{
                  d.cuadrante
                }}</span>
                <app-icon name="chevron-right" [size]="18" class="dir-row__chev" />
              </button>

              <!-- Perfil expandible: las 4 dimensiones juntas (2×2) + acción -->
              @if (abierta() === d.nombre) {
                <div class="dir-profile">
                  <div class="dim-grid">
                    <div class="dim">
                      <span class="dim__h"><app-icon name="chart" [size]="14" /> Cuadrante</span>
                      <div class="dim__row">
                        <span class="qbadge" [class]="'qbadge--' + d.cuadrante.toLowerCase()">{{
                          d.cuadrante
                        }}</span
                        ><span class="tiny">{{
                          d.cuadrante === 'A' ? 'En Crecimiento — cumple MRM + PPED' : d.faltaA
                        }}</span>
                      </div>
                    </div>

                    <div class="dim">
                      <span class="dim__h"
                        ><app-icon name="target" [size]="14" /> Metas · proyección vs avance</span
                      >
                      @for (m of metasArr(d); track m.label) {
                        <div class="mp">
                          <span class="mp__l">{{ m.label }}</span>
                          <div class="progress" [class.progress--success]="m.real >= m.meta">
                            <div
                              class="progress__fill"
                              [style.width.%]="ratio(m.real, m.meta)"
                            ></div>
                          </div>
                          <span class="mp__v"
                            >{{ m.dinero ? '$' : '' }}{{ m.real | number
                            }}<span class="muted"
                              >/{{ m.dinero ? '$' : '' }}{{ m.meta | number }}</span
                            ></span
                          >
                        </div>
                      }
                    </div>

                    <div class="dim">
                      <span class="dim__h"
                        ><app-icon name="users" [size]="14" /> Emprendedoras</span
                      >
                      <div class="dim__row">
                        <span class="empr-n"
                          ><strong>{{ d.emprendedoras.cem }}</strong> CEM ·
                          <strong>{{ d.emprendedoras.ces }}</strong> CES</span
                        >
                      </div>
                      <span class="tiny"
                        >{{ d.emprendedoras.nota }} · crecimiento por venta/IM/PPED/activas (últ. 4
                        campañas)</span
                      >
                      @if (d.emprendedoras.ces === 0) {
                        <span class="badge badge--warning" style="margin-top:6px"
                          >Falta formar CES</span
                        >
                      }
                    </div>

                    <div class="dim">
                      <span class="dim__h"><app-icon name="star" [size]="14" /> PAR+</span>
                      <div class="dim__row par-row">
                        <span class="par-est">{{
                          d.par.proyectada ? '★'.repeat(d.par.proyectada) : '—'
                        }}</span
                        ><span class="tiny"
                          >Proyecta
                          {{ d.par.proyectada ? 'Estrella ' + d.par.proyectada : 'sin proyección' }}
                          · Sueño Estrella {{ d.par.sueno }}</span
                        >
                      </div>
                      <span class="tiny">{{ d.par.falta }}</span>
                    </div>
                  </div>
                  <div class="dim__act">
                    <button class="btn btn--primary btn--sm">
                      <app-icon name="users" [size]="15" /> Agendar coaching
                    </button>
                    <button class="btn btn--soft btn--sm">Ver perfil completo</button>
                  </div>
                </div>
              }
            </div>
          }

          <!-- Las sanas (Cuadrante A) van compactas al final en la lente Prioridad -->
          @if (sanas().length) {
            <div class="sanas">
              <span class="tiny" style="font-weight:700"
                >En Cuadrante A — sanas ({{ sanas().length }})</span
              >
              <div class="sanas__chips">
                @for (d of sanas(); track d.nombre) {
                  <button class="sana-chip" (click)="grupo.set('dir'); abrirEn(d.nombre)">
                    <span class="sem sem--ok"></span>{{ d.nombre }}
                    <span class="gen">{{ genLabel(d.generacion) }}</span>
                  </button>
                }
              </div>
            </div>
          }
        </div>

        <p class="tiny dir-foot" appReveal>
          Cada directora es <strong>empresaria independiente</strong> y gestiona el crédito de su
          propio grupo: por eso aquí no apruebas créditos. Su Cuadrante y PAR+ son de ella — los
          tuyos viven en <a routerLink="/n/negocio">Mi negocio</a> y
          <a routerLink="/n/carrera">Mi carrera</a>.
        </p>
      }
    </div>

    <!-- Confirmación de aprobación de crédito (acción financiera sensible, solo en GP) -->
    @if (confirmando(); as cr) {
      <div class="scrim" (click)="confirmando.set(null)"></div>
      <div
        class="confirm card"
        role="dialog"
        aria-modal="true"
        aria-label="Confirmar aprobación de crédito"
      >
        <h3>Aprobar crédito</h3>
        <p class="muted">
          Vas a aprobar el crédito de <strong>{{ cr.nombre }}</strong
          >.
        </p>
        <div class="confirm__kv">
          <span>Monto</span><strong>\${{ cr.montoSolicitado | number }}</strong>
        </div>
        <div class="confirm__kv">
          <span>Impacto en tu IM</span><strong class="warn">+{{ cr.impactoIM }} pts</strong>
        </div>
        <div class="alert alert--warning">
          <app-icon name="alert" [size]="16" /> Habilita su pedido, pero sube tu índice de
          morosidad. Revisa antes de confirmar.
        </div>
        <div class="confirm__actions">
          <button class="btn btn--ghost" (click)="confirmando.set(null)">Cancelar</button>
          <button class="btn btn--primary" (click)="aprobar(cr)">Confirmar aprobación</button>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .crumbs {
        margin-bottom: 6px;
      }
      .crumbs a {
        color: var(--ink-2);
      }
      .pad {
        padding: 18px 20px;
      }
      .h-ill {
        width: 22px;
        height: 22px;
        object-fit: contain;
      }
      .bad {
        color: var(--danger);
      }

      /* Toggle de los dos grupos */
      .grupo-toggle {
        display: inline-flex;
        gap: 4px;
        margin-top: 14px;
        padding: 4px;
        border-radius: 99px;
        background: var(--sand);
        border: 1px solid var(--line);
      }
      .grupo-toggle button {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        border: 0;
        background: transparent;
        color: var(--ink-2);
        font-weight: 700;
        font-size: 13.5px;
        padding: 9px 18px;
        border-radius: 99px;
        transition: all 0.15s ease;
      }
      .grupo-toggle button.on {
        background: var(--ink);
        color: var(--on-ink);
      }

      /* Indicadores GP */
      .gp-ind {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        margin-bottom: 22px;
      }

      .ava {
        width: 38px;
        height: 38px;
        border-radius: 99px;
        display: grid;
        place-items: center;
        color: #fff;
        font-weight: 700;
        font-size: 13px;
        flex-shrink: 0;
      }
      .cred {
        border-color: var(--brand-500);
      }
      .cred__row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 0;
        border-bottom: 1px solid var(--line);
      }
      .cred__row:last-of-type {
        border-bottom: 0;
      }
      .cred__info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 1px;
      }
      .btn--sm {
        padding: 8px 16px;
        font-size: 13px;
      }

      .seg-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
      }
      .seg {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 14px;
        text-align: left;
        background: var(--surface);
      }
      .seg__top {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .seg__n {
        font-family: var(--font-display);
        font-size: 24px;
        font-weight: 800;
      }

      .search {
        width: 100%;
        margin-bottom: 12px;
        padding: 11px 16px;
        border-radius: var(--radius-s);
        border: 1px solid var(--line-strong);
        background: var(--surface);
        color: var(--ink);
        font-size: 14px;
        font-family: inherit;
      }
      .search::placeholder {
        color: var(--ink-3);
      }
      .chips {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 12px;
      }
      .lista {
        display: flex;
        flex-direction: column;
      }
      .cn {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 11px 16px;
        border-bottom: 1px solid var(--line);
      }
      .cn:last-child {
        border-bottom: 0;
      }
      .cn__info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 1px;
        min-width: 0;
      }
      .cn__tags {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }
      .grow {
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 11px 0;
        border-bottom: 1px solid var(--line);
      }
      .grow:last-of-type {
        border-bottom: 0;
      }
      .grow span:first-child {
        font-weight: 700;
        font-size: 14px;
      }

      /* Resumen visual de Directoras */
      .resumen {
        display: flex;
        gap: 26px;
        align-items: center;
        flex-wrap: wrap;
      }
      .resumen__ring {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        text-align: center;
      }
      .resumen__dist {
        flex: 1;
        min-width: 240px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .dist-bar {
        display: flex;
        gap: 4px;
        height: 30px;
      }
      .dist-bar__seg {
        display: grid;
        place-items: center;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 800;
        color: #fff;
        min-width: 38px;
      }
      .dist-bar__seg--a {
        background: var(--fill-success);
      }
      .dist-bar__seg--b {
        background: var(--fill-brand);
      }
      .dist-bar__seg--c {
        background: #8a5a13;
      }
      .dist-bar__seg--d {
        background: var(--fill-danger);
      }
      .gen-counts {
        display: flex;
        gap: 18px;
      }
      .gen-counts span {
        font-size: 12.5px;
        color: var(--ink-2);
      }
      .gen-counts strong {
        font-family: var(--font-display);
        font-size: 18px;
        color: var(--ink);
        margin-right: 3px;
      }

      .lentes {
        margin-bottom: 4px;
      }
      .lente-hint {
        margin: 0 0 14px;
      }

      /* Lista única de directoras (filas expandibles) */
      .dir-lista {
        overflow: hidden;
      }
      .dir-row {
        border-bottom: 1px solid var(--line);
      }
      .dir-row:last-child {
        border-bottom: 0;
      }
      .dir-row__head {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: transparent;
        border: 0;
        text-align: left;
      }
      .dir-row__head:hover {
        background: var(--sand);
      }
      .dir-row__info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 1px;
        min-width: 0;
      }
      .dir-row__info strong {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .gen {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--ink-2);
        background: var(--sand);
        border-radius: 99px;
        padding: 2px 8px;
      }
      .qbadge {
        width: 26px;
        height: 26px;
        border-radius: 7px;
        display: grid;
        place-items: center;
        font-weight: 800;
        font-size: 12px;
        flex-shrink: 0;
      }
      .qbadge--a {
        background: var(--success-bg);
        color: var(--success);
      }
      .qbadge--c {
        background: var(--warning-bg);
        color: var(--warning);
      }
      .qbadge--d {
        background: var(--danger-bg);
        color: var(--danger);
      }
      .qbadge--b {
        background: var(--brand-100);
        color: var(--brand-700);
      }
      .dir-row__chev {
        color: var(--ink-3);
        transition: transform 0.2s ease;
        flex-shrink: 0;
      }
      .dir-row--open .dir-row__chev {
        transform: rotate(90deg);
      }

      /* Perfil expandible: 4 dimensiones 2×2 */
      .dir-profile {
        padding: 4px 16px 18px 50px;
      }
      .dim-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .dim {
        background: var(--sand);
        border-radius: var(--radius-s);
        padding: 12px 14px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .dim__h {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--ink-2);
      }
      .dim__row {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .empr-n strong {
        font-family: var(--font-display);
        font-size: 17px;
      }
      .par-est {
        color: var(--brand-600);
        font-size: 15px;
        letter-spacing: 1px;
      }
      .mp {
        display: grid;
        grid-template-columns: 96px 1fr auto;
        align-items: center;
        gap: 10px;
      }
      .mp__l {
        font-size: 12px;
        color: var(--ink-2);
      }
      .mp__v {
        font-size: 11.5px;
        white-space: nowrap;
      }
      .dim__act {
        display: flex;
        gap: 10px;
        margin-top: 12px;
        flex-wrap: wrap;
      }

      /* Sanas (Cuadrante A) compactas */
      .sanas {
        padding: 14px 16px;
        background: var(--sand);
      }
      .sanas__chips {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-top: 8px;
      }
      .sana-chip {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        border-radius: 99px;
        border: 1px solid var(--success);
        background: var(--success-bg);
        color: var(--success);
        font-size: 12.5px;
        font-weight: 700;
        padding: 6px 12px;
      }
      .sana-chip .gen {
        background: transparent;
        color: var(--success);
        padding: 0;
      }

      .dir-foot {
        margin: 14px 2px 0;
        line-height: 1.6;
      }
      .dir-foot a {
        color: var(--brand-600);
        font-weight: 700;
      }
      .warn {
        color: var(--warning);
      }

      /* Diálogo de confirmación */
      .scrim {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 70;
      }
      .confirm {
        position: fixed;
        z-index: 71;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: min(420px, 92vw);
        padding: 22px;
        box-shadow: var(--shadow-l);
      }
      .confirm h3 {
        font-size: 19px;
        margin: 0 0 6px;
      }
      .confirm__kv {
        display: flex;
        justify-content: space-between;
        padding: 7px 0;
        border-bottom: 1px solid var(--line);
        font-size: 14px;
      }
      .confirm__actions {
        display: flex;
        gap: 10px;
        margin-top: 16px;
      }
      .confirm__actions .btn {
        flex: 1;
      }

      @media (max-width: 720px) {
        .seg-grid {
          grid-template-columns: 1fr 1fr;
        }
        .gp-ind {
          grid-template-columns: 1fr;
        }
        .dim-grid {
          grid-template-columns: 1fr;
        }
        .dir-profile {
          padding-left: 16px;
        }
        .mp {
          grid-template-columns: 84px 1fr auto;
        }
        /* Chips (filtros/lentes) deslizables, sin wrap */
        .chips {
          flex-wrap: nowrap;
          overflow-x: auto;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
        .chips::-webkit-scrollbar {
          display: none;
        }
        .chip {
          flex: 0 0 auto;
        }
      }
    `,
  ],
})
export class Equipo {
  // ----- estado -----
  protected readonly grupo = signal<'gp' | 'dir'>('gp');
  protected readonly lente = signal<'prioridad' | 'cuadrante' | 'metas' | 'empr' | 'par'>(
    'prioridad',
  );
  protected readonly abierta = signal<string | null>(null);
  protected readonly q = signal('');
  protected readonly filtro = signal<string>('todas');
  protected readonly pendientes = signal<CreditoPendiente[]>([...CREDITOS_PENDIENTES]);
  protected readonly confirmando = signal<CreditoPendiente | null>(null);
  protected readonly aprobados = signal(0);

  // ----- Grupo Personal -----
  protected readonly gpActivas = CAMPANA.activas.total;
  protected readonly gpMeta = CAMPANA.activas.meta;
  protected readonly gpEnRiesgo =
    (SEGMENTOS_GP.find((s) => s.label === 'Reactivar')?.count ?? 0) +
    (SEGMENTOS_GP.find((s) => s.label === 'Deuda')?.count ?? 0);
  /** Acciones del grupo — los Incorporables se gestionan en la vista Incorporar. */
  protected readonly acciones = SEGMENTOS_GP.filter((s) => s.label !== 'Incorporables');

  protected readonly filtros = [
    { id: 'todas', label: 'Todas' },
    { id: 'activa', label: 'Activas' },
    { id: 'riesgo', label: 'En riesgo' },
    { id: 'nueva', label: 'Nuevas' },
    { id: 'deuda', label: 'Con deuda' },
    { id: 'credito', label: 'Crédito pendiente' },
  ];

  private readonly nombresPendientes = computed(
    () => new Set(this.pendientes().map((c) => c.nombre.split(' ')[0])),
  );

  protected readonly visibles = computed<Consultora[]>(() => {
    const f = this.filtro();
    const q = this.q().trim().toLowerCase();
    let arr = CONSULTORAS;
    if (f === 'credito') arr = arr.filter((c) => this.tieneCredito(c));
    else if (f !== 'todas') arr = arr.filter((c) => c.estado === f);
    if (q) arr = arr.filter((c) => c.nombre.toLowerCase().includes(q));
    return arr;
  });

  // ----- Directoras -----
  protected readonly directoras = DIRECTORAS;
  private readonly hijas = DIRECTORAS.filter((d) => d.generacion === 1);
  protected readonly pctHijasA = Math.round(
    (this.hijas.filter((d) => d.cuadrante === 'A').length / this.hijas.length) * 100,
  );
  protected readonly gen: Record<number, number> = {
    1: DIRECTORAS.filter((d) => d.generacion === 1).length,
    2: DIRECTORAS.filter((d) => d.generacion === 2).length,
    3: DIRECTORAS.filter((d) => d.generacion === 3).length,
  };
  protected readonly dist = (() => {
    const c = (k: string) => DIRECTORAS.filter((d) => d.cuadrante === k).length;
    const A = c('A'),
      B = c('B'),
      C = c('C'),
      D = c('D');
    return {
      A,
      B,
      C,
      D,
      partes: [
        { k: 'A', n: A },
        { k: 'B', n: B },
        { k: 'C', n: C },
        { k: 'D', n: D },
      ],
    };
  })();

  protected readonly lentes = [
    { id: 'prioridad', label: 'Prioridad' },
    { id: 'cuadrante', label: 'Cuadrante' },
    { id: 'metas', label: 'Metas' },
    { id: 'empr', label: 'Emprendedoras' },
    { id: 'par', label: 'PAR+' },
  ] as const;

  protected lenteHint(): string {
    return {
      prioridad:
        'Primero quién necesita ayuda (D → C → B → A); las sanas en A, compactas al final.',
      cuadrante: 'Agrupadas por cuadrante: A · B · C · D.',
      metas: 'Ordenadas por % de cumplimiento de su proyección — las más atrasadas primero.',
      empr: 'Primero quién aún no tiene CEM/CES a cargo.',
      par: 'Ordenadas por cuánto le falta a su Estrella Sueño.',
    }[this.lente()];
  }

  private readonly ordenadas = computed<Directora[]>(() => {
    const arr = [...DIRECTORAS];
    const rank: Record<string, number> = { D: 0, C: 1, B: 2, A: 3 };
    switch (this.lente()) {
      case 'prioridad':
        arr.sort(
          (a, b) =>
            rank[a.cuadrante] - rank[b.cuadrante] ||
            (this.sinEmpr(a) ? 0 : 1) - (this.sinEmpr(b) ? 0 : 1),
        );
        break;
      case 'cuadrante':
        arr.sort((a, b) => 'ABCD'.indexOf(a.cuadrante) - 'ABCD'.indexOf(b.cuadrante));
        break;
      case 'metas':
        arr.sort((a, b) => this.cumpl(a) - this.cumpl(b));
        break;
      case 'empr':
        arr.sort(
          (a, b) =>
            (this.sinEmpr(b) ? 1 : 0) - (this.sinEmpr(a) ? 1 : 0) ||
            a.emprendedoras.cem + a.emprendedoras.ces - (b.emprendedoras.cem + b.emprendedoras.ces),
        );
        break;
      case 'par':
        arr.sort((a, b) => b.par.sueno - b.par.proyectada - (a.par.sueno - a.par.proyectada));
        break;
    }
    return arr;
  });

  /** En Prioridad las sanas (A) se sacan de la lista principal y van como chips. */
  protected readonly principales = computed<Directora[]>(() =>
    this.lente() === 'prioridad'
      ? this.ordenadas().filter((d) => d.cuadrante !== 'A')
      : this.ordenadas(),
  );
  protected readonly sanas = computed<Directora[]>(() =>
    this.lente() === 'prioridad' ? this.ordenadas().filter((d) => d.cuadrante === 'A') : [],
  );

  // ----- helpers Directoras -----
  protected genLabel(g: number): string {
    return { 1: 'Hija', 2: 'Nieta', 3: 'Bisnieta' }[g] ?? '';
  }
  protected semDir(c: string): string {
    return c === 'A' ? 'ok' : c === 'D' ? 'bad' : 'warn';
  }
  protected sinEmpr(d: Directora): boolean {
    return d.emprendedoras.cem + d.emprendedoras.ces === 0;
  }
  protected ratio(real: number, meta: number): number {
    return Math.min(100, Math.round((real / meta) * 100));
  }
  protected cumpl(d: Directora): number {
    const m = d.metas;
    const parts = [m.ventaGP, m.activas, m.pped, m.reactivas, m.retenidas];
    const avg =
      parts.reduce((s, p) => s + Math.min(1, p.meta ? p.real / p.meta : 0), 0) / parts.length;
    return Math.round(avg * 100);
  }
  protected metasArr(d: Directora) {
    const m = d.metas;
    return [
      { label: 'Venta GP', real: m.ventaGP.real, meta: m.ventaGP.meta, dinero: true },
      { label: 'Activas', real: m.activas.real, meta: m.activas.meta, dinero: false },
      { label: 'Primeros pedidos', real: m.pped.real, meta: m.pped.meta, dinero: false },
      { label: 'Reactivas', real: m.reactivas.real, meta: m.reactivas.meta, dinero: false },
      { label: 'Retenidas', real: m.retenidas.real, meta: m.retenidas.meta, dinero: false },
    ];
  }
  protected sub(d: Directora): string {
    switch (this.lente()) {
      case 'metas':
        return `${this.cumpl(d)}% de su proyección`;
      case 'empr':
        return d.emprendedoras.nota;
      case 'par':
        return d.par.proyectada
          ? `Proyecta Estrella ${d.par.proyectada} · Sueño ${d.par.sueno}`
          : d.par.falta;
      default:
        return d.cuadrante === 'A' ? 'En Cuadrante A ✓' : d.faltaA;
    }
  }
  protected toggle(nombre: string): void {
    this.abierta.set(this.abierta() === nombre ? null : nombre);
  }
  protected abrirEn(nombre: string): void {
    this.abierta.set(nombre);
  }

  // ----- helpers GP -----
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
      Reactivar: 'riesgo',
      Deuda: 'deuda',
      Activas: 'activa',
      'Sin 1er Pedido': 'nueva',
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
      'linear-gradient(135deg,#c2410c,#9a3412)',
      'linear-gradient(135deg,#0e7490,#0c5566)',
      'linear-gradient(135deg,#7c3aed,#4c2a59)',
      'linear-gradient(135deg,#157347,#0f5132)',
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
}
