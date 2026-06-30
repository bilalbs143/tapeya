import UIKit
import Capacitor

/**
 * Capacitor 6+ no longer auto-discovers local App-target plugins.
 * Register them here so JS registerPlugin('FcmToken') / 'FacebookAnalytics' work.
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

        // Let HTML overlays (LIVE badge, landscape toggle) render above the native stream WKWebView.
        if let webView = bridge?.webView {
            webView.isOpaque = false
            webView.backgroundColor = .clear
            webView.scrollView.backgroundColor = .clear
            if #available(iOS 15.0, *) {
                webView.underPageBackgroundColor = .clear
            }
        }
    }
}
