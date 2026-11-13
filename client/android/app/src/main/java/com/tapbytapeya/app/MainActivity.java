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
        // Android 12+ always shows an OS splash first. Ours is a solid brand page (no circular
        // mark). Keep it only until SplashBrandOverlay is attached, then remove instantly —
        // Cap launchShowDuration is 0 so Cap cannot re-hold a second branded splash.
        AtomicBoolean keepSystemSplash = new AtomicBoolean(true);
        SplashScreen splashScreen = SplashScreen.installSplashScreen(this);
        splashScreen.setKeepOnScreenCondition(keepSystemSplash::get);
        splashScreen.setOnExitAnimationListener(splashScreenView -> splashScreenView.remove());

        TapeyaAppearancePlugin.applyStored(this);
        SplashBrandOverlay.warm(this);
        SplashBrandOverlay.show(this);
        // Exit OS splash as soon as a frame can draw onto the overlay (same brand bg).
        getWindow().getDecorView().post(() -> keepSystemSplash.set(false));

        registerPlugin(TapeyaAppearancePlugin.class);
        registerPlugin(TapeyaBroadcastPlugin.class);
        registerPlugin(FacebookAnalyticsPlugin.class);
        super.onCreate(savedInstanceState);

        // Bridge setContentView can reshuffle z-order; put brand back, then ensure OS splash
        // is gone (instant remove — no circular-mark zoom animation).
        SplashBrandOverlay.show(this);
        SplashBrandOverlay.bringToFront(this);
        keepSystemSplash.set(false);

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
