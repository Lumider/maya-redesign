// swift-tools-version:5.9
import PackageDescription

// App de barra de menú (macOS 13+) que muestra la campaña Yanbal actual.
// El motor de cálculo vive en la librería CampaignKit (Foundation puro y testeable);
// el ejecutable YanbalCampanas es la capa SwiftUI. build.sh empaqueta el .app.
let package = Package(
  name: "YanbalCampanas",
  // iOS se añade para que el widget/app de iPhone (carpeta ios/) pueda depender
  // de la librería CampaignKit. El ejecutable de menú (YanbalCampanas) usa AppKit
  // y solo se compila en macOS; en iOS únicamente se usa el producto CampaignKit.
  platforms: [
    .macOS(.v13),
    .iOS(.v17),
  ],
  targets: [
    .target(
      name: "CampaignKit",
      path: "Sources/CampaignKit"
    ),
    .executableTarget(
      name: "YanbalCampanas",
      dependencies: ["CampaignKit"],
      path: "Sources/YanbalCampanas"
    ),
    .testTarget(
      name: "CampaignKitTests",
      dependencies: ["CampaignKit"],
      path: "Tests/CampaignKitTests"
    ),
  ]
)
