#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(TapeyaBroadcastPlugin, "TapeyaBroadcast",
    CAP_PLUGIN_METHOD(requestPermissions, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(startPreview, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(stopPreview, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(switchCamera, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(toggleMute, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(startBroadcast, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(stopBroadcast, CAPPluginReturnPromise);
)
