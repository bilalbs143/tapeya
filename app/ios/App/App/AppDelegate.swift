import UIKit
import UserNotifications
import Capacitor
import AppTrackingTransparency
import FBSDKCoreKit
import FirebaseCore
import FirebaseMessaging

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, MessagingDelegate, UNUserNotificationCenterDelegate {

    var window: UIWindow?
    private var didRequestTrackingAuthorization = false

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        ApplicationDelegate.shared.application(application, didFinishLaunchingWithOptions: launchOptions)
        syncFacebookTrackingSettings()
        FirebaseApp.configure()
        Messaging.messaging().delegate = self
        // Show banners/sounds/badges even when the app is foregrounded.
        UNUserNotificationCenter.current().delegate = self
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        requestTrackingAuthorizationIfNeeded()
        AppEvents.shared.activateApp()
    }

    func applicationWillTerminate(_ application: UIApplication) {
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        // Link APNs token to Firebase so FCM can deliver to this device.
        Messaging.messaging().apnsToken = deviceToken
        // Keep Capacitor push listeners working for notification tap handling.
        NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
    }

    func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
        guard let token = fcmToken, !token.isEmpty else { return }
        FcmTokenPlugin.notifyTokenRefresh(token)
    }

    // Display push notifications as banners/sounds/badges when the app is in the foreground.
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        if #available(iOS 14.0, *) {
            completionHandler([.banner, .sound, .badge])
        } else {
            completionHandler([.alert, .sound, .badge])
        }
    }

    private func syncFacebookTrackingSettings() {
        if #available(iOS 14, *) {
            let authorized = ATTrackingManager.trackingAuthorizationStatus == .authorized
            Settings.shared.isAdvertiserIDCollectionEnabled = authorized
        } else {
            Settings.shared.isAdvertiserIDCollectionEnabled = true
        }
    }

    private func requestTrackingAuthorizationIfNeeded() {
        if #available(iOS 14, *) {
            let status = ATTrackingManager.trackingAuthorizationStatus
            if status != .notDetermined {
                syncFacebookTrackingSettings()
                return
            }
            guard !didRequestTrackingAuthorization else { return }
            didRequestTrackingAuthorization = true
            ATTrackingManager.requestTrackingAuthorization { _ in
                self.syncFacebookTrackingSettings()
            }
            return
        }

        syncFacebookTrackingSettings()
    }

}
