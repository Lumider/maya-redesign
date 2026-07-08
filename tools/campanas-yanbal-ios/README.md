# Campañas Yanbal — widget para iPhone (iOS)

Widget de **pantalla de inicio** y **pantalla de bloqueo** que muestra la campaña y
semana actual del calendario Yanbal (`C7 · S3`), cuándo cierra y los días que faltan.
Incluye una mini app que, al abrirla, muestra el calendario completo con el iso de Yanbal.

Proyecto **autocontenido**: el motor de cálculo (`CampaignKit`) vive dentro de este
mismo repo, en la carpeta `CampaignKit/`. Es una copia del mismo motor del proyecto
de macOS (`campanas-yanbal-menubar`); si cambias la lógica del calendario, actualízala
en ambos.

## Requisitos

- **Xcode** completo (App Store) en tu Mac — no basta con las Command Line Tools.
- **XcodeGen** para generar el proyecto:
  ```bash
  brew install xcodegen
  ```
- Un iPhone con **iOS 17+** y su **cable**.
- Un **Apple ID** (el gratis sirve; ver la nota de los 7 días).

## Generar y abrir el proyecto

Desde la raíz del repo:

```bash
xcodegen generate
open CampanasYanbal.xcodeproj
```

## Configurar la firma (una sola vez)

En Xcode, para **cada uno de los dos targets** (`CampanasYanbal` y
`CampanasWidgetExtension`):

1. Selecciona el proyecto → pestaña **Signing & Capabilities**.
2. Marca **Automatically manage signing**.
3. En **Team**, elige tu Apple ID ("Tu Nombre (Personal Team)"). Si no está,
   **Add an Account…** e inicia sesión.
4. Si Xcode se queja de que el **Bundle Identifier** ya existe, cámbialo por algo
   único, p. ej. `com.TUNOMBRE.campanasyanbal` (y el widget con `.widget` al final).

## Instalar en tu iPhone

1. Conecta el iPhone por cable y **confía** en el Mac si te lo pide.
2. Arriba en Xcode elige **tu iPhone** como destino (no un simulador).
3. Pulsa **▶ Run**.
4. En el iPhone: **Ajustes → General → VPN y gestión de dispositivos → [tu Apple ID]
   → Confiar**. Vuelve a pulsar **▶ Run** si hace falta.

## Añadir el widget

- **Pantalla de inicio:** mantén pulsada la pantalla → **+** → busca **«Campaña Yanbal»**.
- **Pantalla de bloqueo:** mantén pulsada → **Personalizar** → **Bloqueo** → zona de
  widgets → añade **«Campaña Yanbal»**.

## ⚠️ Apple ID gratis: renovar cada 7 días

Con Apple ID gratuito la firma **caduca a los 7 días**: el widget deja de actualizarse
y la app pide reinstalarse. Para renovar: conecta el iPhone y pulsa **▶ Run** otra vez.
(Con cuenta **Apple Developer** de 99 USD/año esto no pasa y puedes usar TestFlight.)

## Estructura

```
project.yml                          Especificación XcodeGen (app + widget)
CampaignKit/                         Motor de cálculo (paquete Swift local)
  Package.swift
  Sources/CampaignKit/
    CampaignCalendar.swift           Cálculo de campañas (anclas + aritmética)
    YanbalIso.swift                  Isotipo "Y" de Yanbal como Shape SwiftUI
App/Sources/
  CampanasApp.swift                  @main de la app contenedora
  ContentView.swift                  Pantalla con el calendario
Widget/Sources/
  CampanasWidgetBundle.swift         @main del widget
  CampanasWidget.swift               Widget + TimelineProvider
  CampanasWidgetViews.swift          Vistas por tamaño (inicio y bloqueo)
CALENDARIO.md                        Reglas y fechas del calendario campañal Yanbal
```
