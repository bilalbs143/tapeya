import UIKit
import Capacitor

/**
 * Capacitor 6+ no longer auto-discovers local App-target plugins.
 * Register them here so JS registerPlugin('FcmToken') / 'FacebookAnalytics' work.
 */
class AppBridgeViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(FcmTokenPlugin())
        bridge?.registerPluginInstance(FacebookAnalyticsPlugin())
        bridge?.registerPluginInstance(YoutubeStreamOverlayPlugin())
    }
}
