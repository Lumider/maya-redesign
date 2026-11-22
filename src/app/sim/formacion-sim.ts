import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { SimShell } from './sim-shell';
import { ChipOpcion, SimChips } from './sim-chips';
import { campLabel, nivelNombre, opcionesInicio, parseNivel, simularPlan } from './motor';
import { DEMO_FORMACION, SIM_CONFIG } from '../data/mock-sim';

/**
 * Simulador de formación (microsite /sim/formacion): la DIRECTORA simula la
 * formación de UNA candidata de su grupo — llega desde la card de Formaciones
 * en Maya vía deep link. El framing difiere de la vista carrera: la CEM simula
 * su sueño; la Directora simula su gestión. El resultado responde tres
 * preguntas: cuándo asciende la candidata, qué le toca a la Directora en cada
 * etapa (voces Ella/Tú) y cuándo gana el bono protegiendo su grupo.
 *
 * Decisión (desvío consciente del mockup): las etapas se derivan del NIVEL de
 * la candidata con el mismo motor de la vista carrera — a una CEM Senior con
 * requisitos al día no se le propone "Sube a CEM Senior" otra vez, sino
 * postular ya (plan más corto). El mockup mostraba siempre las 3 etapas.
 */
@Component({
  selector: 'app-formacion-sim',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, SimShell, SimChips],
  template: `
    <app-sim-shell tag="Simulador de formación" tono="teal">
      <h1 class="hola">Hola, {{ ctx().dirNombre }} 👋</h1>
      <p class="ctxl">Simula la formación de tu candidata y arma el plan que le vas a proponer.</p>

      <!-- Card de la candidata (misma anatomía que la card de Formaciones en Maya) -->
      <div class="cand card">
        <div class="cand__row1">
          <span class="cand__niv">{{ nombreNivelCand() }}</span>
          @if (ctx().candidata.potencial; as pot) {
            <span
              class="badge"
              [class.badge--success]="pot === 'alto'"
              [class.badge--warning]="pot === 'medio'"
              [class.badge--neutral]="pot === 'bajo'"
            >
              Potencial {{ pot }}
            </span>
          }
        </div>
        <div class="cand__nm">{{ ctx().candidata.nombre }}</div>
        <div class="cand__kpis">
          @if (ctx().candidata.ventaGp; as v) {
            <span class="kpi"><b>✓</b> Venta GP S/ {{ v | number }}</span>
          }
          @if (ctx().candidata.activas; as a) {
            <span class="kpi"><b>✓</b> Activas {{ a }}</span>
          }
          @if (ctx().candidata.pped; as p) {
            <span class="kpi"><b>✓</b> PPED {{ p }}</span>
          }
        </div>
        @if (ctx().candidata.interes || ctx().candidata.sueno) {
          <div class="cand__sue">
            @if (ctx().candidata.interes) {
              ★ Tiene interés
            }
            @if (ctx().candidata.interes && ctx().candidata.sueno) {
              ·
            }
            @if (ctx().candidata.sueno; as s) {
              Sueño: {{ s }}
            }
          </div>
        }
      </div>

      <div class="q">¿En cuántas campañas quieres formarla?</div>
      <p class="qsub">1 campaña = 4 semanas. 13 campañas son un año.</p>
      <app-sim-chips
        etiqueta="Campañas de formación"
        [opciones]="ritmoOpciones()"
        [valor]="ritmo()"
        (valorChange)="ritmo.set(+$event)"
      />

      <div class="q">¿En qué campaña empiezan?</div>
      <p class="qsub">Estamos en {{ campanaHoy }} — el semillero puede ser esta misma semana.</p>
      <app-sim-chips
        etiqueta="Campaña de inicio"
        [opciones]="inicioOpciones"
        [valor]="inicio()"
        (valorChange)="inicio.set(+$event)"
      />

      <button type="button" class="btn btn--primary sim-cta" (click)="simular()">
        Simular su formación
      </button>

      @if (simulado()) {
        <section id="res" class="res" [attr.aria-label]="'El plan de ' + ctx().candidata.corto">
          <div class="res-head">
            <small>El plan de {{ ctx().candidata.corto }}</small>
            <div class="res-head__big">
              {{ ctx().candidata.corto }} sería Directora en {{ etiqueta(plan().fin) }}
            </div>
            <p>
              Empezando en {{ etiqueta(plan().inicio) }}, su formación toma
              {{ plan().ritmo }} campañas con tu acompañamiento.
            </p>
            <span class="res-head__bono">🎁 Tu bono de formación: S/ {{ ctx().bono }}*</span>
          </div>

          <div class="etapas card">
            @for (e of plan().etapas; track e.def.id) {
              <div class="etapa">
                <span class="dot" aria-hidden="true">{{ e.def.emoji }}</span>
                <div class="etapa__body">
                  <b>{{ e.def.tituloDir }}</b>
                  <span class="rng">
                    {{ etiqueta(e.desde) }} → {{ etiqueta(e.hasta) }} · {{ e.n }}
                    {{ e.n === 1 ? 'campaña' : 'campañas' }}
                  </span>
                  <div class="duo duo--e"><b>Ella</b>{{ e.def.ella }}</div>
                  <div class="duo duo--t"><b>Tú</b>{{ e.def.tu }}</div>
                </div>
              </div>
            }
            <div class="etapa">
              <span class="dot dot--fin" aria-hidden="true">🏆</span>
              <div class="etapa__body">
                <b>¡{{ ctx().candidata.corto }} es Directora!</b>
                <span class="rng">Desde {{ etiqueta(plan().fin) }}</span>
                <div class="duo duo--t">
                  <b>Tú</b>Recibes tu bono de formación de S/ {{ ctx().bono }}* y ganas una nueva
                  línea en tu red.
                </div>
              </div>
            </div>
          </div>

          <div class="bono-card">
            🎁 <b>Tu bono de S/ {{ ctx().bono }}</b> se activa cuando {{ ctx().candidata.corto }} se
            gradúa como Nueva Directora en {{ etiqueta(plan().fin) }}. Además, su grupo se convierte
            en tu primera línea: ganas por su crecimiento.
          </div>

          <div class="paralelo">
            <b>Crecimiento paralelo:</b> cuando {{ ctx().candidata.corto }} ascienda, sus activas
            salen de tu Grupo Personal. Planifica incorporar en paralelo para que tu grupo no quede
            con hueco — tu BDM puede ayudarte.
          </div>

          <button type="button" class="re-sim" (click)="otraVez()">↻ Probar otro ritmo</button>
        </section>
      }

      <div simSticky>
        <a class="btn btn--primary sim-wa" [href]="waHref()" target="_blank" rel="noopener">
          💬 Compartir este plan con {{ ctx().candidata.corto }}
        </a>
        <button type="button" class="btn btn--ghost sim-sem" (click)="semillero.set(true)">
          📅 Agendar su semillero
        </button>
        @if (semillero()) {
          <p class="sem-nota" role="status">
            La agenda del semillero se integrará con Maya — por ahora coordínalo por WhatsApp.
          </p>
        }
        <p class="legal">
          *Bono y ganancias estimadas referenciales. Sujetos a las condiciones del programa de
          formación vigente.
        </p>
      </div>
    </app-sim-shell>
  `,
  styles: [
    `
      .hola {
        font-family: var(--font-display);
        font-size: 22px;
        font-weight: 800;
        margin: 0 0 4px;
      }
      .ctxl {
        font-size: 13px;
        color: var(--ink-2);
        line-height: 1.5;
        margin: 0 0 14px;
      }

      .cand {
        padding: 13px 15px;
        margin-bottom: 22px;
        box-shadow: var(--shadow-s);
      }
      .cand__row1 {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
      }
      .cand__niv {
        font-size: 10.5px;
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: var(--ink-3);
      }
      .cand__nm {
        font-size: 15px;
        font-weight: 700;
        margin-bottom: 7px;
      }
      .cand__kpis {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        margin-bottom: 7px;
      }
      .kpi {
        font-size: 10.5px;
        background: var(--sand);
        border: 1px solid var(--line);
        border-radius: var(--radius-s);
        padding: 4px 8px;
      }
      .kpi b {
        color: var(--success);
      }
      .cand__sue {
        font-size: 11.5px;
        color: var(--teal);
        background: var(--teal-bg);
        border-radius: var(--radius-s);
        padding: 6px 9px;
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
        font-size: 21px;
        font-weight: 800;
        margin: 4px 0 2px;
      }
      .res-head p {
        font-size: 12.5px;
        opacity: 0.94;
        line-height: 1.45;
        margin: 0;
      }
      .res-head__bono {
        display: inline-block;
        margin-top: 9px;
        background: rgba(255, 255, 255, 0.14);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 99px;
        padding: 5px 12px;
        font-size: 12px;
        font-weight: 800;
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
      .etapa__body {
        flex: 1;
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
        background: var(--warning-bg);
      }
      .etapa b {
        font-size: 13.5px;
        display: block;
      }
      .rng {
        font-size: 10.5px;
        color: var(--ink-3);
        display: block;
        margin-bottom: 6px;
      }
      .duo {
        font-size: 11.5px;
        line-height: 1.5;
        border-left: 2.5px solid var(--line);
        padding-left: 8px;
        margin-bottom: 5px;
        color: var(--ink-2);
      }
      .duo b {
        display: block;
        font-size: 10px;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }
      .duo--e {
        border-color: var(--brand-500);
      }
      .duo--e b {
        color: var(--brand-600);
      }
      .duo--t {
        border-color: var(--teal);
      }
      .duo--t b {
        color: var(--teal);
      }

      .bono-card {
        background: var(--warning-bg);
        color: var(--warning);
        border-radius: var(--radius);
        padding: 13px 15px;
        margin-bottom: 12px;
        font-size: 12.5px;
        line-height: 1.55;
      }
      .paralelo {
        background: var(--warning-bg);
        border-left: 3px solid var(--warning);
        border-radius: 0 var(--radius-s) var(--radius-s) 0;
        padding: 11px 13px;
        margin-bottom: 16px;
        font-size: 12px;
        line-height: 1.5;
        color: var(--warning);
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

      .sim-wa {
        width: 100%;
        min-height: 46px;
        justify-content: center;
        font-size: 13.5px;
        margin-bottom: 8px;
      }
      .sim-sem {
        width: 100%;
        min-height: 44px;
        justify-content: center;
        font-size: 13px;
      }
      .sem-nota {
        font-size: 11px;
        color: var(--ink-2);
        text-align: center;
        margin: 8px 0 0;
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
export class FormacionSim {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly qp = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  protected readonly campanaHoy = `C${SIM_CONFIG.campanaActual}`;

  /** Contexto del deep link (card de Formaciones) con fallback demo. */
  protected readonly ctx = computed(() => {
    const p = this.qp();
    const d = DEMO_FORMACION;
    const num = (k: string) => {
      const v = Number(p.get(k));
      return Number.isFinite(v) && v > 0 ? v : null;
    };
    const nombre = p.get('nombre') || d.candidata.nombre;
    const potencial = p.get('potencial');
    const interes = p.get('interes');
    return {
      dirNombre: p.get('dir_nombre') || d.dirNombre,
      bono: num('bono') ?? d.bono,
      candidata: {
        nombre,
        corto: nombre.split(' ')[0],
        tel: (p.get('tel_wa') || d.candidata.tel).replace(/\D/g, ''),
        nivel: parseNivel(p.get('nivel')) ?? d.candidata.nivel,
        ventaGp: p.has('venta_gp') ? num('venta_gp') : d.candidata.ventaGp,
        activas: p.has('activas') ? num('activas') : d.candidata.activas,
        pped: p.has('pped') ? num('pped') : d.candidata.pped,
        potencial:
          potencial === 'alto' || potencial === 'medio' || potencial === 'bajo'
            ? potencial
            : d.candidata.potencial,
        interes: interes !== null ? interes === '1' || interes === 'true' : d.candidata.interes,
        sueno: p.has('sueno') ? p.get('sueno') : d.candidata.sueno,
      },
    };
  });

  /** El plan parte del nivel real de la candidata (mismo motor que /sim/carrera). */
  protected readonly ritmo = linkedSignal(
    () => SIM_CONFIG.planes[this.ctx().candidata.nivel].ritmos[1],
  );
  protected readonly inicio = signal(opcionesInicio()[0].abs);
  protected readonly simulado = signal(false);
  protected readonly semillero = signal(false);

  protected readonly nombreNivelCand = computed(() => nivelNombre(this.ctx().candidata.nivel));
  protected readonly plan = computed(() =>
    simularPlan(this.ctx().candidata.nivel, this.ritmo(), this.inicio(), null),
  );

  protected readonly ritmoOpciones = computed<ChipOpcion[]>(() => {
    const labels = ['Ritmo intenso', 'Ritmo parejo', 'A su ritmo'];
    return SIM_CONFIG.planes[this.ctx().candidata.nivel].ritmos.map((r, i) => ({
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

  /** Deep link a la vista carrera con los mismos parámetros del plan. */
  private readonly linkCarrera = computed(() => {
    const c = this.ctx().candidata;
    const tree = this.router.createUrlTree(['/sim/carrera'], {
      queryParams: {
        nombre: c.corto,
        nivel: c.nivel,
        ...(c.sueno ? { sueno: c.sueno } : {}),
        dir_nombre: this.ctx().dirNombre,
      },
    });
    return new URL(this.router.serializeUrl(tree).replace(/^\//, ''), document.baseURI).href;
  });

  /** CTA primaria: compartir el plan con la candidata por WhatsApp. */
  protected readonly waHref = computed(() => {
    const c = this.ctx().candidata;
    const msg =
      `Hola ${c.corto} 👋 Armé tu plan en el simulador: serías Directora en ` +
      `${this.ritmo()} campañas empezando en ${campLabel(this.inicio())}. ` +
      `Mira tu camino y cuéntame qué te parece — lo hacemos juntas: ${this.linkCarrera()}`;
    return `https://wa.me/${c.tel}?text=${encodeURIComponent(msg)}`;
  });

  protected etiqueta(abs: number): string {
    return campLabel(abs);
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
