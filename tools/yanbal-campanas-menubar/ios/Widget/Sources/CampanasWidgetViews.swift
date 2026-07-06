import CampaignKit
import SwiftUI
import WidgetKit

/// Vista del widget. Se adapta a la familia: pantalla de inicio (small/medium) y
/// pantalla de bloqueo (accessoryRectangular/accessoryInline).
struct CampanasWidgetView: View {
  @Environment(\.widgetFamily) private var family
  let entry: CampanaEntry

  private let brand = Color(red: 0xDC / 255, green: 0x58 / 255, blue: 0x2A / 255)

  var body: some View {
    contenido
      .containerBackground(for: .widget) { fondo }
  }

  @ViewBuilder private var fondo: some View {
    switch family {
    case .systemSmall, .systemMedium: brand.opacity(0.12)
    default: Color.clear  // en la pantalla de bloqueo el sistema pone su propio fondo
    }
  }

  @ViewBuilder private var contenido: some View {
    if let s = entry.snapshot {
      switch family {
      case .accessoryInline:
        Text("\(s.campana.etiqueta) · S\(s.semana) · cierra \(CampaignCalendar.fechaCorta(s.campana.fin))")
      case .accessoryRectangular:
        VStack(alignment: .leading, spacing: 2) {
          Text("\(s.campana.etiqueta) · S\(s.semana)").font(.headline)
          Text("Cierra \(CampaignCalendar.fechaCorta(s.campana.fin)) · \(cortoDias(s.diasRestantes))")
            .font(.caption)
        }
      case .systemMedium:
        medium(s)
      default:
        small(s)
      }
    } else {
      Text("Sin datos").font(.caption).foregroundStyle(.secondary)
    }
  }

  private func small(_ s: CampaignSnapshot) -> some View {
    VStack(alignment: .leading, spacing: 4) {
      Text(s.campana.etiqueta)
        .font(.system(size: 34, weight: .bold))
        .foregroundStyle(brand)
      Text("Semana \(s.semana) de \(s.campana.totalSemanas)")
        .font(.caption).fontWeight(.medium)
      Spacer(minLength: 0)
      Text("Cierra \(CampaignCalendar.fechaCorta(s.campana.fin))")
        .font(.caption2).foregroundStyle(.secondary)
      Text(cortoDias(s.diasRestantes))
        .font(.caption2).foregroundStyle(.secondary)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
  }

  private func medium(_ s: CampaignSnapshot) -> some View {
    HStack(alignment: .top, spacing: 14) {
      VStack(alignment: .leading, spacing: 2) {
        Text(s.campana.etiqueta)
          .font(.system(size: 40, weight: .bold))
          .foregroundStyle(brand)
        Text("Semana \(s.semana)/\(s.campana.totalSemanas)")
          .font(.caption).fontWeight(.medium)
        Text("Cierra \(CampaignCalendar.fechaCorta(s.campana.fin))")
          .font(.caption2).foregroundStyle(.secondary)
        Text(cortoDias(s.diasRestantes))
          .font(.caption2).foregroundStyle(.secondary)
      }
      if !s.proximas.isEmpty {
        Divider()
        VStack(alignment: .leading, spacing: 4) {
          Text("PRÓXIMAS")
            .font(.system(size: 9, weight: .semibold))
            .foregroundStyle(.secondary)
          ForEach(s.proximas) { c in
            HStack(spacing: 6) {
              Text(c.etiqueta)
                .font(.caption2).fontWeight(.semibold)
                .frame(width: 26, alignment: .leading)
              Text(CampaignCalendar.rango(c))
                .font(.caption2).foregroundStyle(.secondary)
            }
          }
        }
      }
      Spacer(minLength: 0)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
  }

  private func cortoDias(_ d: Int) -> String {
    switch d {
    case 0: return "cierra hoy"
    case 1: return "1 día"
    default: return "\(d) días"
    }
  }
}
