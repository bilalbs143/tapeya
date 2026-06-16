#import <Capacitor/Capacitor.h>

CAP_PLUGIN(FcmTokenPlugin, "FcmToken",
    CAP_PLUGIN_METHOD(getToken, CAPPluginReturnPromise);
)
