#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(YoutubeStreamOverlayPlugin, "YoutubeStreamOverlay",
    CAP_PLUGIN_METHOD(show, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(updateLayout, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(hide, CAPPluginReturnPromise);
)
