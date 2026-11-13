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

        /** Prefer [Context] directly — [Context.getApplicationContext] crashes in attachBaseContext. */
        @JvmStatic
        fun storedTheme(context: Context): String? =
            context.getSharedPreferences(PREFS_GROUP, Context.MODE_PRIVATE).getString(THEME_KEY, null)

        @JvmStatic
        fun applyStored(context: Context) {
            applyTheme(storedTheme(context))
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

        /** Whether splash should use dark brand page / night logo assets. */
        @JvmStatic
        fun nightModeActive(context: Context): Boolean =
            when (storedTheme(context)) {
                "dark" -> true
                "light" -> false
                else -> {
                    val mask =
                        context.resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK
                    mask == Configuration.UI_MODE_NIGHT_YES
                }
            }

        /**
         * Hardcoded light/dark [Theme.SplashScreen] — Android 12 OS splash does not honor
         * AppCompat night for `@color/splash_background`.
         */
        @JvmStatic
        fun launchSplashThemeRes(context: Context): Int =
            if (nightModeActive(context)) {
                R.style.AppTheme_NoActionBarLaunch_Dark
            } else {
                R.style.AppTheme_NoActionBarLaunch_Light
            }

        /** Context that resolves values-night / drawable-night-nodpi for splash overlay. */
        @JvmStatic
        fun splashContext(context: Context): Context {
            val config = Configuration(context.resources.configuration)
            val bit =
                if (nightModeActive(context)) {
                    Configuration.UI_MODE_NIGHT_YES
                } else {
                    Configuration.UI_MODE_NIGHT_NO
                }
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
