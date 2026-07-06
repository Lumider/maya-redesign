import CampaignKit
import SwiftUI
import WidgetKit

/// Una entrada de la línea de tiempo: el estado del calendario en una fecha.
struct CampanaEntry: TimelineEntry {
  let date: Date
  let snapshot: CampaignSnapshot?
}

/// Provee las entradas del widget. Como el dato solo cambia al pasar de día
/// (y por tanto de semana/campaña), generamos una entrada por cada medianoche de
/// los próximos días y dejamos que WidgetKit avance sola.
struct CampanaProvider: TimelineProvider {
  func placeholder(in context: Context) -> CampanaEntry {
    CampanaEntry(date: Date(), snapshot: CampaignCalendar.snapshot())
  }

  func getSnapshot(in context: Context, completion: @escaping (CampanaEntry) -> Void) {
    completion(CampanaEntry(date: Date(), snapshot: CampaignCalendar.snapshot()))
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<CampanaEntry>) -> Void) {
    let cal = Calendar.current
    let hoy = cal.startOfDay(for: Date())
    var entries: [CampanaEntry] = []
    for offset in 0..<8 {
      if let dia = cal.date(byAdding: .day, value: offset, to: hoy) {
        entries.append(CampanaEntry(date: dia, snapshot: CampaignCalendar.snapshot(para: dia)))
      }
    }
    completion(Timeline(entries: entries, policy: .atEnd))
  }
}

struct CampanasWidget: Widget {
  let kind = "CampanasWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: CampanaProvider()) { entry in
      CampanasWidgetView(entry: entry)
    }
    .configurationDisplayName("Campaña Yanbal")
    .description("Muestra la campaña y semana actual del calendario Yanbal.")
    .supportedFamilies([.systemSmall, .systemMedium, .accessoryRectangular, .accessoryInline])
  }
}
