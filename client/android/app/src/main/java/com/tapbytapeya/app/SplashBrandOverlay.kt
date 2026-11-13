package com.tapbytapeya.app

import android.app.Activity
import android.graphics.BitmapFactory
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.ImageView
import java.lang.ref.WeakReference

/**
 * Window-level splash brand (Android) — full logo + tagline like iOS.
 *
 * Cap Android 12+ briefly keeps a circular system mark (`splash_mark`); with
 * `launchAutoHide` that exits quickly so this overlay owns the brand until JS
 * `hideSplashBrand`. Logos are decoded once (light/dark via night resources).
 */
object SplashBrandOverlay {
    private var presented: WeakReference<View>? = null
    private var cachedLogo: android.graphics.Bitmap? = null
    private var cachedForNight: Boolean? = null

    @JvmStatic
    fun show(activity: Activity) {
        hide()
        warm(activity)

        val root = activity.window?.decorView as? ViewGroup ?: return
        val overlay = LayoutInflater.from(activity).inflate(R.layout.splash_brand_overlay, root, false)
        overlay.findViewById<ImageView>(R.id.splash_brand_logo)?.let { image ->
            cachedLogo?.let { image.setImageBitmap(it) }
        }
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

    @JvmStatic
    fun warm(activity: Activity) {
        val night = activity.resources.configuration.isNightModeActiveCompat()
        if (cachedLogo != null && cachedForNight == night) return

        val opts = BitmapFactory.Options().apply { inPreferredConfig = android.graphics.Bitmap.Config.ARGB_8888 }
        cachedLogo = BitmapFactory.decodeResource(activity.resources, R.drawable.splash_logo, opts)
        cachedForNight = night
    }

    private fun android.content.res.Configuration.isNightModeActiveCompat(): Boolean {
        val mask = uiMode and android.content.res.Configuration.UI_MODE_NIGHT_MASK
        return mask == android.content.res.Configuration.UI_MODE_NIGHT_YES
    }
}
