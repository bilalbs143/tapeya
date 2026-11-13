package com.tapbytapeya.app

import android.app.Application
import android.content.Context

/**
 * Apply stored light/dark as early as [attachBaseContext] so Android 12 OS splash
 * theme attrs (`splash_background`, system icon) resolve night resources.
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
