package com.tapbytapeya.app

import android.app.Application
import android.content.Context

/**
 * Apply stored light/dark before Activities. Must use [base] prefs only in
 * [attachBaseContext] — [Context.getApplicationContext] is not ready yet.
 */
class TapeyaApp : Application() {
    override fun attachBaseContext(base: Context) {
        TapeyaAppearancePlugin.applyStored(base)
        super.attachBaseContext(base)
    }

    override fun onCreate() {
        TapeyaAppearancePlugin.applyStored(this)
        super.onCreate()
    }
}
