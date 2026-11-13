package com.tapbytapeya.app

import android.app.Application

/** Apply stored light/dark for in-app UI before Activities run. */
class TapeyaApp : Application() {
    override fun onCreate() {
        TapeyaAppearancePlugin.applyStored(this)
        super.onCreate()
    }
}
