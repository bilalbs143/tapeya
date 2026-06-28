import Capacitor
import FBSDKCoreKit

@objc(FacebookAnalyticsPlugin)
public class FacebookAnalyticsPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "FacebookAnalyticsPlugin"
    public let jsName = "FacebookAnalytics"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "logEvent", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "logPurchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "flush", returnType: CAPPluginReturnPromise),
    ]

    @objc func logEvent(_ call: CAPPluginCall) {
        guard let eventName = call.getString("eventName") else {
            call.reject("Missing eventName")
            return
        }

        let rawParams = call.getObject("parameters") ?? [:]
        var params: [AppEvents.ParameterName: Any] = [:]
        for (key, value) in rawParams {
            params[AppEvents.ParameterName(key)] = value
        }

        if let value = call.getDouble("valueToSum") {
            AppEvents.shared.logEvent(AppEvents.Name(rawValue: eventName), valueToSum: value, parameters: params)
        } else {
            AppEvents.shared.logEvent(AppEvents.Name(rawValue: eventName), parameters: params)
        }

        call.resolve()
    }

    @objc func logPurchase(_ call: CAPPluginCall) {
        guard let amount = call.getDouble("amount"),
              let currency = call.getString("currency") else {
            call.reject("Missing amount or currency")
            return
        }

        let rawParams = call.getObject("parameters") ?? [:]
        var params: [AppEvents.ParameterName: Any] = [:]
        for (key, value) in rawParams {
            params[AppEvents.ParameterName(key)] = value
        }

        AppEvents.shared.logPurchase(amount: amount, currency: currency, parameters: params)
        call.resolve()
    }

    @objc func flush(_ call: CAPPluginCall) {
        AppEvents.shared.flush(for: .explicit)
        call.resolve()
    }
}
