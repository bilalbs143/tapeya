import UIKit
import Capacitor
import AppTrackingTransparency
import FBSDKCoreKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?
    private var didRequestTrackingAuthorization = false

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        SplashBrandCache.warm()
        ApplicationDelegate.shared.application(application, didFinishLaunchingWithOptions: launchOptions)
        syncFacebookTrackingSettings()
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        TapeyaBroadcastPlugin.handleAppDidEnterBackground()
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        requestTrackingAuthorizationIfNeeded()
        AppEvents.shared.activateApp()
    }

    func applicationWillTerminate(_ application: UIApplication) {
    }

    func application(_ application: UIApplication,
                     configurationForConnecting connectingSceneSession: UISceneSession,
                     options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        let config = UISceneConfiguration(name: "Default Configuration",
                                          sessionRole: connectingSceneSession.role)
        config.delegateClass = SceneDelegate.self
        return config
    }

    private func syncFacebookTrackingSettings() {
        if #available(iOS 14, *) {
            Settings.shared.isAdvertiserIDCollectionEnabled =
                ATTrackingManager.trackingAuthorizationStatus == .authorized
        } else {
            Settings.shared.isAdvertiserIDCollectionEnabled = true
        }
    }

    private func requestTrackingAuthorizationIfNeeded() {
        guard #available(iOS 14, *) else {
            syncFacebookTrackingSettings()
            return
        }

        if ATTrackingManager.trackingAuthorizationStatus != .notDetermined {
            syncFacebookTrackingSettings()
            return
        }

        guard !didRequestTrackingAuthorization else { return }
        didRequestTrackingAuthorization = true
        ATTrackingManager.requestTrackingAuthorization { [weak self] _ in
            self?.syncFacebookTrackingSettings()
        }
    }
}
