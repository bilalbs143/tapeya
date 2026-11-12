import UIKit
import Capacitor

/**
 * Capacitor no longer auto-discovers local App-target plugins.
 * Register local plugins here so JS `registerPlugin(...)` works.
 *
 * WebView transparency for camera underlay is toggled by the plugin while previewing —
 * do not set it globally here.
 */
class AppBridgeViewController: CAPBridgeViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black
    }

    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(TapeyaAppearancePlugin())
        bridge?.registerPluginInstance(TapeyaBroadcastPlugin())
        bridge?.registerPluginInstance(YoutubeStreamOverlayPlugin())
        bridge?.registerPluginInstance(FacebookAnalyticsPlugin())
    }
}
