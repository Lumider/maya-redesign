// swift-tools-version:5.9
import PackageDescription

// Motor de cálculo del calendario Yanbal — copia propia y autocontenida para el
// proyecto de iOS (mismo código que el repo de macOS campanas-yanbal-menubar).
// Si algún día cambia la lógica del calendario, actualízala en ambos repos.
let package = Package(
  name: "CampaignKit",
  platforms: [
    .iOS(.v17),
    .macOS(.v13),
  ],
  products: [
    .library(name: "CampaignKit", targets: ["CampaignKit"]),
  ],
  targets: [
    .target(name: "CampaignKit", path: "Sources/CampaignKit"),
  ]
)
