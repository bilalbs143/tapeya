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
        // Night mode already applied in TapeyaApp; Cap launchShowDuration is 0.
        AtomicBoolean keepSplash = new AtomicBoolean(true);
        SplashScreen splash = SplashScreen.installSplashScreen(this);
        splash.setKeepOnScreenCondition(keepSplash::get);
        splash.setOnExitAnimationListener(view -> view.remove());

        registerPlugin(TapeyaAppearancePlugin.class);
        registerPlugin(TapeyaBroadcastPlugin.class);
        registerPlugin(FacebookAnalyticsPlugin.class);
        super.onCreate(savedInstanceState);

        SplashBrandOverlay.show(this);
        keepSplash.set(false);

        // Hide OS nav early (before JS). Transient-by-swipe: edge swipe peeks then auto-hides.
        // Status bar stays visible. JS re-applies on resume via androidSystemNav.ts.
        applyHiddenAndroidNavigationBar();
        FacebookSdk.setAdvertiserIDCollectionEnabled(true);
        FacebookSdk.setAutoLogAppEventsEnabled(true);
        FacebookSdk.setAutoInitEnabled(true);
        FacebookSdk.fullyInitialize();
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
