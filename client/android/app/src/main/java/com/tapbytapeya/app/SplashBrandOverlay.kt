package com.tapbytapeya.app

import android.app.Activity
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import java.lang.ref.WeakReference

/**
 * Window-level splash brand (Android) — full logo + tagline like iOS.
 *
 * Sizing mirrors iOS `SplashBrandOverlay` / LaunchScreen: logo 276×104, tagline 15,
 * stack spacing 18, horizontal inset 24, centerY −8. Cap Android 12+ starts with a
 * circular system mark; [CapLaunchSplash] dismisses it as soon as this overlay is up.
 */
object SplashBrandOverlay {
    private var presented: WeakReference<View>? = null

    @JvmStatic
    fun show(activity: Activity) {
        hide()
        warm(activity)

        val root = activity.window?.decorView as? ViewGroup ?: return
        val overlay = LayoutInflater.from(activity).inflate(R.layout.splash_brand_overlay, root, false)
        // Sit above Cap splash / WebView.
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

    @JvmStatic
    fun bringToFront(activity: Activity) {
        val overlay = presented?.get() ?: return
        val root = activity.window?.decorView as? ViewGroup ?: return
        overlay.bringToFront()
        root.requestLayout()
    }

    /** Prefetch nodpi light/night logos so the first inflate is not a decode hitch. */
    @JvmStatic
    fun warm(activity: Activity) {
        activity.getDrawable(R.drawable.splash_logo)
    }
}
