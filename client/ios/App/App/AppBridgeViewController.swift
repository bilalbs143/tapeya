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
        // Native iOS edge-swipe back. WKWebView records SPA navigations
        // (history.pushState), so this steps back through React Router screens.
        // TapeyaBroadcastPlugin turns it off while the camera preview is live.
        webView?.allowsBackForwardNavigationGestures = true
        // Cap may insert its splash above the WebView — keep brand overlay on top.
        SplashBrandOverlay.bringToFront()
    }
}
