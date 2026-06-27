import Foundation
import Capacitor
import FirebaseMessaging

/**
 * Exposes the Firebase Cloud Messaging registration token on iOS.
 * Capacitor PushNotifications returns a raw APNs device token; FCM delivery requires this token instead.
 */
@objc(FcmTokenPlugin)
public class FcmTokenPlugin: CAPPlugin {

    private static weak var sharedPlugin: FcmTokenPlugin?
    // Cache the most recent FCM token so JS listeners that attach late still receive it.
    private static var cachedToken: String?

    public override func load() {
        FcmTokenPlugin.sharedPlugin = self
    }

    @objc func getToken(_ call: CAPPluginCall) {
        Messaging.messaging().token { token, error in
            if let error = error {
                call.reject(error.localizedDescription)
                return
            }

            guard let token = token, !token.isEmpty else {
                call.reject("FCM token unavailable")
                return
            }

            call.resolve(["value": token])
        }
    }

    // Called by JS to attach a "tokenRefresh" listener; replays cached token if already received.
    public override func addListener(_ call: CAPPluginCall) {
        super.addListener(call)
        if let eventName = call.getString("eventName"), eventName == "tokenRefresh",
           let token = FcmTokenPlugin.cachedToken {
            notifyListeners("tokenRefresh", data: ["value": token])
        }
    }

    @objc static func notifyTokenRefresh(_ token: String) {
        guard !token.isEmpty else { return }
        cachedToken = token
        sharedPlugin?.notifyListeners("tokenRefresh", data: ["value": token])
    }
}
