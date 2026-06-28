import Foundation
import Capacitor
import FirebaseMessaging

/**
 * Exposes the Firebase Cloud Messaging registration token on iOS.
 * Capacitor PushNotifications returns a raw APNs device token; FCM delivery requires this token instead.
 */
@objc(FcmTokenPlugin)
public class FcmTokenPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "FcmTokenPlugin"
    public let jsName = "FcmToken"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getToken", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getDebugInfo", returnType: CAPPluginReturnPromise),
    ]

    private static weak var sharedPlugin: FcmTokenPlugin?
    private static var cachedToken: String?
    private static var lastGetTokenError: String?

    public override func load() {
        FcmTokenPlugin.sharedPlugin = self
    }

    @objc func getToken(_ call: CAPPluginCall) {
        Messaging.messaging().token { token, error in
            if let error = error {
                FcmTokenPlugin.lastGetTokenError = error.localizedDescription
                call.reject(error.localizedDescription)
                return
            }

            guard let token = token, !token.isEmpty else {
                FcmTokenPlugin.lastGetTokenError = "FCM token unavailable"
                call.reject("FCM token unavailable")
                return
            }

            FcmTokenPlugin.lastGetTokenError = nil
            FcmTokenPlugin.cachedToken = token
            call.resolve(["value": token])
        }
    }

    @objc func getDebugInfo(_ call: CAPPluginCall) {
        call.resolve([
            "hasApnsToken": Messaging.messaging().apnsToken != nil,
            "cachedFcmToken": FcmTokenPlugin.cachedToken ?? NSNull(),
            "lastGetTokenError": FcmTokenPlugin.lastGetTokenError ?? NSNull(),
        ])
    }

    public override func addListener(_ call: CAPPluginCall) {
        super.addListener(call)
        if let eventName = call.getString("eventName"), eventName == "tokenRefresh",
           let token = FcmTokenPlugin.cachedToken {
            notifyListeners("tokenRefresh", data: ["value": token])
        }
    }

    @objc static func notifyApnsRegistrationFailed(_ message: String) {
        lastGetTokenError = "APNs: \(message)"
    }

    @objc static func notifyTokenRefresh(_ token: String) {
        guard !token.isEmpty else { return }
        cachedToken = token
        lastGetTokenError = nil
        sharedPlugin?.notifyListeners("tokenRefresh", data: ["value": token])
    }
}
