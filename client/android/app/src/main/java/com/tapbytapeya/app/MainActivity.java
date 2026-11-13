package com.tapbytapeya.app;

import androidx.core.splashscreen.SplashScreen;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.facebook.FacebookSdk;
import com.facebook.appevents.AppEventsLogger;
import com.getcapacitor.BridgeActivity;

import java.util.concurrent.atomic.AtomicBoolean;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        // Own the Android 12+ splash: keep the OS splash only until SplashBrandOverlay is
        // attached, then release. Cap launchShowDuration is 0 so Cap does not re-hold the
        // circular mark for the whole WebView boot (that was the double-splash).
        AtomicBoolean keepSystemSplash = new AtomicBoolean(true);
        SplashScreen.installSplashScreen(this).setKeepOnScreenCondition(keepSystemSplash::get);

        TapeyaAppearancePlugin.applyStored(this);
        SplashBrandOverlay.warm(this);
        // Attach full logo + tagline before Cap/WebView init so the first drawn frame is
        // already branded (OS mark exits onto this, not a blank WebView).
        SplashBrandOverlay.show(this);
        keepSystemSplash.set(false);

        registerPlugin(TapeyaAppearancePlugin.class);
        registerPlugin(TapeyaBroadcastPlugin.class);
        registerPlugin(FacebookAnalyticsPlugin.class);
        super.onCreate(savedInstanceState);
        SplashBrandOverlay.bringToFront(this);
        // Hide OS nav early (before JS). Transient-by-swipe: edge swipe peeks then auto-hides.
        // Status bar stays visible. JS re-applies on resume via androidSystemNav.ts.
        applyHiddenAndroidNavigationBar();
        FacebookSdk.setAdvertiserIDCollectionEnabled(true);
        FacebookSdk.setAutoLogAppEventsEnabled(true);
        FacebookSdk.setAutoInitEnabled(true);
        FacebookSdk.fullyInitialize();
    }

    @Override
    public void onStart() {
        super.onStart();
        SplashBrandOverlay.bringToFront(this);
    }

    @Override
    public void onResume() {
        super.onResume();
        applyHiddenAndroidNavigationBar();
        AppEventsLogger.activateApp(getApplication());
    }

    private void applyHiddenAndroidNavigationBar() {
        WindowInsetsControllerCompat controller =
            WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        controller.setSystemBarsBehavior(
            WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        );
        controller.hide(WindowInsetsCompat.Type.navigationBars());
    }
}
