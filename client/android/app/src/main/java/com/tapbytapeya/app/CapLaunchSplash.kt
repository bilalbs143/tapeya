package com.tapbytapeya.app

import com.getcapacitor.BridgeActivity
import com.getcapacitor.Logger

/**
 * Cap Android 12+ keeps the circular system splash until [SplashScreen.hide], and its
 * launchAutoHide timer only starts on the first content predraw (often ~1–2s with WebView).
 * Dismiss that system splash as soon as [SplashBrandOverlay] is up so users see one brand.
 */
object CapLaunchSplash {
    @JvmStatic
    fun dismiss(activity: BridgeActivity) {
        val bridge = activity.bridge ?: return
        val plugin = bridge.getPlugin("SplashScreen")?.instance ?: return
        try {
            val field = plugin.javaClass.getDeclaredField("splashScreen")
            field.isAccessible = true
            val splash = field.get(plugin) ?: return
            val settingsClass = Class.forName("com.capacitorjs.plugins.splashscreen.SplashScreenSettings")
            val settings = settingsClass.getDeclaredConstructor().newInstance()
            settingsClass.getMethod("setFadeOutDuration", Integer::class.java).invoke(settings, 0)
            splash.javaClass.getMethod("hide", settingsClass).invoke(splash, settings)
        } catch (error: Exception) {
            Logger.error("Cap launch splash dismiss skipped", error)
        }
    }
}
