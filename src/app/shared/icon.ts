import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Iconos de trazo (estilo lucide) usados en toda la app. */
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      @switch (name()) {
        @case ('home') {
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V21h14V9.5" />
          <path d="M10 21v-6h4v6" />
        }
        @case ('star') {
          <path d="m12 3 2.7 5.6 6.3.9-4.5 4.3 1 6.2-5.5-3-5.5 3 1-6.2L3 9.5l6.3-.9Z" />
        }
        @case ('users') {
          <circle cx="9" cy="8" r="3.5" />
          <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
          <path d="M16.5 4.9a3.5 3.5 0 0 1 0 6.2" />
          <path d="M18.5 14.8c1.7.8 2.5 2.3 2.5 4.2" />
        }
        @case ('sparkles') {
          <path d="M12 4l1.7 4.3L18 10l-4.3 1.7L12 16l-1.7-4.3L6 10l4.3-1.7Z" />
          <path d="M19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8Z" />
          <path d="M5 16l.6 1.5L7 18l-1.4.6L5 20l-.6-1.4L3 18l1.4-.5Z" />
        }
        @case ('cap') {
          <path d="m2 9 10-5 10 5-10 5L2 9Z" />
          <path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5" />
          <path d="M22 9v5" />
        }
        @case ('heart-plus') {
          <path
            d="M12 20.5C7 16.5 3 13.3 3 9.3 3 6.4 5.2 4.5 7.7 4.5c1.7 0 3.3.9 4.3 2.3a5.2 5.2 0 0 1 4.3-2.3c2.5 0 4.7 1.9 4.7 4.8 0 4-4 7.2-9 11.2Z"
          />
        }
        @case ('cart') {
          <circle cx="9" cy="20" r="1.4" />
          <circle cx="17" cy="20" r="1.4" />
          <path d="M3 4h2.2l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h7.6a1.5 1.5 0 0 0 1.5-1.2L20 8H6" />
        }
        @case ('bell') {
          <path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6" />
          <path d="M10.3 19a2 2 0 0 0 3.4 0" />
        }
        @case ('search') {
          <circle cx="11" cy="11" r="6.5" />
          <path d="m20 20-3.8-3.8" />
        }
        @case ('chevron-right') {
          <path d="m9 5 7 7-7 7" />
        }
        @case ('chevron-down') {
          <path d="m5 9 7 7 7-7" />
        }
        @case ('menu') {
          <path d="M4 6.5h16" />
          <path d="M4 12h16" />
          <path d="M4 17.5h10" />
        }
        @case ('x') {
          <path d="m6 6 12 12" />
          <path d="m18 6-12 12" />
        }
        @case ('external') {
          <path d="M14 4h6v6" />
          <path d="m20 4-9 9" />
          <path d="M19 13.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5.5" />
        }
        @case ('box') {
          <path d="m12 2 8 4.5v11L12 22l-8-4.5v-11L12 2Z" />
          <path d="m4.5 7 7.5 4 7.5-4" />
          <path d="M12 11v11" />
        }
        @case ('chart') {
          <path d="M4 20V10" />
          <path d="M10 20V4" />
          <path d="M16 20v-8" />
          <path d="M22 20H2" />
        }
        @case ('file') {
          <path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8l-5-5Z" />
          <path d="M14 3v5h5" />
          <path d="M9 13h6" />
          <path d="M9 17h6" />
        }
        @case ('calendar') {
          <rect x="4" y="5" width="16" height="16" rx="2" />
          <path d="M8 3v4" />
          <path d="M16 3v4" />
          <path d="M4 11h16" />
        }
        @case ('wallet') {
          <path d="M20 7H5a2 2 0 0 1-2-2 2 2 0 0 1 2-2h13v4" />
          <path d="M3 5v13a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1" />
          <circle cx="16.5" cy="13.5" r="1.2" />
        }
        @case ('alert') {
          <path d="M12 8.5V13" />
          <circle cx="12" cy="16.5" r="0.4" />
          <path
            d="M10.3 3.9 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
          />
        }
        @case ('check') {
          <path d="m4 12.5 5 5L20 6.5" />
        }
        @case ('filter') {
          <path d="M4 6h16" />
          <path d="M7 12h10" />
          <path d="M10 18h4" />
        }
        @case ('sort') {
          <path d="M7 4v13" />
          <path d="m4 14 3 3 3-3" />
          <path d="M17 20V7" />
          <path d="m14 10 3-3 3 3" />
        }
        @case ('gift') {
          <rect x="3" y="9" width="18" height="4" rx="1" />
          <path d="M5 13v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" />
          <path d="M12 9v12" />
          <path d="M12 9c-4.5 0-5.5-2.2-5.5-3.2A1.9 1.9 0 0 1 8.4 4c2.3 0 3.6 2.7 3.6 5Z" />
          <path d="M12 9c4.5 0 5.5-2.2 5.5-3.2A1.9 1.9 0 0 0 15.6 4C13.3 4 12 6.7 12 9Z" />
        }
        @case ('plane') {
          <path
            d="M10.5 13.5 3 11l1.5-2L10 10l4-6h2.5l-2.5 7 5 1 1.5-1.5L22 12l-3 3-8-1-2 5H7l1.5-5.5Z"
          />
        }
        @case ('trending') {
          <path d="m3 16 6-6 4 4 8-8" />
          <path d="M15 6h6v6" />
        }
        @case ('arrow-right') {
          <path d="M4 12h16" />
          <path d="m14 6 6 6-6 6" />
        }
        @case ('arrow-left') {
          <path d="M20 12H4" />
          <path d="m10 6-6 6 6 6" />
        }
        @case ('target') {
          <circle cx="12" cy="12" r="8.5" />
          <circle cx="12" cy="12" r="4.5" />
          <circle cx="12" cy="12" r="0.6" />
        }
        @case ('sun') {
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2.5" />
          <path d="M12 19.5V22" />
          <path d="M4.2 4.2 6 6" />
          <path d="M18 18l1.8 1.8" />
          <path d="M2 12h2.5" />
          <path d="M19.5 12H22" />
          <path d="M4.2 19.8 6 18" />
          <path d="M18 6l1.8-1.8" />
        }
        @case ('moon') {
          <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
        }
      }
    </svg>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        line-height: 0;
      }
    `,
  ],
})
export class Icon {
  readonly name = input.required<string>();
  readonly size = input(20);
}
