import CampaignKit
import SwiftUI

/// Pantalla de la app: campaña/semana actual + próximas. Reutiliza el mismo motor
/// (CampaignKit) que el widget y que la app de macOS.
struct ContentView: View {
  private let snapshot = CampaignCalendar.snapshot()
  private let brand = Color(red: 0xDC / 255, green: 0x58 / 255, blue: 0x2A / 255)

  var body: some View {
    NavigationStack {
      if let s = snapshot {
        List {
          Section {
            VStack(alignment: .leading, spacing: 6) {
              HStack(spacing: 10) {
                YanbalIso()
                  .fill(brand)
                  .frame(width: 28, height: 27)
                Text("Campaña \(s.campana.etiqueta)")
                  .font(.largeTitle).bold()
                  .foregroundStyle(brand)
              }
              Text("Semana \(s.semana) de \(s.campana.totalSemanas)")
                .font(.title3)
              Text(CampaignCalendar.rango(s.campana))
                .foregroundStyle(.secondary)
              Text("Cierra el \(CampaignCalendar.cierre(s.campana.fin)) · \(diasTexto(s.diasRestantes))")
                .font(.callout).fontWeight(.medium)
                .padding(.top, 4)
            }
            .padding(.vertical, 6)
          }

          if !s.proximas.isEmpty {
            Section("Próximas campañas") {
              ForEach(s.proximas) { c in
                HStack {
                  Text(c.etiqueta)
                    .fontWeight(.semibold)
                    .frame(width: 40, alignment: .leading)
                  Text(CampaignCalendar.rango(c))
                    .foregroundStyle(.secondary)
                }
              }
            }
          }

          Section {
            Text("Para añadir el widget: mantén pulsada la pantalla de inicio (o de bloqueo) → botón + → busca «Campaña Yanbal».")
              .font(.footnote)
              .foregroundStyle(.secondary)
          }
        }
        .navigationTitle("Campañas Yanbal")
      } else {
        ContentUnavailableView(
          "Sin datos de calendario",
          systemImage: "calendar",
          description: Text("La fecha de hoy queda fuera del calendario cargado.")
        )
      }
    }
  }

  private func diasTexto(_ d: Int) -> String {
    switch d {
    case 0: return "cierra hoy"
    case 1: return "falta 1 día"
    default: return "faltan \(d) días"
    }
  }
}
