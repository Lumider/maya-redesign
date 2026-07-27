import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Icon } from '../shared/icon';
import { Reveal } from '../shared/reveal';
import { Anchor } from '../shared/anchor';
import { EstatusDirService } from '../shared/estatus';
import { PERFILES_DIR } from '../data/mock-dir';
import { OBJETIVOS_LIDER } from '../data/mock-objetivos';
import { CAMPANA, CUADRANTE_HISTORIA } from '../data/mock';

/**
 * Mis objetivos (PROPUESTA · /n/objetivos) — seguimiento unificado de los objetivos
 * anuales de la Líder contra su Business Plan declarado.
 *
 * Materializa el happy path del spec `docs/seguimiento-objetivos-lider.md` (reunión
 * Giovanni + Kaori 22/07/2026): los 5 frentes del tablero "Gestión de Liderazgo"
 * (PAR+ · Formaciones · Medallas · Autos · Ascensos), cada uno respondiendo
 * "¿cómo voy?" (progreso, conmutable anual ↔ esta campaña) y "¿qué debo hacer?"
 * (recomendación faseada por campaña). Arriba, la recomendación 360 reconcilia los
 * frentes entre sí — "dijiste 3 formaciones, necesitas 4" — porque el BP es un plan
 * conjunto, no objetivos aislados.
 *
 * Decisiones deliberadas del prototipo:
 *  · Página paralela a Mi carrera (no la reemplaza): dónde vive esta sección es una
 *    pregunta abierta del spec (§7.5) y así se pueden comparar ambas.
 *  · El toggle anual↔campañal solo conmuta el bloque de progreso de cada frente; la
 *    recomendación siempre es campañal ("faseada para tacklearla", nota de Kaori).
 *  · El reparto entre hijas ("partir la torta", §4.3) vive en PAR+ y los movimientos
 *    con nombre propio en Ascensos: la meta es conjunta y se acciona por persona.
 *  · Autos declara sus reglas como pendientes (§7.1): los montos son ilustrativos.
 */
@Component({
  selector: 'app-objetivos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, RouterLink, Icon, Reveal, Anchor],
  template: `
    <div class="v2">
      <header class="v2-head" appReveal>
        <div class="head-row">
          <h1 class="v2-title">Mis objetivos</h1>
          <span class="badge badge--violet">Propuesta · en definición</span>
        </div>
        <p class="v2-sub">
          Tu Business Plan en un solo lugar: cómo vas en el año y qué toca esta campaña.
        </p>
        <div class="grupo-toggle" role="tablist" aria-label="Vista de progreso">
          <button
            role="tab"
            [attr.aria-selected]="vista() === 'anual'"
            [class.on]="vista() === 'anual'"
            (click)="vista.set('anual')"
          >
            <app-icon name="calendar" [size]="16" /> Vista anual
          </button>
          <button
            role="tab"
            [attr.aria-selected]="vista() === 'campanal'"
            [class.on]="vista() === 'campanal'"
            (click)="vista.set('campanal')"
          >
            <app-icon name="target" [size]="16" /> Esta campaña · {{ actual }}
          </button>
        </div>
        <nav class="anchors" aria-label="Frentes">
          <a class="anchor" appAnchor="par">PAR+</a>
          <a class="anchor" appAnchor="formaciones">Formaciones</a>
          <a class="anchor" appAnchor="medallas">Medallas</a>
          <a class="anchor" appAnchor="autos">Autos</a>
          <a class="anchor" appAnchor="ascensos">Ascensos</a>
        </nav>
      </header>

      <!-- Recomendación 360: lo declarado vs. lo que el plan exige, cruzando frentes -->
      <section class="card pad v2-section r360 r360--{{ obj().r360.tono }}" appReveal>
        <img class="r360__ill" src="/icons/megaphone.png" alt="" aria-hidden="true" />
        <div class="r360__body">
          <div class="r360__kicker tiny">Recomendación 360 · tu plan, cruzado entre frentes</div>
          <p class="r360__resumen">{{ obj().r360.resumen }}</p>
          <ul class="r360__detalle">
            @for (d of obj().r360.detalle; track d.frente) {
              <li>
                <strong>{{ d.frente }}:</strong> {{ d.texto }}
              </li>
            }
          </ul>
        </div>
      </section>

      <div class="v2-grid">
        <main>
          <!-- ============================== PAR+ ============================== -->
          <section id="par" class="card pad v2-section" appReveal>
            <div class="fr-head">
              <img class="fr-ill" src="/icons/airplane-01.png" alt="" aria-hidden="true" />
              <div>
                <h2 class="v2-h">PAR+</h2>
                <p class="tiny muted">
                  Estrella Sueño: {{ estrellas(obj().bp.estrellaSueno) }} ·
                  {{ perfil().par.premio }}
                </p>
              </div>
              <span class="badge badge--brand fr-badge">{{ perfil().par.kicker }}</span>
            </div>

            @if (vista() === 'anual') {
              <!-- Progreso anual: venta GF acumulada y escalones hasta el sueño -->
              <div class="gf">
                <span class="gf__n">S/ {{ perfil().par.crecimientoActual | number }}</span>
                <span class="muted">
                  crecimiento de Grupo Familiar · faltan
                  <strong>S/ {{ faltaSueno() | number }}</strong> para tu sueño
                </span>
              </div>
              <div class="checks">
                @for (e of obj().par.escalones; track e.estrella) {
                  <div
                    class="check"
                    [class.check--ok]="e.lograda"
                    [class.check--warn]="!e.lograda && e.estrella === siguiente()?.estrella"
                  >
                    <span class="check__ic">
                      <app-icon [name]="e.lograda ? 'check' : 'star'" [size]="15" />
                    </span>
                    <div class="check__body">
                      <div class="row-between">
                        <strong>
                          {{ estrellas(e.estrella) }} {{ e.nombre }}
                          @if (e.estrella === obj().bp.estrellaSueno) {
                            <span class="badge badge--violet">tu sueño</span>
                          }
                        </strong>
                        <span class="check__n"
                          >{{ pct(perfil().par.crecimientoActual, e.meta) }}%</span
                        >
                      </div>
                      <div class="progress" [class.progress--success]="e.lograda">
                        <div
                          class="progress__fill"
                          [style.width.%]="pct(perfil().par.crecimientoActual, e.meta)"
                        ></div>
                      </div>
                      <div class="check__foot tiny">
                        Meta: S/ {{ e.meta | number }}
                        @if (!e.lograda) {
                          · faltan
                          <strong>S/ {{ e.meta - perfil().par.crecimientoActual | number }}</strong>
                        } @else {
                          · <strong>lograda ✓</strong>
                        }
                      </div>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <!-- Corte campañal: el ritmo que pide el sueño -->
              <div class="checks">
                <div class="check" [class.check--ok]="ritmoOk()" [class.check--warn]="!ritmoOk()">
                  <span class="check__ic">
                    <app-icon [name]="ritmoOk() ? 'check' : 'trending'" [size]="15" />
                  </span>
                  <div class="check__body">
                    <div class="row-between">
                      <strong>Crecimiento GF de {{ actual }}</strong>
                      <span class="check__n">
                        {{
                          pct(
                            obj().par.crecimientoCampanal.logrado,
                            obj().par.crecimientoCampanal.requerido
                          )
                        }}%
                      </span>
                    </div>
                    <div class="progress" [class.progress--success]="ritmoOk()">
                      <div
                        class="progress__fill"
                        [style.width.%]="
                          pct(
                            obj().par.crecimientoCampanal.logrado,
                            obj().par.crecimientoCampanal.requerido
                          )
                        "
                      ></div>
                    </div>
                    <div class="check__foot tiny">
                      Lleva S/ {{ obj().par.crecimientoCampanal.logrado | number }} · tu sueño pide
                      <strong>S/ {{ obj().par.crecimientoCampanal.requerido | number }}</strong>
                      por campaña
                    </div>
                  </div>
                </div>
              </div>
            }

            <!-- Partir la torta: qué se le pide a cada hija (la meta es conjunta) -->
            @if (obj().par.reparto.length) {
              <h3 class="fr-sub">A qué llevar a cada hija</h3>
              <div class="reps">
                @for (h of obj().par.reparto; track h.nombre) {
                  <div class="rep">
                    <span class="ava" aria-hidden="true">{{ h.iniciales }}</span>
                    <div class="rep__body">
                      <div class="row-between">
                        <strong>{{ h.nombre }}</strong>
                        <span class="badge badge--brand">{{ estrellas(h.estrellaObjetivo) }}</span>
                      </div>
                      <div
                        class="progress"
                        [class.progress--success]="h.ventaReal >= h.ventaPedida"
                      >
                        <div
                          class="progress__fill"
                          [style.width.%]="pct(h.ventaReal, h.ventaPedida)"
                        ></div>
                      </div>
                      <div class="tiny muted">
                        Pedida esta campaña: S/ {{ h.ventaPedida | number }} · lleva S/
                        {{ h.ventaReal | number }}
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
            @if (obj().par.notaReparto) {
              <p class="tiny muted fr-nota">{{ obj().par.notaReparto }}</p>
            }

            <div class="reco">
              <app-icon name="sparkles" [size]="16" />
              <p>
                Te faltan <strong>S/ {{ faltaSueno() | number }}</strong> para tu
                {{ estrellas(obj().bp.estrellaSueno) }} — el ritmo es
                <strong>S/ {{ obj().par.crecimientoCampanal.requerido | number }}</strong> de
                crecimiento por campaña.
              </p>
            </div>
          </section>

          <!-- =========================== FORMACIONES =========================== -->
          <section id="formaciones" class="card pad v2-section" appReveal>
            <div class="fr-head">
              <img class="fr-ill" src="/icons/growth.png" alt="" aria-hidden="true" />
              <div>
                <h2 class="v2-h">Formaciones</h2>
                <p class="tiny muted">Nuevas Directoras: la palanca de todo el plan</p>
              </div>
              @if (obj().formaciones.requeridas > obj().formaciones.plan) {
                <span class="badge badge--warning fr-badge">
                  plan 360: {{ obj().formaciones.requeridas }}
                </span>
              } @else {
                <span class="badge badge--success fr-badge">plan alineado</span>
              }
            </div>

            @if (vista() === 'anual') {
              <div class="tiles fr-tiles">
                <div class="tile">
                  <div class="tile__label">Declaraste (BP)</div>
                  <div class="tile__value">{{ obj().formaciones.plan }}</div>
                </div>
                <div
                  class="tile"
                  [class.tile--alert]="obj().formaciones.requeridas > obj().formaciones.plan"
                >
                  <div class="tile__label">Pide tu plan 360</div>
                  <div class="tile__value">{{ obj().formaciones.requeridas }}</div>
                </div>
                <div class="tile">
                  <div class="tile__label">En curso</div>
                  <div class="tile__value">{{ obj().formaciones.enCurso }}</div>
                </div>
                <div class="tile">
                  <div class="tile__label">Logradas</div>
                  <div class="tile__value">{{ obj().formaciones.logradas }}</div>
                </div>
              </div>
            }

            <!-- La cadena de formación: dónde está parada la tubería -->
            <h3 class="fr-sub">Tu cadena de formación</h3>
            <div class="cadena" role="list">
              @for (c of obj().formaciones.cadena; track c.etapa) {
                <div class="cadena__paso" role="listitem" [class.cadena__paso--vacio]="c.n === 0">
                  <span class="cadena__n">{{ c.n }}</span>
                  <div>
                    <strong>{{ c.etapa }}</strong>
                    <div class="tiny muted">{{ c.nota }}</div>
                  </div>
                </div>
              }
            </div>

            @if (obj().formaciones.origen) {
              <div class="alert--warning fr-origen">
                <app-icon name="alert" [size]="16" />
                {{ obj().formaciones.origen }}
              </div>
            }

            <div class="reco">
              <app-icon name="sparkles" [size]="16" />
              <p>{{ obj().formaciones.campanal }}</p>
            </div>
          </section>

          <!-- ============================= MEDALLAS ============================= -->
          <section id="medallas" class="card pad v2-section" appReveal>
            <div class="fr-head">
              <img class="fr-ill" src="/icons/medal-01.png" alt="" aria-hidden="true" />
              <div>
                <h2 class="v2-h">Medallas</h2>
                <p class="tiny muted">La acumulación de tus cuadrantes, campaña a campaña</p>
              </div>
              <span class="badge badge--brand fr-badge">
                proyectas {{ obj().medallas.gp.proyeccion }}
              </span>
            </div>

            @if (vista() === 'anual') {
              <!-- Fila del año: la medalla se lee en la racha, no en una campaña -->
              <div class="streak">
                <div class="streak__top">
                  <strong>Excelencia GP · {{ obj().medallas.gp.cumplidas }} de 13 en A</strong>
                  <span class="tiny streak__msg">{{ obj().medallas.gp.margen }}</span>
                </div>
                <div
                  class="streak__row"
                  role="img"
                  [attr.aria-label]="
                    obj().medallas.gp.cumplidas + ' campañas en Cuadrante A este año'
                  "
                >
                  @for (h of historia(); track h.campana) {
                    <span
                      class="streak__dot"
                      [class.streak__dot--on]="h.valor === 'A'"
                      [class.streak__dot--risk]="h.campana === actual && h.valor !== 'A'"
                      [title]="h.campana + ': ' + (h.valor === '-' ? 'pendiente' : h.valor)"
                    >
                      @if (h.valor === 'A') {
                        <app-icon name="check" [size]="12" />
                      } @else {
                        {{ h.campana === actual ? '!' : h.valor === '-' ? '' : h.valor }}
                      }
                      <small>{{ h.campana }}</small>
                    </span>
                  }
                </div>
              </div>
              @if (obj().medallas.liderazgo; as lid) {
                <div class="check" [class.check--ok]="lid.hijasEnA >= lid.hijasObjetivo">
                  <span class="check__ic"><app-icon name="users" [size]="15" /></span>
                  <div class="check__body">
                    <div class="row-between">
                      <strong>Medalla de Liderazgo · proyectas {{ lid.proyeccion }}</strong>
                      <span class="check__n"
                        >{{ lid.hijasEnA }}/{{ lid.hijasObjetivo }} hijas en A</span
                      >
                    </div>
                    <div class="check__foot tiny">{{ lid.margen }}</div>
                  </div>
                </div>
              } @else {
                <p class="tiny muted fr-nota">
                  La Medalla de Liderazgo se juega cuando formes tus primeras hijas directoras.
                </p>
              }
            } @else {
              <div class="checks">
                <div
                  class="check"
                  [class.check--ok]="perfil().negocio.cuadrante === 'A'"
                  [class.check--bad]="perfil().negocio.cuadrante !== 'A'"
                >
                  <span class="check__ic">
                    <app-icon
                      [name]="perfil().negocio.cuadrante === 'A' ? 'check' : 'alert'"
                      [size]="15"
                    />
                  </span>
                  <div class="check__body">
                    <div class="row-between">
                      <strong>{{ actual }} va en Cuadrante {{ perfil().negocio.cuadrante }}</strong>
                      <span class="check__n">{{ perfil().negocio.badge }}</span>
                    </div>
                    <div class="check__foot tiny">
                      La medalla es la suma de tus cuadrantes: cada campaña en A cuenta doble —
                      Excelencia GP y Liderazgo.
                    </div>
                  </div>
                </div>
              </div>
            }

            <div class="reco">
              <app-icon name="sparkles" [size]="16" />
              <p>{{ obj().medallas.campanal }}</p>
            </div>
          </section>

          <!-- ============================== AUTOS ============================== -->
          <section id="autos" class="card pad v2-section" appReveal>
            <div class="fr-head">
              <img class="fr-ill" src="/icons/money-01.png" alt="" aria-hidden="true" />
              <div>
                <h2 class="v2-h">Autos</h2>
                <p class="tiny muted">El máximo símbolo de éxito Yanbal</p>
              </div>
              <span class="badge badge--warning fr-badge">reglas por confirmar</span>
            </div>

            @if (obj().auto; as auto) {
              @if (vista() === 'anual') {
                <div class="checks">
                  @for (c of auto.conteo; track c.etiqueta) {
                    <div
                      class="check"
                      [class.check--ok]="c.logrado >= c.meta"
                      [class.check--warn]="c.logrado < c.meta"
                    >
                      <span class="check__ic">
                        <app-icon [name]="c.logrado >= c.meta ? 'check' : 'trending'" [size]="15" />
                      </span>
                      <div class="check__body">
                        <div class="row-between">
                          <strong>{{ c.etiqueta }}</strong>
                          <span class="check__n">{{ pct(c.logrado, c.meta) }}%</span>
                        </div>
                        <div class="progress" [class.progress--success]="c.logrado >= c.meta">
                          <div
                            class="progress__fill"
                            [style.width.%]="pct(c.logrado, c.meta)"
                          ></div>
                        </div>
                        <div class="check__foot tiny">
                          S/ {{ c.logrado | number }} de S/ {{ c.meta | number }}
                        </div>
                      </div>
                    </div>
                  }
                </div>
                <p class="tiny muted fr-nota">
                  {{ auto.modelo }} · conteo al día en {{ auto.campanasOk }} de
                  {{ auto.campanasDe }} campañas. Los montos son ilustrativos: las bases oficiales
                  del programa de autos están en validación (spec §7.1).
                </p>
              } @else {
                <div class="checks">
                  <div
                    class="check"
                    [class.check--ok]="auto.conteo[0].logrado >= auto.conteo[0].meta"
                    [class.check--warn]="auto.conteo[0].logrado < auto.conteo[0].meta"
                  >
                    <span class="check__ic"><app-icon name="target" [size]="15" /></span>
                    <div class="check__body">
                      <div class="row-between">
                        <strong>{{ auto.conteo[0].etiqueta }}</strong>
                        <span class="check__n"
                          >{{ pct(auto.conteo[0].logrado, auto.conteo[0].meta) }}%</span
                        >
                      </div>
                      <div
                        class="progress"
                        [class.progress--success]="auto.conteo[0].logrado >= auto.conteo[0].meta"
                      >
                        <div
                          class="progress__fill"
                          [style.width.%]="pct(auto.conteo[0].logrado, auto.conteo[0].meta)"
                        ></div>
                      </div>
                      <div class="check__foot tiny">
                        S/ {{ auto.conteo[0].logrado | number }} de S/
                        {{ auto.conteo[0].meta | number }} · {{ auto.campanasOk }} de
                        {{ auto.campanasDe }} campañas al día
                      </div>
                    </div>
                  </div>
                </div>
              }
              <div class="reco">
                <app-icon name="sparkles" [size]="16" />
                <p>{{ auto.campanal }}</p>
              </div>
            } @else {
              <p class="fr-empty muted">
                El programa de autos arranca en Súper Senior: tu Toyota Raize te espera al formar 3
                hijas directoras. Tu escalera de ascensos ya lo tiene en el mapa.
              </p>
            }
          </section>

          <!-- ============================= ASCENSOS ============================= -->
          <section id="ascensos" class="card pad v2-section" appReveal>
            <div class="fr-head">
              <img class="fr-ill" src="/icons/goals.png" alt="" aria-hidden="true" />
              <div>
                <h2 class="v2-h">Ascensos</h2>
                <p class="tiny muted">Rumbo a {{ obj().ascenso.a }}</p>
              </div>
              @if (obj().bp.conAuto) {
                <span class="badge badge--brand fr-badge">con auto en paralelo</span>
              }
            </div>

            @if (vista() === 'anual') {
              <div class="tiles fr-tiles fr-tiles--3">
                <div class="tile">
                  <div class="tile__label">Estructura actual</div>
                  <div class="tile__value tile__value--s">{{ obj().ascenso.estructuraActual }}</div>
                </div>
                <div class="tile">
                  <div class="tile__label">Objetivo</div>
                  <div class="tile__value tile__value--s">
                    {{ obj().ascenso.estructuraObjetivo }}
                  </div>
                </div>
                <div class="tile tile--alert">
                  <div class="tile__label">Te falta</div>
                  <div class="tile__value tile__value--s">
                    {{ obj().ascenso.estructuraFaltante }}
                  </div>
                </div>
              </div>
            }

            <!-- Movimientos con nombre propio: el ascenso se juega en equipo -->
            <h3 class="fr-sub">Movimientos que pide tu ascenso</h3>
            <div class="checks">
              @for (m of obj().ascenso.movimientos; track m.quien + m.accion) {
                <div
                  class="check"
                  [class.check--ok]="m.estado === 'logrado'"
                  [class.check--warn]="m.estado === 'en-curso'"
                >
                  <span class="check__ic">
                    <app-icon
                      [name]="
                        m.estado === 'logrado'
                          ? 'check'
                          : m.estado === 'en-curso'
                            ? 'trending'
                            : 'users'
                      "
                      [size]="15"
                    />
                  </span>
                  <div class="check__body">
                    <div class="row-between">
                      <strong>{{ m.quien }}</strong>
                      <span class="check__n tiny">{{
                        m.estado === 'logrado'
                          ? 'logrado'
                          : m.estado === 'en-curso'
                            ? 'en curso'
                            : 'pendiente'
                      }}</span>
                    </div>
                    <div class="check__foot tiny">{{ m.accion }}</div>
                  </div>
                </div>
              }
            </div>
            <p class="tiny muted fr-nota">{{ obj().ascenso.ventana }}</p>

            <div class="reco">
              <app-icon name="sparkles" [size]="16" />
              <p>{{ obj().ascenso.campanal }}</p>
            </div>
          </section>
        </main>

        <!-- =============================== ASIDE =============================== -->
        <aside class="v2-aside">
          <!-- La vara de toda la página: lo que ella declaró en su BP -->
          <div class="card pad" appReveal>
            <h3 class="v2-h">Mi Business Plan</h3>
            <p class="tiny muted">Declarado en C11 · la vara de esta página</p>
            <div class="kv-list">
              <div class="kv">
                <span class="muted">Mi sueño</span><strong>{{ obj().bp.suenoPersonal }}</strong>
              </div>
              <div class="kv">
                <span class="muted">Estrella Sueño</span>
                <strong>{{ estrellas(obj().bp.estrellaSueno) }}</strong>
              </div>
              <div class="kv">
                <span class="muted">Formaciones</span>
                <strong>
                  {{ obj().bp.formaciones }}
                  @if (obj().formaciones.requeridas > obj().bp.formaciones) {
                    <span class="bp-alerta">→ tu plan pide {{ obj().formaciones.requeridas }}</span>
                  }
                </strong>
              </div>
              <div class="kv">
                <span class="muted">Medalla GP</span><strong>{{ obj().bp.medallaGP }}</strong>
              </div>
              @if (obj().bp.medallaLiderazgo) {
                <div class="kv">
                  <span class="muted">M. Liderazgo</span
                  ><strong>{{ obj().bp.medallaLiderazgo }}</strong>
                </div>
              }
              <div class="kv">
                <span class="muted">Ascenso</span>
                <strong>{{ obj().bp.ascenso }}{{ obj().bp.conAuto ? ' · con auto' : '' }}</strong>
              </div>
            </div>
          </div>

          <div class="card pad" appReveal [revealDelay]="60">
            <h3 class="v2-h">Progreso del año</h3>
            <div class="anio">
              <span class="anio__n">{{ transcurridas }}</span>
              <span class="muted">de 13 campañas jugadas</span>
            </div>
            <div class="progress">
              <div class="progress__fill" [style.width.%]="pct(transcurridas, 13)"></div>
            </div>
            <p class="tiny muted fr-nota">
              Proyección hoy: Excelencia GP {{ obj().medallas.gp.proyeccion }}
              @if (obj().medallas.liderazgo; as lid) {
                · Liderazgo {{ lid.proyeccion }}
              }
            </p>
          </div>

          <div class="card pad" appReveal [revealDelay]="120">
            <h3 class="v2-h">Relacionado</h3>
            <div class="rel">
              <a routerLink="/n/carrera"
                >Mi carrera · el sueño PAR+ <app-icon name="chevron-right" [size]="14"
              /></a>
              <a routerLink="/n/campana"
                >Mi campaña · ejecuta {{ actual }} <app-icon name="chevron-right" [size]="14"
              /></a>
              @if (perfil().capacidades.equipo) {
                <a routerLink="/n/equipo"
                  >Mi equipo · trabaja a tus hijas <app-icon name="chevron-right" [size]="14"
                /></a>
              }
            </div>
          </div>
        </aside>
      </div>
    </div>
  `,
  styles: `
    .pad {
      padding: 18px 20px;
    }

    .row-between {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 10px;
    }

    .head-row {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    /* Toggle anual ↔ campañal (mismo patrón que Mi equipo) */
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

    /* Recomendación 360 */
    .r360 {
      display: flex;
      gap: 16px;
      align-items: flex-start;
      border-left: 4px solid var(--line-strong);
    }
    .r360--warning {
      border-left-color: var(--warning);
    }
    .r360--danger {
      border-left-color: var(--danger);
    }
    .r360--success {
      border-left-color: var(--success);
    }
    .r360__ill {
      width: 44px;
      height: 44px;
      object-fit: contain;
      flex-shrink: 0;
    }
    .r360__body {
      flex: 1;
      min-width: 0;
    }
    .r360__kicker {
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--ink-3);
    }
    .r360__resumen {
      margin: 6px 0 10px;
      font-size: 15px;
      font-weight: 600;
      line-height: 1.45;
    }
    .r360__detalle {
      margin: 0;
      padding: 0 0 0 18px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 13px;
      color: var(--ink-2);
    }

    /* Cabecera de cada frente */
    .fr-head {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 14px;
    }
    .fr-head .v2-h {
      margin: 0;
    }
    .fr-head p {
      margin: 2px 0 0;
    }
    .fr-ill {
      width: 40px;
      height: 40px;
      object-fit: contain;
      flex-shrink: 0;
    }
    .fr-badge {
      margin-left: auto;
      flex-shrink: 0;
    }
    .fr-sub {
      margin: 18px 0 10px;
      font-size: 13.5px;
      font-weight: 800;
      color: var(--ink-2);
    }
    .fr-nota {
      margin: 10px 0 0;
    }
    .fr-empty {
      margin: 0;
      font-size: 14px;
    }

    /* PAR+: cifra grande del crecimiento GF */
    .gf {
      display: flex;
      align-items: baseline;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 6px;
    }
    .gf__n {
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 28px;
      letter-spacing: -0.02em;
    }

    /* Checkpoints (patrón de Mi campaña) */
    .checks {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 12px;
    }
    .check {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      padding: 13px 14px;
      border-radius: var(--radius);
      background: var(--sand);
      border-left: 3px solid var(--line-strong);
    }
    .check__ic {
      width: 28px;
      height: 28px;
      flex-shrink: 0;
      border-radius: 99px;
      display: grid;
      place-items: center;
      background: var(--surface);
      color: var(--ink-2);
    }
    .check__body {
      flex: 1;
      min-width: 0;
    }
    .check__n {
      font-weight: 800;
      font-size: 13.5px;
    }
    .check__foot {
      margin-top: 6px;
    }
    .check .progress {
      margin: 8px 0 0;
    }
    .check--ok {
      border-left-color: var(--success);
    }
    .check--ok .check__ic {
      background: var(--fill-success);
      color: #fff;
    }
    .check--warn {
      border-left-color: var(--warning);
    }
    .check--warn .check__ic {
      background: var(--warning-bg);
      color: var(--warning);
    }
    .check--bad {
      border-left-color: var(--danger);
    }
    .check--bad .check__ic {
      background: var(--danger-bg);
      color: var(--danger);
    }
    .check .badge {
      margin-left: 6px;
    }

    /* Reparto entre hijas */
    .reps {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .rep {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }
    .rep__body {
      flex: 1;
      min-width: 0;
    }
    .rep .progress {
      margin: 6px 0 4px;
    }
    .ava {
      width: 34px;
      height: 34px;
      flex-shrink: 0;
      border-radius: 99px;
      display: grid;
      place-items: center;
      background: var(--brand-50);
      color: var(--brand-700);
      font-weight: 800;
      font-size: 12px;
    }

    /* Cadena de formación */
    .cadena {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }
    .cadena__paso {
      display: flex;
      gap: 10px;
      align-items: center;
      padding: 10px 12px;
      border-radius: var(--radius);
      background: var(--sand);
    }
    .cadena__paso--vacio {
      border: 1.5px dashed var(--line-strong);
      background: transparent;
    }
    .cadena__n {
      width: 30px;
      height: 30px;
      flex-shrink: 0;
      border-radius: 99px;
      display: grid;
      place-items: center;
      background: var(--surface);
      font-weight: 800;
      font-size: 14px;
    }
    .cadena__paso--vacio .cadena__n {
      color: var(--ink-3);
    }
    .fr-origen {
      display: flex;
      gap: 10px;
      align-items: flex-start;
      margin-top: 12px;
      padding: 12px 14px;
      border-radius: var(--radius);
      font-size: 13.5px;
      font-weight: 600;
    }
    .fr-origen app-icon {
      flex-shrink: 0;
      margin-top: 1px;
    }

    /* Tiles del frente */
    .fr-tiles {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }
    .fr-tiles--3 {
      grid-template-columns: repeat(3, 1fr);
    }
    .fr-tiles .tile {
      background: var(--sand);
      border-radius: var(--radius);
      padding: 12px 14px;
    }
    .tile--alert {
      box-shadow: inset 0 0 0 1.5px var(--warning);
    }
    .tile__value--s {
      font-size: 13.5px;
      line-height: 1.35;
    }

    /* Racha anual de cuadrantes (patrón de Mi campaña) */
    .streak {
      margin: 4px 0 14px;
      padding: 14px 16px 24px;
      background: var(--sand);
      border-radius: var(--radius);
    }
    .streak__top {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 10px;
    }
    .streak__top strong {
      font-size: 14px;
    }
    .streak__msg {
      color: var(--ink-2);
      font-weight: 600;
    }
    .streak__row {
      display: flex;
      gap: 7px;
      flex-wrap: wrap;
    }
    .streak__dot {
      position: relative;
      width: 34px;
      height: 34px;
      border-radius: 99px;
      display: grid;
      place-items: center;
      background: var(--surface);
      border: 1.5px solid var(--line-strong);
      color: var(--ink-3);
      font-weight: 800;
      font-size: 12px;
    }
    .streak__dot small {
      position: absolute;
      bottom: -15px;
      font-size: 9px;
      font-weight: 700;
      color: var(--ink-3);
    }
    .streak__dot--on {
      background: var(--fill-success);
      border-color: var(--fill-success);
      color: #fff;
    }
    .streak__dot--risk {
      border-color: var(--danger);
      color: var(--danger);
      border-style: dashed;
    }

    /* Recomendación faseada del frente */
    .reco {
      display: flex;
      gap: 10px;
      align-items: flex-start;
      margin-top: 16px;
      padding: 12px 14px;
      border-radius: var(--radius);
      background: var(--brand-50);
      color: var(--ink);
      border-left: 3px solid var(--brand-500);
    }
    .reco app-icon {
      flex-shrink: 0;
      color: var(--brand-600);
      margin-top: 1px;
    }
    .reco p {
      margin: 0;
      font-size: 13.5px;
      font-weight: 600;
      line-height: 1.45;
    }

    /* Aside */
    .kv-list {
      display: flex;
      flex-direction: column;
      gap: 9px;
      margin-top: 12px;
    }
    .kv {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 12px;
      font-size: 13.5px;
    }
    .kv strong {
      text-align: right;
    }
    .bp-alerta {
      display: block;
      color: var(--warning);
      font-size: 12px;
    }
    .anio {
      display: flex;
      align-items: baseline;
      gap: 8px;
      margin: 10px 0 8px;
    }
    .anio__n {
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 28px;
    }
    .rel {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-top: 10px;
    }
    .rel a {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 9px 10px;
      border-radius: var(--radius-s);
      font-size: 13.5px;
      font-weight: 600;
      color: var(--ink);
    }
    .rel a:hover {
      background: var(--sand);
    }

    @media (max-width: 720px) {
      .fr-tiles {
        grid-template-columns: repeat(2, 1fr);
      }
      .cadena {
        grid-template-columns: 1fr;
      }
    }
    @media (max-width: 560px) {
      .fr-tiles,
      .fr-tiles--3 {
        grid-template-columns: 1fr 1fr;
      }
      .grupo-toggle {
        width: 100%;
      }
      .grupo-toggle button {
        flex: 1;
        justify-content: center;
        padding: 9px 10px;
      }
      .fr-badge {
        display: none;
      }
    }
  `,
})
export class Objetivos {
  private readonly estatusDirSrv = inject(EstatusDirService);

  /** Perfil del estatus encarnado (conmutador demo) — misma fuente que Mi carrera. */
  protected readonly perfil = computed(() => PERFILES_DIR[this.estatusDirSrv.estatus()]);
  /** Objetivos del estatus: BP declarado, recomendación 360 y los 5 frentes. */
  protected readonly obj = computed(() => OBJETIVOS_LIDER[this.estatusDirSrv.estatus()]);

  /** El toggle solo conmuta el PROGRESO; la recomendación siempre es campañal. */
  protected readonly vista = signal<'anual' | 'campanal'>('anual');

  protected readonly actual = CAMPANA.actual;
  protected readonly transcurridas = CUADRANTE_HISTORIA.filter((h) => h.valor !== '-').length;

  /** Faltante para la Estrella Sueño (la meta vive en el perfil, no se duplica). */
  protected readonly faltaSueno = computed(() =>
    Math.max(0, this.perfil().par.crecimientoMeta - this.perfil().par.crecimientoActual),
  );

  /** Primer escalón no logrado: "engánchate a la siguiente estrella". */
  protected readonly siguiente = computed(
    () => this.obj().par.escalones.find((e) => !e.lograda) ?? null,
  );

  protected readonly ritmoOk = computed(
    () =>
      this.obj().par.crecimientoCampanal.logrado >= this.obj().par.crecimientoCampanal.requerido,
  );

  /**
   * Fila anual de cuadrantes: la historia global con la campaña actual reinterpretada
   * según el cuadrante del estatus encarnado (cada estatus demo vive un cuadrante).
   */
  protected readonly historia = computed(() =>
    CUADRANTE_HISTORIA.map((h) =>
      h.campana === CAMPANA.actual ? { ...h, valor: this.perfil().negocio.cuadrante } : h,
    ),
  );

  protected pct(actual: number, meta: number): number {
    if (meta <= 0) return 0;
    return Math.min(100, Math.round((actual / meta) * 100));
  }

  protected estrellas(n: number): string {
    return `Estrella ${n}`;
  }
}
