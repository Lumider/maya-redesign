# Campañas Yanbal — widget para iPhone (iOS)

Widget de **pantalla de inicio** y **pantalla de bloqueo** que muestra la campaña y
semana actual del calendario Yanbal (`C7 · S3`), cuándo cierra y los días que faltan.
Incluye una mini app que, al abrirla, muestra el calendario completo.

Comparte el mismo motor de cálculo (`CampaignKit`) que la app de macOS — cero
duplicación: el widget depende del paquete Swift de la carpeta superior.

## Requisitos

- **Xcode** (App Store) en tu Mac.
- **XcodeGen** para generar el proyecto desde `project.yml`:
  ```bash
  brew install xcodegen
  ```
- Un iPhone con **iOS 17+** y su **cable**.
- Un **Apple ID** (el gratis sirve; ver la nota de los 7 días más abajo).

## Generar y abrir el proyecto

Desde esta carpeta (`ios/`):

```bash
xcodegen generate
open CampanasYanbal.xcodeproj
```

## Configurar la firma (una sola vez)

En Xcode, para **cada uno de los dos targets** (`CampanasYanbal` y
`CampanasWidgetExtension`):

1. Selecciona el proyecto en el panel izquierdo → pestaña **Signing & Capabilities**.
2. Marca **Automatically manage signing**.
3. En **Team**, elige tu Apple ID (aparece como "Tu Nombre (Personal Team)").
   Si no está, pulsa **Add an Account…** e inicia sesión con tu Apple ID.
4. Si Xcode se queja de que el **Bundle Identifier** ya existe, cámbialo por algo
   único, p. ej. `com.TUNOMBRE.campanasyanbal` (y el widget
   `com.TUNOMBRE.campanasyanbal.widget` — el del widget SIEMPRE lleva el del app + `.widget`).

## Instalar en tu iPhone

1. Conecta el iPhone por cable y **confía** en el Mac si te lo pide.
2. Arriba en Xcode, en el selector de dispositivo, elige **tu iPhone** (no un simulador).
3. Pulsa **▶ Run**. La primera vez tardará y puede pedirte tu contraseña del llavero.
4. En el iPhone saldrá "Dispositivo no confiable": ve a **Ajustes → General →
   VPN y gestión de dispositivos → [tu Apple ID] → Confiar**.
5. Vuelve a pulsar **▶ Run** si hizo falta. La app queda instalada.

## Añadir el widget

- **Pantalla de inicio:** mantén pulsada la pantalla → botón **+** (arriba a la
  izquierda) → busca **«Campaña Yanbal»** → elige tamaño pequeño o mediano → **Añadir**.
- **Pantalla de bloqueo:** mantén pulsada la pantalla de bloqueo → **Personalizar**
  → **Bloqueo** → toca la zona de widgets → añade **«Campaña Yanbal»**.

## ⚠️ Lo de los 7 días (Apple ID gratis)

Con un Apple ID gratuito, la firma **caduca a los 7 días**: el widget dejará de
actualizarse y la app pedirá reinstalarse. Para renovar: conecta el iPhone y pulsa
**▶ Run** en Xcode otra vez. (Con una cuenta **Apple Developer** de 99 USD/año esto
no pasa y además puedes instalar sin cable vía TestFlight.)

## Estructura

```
ios/
├── project.yml                         Especificación XcodeGen (app + widget)
├── App/Sources/
│   ├── CampanasApp.swift               @main de la app contenedora
│   └── ContentView.swift               Pantalla con el calendario
└── Widget/Sources/
    ├── CampanasWidgetBundle.swift      @main del widget
    ├── CampanasWidget.swift            Widget + TimelineProvider
    └── CampanasWidgetViews.swift       Vistas por tamaño (inicio y bloqueo)
```

> El motor de cálculo NO está aquí: se reutiliza desde `../Sources/CampaignKit/`
> a través del paquete Swift de la raíz del repo (ver `project.yml`).
