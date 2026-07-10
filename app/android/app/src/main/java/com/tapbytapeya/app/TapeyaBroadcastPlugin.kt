package com.tapbytapeya.app

import android.Manifest
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.SurfaceHolder
import android.view.SurfaceView
import android.view.ViewGroup
import android.view.WindowManager
import android.widget.FrameLayout
import androidx.coordinatorlayout.widget.CoordinatorLayout
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PermissionState
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.Permission
import com.getcapacitor.annotation.PermissionCallback
import com.pedro.common.ConnectChecker
import com.pedro.encoder.input.sources.audio.MicrophoneSource
import com.pedro.encoder.input.sources.video.Camera2Source
import com.pedro.encoder.input.video.CameraHelper
import com.pedro.library.base.StreamBase
import com.pedro.library.generic.GenericStream
import com.pedro.library.util.BitrateAdapter

/**
 * Self-serve mobile broadcast — camera capture + RTMP publish via RootEncoder's GenericStream.
 * See LIVE_STREAM_MOBILE_BROADCAST.md's "Android — Kotlin, rootencoder-based" section.
 *
 * Uses `GenericStream` (com.pedro.library.generic), not the doc's sketched `RtmpStream` —
 * verified against the current RootEncoder README/source: `RtmpStream` still exists but
 * `GenericStream` is the actively documented, recommended entry point in the pinned
 * `library:2.7.5` artifact, and it publishes plain RTMP exactly the same way when given an
 * `rtmp://` endpoint. `ConnectChecker` lives in `com.pedro.common` (moved from
 * `com.pedro.library.util` since the doc was written) — this file targets the real,
 * currently-published API surface.
 */
@CapacitorPlugin(
    name = "TapeyaBroadcast",
    permissions = [
        Permission(alias = "camera", strings = [Manifest.permission.CAMERA]),
        Permission(alias = "microphone", strings = [Manifest.permission.RECORD_AUDIO]),
    ]
)
class TapeyaBroadcastPlugin : Plugin(), ConnectChecker {

    companion object {
        private const val TAG = "TapeyaBroadcastPlugin"

        /** Reconnect contract from the doc: 2s -> 4s -> 8s -> 16s -> 30s, 5 attempts before error. */
        private val RECONNECT_DELAYS_MS = longArrayOf(2000, 4000, 8000, 16000, 30000)

        private const val AUDIO_SAMPLE_RATE = 44100
        private const val AUDIO_BITRATE = 128_000
    }

    private data class Resolution(val width: Int, val height: Int, val videoBitrate: Int)

  private val resolutionTiers = listOf(
        Resolution(1080, 1920, 2_500_000),
        Resolution(720, 1280, 1_500_000),
        Resolution(480, 854, 640_000),
    )

    private val resolutions = mapOf(
        "720p" to resolutionTiers[1],
        "1080p" to resolutionTiers[0],
    )

    private var stream: StreamBase? = null
    private var previewView: SurfaceView? = null
    private var bitrateAdapter: BitrateAdapter? = null
    private var targetVideoBitrate = resolutionTiers[0].videoBitrate
    private var currentTierIndex = 0
    private var poorSinceMs: Long? = null
    private var lastFps = 0

    private val mainHandler = Handler(Looper.getMainLooper())
    private var reconnectAttempt = 0
    private var reconnectRunnable: Runnable? = null
    private var maxDurationRunnable: Runnable? = null
    private var isEnding = false
    private var lastEndpoint: String? = null
    private var lastStreamId: String? = null
    private var currentFacing: CameraHelper.Facing = CameraHelper.Facing.FRONT

    override fun load() {
        val genericStream = GenericStream(context, this, Camera2Source(context), MicrophoneSource())
        genericStream.getGlInterface().autoHandleOrientation = true
        genericStream.setFpsListener { fps -> lastFps = fps }
        genericStream.getStreamClient().resizeCache(200)
        stream = genericStream
    }

    // MARK: - Permissions

    @PluginMethod
    override fun requestPermissions(call: PluginCall) {
        if (getPermissionState("camera") == PermissionState.GRANTED &&
            getPermissionState("microphone") == PermissionState.GRANTED
        ) {
            permissionsCallback(call)
        } else {
            requestPermissionForAliases(arrayOf("camera", "microphone"), call, "permissionsCallback")
        }
    }

    @PermissionCallback
    private fun permissionsCallback(call: PluginCall) {
        val result = JSObject()
        result.put("camera", getPermissionState("camera")?.toString() ?: "denied")
        result.put("microphone", getPermissionState("microphone")?.toString() ?: "denied")
        call.resolve(result)
    }

    // MARK: - Preview

    @PluginMethod
    fun startPreview(call: PluginCall) {
        val stream = stream ?: return call.reject("Stream not initialized")
        val activity = activity ?: return call.reject("Activity unavailable")

        val x = (call.getFloat("x") ?: 0f).toInt()
        val y = (call.getFloat("y") ?: 0f).toInt()
        val width = (call.getFloat("width") ?: 0f).toInt()
        val height = (call.getFloat("height") ?: 0f).toInt()
        // Go-live always opens on the front camera; flip is opt-in via switchCamera.
        currentFacing = CameraHelper.Facing.FRONT
        ensureCameraFacing(CameraHelper.Facing.FRONT)

        activity.runOnUiThread {
            setKeepScreenOn(true)
            val surfaceView = previewView ?: SurfaceView(activity).also { it.holder.setFormat(PixelFormat.TRANSLUCENT) }
            previewView = surfaceView
            attachPreviewSurface(surfaceView, x, y, width, height)

            if (surfaceView.holder.surface?.isValid == true) {
                if (!stream.isOnPreview) stream.startPreview(surfaceView)
                call.resolve(JSObject().put("started", true))
                return@runOnUiThread
            }

            surfaceView.holder.addCallback(object : SurfaceHolder.Callback {
                override fun surfaceCreated(holder: SurfaceHolder) {
                    if (!stream.isOnPreview) stream.startPreview(surfaceView)
                    call.resolve(JSObject().put("started", true))
                }
                override fun surfaceChanged(holder: SurfaceHolder, format: Int, w: Int, h: Int) {}
                override fun surfaceDestroyed(holder: SurfaceHolder) {}
            })
        }
    }

    @PluginMethod
    fun updatePreviewLayout(call: PluginCall) {
        val surfaceView = previewView ?: return call.reject("Preview not started")
        val x = (call.getFloat("x") ?: 0f).toInt()
        val y = (call.getFloat("y") ?: 0f).toInt()
        val width = (call.getFloat("width") ?: 0f).toInt()
        val height = (call.getFloat("height") ?: 0f).toInt()
        val activity = activity ?: return call.reject("Activity unavailable")

        activity.runOnUiThread {
            attachPreviewSurface(surfaceView, x, y, width, height)
            call.resolve(JSObject().put("updated", true))
        }
    }

    @PluginMethod
    fun stopPreview(call: PluginCall) {
        val stream = stream
        val activity = activity ?: return call.resolve(JSObject().put("stopped", true))

        activity.runOnUiThread {
            if (stream?.isOnPreview == true) stream.stopPreview()
            previewView?.let { (it.parent as? ViewGroup)?.removeView(it) }
            setWebViewTransparent(false)
            // Keep screen awake while still publishing (prepareVideo may stop preview briefly).
            if (stream?.isStreaming != true) setKeepScreenOn(false)
            call.resolve(JSObject().put("stopped", true))
        }
    }

    @PluginMethod
    fun switchCamera(call: PluginCall) {
        try {
            val cameraSource = stream?.videoSource as? Camera2Source
                ?: return call.reject("Camera unavailable")
            cameraSource.switchCamera()
            currentFacing = cameraSource.getCameraFacing()
            call.resolve(JSObject().put("switched", true))
        } catch (e: Exception) {
            call.reject("Failed to switch camera: ${e.message}")
        }
    }

    @PluginMethod
    fun toggleMute(call: PluginCall) {
        val muted = call.getBoolean("muted") ?: true
        val mic = stream?.audioSource as? MicrophoneSource
        if (muted) mic?.mute() else mic?.unMute()
        call.resolve(JSObject().put("muted", muted))
    }

    // MARK: - Broadcast


    /** RootEncoder defaults to back; prepareVideo can reset facing — restore the user's choice. */
    private fun ensureCameraFacing(preferred: CameraHelper.Facing) {
        try {
            val cameraSource = stream?.videoSource as? Camera2Source ?: return
            var guard = 0
            while (cameraSource.getCameraFacing() != preferred && guard < 2) {
                cameraSource.switchCamera()
                guard++
            }
            currentFacing = cameraSource.getCameraFacing()
        } catch (e: Exception) {
            Log.w(TAG, "Unable to select camera facing: ${e.message}")
        }
    }

    /** Insert camera SurfaceView below the Capacitor WebView so floating JS controls stay visible. */
    private fun attachPreviewSurface(surfaceView: SurfaceView, x: Int, y: Int, width: Int, height: Int) {
        val webView = bridge.webView
        val parent = webView.parent as? ViewGroup
            ?: activity?.findViewById<ViewGroup>(android.R.id.content)
            ?: return

        surfaceView.isClickable = false
        surfaceView.isFocusable = false
        surfaceView.setZOrderOnTop(false)
        surfaceView.setZOrderMediaOverlay(false)

        if (surfaceView.parent != parent) {
            (surfaceView.parent as? ViewGroup)?.removeView(surfaceView)
            val webIndex = parent.indexOfChild(webView)
            parent.addView(surfaceView, if (webIndex >= 0) webIndex else 0)
        } else {
            val webIndex = parent.indexOfChild(webView)
            val surfIndex = parent.indexOfChild(surfaceView)
            if (webIndex >= 0 && surfIndex > webIndex) {
                parent.removeView(surfaceView)
                parent.addView(surfaceView, webIndex)
            }
        }

        setWebViewTransparent(true)

        if (width <= 0 || height <= 0) return

        // JS sends CSS pixels (window.innerWidth); Android layout expects device px.
        // Full-bleed go-live always passes x/y=0 — use MATCH_PARENT instead of ~412px width.
        val fullBleed = x == 0 && y == 0
        val metrics = parent.resources.displayMetrics
        val scaledWidth = (width * metrics.density).toInt()
        val scaledHeight = (height * metrics.density).toInt()
        val scaledX = (x * metrics.density).toInt()
        val scaledY = (y * metrics.density).toInt()

        surfaceView.layoutParams = when (parent) {
            is CoordinatorLayout -> if (fullBleed) {
                CoordinatorLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT,
                )
            } else {
                CoordinatorLayout.LayoutParams(scaledWidth, scaledHeight).apply {
                    leftMargin = scaledX
                    topMargin = scaledY
                }
            }
            is FrameLayout -> if (fullBleed) {
                FrameLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT,
                )
            } else {
                FrameLayout.LayoutParams(scaledWidth, scaledHeight).apply {
                    leftMargin = scaledX
                    topMargin = scaledY
                }
            }
            else -> if (fullBleed) {
                ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT,
                )
            } else {
                ViewGroup.MarginLayoutParams(scaledWidth, scaledHeight).apply {
                    leftMargin = scaledX
                    topMargin = scaledY
                }
            }
        }
        surfaceView.requestLayout()
    }


    /** RootEncoder requires preview/stream/record stopped before prepareVideo. */
    private fun stopPreviewForPrepare(stream: StreamBase) {
        if (!stream.isOnPreview) return
        try {
            stream.stopPreview()
        } catch (e: Exception) {
            Log.w(TAG, "stopPreview before prepare failed", e)
        }
    }

    private fun restartPreviewAfterPublish(stream: StreamBase) {
        val surfaceView = previewView ?: return
        val activity = activity ?: return
        if (surfaceView.holder.surface?.isValid != true) return
        try {
            if (!stream.isOnPreview) {
                // prepareVideo stops preview and can reset camera to back — restore facing first.
                attachPreviewSurface(surfaceView, 0, 0, activity.resources.displayMetrics.widthPixels, activity.resources.displayMetrics.heightPixels)
                ensureCameraFacing(currentFacing)
                stream.startPreview(surfaceView)
            }
        } catch (e: Exception) {
            Log.w(TAG, "restartPreview after publish failed", e)
        }
    }

    private fun prepareEncoder(stream: StreamBase, resolution: Resolution): Boolean {
        stopPreviewForPrepare(stream)
        val prepared = stream.prepareVideo(resolution.width, resolution.height, resolution.videoBitrate) &&
            stream.prepareAudio(AUDIO_SAMPLE_RATE, true, AUDIO_BITRATE)
        // prepareVideo can reset the camera source — restore facing after, not before, so it
        // actually sticks for the encoder that startStream() is about to use.
        if (prepared) ensureCameraFacing(currentFacing)
        return prepared
    }



    /** Keep the display on for the whole preview/broadcast session — no tap-to-wake. */
    private fun setKeepScreenOn(enabled: Boolean) {
        val window = activity?.window
        if (window != null) {
            if (enabled) {
                window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
            } else {
                window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
            }
        }
        // View-level flag — more reliable on some OEM skins than window flags alone.
        previewView?.keepScreenOn = enabled
        bridge.webView?.keepScreenOn = enabled
    }

    private fun setWebViewTransparent(transparent: Boolean) {
        val webView = bridge.webView ?: return
        webView.setBackgroundColor(if (transparent) Color.TRANSPARENT else Color.BLACK)
    }

    // MARK: - Publish
    @PluginMethod
    fun startBroadcast(call: PluginCall) {
        val stream = stream ?: return call.reject("Stream not initialized")
        val rtmpUrl = call.getString("rtmpUrl")
        val streamKey = call.getString("streamKey")
        if (rtmpUrl == null || streamKey == null) {
            call.reject("rtmpUrl and streamKey are required")
            return
        }
        val maxDurationSeconds = call.getDouble("maxDurationSeconds") ?: 7200.0
        val resolution = resolutions[call.getString("resolution")] ?: resolutionTiers[0]
        currentTierIndex = resolutionTiers.indexOf(resolution).coerceAtLeast(0)
        poorSinceMs = null

        val endpoint = rtmpUrl.trimEnd('/') + "/" + streamKey
        lastEndpoint = endpoint
        lastStreamId = call.getString("streamId")
        targetVideoBitrate = resolution.videoBitrate
        isEnding = false
        reconnectAttempt = 0

        startBroadcastService()

        val activity = activity ?: return call.reject("Activity unavailable")
        activity.runOnUiThread {
            setKeepScreenOn(true)
            try {
                if (!stream.isStreaming) {
                    if (!prepareEncoder(stream, resolution)) {
                        call.reject("Failed to prepare encoder")
                        return@runOnUiThread
                    }
                    stream.startStream(endpoint)
                    restartPreviewAfterPublish(stream)
                }
                scheduleMaxDurationTimeout(maxDurationSeconds)
                call.resolve()
            } catch (e: Exception) {
                notifyBroadcastState("error", mapOf("message" to (e.message ?: "unknown")))
                call.reject("Failed to start broadcast: ${e.message}")
            }
        }
    }

    @PluginMethod
    fun stopBroadcast(call: PluginCall) {
        isEnding = true
        cancelMaxDurationTimeout()
        cancelReconnect()
        teardownStream()
        stopBroadcastService()
        activity?.runOnUiThread { setKeepScreenOn(false) }
        notifyBroadcastState("ended", null)
        call.resolve(JSObject().put("stopped", true))
    }

    private fun teardownStream() {
        val stream = stream ?: return
        try {
            if (stream.isStreaming) stream.stopStream()
        } catch (e: Exception) {
            Log.w(TAG, "stopStream failed", e)
        }
    }

    // MARK: - ConnectChecker (RootEncoder callbacks)

    override fun onConnectionStarted(url: String) {
        if (reconnectAttempt == 0) notifyBroadcastState("connecting", null)
    }

    override fun onConnectionSuccess() {
        reconnectAttempt = 0
        cancelReconnect()
        bitrateAdapter = BitrateAdapter { bitrate -> stream?.setVideoBitrateOnFly(bitrate) }.also {
            it.setMaxBitrate(targetVideoBitrate)
        }
        notifyBroadcastState("live", null)
    }

    override fun onConnectionFailed(reason: String) {
        handleUnexpectedDisconnect(reason)
    }

    override fun onNewBitrate(bitrate: Long) {
        val stream = stream
        val hasCongestion = stream?.getStreamClient()?.hasCongestion() == true
        bitrateAdapter?.adaptBitrate(bitrate, hasCongestion)

        val quality = when {
            hasCongestion || bitrate < targetVideoBitrate * 0.5 -> "poor"
            bitrate >= targetVideoBitrate * 0.85 -> "good"
            else -> "fair"
        }

        if (quality == "poor") {
            val now = System.currentTimeMillis()
            val since = poorSinceMs
            if (since == null) {
                poorSinceMs = now
            } else if (now - since >= 10_000) {
                maybeStepDownResolution()
                poorSinceMs = null
            }
        } else {
            poorSinceMs = null
        }

        val data = JSObject()
        data.put("bitrateKbps", (bitrate / 1000).toInt())
        data.put("fps", lastFps)
        data.put("droppedFrames", if (hasCongestion) 1 else 0)
        data.put("networkQuality", quality)
        notifyListeners("broadcastStats", data)
    }

    override fun onDisconnect() {
        if (!isEnding) {
            notifyBroadcastState("ended", null)
        }
    }

    override fun onAuthError() {
        notifyBroadcastState("error", mapOf("reason" to "auth_error"))
    }

    override fun onAuthSuccess() {
        // no-op — onConnectionSuccess already covers the transition to "live".
    }

    private fun handleUnexpectedDisconnect(reason: String) {
        if (isEnding) return
        val endpoint = lastEndpoint ?: return

        if (reconnectAttempt >= RECONNECT_DELAYS_MS.size) {
            notifyBroadcastState("error", mapOf("reason" to "reconnect_exhausted", "message" to reason))
            return
        }

        notifyBroadcastState("reconnecting", null)
        val delay = RECONNECT_DELAYS_MS[reconnectAttempt]
        reconnectAttempt += 1

        cancelReconnect()
        val runnable = Runnable {
            if (isEnding) return@Runnable
            try {
                stream?.startStream(endpoint)
            } catch (e: Exception) {
                handleUnexpectedDisconnect(e.message ?: "reconnect_failed")
            }
        }
        reconnectRunnable = runnable
        mainHandler.postDelayed(runnable, delay)
    }

    private fun cancelReconnect() {
        reconnectRunnable?.let { mainHandler.removeCallbacks(it) }
        reconnectRunnable = null
    }

    // MARK: - Max duration enforcement (client-side; server-side backstop is
    // EndExpiredBroadcasts — see LiveStreamService::SELF_SERVE_MAX_DURATION_SECONDS)

    private fun scheduleMaxDurationTimeout(seconds: Double) {
        cancelMaxDurationTimeout()
        val runnable = Runnable {
            isEnding = true
            cancelReconnect()
            teardownStream()
            stopBroadcastService()
            notifyBroadcastState("ended", mapOf("reason" to "max_duration"))
        }
        maxDurationRunnable = runnable
        mainHandler.postDelayed(runnable, (seconds * 1000).toLong())
    }

    private fun cancelMaxDurationTimeout() {
        maxDurationRunnable?.let { mainHandler.removeCallbacks(it) }
        maxDurationRunnable = null
    }

    private fun maybeStepDownResolution() {
        if (currentTierIndex >= resolutionTiers.lastIndex) return
        val stream = stream ?: return
        val endpoint = lastEndpoint ?: return

        currentTierIndex += 1
        val tier = resolutionTiers[currentTierIndex]
        targetVideoBitrate = tier.videoBitrate

        mainHandler.post {
            try {
                if (stream.isStreaming) stream.stopStream()
                if (!prepareEncoder(stream, tier)) {
                    Log.w(TAG, "resolution step-down prepare failed at tier $currentTierIndex")
                    return@post
                }
                bitrateAdapter?.setMaxBitrate(tier.videoBitrate)
                stream.startStream(endpoint)
                restartPreviewAfterPublish(stream)
            } catch (e: Exception) {
                Log.w(TAG, "resolution step-down failed", e)
            }
        }
    }

    private fun notifyBroadcastState(state: String, extra: Map<String, String>?) {
        val data = JSObject()
        data.put("state", state)
        extra?.forEach { (k, v) -> data.put(k, v) }
        notifyListeners("broadcastStateChanged", data)
    }

    // MARK: - Foreground service (Android 14+ mandates a foreground service type for
    // camera/mic access while backgrounded — see doc's "Backgrounding" section)

    private fun startBroadcastService() {
        val ctx = context ?: return
        val intent = Intent(ctx, BroadcastForegroundService::class.java).apply {
            putExtra(BroadcastForegroundService.EXTRA_STREAM_ID, lastStreamId)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            ctx.startForegroundService(intent)
        } else {
            ctx.startService(intent)
        }
    }

    private fun stopBroadcastService() {
        val ctx = context ?: return
        ctx.stopService(Intent(ctx, BroadcastForegroundService::class.java))
    }
}
