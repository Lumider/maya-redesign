import SwiftUI

/// App contenedora del widget. En iOS un widget necesita una app "anfitriona":
/// esta muestra el calendario completo al abrirla, y su única razón de existir
/// (además de eso) es poder instalar el widget en el sistema.
@main
struct CampanasYanbalApp: App {
  var body: some Scene {
    WindowGroup {
      ContentView()
    }
  }
}
