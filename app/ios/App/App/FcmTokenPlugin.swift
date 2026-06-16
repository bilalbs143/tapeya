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

    @objc static func notifyTokenRefresh(_ token: String) {
        guard !token.isEmpty else { return }
        sharedPlugin?.notifyListeners("tokenRefresh", data: ["value": token])
    }
}
