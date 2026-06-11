import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Ilustraciones 3D estilo Airbnb: objetos suaves con degradados,
 * brillo especular y sombra de apoyo. SVG puro, sin assets externos.
 */
@Component({
  selector: 'app-icon3d',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 96 96" fill="none" aria-hidden="true">
      @switch (name()) {
        @case ('bag') {
          <defs>
            <linearGradient id="bagBody" x1="24" y1="34" x2="72" y2="80" gradientUnits="userSpaceOnUse">
              <stop stop-color="#ff7a93" /><stop offset="1" stop-color="#d70466" />
            </linearGradient>
            <linearGradient id="bagTop" x1="24" y1="34" x2="72" y2="44" gradientUnits="userSpaceOnUse">
              <stop stop-color="#ffafc0" /><stop offset="1" stop-color="#ff5a76" />
            </linearGradient>
          </defs>
          <ellipse cx="48" cy="85" rx="26" ry="6" fill="#222" opacity="0.08" />
          <path d="M36 36v-9c0-7 5-13 12-13s12 6 12 13v9" stroke="#b01551" stroke-width="4.5" stroke-linecap="round" fill="none" />
          <path d="M27 34h42l4 38a8 8 0 0 1-8 8.5H31a8 8 0 0 1-8-8.5l4-38Z" fill="url(#bagBody)" />
          <path d="M27 34h42l1 10H26l1-10Z" fill="url(#bagTop)" />
          <ellipse cx="35" cy="60" rx="5" ry="13" fill="#fff" opacity="0.22" />
          <circle cx="36" cy="40" r="3" fill="#8a0a3c" />
          <circle cx="60" cy="40" r="3" fill="#8a0a3c" />
          <circle cx="63" cy="52" r="2.4" fill="#fff" opacity="0.7" />
        }
        @case ('chart') {
          <defs>
            <linearGradient id="chA" x1="0" y1="0" x2="0" y2="1">
              <stop stop-color="#ffc2cf" /><stop offset="1" stop-color="#ff8aa1" />
            </linearGradient>
            <linearGradient id="chB" x1="0" y1="0" x2="0" y2="1">
              <stop stop-color="#ff7a93" /><stop offset="1" stop-color="#e31c5f" />
            </linearGradient>
            <linearGradient id="chC" x1="0" y1="0" x2="0" y2="1">
              <stop stop-color="#e31c5f" /><stop offset="1" stop-color="#a30c44" />
            </linearGradient>
          </defs>
          <ellipse cx="48" cy="85" rx="28" ry="6" fill="#222" opacity="0.08" />
          <!-- barra 1 -->
          <rect x="22" y="56" width="14" height="24" rx="3" fill="url(#chA)" />
          <path d="M22 56l5-4h14l-5 4z" fill="#ffe1e8" />
          <path d="M36 56l5-4v24l-5 4z" fill="#ff9eb2" />
          <!-- barra 2 -->
          <rect x="42" y="44" width="14" height="36" rx="3" fill="url(#chB)" />
          <path d="M42 44l5-4h14l-5 4z" fill="#ffb3c2" />
          <path d="M56 44l5-4v36l-5 4z" fill="#c4356b" />
          <!-- barra 3 -->
          <rect x="62" y="30" width="14" height="50" rx="3" fill="url(#chC)" />
          <path d="M62 30l5-4h14l-5 4z" fill="#ff7a93" />
          <path d="M76 30l5-4v50l-5 4z" fill="#84083a" />
          <!-- flecha -->
          <path d="M20 42 Q40 36 54 26 T82 12" stroke="#ff385c" stroke-width="4" stroke-linecap="round" fill="none" />
          <path d="M70 10l12 2-4 11" stroke="#ff385c" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" />
        }
        @case ('gift') {
          <defs>
            <linearGradient id="gBox" x1="26" y1="46" x2="70" y2="80" gradientUnits="userSpaceOnUse">
              <stop stop-color="#ff5a76" /><stop offset="1" stop-color="#c11550" />
            </linearGradient>
            <linearGradient id="gLid" x1="22" y1="34" x2="74" y2="48" gradientUnits="userSpaceOnUse">
              <stop stop-color="#ffc2cf" /><stop offset="1" stop-color="#ff7a93" />
            </linearGradient>
          </defs>
          <ellipse cx="48" cy="84" rx="27" ry="6" fill="#222" opacity="0.08" />
          <rect x="27" y="46" width="42" height="34" rx="7" fill="url(#gBox)" />
          <rect x="22" y="34" width="52" height="15" rx="7.5" fill="url(#gLid)" />
          <rect x="43.5" y="34" width="9" height="46" rx="3" fill="#fff5f7" />
          <path d="M48 33c-9-11-21-3-11 4 4 3 11-1 11-4Z" fill="#e31c5f" />
          <path d="M48 33c9-11 21-3 11 4-4 3-11-1-11-4Z" fill="#ff5a76" />
          <circle cx="48" cy="34" r="3.4" fill="#ffe1e8" />
          <ellipse cx="35" cy="62" rx="4.5" ry="10" fill="#fff" opacity="0.18" />
        }
        @case ('plane') {
          <defs>
            <linearGradient id="plTop" x1="12" y1="30" x2="70" y2="55" gradientUnits="userSpaceOnUse">
              <stop stop-color="#ffffff" /><stop offset="1" stop-color="#ffe1e8" />
            </linearGradient>
            <linearGradient id="plBot" x1="38" y1="56" x2="48" y2="78" gradientUnits="userSpaceOnUse">
              <stop stop-color="#ffc2cf" /><stop offset="1" stop-color="#ff8aa1" />
            </linearGradient>
          </defs>
          <ellipse cx="50" cy="85" rx="26" ry="5.5" fill="#222" opacity="0.08" />
          <path d="M84 20 12 50l27 7Z" fill="url(#plTop)" stroke="#ffd0da" stroke-width="1" />
          <path d="M84 20 39 57l6 21Z" fill="url(#plBot)" />
          <path d="M39 57l6 21 7-14Z" fill="#e8657f" />
          <path d="M22 66c5 1 9-1 12-4M30 74c4 0 7-2 9-5" stroke="#ff8aa1" stroke-width="3" stroke-linecap="round" opacity="0.6" />
          <circle cx="78" cy="14" r="11" fill="#ff385c" />
          <path d="M78 9.5v9M73.5 14h9" stroke="#fff" stroke-width="3" stroke-linecap="round" />
        }
        @case ('rocket') {
          <defs>
            <linearGradient id="rkBody" x1="34" y1="20" x2="62" y2="64" gradientUnits="userSpaceOnUse">
              <stop stop-color="#ffffff" /><stop offset="1" stop-color="#ffd0da" />
            </linearGradient>
            <linearGradient id="rkNose" x1="40" y1="10" x2="56" y2="26" gradientUnits="userSpaceOnUse">
              <stop stop-color="#ff7a93" /><stop offset="1" stop-color="#d70466" />
            </linearGradient>
          </defs>
          <ellipse cx="48" cy="86" rx="24" ry="5.5" fill="#222" opacity="0.08" />
          <!-- aletas -->
          <path d="M36 46c-9 5-12 14-10 21l11-7Z" fill="#e31c5f" />
          <path d="M60 46c9 5 12 14 10 21l-11-7Z" fill="#a30c44" />
          <!-- cuerpo -->
          <path d="M48 8c11 10 15 25 15 38 0 9-7 16-15 16s-15-7-15-16c0-13 4-28 15-38Z" fill="url(#rkBody)" stroke="#ffc2cf" stroke-width="1" />
          <path d="M48 8c11 10 15 25 15 38 0 5-2 9-5 12 2-18-2-36-10-50Z" fill="#ffb3c2" opacity="0.55" />
          <!-- punta -->
          <path d="M48 8c5 4 8 9 10 15H38c2-6 5-11 10-15Z" fill="url(#rkNose)" />
          <!-- ventana -->
          <circle cx="48" cy="38" r="7" fill="#ff385c" />
          <circle cx="48" cy="38" r="4" fill="#ffe1e8" />
          <circle cx="46.4" cy="36.4" r="1.5" fill="#fff" />
          <!-- propulsor y llama -->
          <path d="M42 62h12l-2 6h-8Z" fill="#c11550" />
          <path d="M48 70c5 5 4 10 0 16-4-6-5-11 0-16Z" fill="#ff8a3d" />
          <path d="M48 72c3 3 2.5 7 0 11-2.5-4-3-8 0-11Z" fill="#f5b942" />
          <!-- destellos -->
          <path d="M22 26l1.4 3.6L27 31l-3.6 1.4L22 36l-1.4-3.6L17 31l3.6-1.4Z" fill="#ffc2cf" />
          <circle cx="74" cy="22" r="2.4" fill="#ffc2cf" />
        }
        @case ('heart') {
          <defs>
            <linearGradient id="htG" x1="22" y1="24" x2="74" y2="78" gradientUnits="userSpaceOnUse">
              <stop stop-color="#ff5a76" /><stop offset="1" stop-color="#c50556" />
            </linearGradient>
          </defs>
          <ellipse cx="48" cy="85" rx="25" ry="6" fill="#222" opacity="0.08" />
          <path
            d="M48 79C20 59 13 37 25.5 26.5 35.5 18 46 24 48 32c2-8 12.5-14 22.5-5.5C83 37 76 59 48 79Z"
            fill="url(#htG)"
          />
          <ellipse cx="35" cy="36" rx="8.5" ry="5.5" fill="#fff" opacity="0.35" transform="rotate(-24 35 36)" />
          <path d="M73 18l1.6 4.4L79 24l-4.4 1.6L73 30l-1.6-4.4L67 24l4.4-1.6Z" fill="#ffc2cf" />
        }
        @case ('cap') {
          <defs>
            <linearGradient id="cpBoard" x1="12" y1="26" x2="84" y2="50" gradientUnits="userSpaceOnUse">
              <stop stop-color="#a30c44" /><stop offset="1" stop-color="#6f0530" />
            </linearGradient>
            <linearGradient id="cpBase" x1="30" y1="44" x2="66" y2="68" gradientUnits="userSpaceOnUse">
              <stop stop-color="#ff7a93" /><stop offset="1" stop-color="#d70466" />
            </linearGradient>
          </defs>
          <ellipse cx="48" cy="84" rx="27" ry="6" fill="#222" opacity="0.08" />
          <path d="M30 44v12c0 6.5 8 11.5 18 11.5s18-5 18-11.5V44" fill="url(#cpBase)" />
          <path d="M48 20 86 36 48 52 10 36Z" fill="url(#cpBoard)" />
          <path d="M48 26 70 35 48 44 26 35Z" fill="#fff" opacity="0.1" />
          <path d="M86 36v17" stroke="#f5b942" stroke-width="3.2" stroke-linecap="round" />
          <circle cx="86" cy="56.5" r="3.6" fill="#f5b942" />
          <circle cx="48" cy="36" r="3" fill="#ffc2cf" />
        }
      }
    </svg>
  `,
  styles: [`:host { display: inline-flex; line-height: 0; }`],
})
export class Icon3d {
  readonly name = input.required<string>();
  readonly size = input(64);
}
