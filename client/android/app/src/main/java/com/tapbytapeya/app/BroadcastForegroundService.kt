package com.tapbytapeya.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.net.Uri
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat

/**
 * Required by Android 14+ (foreground service types) to keep the camera/mic pipeline alive
 * while backgrounded. See LIVE_STREAM_MOBILE_BROADCAST.md's "Backgrounding" (Android) section:
 * notification copy and tap target are specified there, not incidental.
 *
 * Tapping the notification deep-links to /live/go-live/:streamId via the app's `tapeya://`
 * custom scheme — handled by @capacitor/app's already-wired `appUrlOpen` event (see App.jsx),
 * not bespoke intent plumbing here.
 */
class BroadcastForegroundService : Service() {

    companion object {
        const val CHANNEL_ID = "tapeya_broadcast"
        const val NOTIFICATION_ID = 4201
        const val EXTRA_STREAM_ID = "streamId"
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val streamId = intent?.getStringExtra(EXTRA_STREAM_ID)
        val serviceType = ServiceInfo.FOREGROUND_SERVICE_TYPE_CAMERA or ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE
        ServiceCompat.startForeground(this, NOTIFICATION_ID, buildNotification(streamId), serviceType)
        return START_STICKY
    }

    private fun buildNotification(streamId: String?): Notification {
        ensureChannel()

        val tapIntent = Intent(Intent.ACTION_VIEW).apply {
            data = Uri.parse(if (streamId != null) "tapeya://live/go-live/$streamId" else "tapeya://live/go-live")
            setPackage(packageName)
        }
        val flags = PendingIntent.FLAG_UPDATE_CURRENT or
            (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE else 0)
        val pendingIntent = PendingIntent.getActivity(this, 0, tapIntent, flags)

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("You're live on Tapeya")
            .setContentText("Tap to return to your broadcast")
            .setSmallIcon(applicationInfo.icon)
            .setOngoing(true)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun ensureChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val manager = getSystemService(NotificationManager::class.java)
        if (manager.getNotificationChannel(CHANNEL_ID) == null) {
            val channel = NotificationChannel(CHANNEL_ID, "Live Broadcast", NotificationManager.IMPORTANCE_LOW)
            channel.description = "Shown while you are broadcasting from Tapeya"
            manager.createNotificationChannel(channel)
        }
    }

    override fun onDestroy() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            stopForeground(STOP_FOREGROUND_REMOVE)
        } else {
            @Suppress("DEPRECATION")
            stopForeground(true)
        }
        super.onDestroy()
    }
}
