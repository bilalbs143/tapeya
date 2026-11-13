package com.tapbytapeya.app

import android.app.Application

/**
 * Apply stored light/dark before any Activity so Android 12 OS splash
 * (`splash_background` / system icon) resolves the correct night resources.
 */
class TapeyaApp : Application() {
    override fun onCreate() {
        TapeyaAppearancePlugin.applyStored(this)
        super.onCreate()
    }
}
