import AppTrackingTransparency
import FBSDKCoreKit
import UIKit

/**
 * App Tracking Transparency — show before any Facebook advertiser-ID / activateApp work.
 *
 * iPadOS often drops `requestTrackingAuthorization` if it runs in the first
 * `applicationDidBecomeActive` tick (no key window yet). Delay slightly and
 * prefer the scene-active path used by Capacitor.
 */
enum AttPrompt {
    private static var requested = false
    private static var facebookActivated = false

    static func requestIfNeeded() {
        guard !requested else {
            activateFacebookIfAllowed()
            return
        }

        if #available(iOS 14, *) {
            let status = ATTrackingManager.trackingAuthorizationStatus
            if status != .notDetermined {
                requested = true
                apply(status: status)
                activateFacebookIfAllowed()
                return
            }

            requested = true
            // Give the key window / splash a beat — otherwise the system sheet never appears on iPad.
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
                guard ATTrackingManager.trackingAuthorizationStatus == .notDetermined else {
                    apply(status: ATTrackingManager.trackingAuthorizationStatus)
                    activateFacebookIfAllowed()
                    return
                }
                ATTrackingManager.requestTrackingAuthorization { status in
                    DispatchQueue.main.async {
                        apply(status: status)
                        activateFacebookIfAllowed()
                    }
                }
            }
            return
        }

        requested = true
        Settings.shared.isAdvertiserIDCollectionEnabled = true
        activateFacebookIfAllowed()
    }

    private static func apply(status: ATTrackingManager.AuthorizationStatus) {
        Settings.shared.isAdvertiserIDCollectionEnabled = status == .authorized
    }

    private static func activateFacebookIfAllowed() {
        guard !facebookActivated else { return }
        facebookActivated = true
        AppEvents.shared.activateApp()
    }
}
