package com.tapbytapeya.app

import android.content.Context
import androidx.appcompat.app.AppCompatDelegate
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

/** Cap Preferences `tapeya:theme` → night mode (cold start + live). */
@CapacitorPlugin(name = "TapeyaAppearance")
class TapeyaAppearancePlugin : Plugin() {
    companion object {
        private const val PREFS_GROUP = "CapacitorStorage"
        private const val THEME_KEY = "tapeya:theme"

        @JvmStatic
        fun applyStored(context: Context) {
            val prefs = context.applicationContext.getSharedPreferences(PREFS_GROUP, Context.MODE_PRIVATE)
            applyTheme(prefs.getString(THEME_KEY, null))
        }

        @JvmStatic
        fun applyTheme(theme: String?) {
            val mode = when (theme) {
                "light" -> AppCompatDelegate.MODE_NIGHT_NO
                "dark" -> AppCompatDelegate.MODE_NIGHT_YES
                else -> AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM
            }
            AppCompatDelegate.setDefaultNightMode(mode)
        }
    }

    @PluginMethod
    fun apply(call: PluginCall) {
        applyTheme(call.getString("theme"))
        call.resolve()
    }
}
