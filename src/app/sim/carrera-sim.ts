import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { SimShell } from './sim-shell';
import { ChipOpcion, SimChips } from './sim-chips';
import { campLabel, nivelNombre, opcionesInicio, parseNivel, simularPlan } from './motor';
import { DEMO_CARRERA, NivelSim, SIM_CONFIG } from '../data/mock-sim';

/**
 * Simulador de carrera (microsite /sim/carrera): una Consultora, Emprendedora
 * o CEM Senior simula su camino a Directora. Llega desde Maya vía deep link
 * (?nombre=&nivel=&ganancia_actual=&sueno=&meta=&dir_nombre=&dir_tel=) con
 * fallback demo; si el nivel no llega, el selector de la pantalla lo resuelve.
 * El CTA persistente — "Hacer este plan con mi Directora" — es la salida
 * clave: el plan termina en una conversación, no en la pantalla.
 */
@Component({
  selector: 'app-carrera-sim',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, SimShell, SimChips],
  template: `
    <app-sim-shell tag="Simulador de carrera">
      <h1 class="hola">Hola, {{ ctx().nombre }} 👋</h1>
      <p class="ctxl">
        @if (nivel() === ctx().nivel) {
          Hoy eres <b>{{ nombreNivel() }}</b> y tu ganancia estimada es
          <b>S/ {{ ctx().ganancia | number }} por campaña</b>.
        }
        Veamos cómo se ve tu camino a Directora.
      </p>
      @if (ctx().sueno) {
        <div class="sueno card">
          <img src="/icons/goals.png" alt="" aria-hidden="true" width="34" height="34" />
          <div>
            <small>Tu sueño</small>
            <b>{{ ctx().sueno }} · Meta S/ {{ ctx().meta | number }}</b>
          </div>
        </div>
      }

      <div class="q">¿Dónde estás hoy en la carrera?</div>
      <p class="qsub">Tu plan se arma desde tu nivel actual.</p>
      <app-sim-chips
        etiqueta="Tu nivel actual"
        [opciones]="nivelOpciones"
        [texto]="true"
        [valor]="nivel()"
        (valorChange)="setNivel($event)"
      />

      <div class="q">¿En cuántas campañas quieres llegar a Directora?</div>
      <p class="qsub">Recuerda: 1 campaña = 4 semanas. 13 campañas son un año.</p>
      <app-sim-chips
        etiqueta="Campañas para llegar a Directora"
        [opciones]="ritmoOpciones()"
        [valor]="ritmo()"
        (valorChange)="ritmo.set(+$event)"
      />

      <div class="q">¿En qué campaña quieres empezar?</div>
      <p class="qsub">Estamos en {{ campanaHoy }} — empezar hoy cuenta.</p>
      <app-sim-chips
        etiqueta="Campaña de inicio"
        [opciones]="inicioOpciones"
        [valor]="inicio()"
        (valorChange)="inicio.set(+$event)"
      />

      <button type="button" class="btn btn--primary sim-cta" (click)="simular()">
        Simular mi plan
      </button>

      @if (simulado()) {
        <section id="res" class="res" aria-label="Tu plan simulado">
          <div class="res-head">
            <small>Tu plan</small>
            <div class="res-head__big">Directora en {{ etiqueta(plan().fin) }}</div>
            <p>
              Empezando en {{ etiqueta(plan().inicio) }}, llegarías a Directora en
              {{ plan().ritmo }} campañas, ganando desde S/ {{ cfg.gananciaDirectora | number }} por
              campaña*.
            </p>
          </div>

          <div class="etapas card">
            @for (e of plan().etapas; track e.def.id) {
              <div class="etapa">
                <span class="dot" aria-hidden="true">{{ e.def.emoji }}</span>
                <div>
                  <b>{{ e.def.titulo }}</b>
                  <small>
                    {{ etiqueta(e.desde) }} → {{ etiqueta(e.hasta) }} · {{ e.n }}
                    {{ e.n === 1 ? 'campaña' : 'campañas' }}
                  </small>
                  <small>{{ e.def.logro }}</small>
                  <span class="gan">
                    Ganancia en esta etapa: ~S/ {{ e.ganancia | number }} por campaña*
                  </span>
                </div>
              </div>
            }
            <div class="etapa">
              <span class="dot dot--fin" aria-hidden="true">✓</span>
              <div>
                <b>¡Directora!</b>
                <small>
                  Desde {{ etiqueta(plan().fin) }} · ganancia desde S/
                  {{ cfg.gananciaDirectora | number }} por campaña*
                </small>
              </div>
            </div>
          </div>

          @if (ctx().sueno) {
            <div class="meta-card">
              🏠 <b>Tu sueño: {{ ctx().sueno }}.</b>
              @if (plan().campMeta; as cm) {
                Con este plan, tu ganancia acumulada alcanza tu meta de S/
                {{ ctx().meta | number }} en <b>{{ etiqueta(cm) }}</b> — antes de llegar a
                Directora.
              } @else {
                Al llegar a Directora habrás acumulado ~S/ {{ plan().acumulado | number }}; tu meta
                de S/ {{ ctx().meta | number }} llega en las primeras campañas como Directora.
              }
            </div>
          }

          <div class="bars card" aria-hidden="true">
            @for (b of barras(); track $index) {
              <div
                class="bar"
                [class.bar--hit]="b.hit"
                [style.height.px]="b.h"
                [title]="'S/ ' + b.v"
              ></div>
            }
          </div>
          <div class="bar-lbl" aria-hidden="true">
            @for (b of barras(); track $index) {
              <span>{{ b.c }}</span>
            }
          </div>
          <p class="tiny bars-nota">Ganancia acumulada por campaña — naranja: tu meta cumplida.</p>

          <button type="button" class="re-sim" (click)="otraVez()">↻ Probar otro ritmo</button>
        </section>
      }

      <div simSticky>
        <p class="hint">¿Dudas con tu plan? No vas sola.</p>
        <a class="btn btn--ghost sim-wa" [href]="waHref()" target="_blank" rel="noopener">
          💬 Hacer este plan con mi Directora
        </a>
        <p class="legal">
          *Ganancia estimada referencial por campaña (4 semanas). Varía según tu actividad y la de
          tu red. El plan es una proyección, no una promesa de ingresos.
        </p>
      </div>
    </app-sim-shell>
  `,
  styles: [
    `
      .hola {
        font-family: var(--font-display);
        font-size: 23px;
        font-weight: 800;
        margin: 0 0 4px;
      }
      .ctxl {
        font-size: 13.5px;
        color: var(--ink-2);
        line-height: 1.55;
        margin: 0 0 12px;
      }
      .ctxl b {
        color: var(--ink);
      }
      .sueno {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 14px;
        margin: 0 0 22px;
      }
      .sueno small {
        display: block;
        font-size: 10.5px;
        color: var(--ink-3);
      }
      .sueno b {
        font-size: 13px;
      }

      .q {
        font-size: 14.5px;
        font-weight: 700;
        margin: 0 0 3px;
      }
      .qsub {
        font-size: 11.5px;
        color: var(--ink-2);
        margin: 0 0 10px;
      }
      app-sim-chips {
        display: block;
        margin-bottom: 20px;
      }
      .sim-cta {
        width: 100%;
        min-height: 48px;
        font-size: 15px;
      }

      .res {
        margin-top: 26px;
        /* Que el headline no quede bajo el header sticky al hacer scrollIntoView */
        scroll-margin-top: 70px;
      }
      .res-head {
        background: var(--brand-grad-strong);
        border-radius: var(--radius-l);
        color: #fff;
        padding: 16px;
        margin-bottom: 16px;
      }
      .res-head small {
        font-size: 10.5px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        font-weight: 800;
        opacity: 0.85;
      }
      .res-head__big {
        font-family: var(--font-display);
        font-size: 24px;
        font-weight: 800;
        margin: 4px 0 2px;
      }
      .res-head p {
        font-size: 12.5px;
        opacity: 0.94;
        line-height: 1.45;
        margin: 0;
      }

      .etapas {
        padding: 4px 14px;
        margin-bottom: 16px;
      }
      .etapa {
        display: flex;
        gap: 11px;
        align-items: flex-start;
        padding: 12px 0;
        border-bottom: 1px dashed var(--line);
      }
      .etapa:last-child {
        border-bottom: none;
      }
      .dot {
        width: 30px;
        height: 30px;
        border-radius: 99px;
        background: var(--brand-100);
        display: grid;
        place-items: center;
        font-size: 14px;
        flex-shrink: 0;
        margin-top: 1px;
      }
      .dot--fin {
        background: var(--fill-success);
        color: #fff;
        font-weight: 800;
      }
      .etapa b {
        font-size: 13.5px;
        display: block;
      }
      .etapa small {
        font-size: 11.5px;
        color: var(--ink-2);
        display: block;
        line-height: 1.45;
        margin-top: 2px;
      }
      .gan {
        display: block;
        margin-top: 3px;
        font-size: 11.5px;
        color: var(--brand-600);
        font-weight: 700;
      }

      .meta-card {
        background: var(--success-bg);
        border-radius: var(--radius);
        padding: 13px 15px;
        margin-bottom: 16px;
        font-size: 12.5px;
        line-height: 1.55;
        color: var(--success);
      }

      .bars {
        display: flex;
        align-items: flex-end;
        gap: 4px;
        height: 90px;
        padding: 12px;
        margin-bottom: 6px;
      }
      .bar {
        flex: 1;
        background: var(--brand-100);
        border-radius: 4px 4px 0 0;
        min-height: 8px;
      }
      .bar--hit {
        background: var(--fill-brand);
      }
      .bar-lbl {
        display: flex;
        gap: 4px;
        padding: 0 12px;
      }
      .bar-lbl span {
        flex: 1;
        text-align: center;
        font-size: 8.5px;
        color: var(--ink-3);
        font-weight: 700;
      }
      .bars-nota {
        margin: 6px 0 14px;
        text-align: center;
      }

      .re-sim {
        display: block;
        width: 100%;
        border: 0;
        background: none;
        text-align: center;
        font-size: 12.5px;
        font-weight: 700;
        color: var(--brand-600);
        cursor: pointer;
        padding: 10px;
      }

      .hint {
        font-size: 10.5px;
        color: var(--ink-2);
        text-align: center;
        margin: 0 0 8px;
      }
      .sim-wa {
        width: 100%;
        min-height: 46px;
        justify-content: center;
        font-size: 14px;
      }
      .legal {
        font-size: 9.5px;
        color: var(--ink-3);
        line-height: 1.5;
        text-align: center;
        margin: 8px 0 0;
      }
    `,
  ],
})
export class CarreraSim {
  private readonly route = inject(ActivatedRoute);
  private readonly qp = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  protected readonly cfg = SIM_CONFIG;
  protected readonly campanaHoy = `C${SIM_CONFIG.campanaActual}`;

  /** Contexto del deep link con fallback demo campo a campo. */
  protected readonly ctx = computed(() => {
    const p = this.qp();
    const num = (k: string) => {
      const v = Number(p.get(k));
      return Number.isFinite(v) && v > 0 ? v : null;
    };
    return {
      nombre: p.get('nombre') || DEMO_CARRERA.nombre,
      nivel: parseNivel(p.get('nivel')) ?? DEMO_CARRERA.nivel,
      ganancia: num('ganancia_actual') ?? DEMO_CARRERA.ganancia,
      sueno: p.get('sueno') ?? DEMO_CARRERA.sueno,
      meta: num('meta') ?? DEMO_CARRERA.meta,
      dirNombre: p.get('dir_nombre') || DEMO_CARRERA.dirNombre,
      dirTel: (p.get('dir_tel') || DEMO_CARRERA.dirTel).replace(/\D/g, ''),
    };
  });

  /** Nivel editable en pantalla; se re-sincroniza si cambia el deep link. */
  protected readonly nivel = linkedSignal<NivelSim>(() => this.ctx().nivel);
  /** Ritmo elegido; vuelve al ritmo medio cuando cambia el nivel (los chips cambian). */
  protected readonly ritmo = linkedSignal(() => SIM_CONFIG.planes[this.nivel()].ritmos[1]);
  protected readonly inicio = signal(opcionesInicio()[0].abs);
  protected readonly simulado = signal(false);

  protected readonly nombreNivel = computed(() => nivelNombre(this.nivel()));
  protected readonly plan = computed(() =>
    simularPlan(this.nivel(), this.ritmo(), this.inicio(), this.ctx().meta),
  );

  protected readonly nivelOpciones: ChipOpcion[] = [
    { valor: 'CNS', big: 'Consultora', label: 'Vendo' },
    { valor: 'CEM', big: 'Emprendedora', label: 'Ya incorporo' },
    { valor: 'CES', big: 'CEM Senior', label: 'Tengo red' },
  ];
  protected readonly ritmoOpciones = computed<ChipOpcion[]>(() => {
    const labels = ['Ritmo intenso', 'Ritmo parejo', 'A tu ritmo'];
    return SIM_CONFIG.planes[this.nivel()].ritmos.map((r, i) => ({
      valor: r,
      big: String(r),
      label: labels[i],
    }));
  });
  protected readonly inicioOpciones: ChipOpcion[] = opcionesInicio().map((o) => ({
    valor: o.abs,
    big: o.big,
    label: o.label,
  }));

  /** Barras de ganancia acumulada (naranja al cruzar la meta del sueño). */
  protected readonly barras = computed(() => {
    const { serie, inicio } = this.plan();
    const meta = this.ctx().meta;
    const max = Math.max(serie[serie.length - 1] ?? 0, meta);
    return serie.map((v, i) => ({
      v,
      h: Math.max(8, Math.round((v / max) * 66)),
      hit: v >= meta,
      c: ((inicio + i - 1) % SIM_CONFIG.campaniasPorAnio) + 1,
    }));
  });

  /** CTA persistente: WhatsApp a la Directora con el plan elegido precargado. */
  protected readonly waHref = computed(() => {
    const c = this.ctx();
    const msg =
      `Hola ${c.dirNombre}, hice mi simulación en el planificador: quiero ser Directora en ` +
      `${this.ritmo()} campañas empezando en ${campLabel(this.inicio())}. ` +
      `¿Me ayudas a armar mi plan?`;
    return `https://wa.me/${c.dirTel}?text=${encodeURIComponent(msg)}`;
  });

  protected etiqueta(abs: number): string {
    return campLabel(abs);
  }

  protected setNivel(v: number | string): void {
    this.nivel.set(v as NivelSim);
  }

  protected simular(): void {
    this.simulado.set(true);
    setTimeout(() => document.getElementById('res')?.scrollIntoView({ behavior: 'smooth' }));
  }

  protected otraVez(): void {
    this.simulado.set(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
