package com.tapbytapeya.app

import android.app.Activity
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import java.lang.ref.WeakReference

/** Full logo + tagline (iOS-sized). Shown until JS `hideSplashBrand`. */
object SplashBrandOverlay {
    private var presented: WeakReference<View>? = null

    @JvmStatic
    fun show(activity: Activity) {
        hide()
        val root = activity.window?.decorView as? ViewGroup ?: return
        val overlay = LayoutInflater.from(activity).inflate(R.layout.splash_brand_overlay, root, false)
        overlay.elevation = 100f
        root.addView(
            overlay,
            FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT,
            ),
        )
        presented = WeakReference(overlay)
    }

    @JvmStatic
    fun hide() {
        presented?.get()?.let { view ->
            (view.parent as? ViewGroup)?.removeView(view)
        }
        presented = null
    }
}
