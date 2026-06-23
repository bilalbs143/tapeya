#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(FacebookAnalyticsPlugin, "FacebookAnalytics",
    CAP_PLUGIN_METHOD(logEvent, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(logPurchase, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(flush, CAPPluginReturnPromise);
)
