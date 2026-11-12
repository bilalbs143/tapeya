import Foundation
import Capacitor
import UIKit

/** Cap Preferences `CapacitorStorage.tapeya:theme` → window UI style (cold start + live). */
enum ThemeAppearance {
    static let preferencesKey = "CapacitorStorage.tapeya:theme"

    static func applyStored(to window: UIWindow) {
        apply(UserDefaults.standard.string(forKey: preferencesKey), to: window)
    }

    static func apply(_ theme: String?, to window: UIWindow? = nil) {
        let style: UIUserInterfaceStyle =
            theme == "light" ? .light : theme == "dark" ? .dark : .unspecified

        window?.overrideUserInterfaceStyle = style
        for case let windowScene as UIWindowScene in UIApplication.shared.connectedScenes {
            for sceneWindow in windowScene.windows where sceneWindow !== window {
                sceneWindow.overrideUserInterfaceStyle = style
            }
        }
    }
}

@objc(TapeyaAppearancePlugin)
public class TapeyaAppearancePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "TapeyaAppearancePlugin"
    public let jsName = "TapeyaAppearance"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "apply", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "hideSplashBrand", returnType: CAPPluginReturnPromise),
    ]

    @objc func apply(_ call: CAPPluginCall) {
        let theme = call.getString("theme")
        DispatchQueue.main.async {
            ThemeAppearance.apply(theme)
            call.resolve()
        }
    }

    @objc func hideSplashBrand(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            SplashBrandOverlay.hide()
            call.resolve()
        }
    }
}
