import UIKit
import Capacitor

/**
 * Capacitor 6+ no longer auto-discovers local App-target plugins.
 * Register them here so JS registerPlugin('FcmToken') / 'FacebookAnalytics' work.
 *
 * Capacitor webview transparency is toggled by YoutubeStreamOverlayPlugin when underlay
 * is active (portrait + landscape). Do not set it globally here.
 *
 * Inline media: Capacitor already sets allowsInlineMediaPlayback = true on the WKWebView.
 */
class AppBridgeViewController: CAPBridgeViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black
    }

    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(FcmTokenPlugin())
        bridge?.registerPluginInstance(FacebookAnalyticsPlugin())
        bridge?.registerPluginInstance(YoutubeStreamOverlayPlugin())
        bridge?.registerPluginInstance(TapeyaBroadcastPlugin())
    }
}
