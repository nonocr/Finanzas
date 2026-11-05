import Capacitor
import UIKit

/// Ícono de la app a juego con el tema. Los íconos alternos viven en Assets.xcassets (Titanio, Oro…) y se declaran
/// en ASSETCATALOG_COMPILER_ALTERNATE_APPICON_NAMES. Solo usa la API pública de Apple; iOS muestra su propio aviso.
@objc(IconoAppPlugin)
public class IconoAppPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "IconoAppPlugin"
    public let jsName = "IconoApp"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "cambiar", returnType: CAPPluginReturnPromise)
    ]

    @objc func cambiar(_ call: CAPPluginCall) {
        // nil = el ícono principal (Negra).
        let nombre = call.getString("nombre")
        DispatchQueue.main.async {
            let app = UIApplication.shared
            guard app.supportsAlternateIcons, app.alternateIconName != nombre else {
                call.resolve(["cambiado": false])
                return
            }
            app.setAlternateIconName(nombre) { error in
                if let error = error {
                    call.reject(error.localizedDescription)
                } else {
                    call.resolve(["cambiado": true])
                }
            }
        }
    }
}

/// Controlador principal (Main.storyboard): registra los plugins propios de la app.
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(IconoAppPlugin())
    }
}
