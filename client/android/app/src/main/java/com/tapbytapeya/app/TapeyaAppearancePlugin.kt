package com.tapbytapeya.app

import android.content.Context
import android.content.res.Configuration
import android.os.Handler
import android.os.Looper
import androidx.appcompat.app.AppCompatDelegate
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

/**
 * Cap Preferences `tapeya:theme` → AppCompat night mode (cold start + live).
 * Live `apply` must hop to the main thread — Capacitor runs plugin methods off-main.
 */
@CapacitorPlugin(name = "TapeyaAppearance")
class TapeyaAppearancePlugin : Plugin() {
    companion object {
        private const val PREFS_GROUP = "CapacitorStorage"
        private const val THEME_KEY = "tapeya:theme"

        @JvmStatic
        fun applyStored(context: Context) {
            applyTheme(
                context.getSharedPreferences(PREFS_GROUP, Context.MODE_PRIVATE).getString(THEME_KEY, null),
            )
        }

        /** Caller must be on the main thread (onCreate or runOnUiThread). */
        @JvmStatic
        fun applyTheme(theme: String?) {
            val mode =
                when (theme) {
                    "light" -> AppCompatDelegate.MODE_NIGHT_NO
                    "dark" -> AppCompatDelegate.MODE_NIGHT_YES
                    else -> AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM
                }
            if (AppCompatDelegate.getDefaultNightMode() == mode) return
            AppCompatDelegate.setDefaultNightMode(mode)
        }

        /** Inflate splash overlay with stored light/dark (Activity may stay system-light). */
        @JvmStatic
        fun splashContext(context: Context): Context {
            val theme =
                context.getSharedPreferences(PREFS_GROUP, Context.MODE_PRIVATE).getString(THEME_KEY, null)
            val night =
                when (theme) {
                    "dark" -> true
                    "light" -> false
                    else -> {
                        val mask =
                            context.resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK
                        mask == Configuration.UI_MODE_NIGHT_YES
                    }
                }
            val config = Configuration(context.resources.configuration)
            val bit =
                if (night) Configuration.UI_MODE_NIGHT_YES else Configuration.UI_MODE_NIGHT_NO
            config.uiMode = (config.uiMode and Configuration.UI_MODE_NIGHT_MASK.inv()) or bit
            return context.createConfigurationContext(config)
        }
    }

    @PluginMethod
    fun apply(call: PluginCall) {
        val theme = call.getString("theme")
        val run = Runnable {
            applyTheme(theme)
            call.resolve()
        }
        val act = activity
        if (act != null) act.runOnUiThread(run)
        else Handler(Looper.getMainLooper()).post(run)
    }

    @PluginMethod
    fun hideSplashBrand(call: PluginCall) {
        val run = Runnable {
            SplashBrandOverlay.hide()
            call.resolve()
        }
        val act = activity
        if (act != null) act.runOnUiThread(run)
        else Handler(Looper.getMainLooper()).post(run)
    }
}
